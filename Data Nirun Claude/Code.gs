/**
 * DATA NIRUN — รับข้อมูลจากฟอร์มบนเว็บ แล้วบันทึกลง Google Sheet
 *
 * วิธีใช้
 * 1) เปิด Google Sheet ที่ต้องการเก็บข้อมูล > ส่วนขยาย > Apps Script
 *    (หรือใช้โปรเจกต์ Apps Script เดิม แล้วใส่ SHEET_ID ด้านล่าง)
 * 2) วางโค้ดนี้ > บันทึก
 * 3) ทำให้ใช้งานได้ > การทำให้ใช้งานได้รายการใหม่ > ประเภท: เว็บแอป
 *    - ดำเนินการในฐานะ: ฉัน
 *    - ผู้มีสิทธิ์เข้าถึง: ทุกคน
 * 4) คัดลอก URL ที่ลงท้ายด้วย /exec ไปใส่ใน CONFIG.SUBMIT_URL ของ index.html
 */

const SHEET_ID = '';          // เว้นว่างได้ถ้าสคริปต์ผูกกับ Sheet อยู่แล้ว
const SHEET_NAME = 'Leads';
const HEADERS = ['Timestamp', 'Email', 'Interest', 'Consent', 'Newsletter', 'Page', 'User agent'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = (e && e.parameter) || {};
    const email = String(p.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || p.consent !== 'yes') {
      return json_({ ok: false, error: 'invalid' });
    }
    const sheet = getSheet_();
    sheet.appendRow([
      new Date(),
      email,
      String(p.interest || '').slice(0, 100),
      'yes',
      p.newsletter === 'yes' ? 'yes' : 'no',
      String(p.page || '').slice(0, 300),
      String(p.ua || '').slice(0, 300)
    ]);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
