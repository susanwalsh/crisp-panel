/**
 * The Crisp Panel – server.
 * Paste into the Apps Script editor of a Google Sheet (Extensions → Apps Script).
 * Votes land in a "Votes" tab. Results are only returned with the organiser code.
 */

// The organiser code lives in Apps Script, not in this file, so it never ends up on GitHub.
// Set it in Project Settings → Script Properties → Add script property: ORGANISER_CODE. Case doesn't matter.
const EXPECTED_PANEL = 23;

const SHEET_NAME = 'Votes';
const HEADERS = ['Submitted', 'Name', 'Email', 'Device', '1st', '2nd', '3rd', 'Defence', 'Submission ID'];

// Must match the ids in Index.html. If you change the line-up, change both.
const VALID_IDS = [
  'blanco-nino', 'eat-real', 'hippeas', 'love-corn-habanero', 'filberts-truffle', 'filberts-padron',
  'pipers-cider-vinegar', 'properchips', 'simply-roasted', 'tyrrells-lentil', 'popchips'
];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('The Crisp Panel')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

/** The page on GitHub Pages sends { action, arg } here and gets JSON back. */
function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { /* bad request */ }
  const actions = { getStatus: getStatus, submitVote: submitVote, getResults: getResults };
  const fn = actions[body.action];
  const out = fn ? fn(body.arg) : { ok: false, error: 'unknown' };
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/** Has this person (by work email, or by device if no email is available) already voted? */
function getStatus(device) {
  const mine = findMine_(rows_(), email_(), clean_(device, 64));
  return { voted: !!mine, vote: mine ? public_(mine) : null };
}

function submitVote(p) {
  p = p || {};
  const name = clean_(p.name, 60);
  const picks = [p.first, p.second, p.third];
  if (!name) return { ok: false, error: 'name' };
  if (picks.some(function (id) { return VALID_IDS.indexOf(id) < 0; }) || new Set(picks).size !== 3) {
    return { ok: false, error: 'picks' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const email = email_();
    const device = clean_(p.device, 64);
    const sid = clean_(p.submissionId, 64);
    const rows = rows_();

    // Same submission arriving twice (double tap, retry after a timeout): already recorded.
    const same = sid && rows.find(function (r) { return r.submissionId === sid; });
    if (same) return { ok: true, status: 'recorded', vote: public_(same) };

    const mine = findMine_(rows, email, device);
    if (mine && !p.replace) return { ok: false, error: 'duplicate', vote: public_(mine) };

    const now = new Date();
    const values = [now, name, email, device, picks[0], picks[1], picks[2], clean_(p.defence, 600), sid];
    const sh = sheet_();
    if (mine) sh.getRange(mine.row, 1, 1, values.length).setValues([values]);
    else sh.appendRow(values);

    return {
      ok: true,
      status: mine ? 'replaced' : 'recorded',
      vote: { name: name, first: picks[0], second: picks[1], third: picks[2], defence: values[7], submitted: now.toISOString() }
    };
  } finally {
    lock.releaseLock();
  }
}

function getResults(code) {
  const expected = organiserCode_();
  if (!expected) return { ok: false, error: 'no-code' };
  if (String(code || '').trim().toLowerCase() !== expected.toLowerCase()) {
    Utilities.sleep(1000); // slows down guessing
    return { ok: false };
  }
  return { ok: true, expected: EXPECTED_PANEL, votes: rows_().map(public_) };
}

function organiserCode_() {
  return String(PropertiesService.getScriptProperties().getProperty('ORGANISER_CODE') || '').trim();
}

// ---------------------------------------------------------------------------

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function rows_() {
  const sh = sheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, HEADERS.length).getValues().map(function (r, i) {
    return {
      row: i + 2,
      submitted: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
      name: String(r[1]),
      email: String(r[2]).toLowerCase(),
      device: String(r[3]),
      first: String(r[4]),
      second: String(r[5]),
      third: String(r[6]),
      defence: String(r[7]),
      submissionId: String(r[8])
    };
  }).filter(function (r) { return r.name; });
}

function findMine_(rows, email, device) {
  if (email) return rows.find(function (r) { return r.email === email; });
  if (device) return rows.find(function (r) { return r.device === device; });
  return null;
}

// Only what the page needs. Email and device ids never leave the server.
function public_(r) {
  return { name: r.name, first: r.first, second: r.second, third: r.third, defence: r.defence, submitted: r.submitted };
}

function email_() {
  try { return (Session.getActiveUser().getEmail() || '').toLowerCase(); } catch (e) { return ''; }
}

function clean_(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // stop names being read as spreadsheet formulas
  return s;
}
