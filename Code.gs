const SHEET_NAME = 'Registros';
const CONFIG_NAME = 'Configuracion';
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'list';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets_(ss);
  if (action === 'ping') return json_({ok:true, message:'Nuestra Casa conectado'});
  const rows = ss.getSheetByName(SHEET_NAME).getDataRange().getValues();
  const data = rows.slice(1).filter(r => r[0]).map(r => ({
    id:String(r[0]), fecha:String(r[1]), persona:String(r[2]), turno:String(r[3]),
    horas:Number(r[4]) || 0, nota:String(r[5] || ''), actualizado:String(r[6] || '')
  }));
  return json_({ok:true, data});
}
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets_(ss);
  let body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch (_) { return json_({ok:false,error:'JSON inválido'}); }
  const sh = ss.getSheetByName(SHEET_NAME);
  if (body.action === 'saveDay') {
    const fecha = String(body.fecha || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return json_({ok:false,error:'Fecha de jornada inválida'});
    const entries = Array.isArray(body.data) ? body.data : [];
    if (entries.some(x => String(x.fecha || '') !== fecha)) return json_({ok:false,error:'Hay registros que no pertenecen a esta jornada'});
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const lastRow = sh.getLastRow();
      if (lastRow > 1) {
        const rows = sh.getRange(2, 1, lastRow - 1, 7).getValues();
        for (let i = rows.length - 1; i >= 0; i--) {
          if (String(rows[i][1] || '') === fecha) sh.deleteRow(i + 2);
        }
      }
      const now = new Date().toISOString();
      if (entries.length) sh.getRange(sh.getLastRow() + 1, 1, entries.length, 7).setValues(entries.map(x => [
        String(x.id || Utilities.getUuid()), fecha, String(x.persona || ''),
        String(x.turno || ''), Number(x.horas) || 0, String(x.nota || ''), now
      ]));
      return json_({ok:true, fecha:fecha, count:entries.length, updated:now});
    } finally {
      lock.releaseLock();
    }
  }
  if (body.action === 'save') {
    const entries = Array.isArray(body.data) ? body.data : [];
    sh.clearContents();
    sh.appendRow(['ID','Fecha','Persona','Turno','Horas','Nota','Actualizado']);
    const now = new Date().toISOString();
    if (entries.length) sh.getRange(2,1,entries.length,7).setValues(entries.map(x => [
      String(x.id || Utilities.getUuid()), String(x.fecha || ''), String(x.persona || ''),
      String(x.turno || ''), Number(x.horas) || 0, String(x.nota || ''), now
    ]));
    return json_({ok:true, count:entries.length, updated:now});
  }
  return json_({ok:false,error:'Acción no reconocida'});
}
function ensureSheets_(ss) {
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(['ID','Fecha','Persona','Turno','Horas','Nota','Actualizado']);
  let cfg = ss.getSheetByName(CONFIG_NAME);
  if (!cfg) { cfg = ss.insertSheet(CONFIG_NAME); cfg.appendRow(['Parámetro','Valor']); cfg.appendRow(['Meta mensual conjunta',80]); cfg.appendRow(['Deuda inicial conjunta',122]); }
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}