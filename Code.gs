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