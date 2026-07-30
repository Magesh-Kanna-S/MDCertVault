/* =================================================================
 *  api.js — Data fetching layer
 *  Talks to either Google Sheets API v4 (Approach A) or your
 *  Apps Script Web App (Approach B), based on CERTNOW_CONFIG.
 * ================================================================= */

const CertAPI = (function () {
  const cfg = window.CERTNOW_CONFIG;

  // ---------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------
  return {

    /**
     * Fetch a single certificate row by its 8-char hex ID.
     * @param {string} certId  e.g. "501059c1"
     * @returns {Promise<Object|null>}  row object or null if not found
     */
    async fetchCertificate(certId) {
      const rows = await fetchAllRows();
      return rows.find(r => r.cert_id.toLowerCase() === certId.toLowerCase()) || null;
    },

    /**
     * Fetch all certificates whose email matches.
     * @param {string} email
     * @returns {Promise<Array<Object>>}  array of rows (possibly empty)
     */
    async fetchByEmail(email) {
      const rows = await fetchAllRows();
      const e = email.trim().toLowerCase();
      return rows.filter(r => (r.email || "").toLowerCase() === e);
    },

    /**
     * Auto-detect whether the input looks like an email or a cert ID
     * and call the appropriate fetcher.
     * @param {string} input
     * @returns {Promise<{mode:'single'|'multiple'|'none', rows:Array, input:string}>}
     */
    async smartFetch(input) {
      const trimmed = (input || "").trim();
      if (!trimmed) return { mode: 'none', rows: [], input: '' };

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
      if (isEmail) {
        const rows = await this.fetchByEmail(trimmed);
        return { mode: 'multiple', rows, input: trimmed };
      } else {
        const row = await this.fetchCertificate(trimmed);
        return {
          mode: row ? 'single' : 'none',
          rows: row ? [row] : [],
          input: trimmed,
        };
      }
    },
  };

  // ---------------------------------------------------------------
  // Internal — fetch all rows once per page load, then filter.
  // For large Sheets (>1000 rows), switch to Approach B with a
  // server-side filter (see /apps-script/Code.gs).
  // ---------------------------------------------------------------
  async function fetchAllRows() {
    if (cfg.appsScriptUrl) {
      // ---- Approach B: Apps Script ----
      const url = cfg.appsScriptUrl;
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) throw new Error('Apps Script request failed: ' + res.status);
      const data = await res.json();
      return data.rows || [];
    } else {
      // ---- Approach A: direct Google Sheets API ----
      const { apiKey, sheetId, sheetName } = cfg.sheets;
      if (!apiKey || apiKey.startsWith('YOUR_')) {
        throw new Error('Configuration incomplete: edit js/config.js and add your Google Sheets API key.');
      }
      if (!sheetId || sheetId.startsWith('YOUR_')) {
        throw new Error('Configuration incomplete: edit js/config.js and add your Google Sheet ID.');
      }
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error('Google Sheets API error: ' + (err.error?.message || res.status));
      }
      const data = await res.json();
      return parseSheetValues(data.values || []);
    }
  }

  /**
   * Convert the raw array-of-arrays from the Sheets API into an
   * array of objects keyed by the header row.
   */
  function parseSheetValues(values) {
    if (!values.length) return [];
    const headers = values[0].map(h => h.trim().toLowerCase());
    return values.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (row[i] || '').trim(); });
      // Only return rows that have been issued (issued === TRUE or empty)
      // AND have a non-empty cert_id
      obj._hidden = (obj.issued || '').toLowerCase() === 'false';
      return obj;
    }).filter(r => r.cert_id && !r._hidden);
  }
})();
