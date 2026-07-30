/* =================================================================
 *  Code.gs — Optional Apps Script backend (Approach B)
 *  ----------------------------------------------------------------
 *  Deploy this if you'd rather hide your Sheet and API key behind
 *  a serverless API. The browser will call this URL instead of
 *  calling Google Sheets API directly.
 *
 *  SETUP:
 *   1. Open your Google Sheet → Extensions → Apps Script
 *   2. Delete the placeholder Code.gs content and paste this file
 *   3. Deploy → New deployment → Web app
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   4. Copy the deployment URL (ends in /exec)
 *   5. Paste it into js/config.js as `appsScriptUrl`
 *
 *  Project: My Desktop CertVault
 * =================================================================
 */

// ★ EDIT THIS: sheet tab name (must match your sheet)
const SHEET_NAME = 'Certificates';

function doGet(e) {
  const params = e.parameter || {};
  const certId = params.cert_id;
  const email  = params.email;

  let rows = readRows();

  if (certId) {
    rows = rows.filter(r => r.cert_id.toLowerCase() === certId.toLowerCase());
  } else if (email) {
    const e = email.toLowerCase();
    rows = rows.filter(r => (r.email || '').toLowerCase() === e);
  }

  return jsonResponse({ rows: rows });
}

/**
 * Read all issued rows from the bound Sheet.
 * Returns an array of plain objects keyed by the header row.
 */
function readRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim().toLowerCase());
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const obj = {};
    headers.forEach((h, j) => { obj[h] = String(row[j] || '').trim(); });
    // Skip rows that are not yet issued (issued === FALSE)
    if ((obj.issued || '').toLowerCase() === 'false') continue;
    if (!obj.cert_id) continue;
    out.push(obj);
  }
  return out;
}

/** Helper: return JSON with proper MIME + CORS-friendly headers. */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Optional trigger: auto-generate a cert_id when a new row is added
 * via a Google Form. Enable in Triggers → addRow → On form submit.
 */
function addRow(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const row = e.range.getRow();
  const idCell = sheet.getRange('A' + row);
  if (!idCell.getValue()) {
    idCell.setValue(generateCertId());
  }
}

function generateCertId() {
  const n = Math.floor(Math.random() * 0xFFFFFFFF);
  return ('00000000' + n.toString(16)).slice(-8);
}
