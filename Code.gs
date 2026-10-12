const LEGACY_SHEET_NAME = 'Registros';
const SHEET_NAME = 'RegistroHoras';
const CONFIG_NAME = 'Configuracion';
const DB_ID_KEY = 'NUESTRA_CASA_SPREADSHEET_ID';
const HEADERS = ['ID','Fecha','Persona','Turno','Horas','Nota','Actualizado'];

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'list';
    const ss = getDatabase_();
    const sh = ss.getSheetByName(SHEET_NAME);
    if (action === 'ping') return json_({ok:true,message:'Nuestra Casa conectado',spreadsheetUrl:ss.getUrl(),sheet:SHEET_NAME});
    const rows = sh.getDataRange().getValues();
    const data = rows.slice(1).filter(r => r[0]).map(r => ({
      id:String(r[0]), fecha:normalizeDate_(r[1]), persona:String(r[2] || ''),
      turno:String(r[3] || ''), horas:Number(r[4]) || 0, nota:String(r[5] || ''),
      actualizado:r[6] ? String(r[6]) : ''
    })).filter(r => /^\d{4}-\d{2}-\d{2}$/.test(r.fecha));
    return json_({ok:true,data,count:data.length,sheet:SHEET_NAME,spreadsheetUrl:ss.getUrl(),serverTime:new Date().toISOString()});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const ss = getDatabase_();
    const sh = ss.getSheetByName(SHEET_NAME);
    lock.waitLock(20000);
    try {
      if (body.action === 'saveDay') {
        const fecha = String(body.fecha || '');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new Error('Fecha de jornada inválida');
        const entries = Array.isArray(body.data) ? body.data : [];
        if (entries.some(x => String(x.fecha || '') !== fecha)) throw new Error('Hay registros que no pertenecen a esta jornada');
        const all = readRows_(sh).filter(r => r.fecha !== fecha);
        entries.forEach(x => all.push(cleanRecord_(x, fecha)));
        writeRows_(sh, all);
        return json_({ok:true,fecha:fecha,count:entries.length,updated:new Date().toISOString(),spreadsheetUrl:ss.getUrl()});
      }
      if (body.action === 'saveRecord') {
        const r = cleanRecord_(body.record || {});
        validateRecord_(r);
        const all = readRows_(sh);
        const idx = all.findIndex(x => x.id === r.id || (x.fecha === r.fecha && x.persona === r.persona && x.turno === r.turno));
        if (idx >= 0) all[idx] = r; else all.push(r);
        writeRows_(sh, all);
        return json_({ok:true,record:r,count:all.length,spreadsheetUrl:ss.getUrl()});
      }
      if (body.action === 'deleteRecord') {
        const id = String(body.id || '');
        if (!id) throw new Error('Falta el identificador del registro');
        const all = readRows_(sh).filter(r => r.id !== id);
        writeRows_(sh, all);
        return json_({ok:true,id:id,count:all.length,spreadsheetUrl:ss.getUrl()});
      }
      // Compatibilidad con versiones anteriores: nunca vaciar toda la hoja.
      if (body.action === 'save') {
        const entries = Array.isArray(body.data) ? body.data : [];
        const all = readRows_(sh);
        entries.forEach(item => {
          const r = cleanRecord_(item);
          validateRecord_(r);
          const idx = all.findIndex(x => x.id === r.id || (x.fecha === r.fecha && x.persona === r.persona && x.turno === r.turno));
          if (idx >= 0) all[idx] = r; else all.push(r);
        });
        writeRows_(sh, all);
        return json_({ok:true,count:all.length,updated:new Date().toISOString(),spreadsheetUrl:ss.getUrl()});
      }
      throw new Error('Acción no reconocida');
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function getDatabase_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(DB_ID_KEY);
  let ss = null;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (_) { props.deleteProperty(DB_ID_KEY); }
  }
  if (!ss) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) ss = SpreadsheetApp.create('Nuestra Casa - Registro de horas MEVIR 3');
    props.setProperty(DB_ID_KEY, ss.getId());
  }
  ensureSheets_(ss);
  return ss;
}

function ensureSheets_(ss) {
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
    // Migración automática desde la hoja anterior para no perder registros.
    const legacy = ss.getSheetByName(LEGACY_SHEET_NAME);
    if (legacy && legacy.getLastRow() > 1) {
      const old = legacy.getRange(2,1,legacy.getLastRow()-1,Math.min(7,legacy.getLastColumn())).getValues();
      const migrated = old.filter(r => r[0]).map(r => [
        String(r[0]), normalizeDate_(r[1]), String(r[2] || ''), String(r[3] || ''),
        Number(r[4]) || 0, String(r[5] || ''), r[6] || new Date()
      ]).filter(r => r[1] && r[2] && r[3]);
      if (migrated.length) sh.getRange(2,1,migrated.length,7).setValues(migrated);
    }
    sh.setFrozenRows(1);
    sh.getRange(1,1,1,7).setFontWeight('bold');
    sh.getRange('B:B').setNumberFormat('@');
  }
  let cfg = ss.getSheetByName(CONFIG_NAME);
  if (!cfg) {
    cfg = ss.insertSheet(CONFIG_NAME);
    cfg.getRange(1,1,3,2).setValues([['Parámetro','Valor'],['Meta mensual conjunta',80],['Deuda inicial conjunta',122]]);
    cfg.setFrozenRows(1);
  }
}

function readRows_(sh) {
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2,1,sh.getLastRow()-1,7).getValues().filter(r => r[0]).map(r => ({
    id:String(r[0]),fecha:normalizeDate_(r[1]),persona:String(r[2] || ''),turno:String(r[3] || ''),
    horas:Number(r[4]) || 0,nota:String(r[5] || ''),actualizado:r[6] || ''
  })).filter(r => r.fecha);
}

function writeRows_(sh, records) {
  const rows = records.map(x => {
    const r = cleanRecord_(x);
    validateRecord_(r);
    return [r.id,r.fecha,r.persona,r.turno,r.horas,r.nota,new Date()];
  });
  const last = sh.getLastRow();
  if (last > 1) sh.getRange(2,1,last-1,7).clearContent();
  if (rows.length) sh.getRange(2,1,rows.length,7).setValues(rows);
  sh.getRange('B:B').setNumberFormat('@');
}

function cleanRecord_(x, forcedDate) {
  return {
    id:String(x.id || Utilities.getUuid()),
    fecha:normalizeDate_(forcedDate || x.fecha),
    persona:String(x.persona || ''),
    turno:String(x.turno || ''),
    horas:Number(x.horas) || 0,
    nota:String(x.nota || '')
  };
}

function validateRecord_(r) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.fecha)) throw new Error('La fecha debe estar en formato AAAA-MM-DD');
  if (['Pablo','Patricia'].indexOf(r.persona) < 0) throw new Error('Persona inválida');
  if (['Mañana','Tarde'].indexOf(r.turno) < 0) throw new Error('Turno inválido');
  if (!isFinite(r.horas) || r.horas < 0 || r.horas > 12) throw new Error('Cantidad de horas inválida');
}

function normalizeDate_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const s = String(value == null ? '' : value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (m) return m[3] + '-' + String(m[2]).padStart(2, '0') + '-' + String(m[1]).padStart(2, '0');
  return '';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}