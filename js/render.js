/* =================================================================
 *  render.js — Template rendering + certificate assembly
 *  ----------------------------------------------------------------
 *  Handles:
 *    - {{placeholder}} substitution from the row object
 *    - Resolution of per-row signature image files
 *      (sign1_file_name / sign2_file_name) inside /branding/signatures/
 *    - Optional Google Drive image hosting for the logo
 *    - QR code injection
 * ================================================================= */

const CertRender = (function () {

  // ---- Derive the project root URL from render.js's own <script src> ----
  // render.js lives at <root>/js/render.js, so root = scriptSrc minus 'js/render.js'.
  const SCRIPT_SRC = (function () {
    if (document.currentScript && document.currentScript.src) {
      return document.currentScript.src;
    }
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const s = scripts[i];
      if (s.src && /\/render\.js(\?|$)/.test(s.src)) return s.src;
    }
    return '';
  })();

  // Strip trailing /js/render.js (and any ?query) → project root with trailing /
  const PROJECT_ROOT = (function () {
    const m = SCRIPT_SRC.match(/^(.*)\/js\/render\.js(?:\?.*)?$/);
    return m ? m[1] + '/' : '';
  })();

  // Folder that holds per-row signature images.
  const SIGNATURES_DIR = 'branding/signatures/';

  let cachedTemplate = null;

  /**
   * Load the certificate template (cached after first call).
   * @returns {Promise<string>}
   */
  async function loadTemplate() {
    if (cachedTemplate) return cachedTemplate;
    if (!PROJECT_ROOT) {
      throw new Error('Could not determine project root — check that render.js is loaded via a <script src> tag.');
    }
    const templatePath = PROJECT_ROOT + 'templates/certificate.html';
    const res = await fetch(templatePath);
    if (!res.ok) {
      throw new Error('Failed to load certificate template: ' + res.status +
        ' (looked at ' + templatePath + ')');
    }
    cachedTemplate = await res.text();
    return cachedTemplate;
  }

  /**
   * Replace {{placeholders}} in the template with row values.
   * Unknown placeholders are left intact (visible as a debugging aid).
   * @param {string} template
   * @param {Object} row
   * @returns {string}
   */
  function fillTemplate(template, row) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const val = row[key.toLowerCase()];
      if (val === undefined || val === '') return match;
      return escapeHtml(val);
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Format an ISO date (2026-04-15) as "April 2026".
   * Falls back to the raw string if parsing fails.
   */
  function formatDate(iso) {
    if (!iso) return '';
    const m = iso.match(/^(\d{4})-(\d{2})/);
    if (!m) return iso;
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    return `${months[parseInt(m[2],10) - 1]} ${m[1]}`;
  }

  /**
   * Resolve a per-row signature image URL.
   * Falls back to the configured default file name when the row
   * doesn't specify one.
   */
  function resolveSignatureUrl(rowFile, defaultFile) {
    const file = (rowFile && String(rowFile).trim()) || defaultFile;
    if (!file) return '';
    // Allow callers to pass either a bare file name (resolved in
    // /branding/signatures/) or an absolute URL (http/https, data:).
    if (/^(https?:)?\/\//.test(file) || file.startsWith('data:')) return file;
    return PROJECT_ROOT + SIGNATURES_DIR + file;
  }

  /**
   * Build the full certificate DOM and render into a container.
   * @param {HTMLElement} container
   * @param {Object} row
   */
  async function renderCertificate(container, row) {
    const template = await loadTemplate();
    const cfg = window.CERTNOW_CONFIG;
    const sigCfg = cfg.signatures || {};

    // Compute signature display values (row → config default → empty)
    const sign1PersonName  = row.sign1_person_name  || (sigCfg.sign1 && sigCfg.sign1.personName)  || '';
    const sign1Designation = row.sign1_designation  || (sigCfg.sign1 && sigCfg.sign1.designation) || '';
    const sign2PersonName  = row.sign2_person_name  || (sigCfg.sign2 && sigCfg.sign2.personName)  || '';
    const sign2Designation = row.sign2_designation  || (sigCfg.sign2 && sigCfg.sign2.designation) || '';

    const prepared = {
      ...row,
      issue_date_display: formatDate(row.issue_date),
      issuer_name:  row.issuer_name  || cfg.site.issuerName,
      issuer_title: row.issuer_title || cfg.site.issuerTitle,
      sign1_person_name:  sign1PersonName,
      sign1_designation:  sign1Designation,
      sign2_person_name:  sign2PersonName,
      sign2_designation:  sign2Designation,
      verify_url: buildVerifyUrl(row.cert_id),
    };
    container.innerHTML = fillTemplate(template, prepared);

    // Resolve signature image src from per-row file names
    const sig1Img = container.querySelector('[data-signature-1]');
    if (sig1Img) {
      const url = resolveSignatureUrl(row.sign1_file_name, sigCfg.sign1 && sigCfg.sign1.fileName);
      if (url) sig1Img.src = url;
    }
    const sig2Img = container.querySelector('[data-signature-2]');
    if (sig2Img) {
      const url = resolveSignatureUrl(row.sign2_file_name, sigCfg.sign2 && sigCfg.sign2.fileName);
      if (url) sig2Img.src = url;
    }

    // Inject QR code if enabled
    if (cfg.output.qrEnabled) {
      injectQR(container, prepared.verify_url);
    }

    // Inject branding logo from Drive if enabled
    if (cfg.drive && cfg.drive.enabled) {
      injectDriveImages(container);
    }
  }

  /**
   * Build the public verify URL for a certificate.
   * Uses PROJECT_ROOT (derived from render.js's src) for robustness.
   */
  function buildVerifyUrl(certId) {
    if (PROJECT_ROOT) {
      return PROJECT_ROOT + 'verify/?id=' + encodeURIComponent(certId);
    }
    // Fallback: derive from current location
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const rootPath = '/' + pathParts.slice(0, -1).join('/') + '/';
    return window.location.origin + rootPath + 'verify/?id=' + encodeURIComponent(certId);
  }

  /**
   * QR code via public api.qrserver.com.
   * Swap for a local library if you want zero external requests.
   */
  function injectQR(container, url) {
    const slot = container.querySelector('[data-qr]');
    if (!slot) return;
    const size = 120;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
    slot.innerHTML = `<img src="${qrUrl}" width="72" height="72" alt="QR code linking to ${escapeHtml(url)}" class="cert-qr">`;
  }

  async function injectDriveImages(container) {
    const cfg = window.CERTNOW_CONFIG.drive;
    if (!cfg.apiKey || cfg.apiKey.startsWith('YOUR_')) return;
    const logoImg = container.querySelector('[data-logo]');
    if (logoImg && cfg.logoFileId) {
      logoImg.src = `https://www.googleapis.com/drive/v3/files/${cfg.logoFileId}?alt=media&key=${cfg.apiKey}`;
    }
  }

  // ---- Desktop-size rendering → canvas ----
  //
  // The certificate is ALWAYS rendered off-screen at the desktop A4
  // landscape pixel dimensions (1123 × 794 at 96 dpi). html2canvas
  // then captures it at exactly those dimensions, producing a canvas
  // that is:
  //   - Identical on every device (desktop, tablet, phone) because
  //     it is an image, not live HTML subject to responsive CSS.
  //   - Tightly cropped — no white space on the right or bottom.
  //
  // The caller can:
  //   - Display the canvas as a responsive <img> (via toDataURL).
  //   - Download it as a PNG (via toBlob).

  const DESKTOP_W = 1123;
  const DESKTOP_H = 794;

  /**
   * Wait for all <img> elements inside a container to finish loading.
   * Includes a generous timeout so a broken QR or logo doesn't block
   * forever.
   */
  function waitForImages(container) {
    const imgs = container.querySelectorAll('img');
    return Promise.all(Array.from(imgs).map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(resolve => {
        const settled = () => {
          img.removeEventListener('load', settled);
          img.removeEventListener('error', settled);
          resolve();
        };
        img.addEventListener('load', settled);
        img.addEventListener('error', settled);
        // Timeout fallback — don't block more than 8s per image
        setTimeout(settled, 8000);
      });
    }));
  }

  /**
   * Render the certificate off-screen at desktop dimensions and
   * capture it as a canvas via html2canvas.
   *
   * @param {Object} row  The certificate row data
   * @returns {Promise<HTMLCanvasElement>}  Canvas at 2× scale (2246×1588)
   */
  async function renderCertificateToCanvas(row) {
    if (!window.html2canvas) {
      throw new Error('html2canvas is not loaded yet. Check your network connection.');
    }

    // 1. Create an off-screen container at desktop dimensions
    const offscreen = document.createElement('div');
    offscreen.style.position = 'absolute';
    offscreen.style.left = '-99999px';
    offscreen.style.top = '0';
    offscreen.style.width = DESKTOP_W + 'px';
    offscreen.style.height = DESKTOP_H + 'px';
    offscreen.style.pointerEvents = 'none';
    document.body.appendChild(offscreen);

    try {
      // 2. Render the certificate HTML into the off-screen container
      await renderCertificate(offscreen, row);

      // 3. Force explicit pixel dimensions on the certificate element
      //    (overrides aspect-ratio CSS for pixel-perfect capture)
      const certEl = offscreen.querySelector('.certificate');
      if (!certEl) throw new Error('Certificate element not found after render.');
      certEl.style.width = DESKTOP_W + 'px';
      certEl.style.height = DESKTOP_H + 'px';

      // 4. Wait for all images (logo, signatures, QR) to load
      await waitForImages(offscreen);

      // 5. Small delay for final browser paint
      await new Promise(r => setTimeout(r, 200));

      // 6. Capture with html2canvas at exactly DESKTOP_W × DESKTOP_H
      const canvas = await window.html2canvas(certEl, {
        scale:           2,                    // 2× for high-DPI / print quality
        width:           DESKTOP_W,
        height:          DESKTOP_H,
        windowWidth:     DESKTOP_W,
        windowHeight:    DESKTOP_H,
        backgroundColor: '#ffffff',
        useCORS:         true,
        allowTaint:      true,
        logging:         false,
        scrollX:         0,
        scrollY:         0,
      });

      return canvas;
    } finally {
      // 7. Clean up the off-screen container
      offscreen.remove();
    }
  }

  // Expose for debugging
  return {
    renderCertificate,
    renderCertificateToCanvas,
    fillTemplate,
    formatDate,
    escapeHtml,
    buildVerifyUrl,
    resolveSignatureUrl,
    waitForImages,
    _projectRoot: PROJECT_ROOT,
  };
})();
