/* =================================================================
 *  MY DESKTOP CERTVAULT CONFIGURATION
 *  ----------------------------------------------------------------
 *  ★ THIS IS THE ONLY FILE YOU NEED TO EDIT BEFORE GOING LIVE. ★
 *
 *  Replace every "YOUR_..._HERE" placeholder below with your own
 *  values. See docs/setup-google-sheets.md for step-by-step
 *  instructions on obtaining each value.
 * ================================================================= */

const CERTNOW_CONFIG = {  // variable name kept for backward-compatibility

  /* ---------------------------------------------------------------
   *  GOOGLE SHEETS API  (Approach A — pure static)
   *  ---------------------------------------------------------------
   *  Used when `appsScriptUrl` below is empty. The browser calls
   *  the Google Sheets API v4 directly with this API key. The key
   *  must be restricted by HTTP referrer in Google Cloud Console
   *  to your GitHub Pages URL (e.g. https://*.github.io/*).
   *
   *  The Sheet must be shared as "Anyone with the link can view".
   * --------------------------------------------------------------- */
  sheets: {
    apiKey:   "AIzaSyB7MUT5LJ9kBAQAuUGPd45hhVBmVfkNowI",
    sheetId:  "1giSxYyMPfBz_JCEHc6iWCt1kwiTpLVkZeGCULz1rJwA",   // long string in the Sheet URL
    sheetName: "Certificates",                // the tab name (case-sensitive)
  },

  /* ---------------------------------------------------------------
   *  GOOGLE DRIVE API  (optional — for hosting branding images)
   *  ---------------------------------------------------------------
   *  If you'd rather host your logo and signature images on Google
   *  Drive instead of in the /branding/ folder, set `enabled: true`
   *  and paste the file IDs below. The file IDs are the long string
   *  in any Drive share URL: https://drive.google.com/file/d/FILE_ID/view
   *
   *  Each Drive file must be shared as "Anyone with the link can
   *  view" for the API key to fetch it.
   * --------------------------------------------------------------- */
  drive: {
    apiKey:          "YOUR_GOOGLE_DRIVE_API_KEY_HERE",
    enabled:         false,
    logoFileId:      "YOUR_LOGO_FILE_ID_HERE",
    // Per-row signature images are loaded by file name from
    // /branding/signatures/ by default. Drive hosting for them is
    // not currently wired — keep drive.enabled = false to use the
    // local folder approach.
  },

  /* ---------------------------------------------------------------
   *  APPS SCRIPT BACKEND  (Approach B — recommended for PII)
   *  ---------------------------------------------------------------
   *  If you'd rather hide your Sheet and API key behind a thin
   *  serverless API, deploy the script in /apps-script/Code.gs as
   *  a Web App and paste its URL here. The site will then call
   *  this URL instead of calling Google Sheets API directly.
   *
   *  Leave as "" to use Approach A (above). See:
   *  docs/setup-google-sheets.md  →  "Approach B" section
   * --------------------------------------------------------------- */
  appsScriptUrl: "",

  /* ---------------------------------------------------------------
   *  SITE IDENTITY  (shown in the header + on the certificate)
   * --------------------------------------------------------------- */
  site: {
    name:        "My Desktop CertVault",            // header brand title
    tagline:     "Certificate Studio",              // header subtitle
    issuerName:  "My Desktop Tech",                 // issuing org line on cert
    issuerTitle: "Certification Authority",         // tagline below org name
    homeUrl:     "../",                             // where the brand mark links
    repoUrl:     "https://github.com/your-username/certvault",
  },

  /* ---------------------------------------------------------------
   *  SIGNATURES  (defaults used when a row's sign*_file_name is empty)
   *  ---------------------------------------------------------------
   *  Each row in your Sheet/CSV may override these with its own
   *  `sign1_file_name` / `sign2_file_name` column. Files are looked
   *  up by name inside /branding/signatures/.
   * --------------------------------------------------------------- */
  signatures: {
    sign1: {
      fileName:    "signature-1.svg",
      personName:  "Program Director",
      designation: "Course Coordinator",
    },
    sign2: {
      fileName:    "signature-2.svg",
      personName:  "Academic Head",
      designation: "Department of Management Studies",
    },
  },

  /* ---------------------------------------------------------------
   *  OUTPUT  (filenames for downloaded PDFs and PNGs)
   * --------------------------------------------------------------- */
  output: {
    pdfPrefix:  "certificate",   // → certificate-501059c1.pdf
    pngPrefix:  "certificate",   // → certificate-501059c1.png
    qrEnabled:  false,           // v2: QR code removed from the certificate
  },
};

// Expose globally (no module system — keeps the project build-free)
window.CERTNOW_CONFIG = CERTNOW_CONFIG;
