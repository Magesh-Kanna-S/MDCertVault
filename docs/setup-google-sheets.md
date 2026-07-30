# Setting Up Google Sheets

This guide walks you through creating the spreadsheet, obtaining an API key,
and connecting it to My Desktop CertVault. Total setup time: ~15 minutes.

---

## Step 1 — Create the Sheet

1. Go to [sheets.new](https://sheets.new) to create a blank spreadsheet.
2. Rename the default tab to **`Certificates`** (case-sensitive).
3. Paste the following headers into row 1, columns A–H:

| A          | B               | C      | D            | E          | F            | G             | H       |
|------------|-----------------|--------|--------------|------------|--------------|---------------|---------|
| `cert_id`  | `recipient_name`| `email`| `course_name`| `issue_date`| `issuer_name`| `issuer_title`| `issued`|

4. Freeze row 1: **View → Freeze → 1 row**.
5. Add data validation:
   - Column C (email): **Data → Data validation → Email address**
   - Column E (issue_date): format as **Format → Number → Date**
   - Column H (issued): dropdown with values `TRUE` / `FALSE`
6. Add a few sample rows. You can import `docs/sample-sheet.csv` for a starter set.

## Step 2 — Get the Sheet ID

The Sheet ID is the long string in your Sheet URL:

```
https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_SHEET_ID/edit#gid=0
```

Copy `THIS_IS_YOUR_SHEET_ID` — you'll paste it into `js/config.js` as `sheets.sheetId`.

---

## Step 3 — Choose Your Backend Approach

### Approach A — Pure Static (default, fastest)

The browser calls the Google Sheets API v4 directly. Your API key will be
visible in the browser source, but you'll restrict it by HTTP referrer so
only your GitHub Pages URL can use it.

**Steps:**

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or reuse an existing one).
3. **APIs & Services → Library → search "Google Sheets API" → Enable.**
4. **APIs & Services → Credentials → Create credentials → API key.**
5. Copy the API key — you'll paste it into `js/config.js` as `sheets.apiKey`.
6. **Restrict the key:**
   - Application restrictions: **HTTP referrers**
   - Add your GitHub Pages URL: `https://*.github.io/*`
   - (Add `http://localhost:*/*` for local testing)
7. **API restrictions:**
   - Restrict key → select only **Google Sheets API**
8. **Share your Sheet:**
   - In the Sheet, click **Share → Anyone with the link → Viewer**.
9. **Edit `js/config.js`:**
   ```js
   sheets: {
     apiKey:   "AIzaSy...",          // ← your API key
     sheetId:  "1AbCdEf...",         // ← your Sheet ID
     sheetName: "Certificates",
   }
   ```

✅ Done. You're using Approach A.

---

### Approach B — Apps Script (recommended for PII)

Hides your Sheet and API key behind a thin serverless API. Use this if
your Sheet contains email addresses or other personal data.

**Steps:**

1. Open your Sheet → **Extensions → Apps Script**.
2. Delete the placeholder code and paste the contents of `apps-script/Code.gs` from this repo.
3. **Deploy → New deployment:**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Authorize the script when prompted.
5. Copy the deployment URL (ends in `/exec`).
6. **Edit `js/config.js`:**
   ```js
   appsScriptUrl: "https://script.google.com/macros/s/AKfycb.../exec",
   ```
7. You can leave `sheets.apiKey` and `sheets.sheetId` as placeholders —
   they won't be used when `appsScriptUrl` is set.

✅ Done. You're using Approach B. The Sheet does NOT need to be shared
publicly — the script runs as you and reads it on behalf of the browser.

---

## Step 4 (Optional) — Google Drive for Branding Images

If you'd rather host your logo and signature on Google Drive instead of in
the `/branding/` folder:

1. Upload your `logo.png` and `signature.png` to Google Drive.
2. For each file: right-click → **Share → Anyone with the link → Viewer**.
3. Copy the file ID from the share URL:
   `https://drive.google.com/file/d/THIS_IS_THE_FILE_ID/view`
4. In Google Cloud Console, enable **Google Drive API** and create an API key
   restricted to your GitHub Pages URL.
5. **Edit `js/config.js`:**
   ```js
   drive: {
     apiKey:          "AIzaSy...",
     enabled:         true,
     logoFileId:      "1AbCdEf...",
     signatureFileId: "1XyZwVu...",
   }
   ```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| 403 in browser console | API key not restricted to your Pages URL | Add `https://*.github.io/*` to allowed referrers |
| 403 from Sheets API | Sheet not shared publicly (Approach A) | Share → Anyone with link can view |
| 401 from Apps Script | Web app deployed as "only myself" | Redeploy with access = Anyone |
| Empty results | Sheet tab name mismatch | Check `sheetName` in config matches the tab exactly |
| CORS error in console | Apps Script returning wrong MIME type | Should be `ContentService.MimeType.JSON` — see Code.gs |

For more help, open an issue at the repo URL listed in your `js/config.js`.
