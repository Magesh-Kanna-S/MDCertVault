/* =================================================================
 *  verify.js — Controller for /verify/index.html
 *
 *  KEY DESIGN: The certificate is ALWAYS rendered as an IMAGE.
 *  ----------------------------------------------------------------
 *  When a certificate is viewed:
 *    1. The HTML template is rendered off-screen at desktop A4
 *       landscape dimensions (1123 × 794 px).
 *    2. html2canvas captures it as a canvas (2246 × 1588 at 2× scale).
 *    3. The canvas is displayed on the page as a responsive <img>
 *       that scales to fit any screen — desktop, tablet, or mobile.
 *    4. The same canvas powers the PNG download.
 *
 *  This ensures the certificate looks identical on ALL devices and
 *  the downloaded PNG matches exactly what the user sees.
 *
 *  URL contract:
 *    /verify/                       → show the form
 *    /verify/?id=501059c1           → show single certificate
 *    /verify/?email=user@x.com      → show results table (multiple)
 *    /verify/?q=...                 → auto-detect id vs email
 * ================================================================= */

(function () {
  const cfg = window.CERTNOW_CONFIG;

  // ---- Wire up the brand identity from config ----
  function applyBranding() {
    document.getElementById('brand-title').textContent = cfg.site.name;
    document.getElementById('brand-subtitle').textContent = cfg.site.tagline;
  }

  // ---- View switcher ----
  function show(viewId) {
    ['form-view', 'results-view', 'cert-view', 'notfound-view'].forEach(id => {
      document.getElementById(id).style.display = (id === viewId) ? '' : 'none';
    });
  }

  // ---- Form submission ----
  function wireForm() {
    const form = document.getElementById('verify-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('verify-input').value.trim();
      if (!q) return;
      window.location.search = '?q=' + encodeURIComponent(q);
    });
  }

  // ---- Wire download + copy buttons ----
  let currentRow = null;

  function wireDownloadButtons() {
    // Single "Download Certificate" button (PNG only)
    document.getElementById('download-btn').addEventListener('click', async () => {
      if (!currentRow) return;
      const btn = document.getElementById('download-btn');
      const orig = btn.textContent;
      btn.textContent = 'Preparing…';
      try {
        await CertDownload.downloadPNG(currentRow);
      } catch (err) {
        alert('Download failed: ' + err.message);
      } finally {
        btn.textContent = orig;
      }
    });
  }

  // ---- Render a single certificate as an IMAGE ----
  async function showCertificate(row) {
    currentRow = row;
    show('cert-view');
    const root = document.getElementById('certificate-root');
    root.innerHTML = '<div class="cert-loading"><div class="spinner"></div>Rendering certificate…</div>';

    try {
      // Wait for html2canvas to be available
      await CertDownload.waitForLibs();

      // Render the certificate off-screen at desktop dimensions → canvas
      const canvas = await CertRender.renderCertificateToCanvas(row);

      // Store the canvas so the Download button can reuse it instantly
      window.__certCanvas = canvas;
      window.__certCanvasId = row.cert_id;

      // Convert the canvas to a data URL and display as a responsive <img>
      const dataUrl = canvas.toDataURL('image/png');
      root.innerHTML =
        '<img class="certificate-image" src="' + dataUrl + '" ' +
        'alt="Certificate ' + escapeHtml(row.cert_id) + '">';
    } catch (err) {
      root.innerHTML =
        '<div class="alert alert-error">Failed to render certificate: ' +
        escapeHtml(err.message) + '</div>';
    }
  }

  // ---- Render a results table ----
  function showResults(rows, query) {
    const tbody = document.getElementById('results-tbody');
    tbody.innerHTML = '';
    rows.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><strong>' + escapeHtml(row.recipient_name) + '</strong></td>' +
        '<td>' + escapeHtml(row.course_name) + '</td>' +
        '<td>' + escapeHtml(CertRender.formatDate(row.issue_date)) + '</td>' +
        '<td>' +
          '<div class="button-row" style="gap:8px;">' +
            '<span class="pill">' + escapeHtml(row.cert_id) + '</span>' +
            '<button class="button-secondary download-row-btn" data-id="' +
              escapeHtml(row.cert_id) + '">Download</button>' +
          '</div>' +
        '</td>' +
        '<td>' +
          '<a class="button-ghost" href="?id=' + encodeURIComponent(row.cert_id) + '">Open</a>' +
        '</td>';
      tbody.appendChild(tr);
    });

    // Wire per-row download buttons (one-click PNG download)
    tbody.querySelectorAll('.download-row-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const r = rows.find(x => x.cert_id === id);
        if (!r) return;
        const orig = btn.textContent;
        btn.textContent = 'Rendering…';
        try {
          await CertDownload.waitForLibs();
          await CertDownload.downloadPNG(r);
        } catch (err) {
          alert('Download failed: ' + err.message);
        } finally {
          btn.textContent = orig;
        }
      });
    });

    document.getElementById('results-summary').innerHTML =
      'We found <strong>' + rows.length + '</strong> certificate' +
      (rows.length === 1 ? '' : 's') + ' for <strong>' + escapeHtml(query) +
      '</strong>. Open any record below to verify it in detail.';
    show('results-view');
  }

  // ---- Not-found handler ----
  function showNotFound(input) {
    const msg = document.getElementById('notfound-message');
    msg.innerHTML = 'We could not find a certificate matching <strong>"' +
      escapeHtml(input) + '"</strong>. Please check your input and try again, ' +
      'or contact the issuing organization.';
    show('notfound-view');
  }

  function showFormError(message) {
    const el = document.getElementById('form-error');
    el.textContent = message;
    el.style.display = '';
  }

  function escapeHtml(s) {
    return CertRender.escapeHtml(s);
  }

  // ---- Main entry point ----
  async function init() {
    applyBranding();
    wireForm();
    wireDownloadButtons();

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const email = params.get('email');
    const q = params.get('q');

    const query = id || email || q;
    if (!query) {
      show('form-view');
      return;
    }

    show('form-view');
    try {
      const result = await CertAPI.smartFetch(query);
      if (result.mode === 'single') {
        await showCertificate(result.rows[0]);
      } else if (result.mode === 'multiple' && result.rows.length > 0) {
        showResults(result.rows, result.input);
      } else {
        showNotFound(result.input || query);
      }
    } catch (err) {
      console.error(err);
      showFormError('Could not reach the certificate database: ' + err.message +
        ' If you just forked this project, remember to edit js/config.js ' +
        'with your Google Sheets API key and Sheet ID.');
      show('form-view');
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
