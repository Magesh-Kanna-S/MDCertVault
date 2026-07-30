/* =================================================================
 *  download.js — PNG exporter (image-only, no PDF)
 *  ----------------------------------------------------------------
 *  The certificate is rendered off-screen at desktop dimensions
 *  (1123 × 794 px) by CertRender.renderCertificateToCanvas(), which
 *  returns a tightly-cropped canvas with NO white space on the right
 *  or bottom.
 *
 *  That same canvas is:
 *    1. Displayed on the page as a responsive <img> (via toDataURL).
 *    2. Downloaded as a high-resolution PNG (via toBlob).
 *
 *  This means the downloaded PNG is pixel-identical to what the user
 *  sees on screen — and it looks the same on desktop, tablet, and
 *  mobile because it is an image, not live HTML.
 *
 *  CDN dependency (loaded in verify/index.html):
 *    - html2canvas  → window.html2canvas
 * ================================================================= */

const CertDownload = (function () {

  function waitForLibs() {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      (function check() {
        if (window.html2canvas) return resolve();
        if (Date.now() - start > 12000)
          return reject(new Error('Image library failed to load. Check your network.'));
        setTimeout(check, 80);
      })();
    });
  }

  function fileName(prefix, row, ext) {
    const id = (row && row.cert_id) ? row.cert_id : 'unknown';
    return `${prefix}-${id}.${ext}`;
  }

  /**
   * Download the certificate as a PNG image.
   *
   * If the certificate was already rendered to a canvas (stored in
   * window.__certCanvas), we reuse it. Otherwise we render fresh.
   * The canvas is always captured at exactly 1123 × 794 (× 2 scale =
   * 2246 × 1588 px), so the PNG has NO extra white space.
   */
  async function downloadPNG(row) {
    await waitForLibs();

    let canvas;
    // Reuse the already-rendered canvas if it matches this row
    if (window.__certCanvas && window.__certCanvasId === row.cert_id) {
      canvas = window.__certCanvas;
    } else {
      canvas = await CertRender.renderCertificateToCanvas(row);
    }

    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    triggerDownload(blob, fileName(window.CERTNOW_CONFIG.output.pngPrefix, row, 'png'));
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyVerifyLink(row) {
    const url = CertRender.buildVerifyUrl(row.cert_id);
    try {
      await navigator.clipboard.writeText(url);
      return url;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      return url;
    }
  }

  return { downloadPNG, copyVerifyLink, waitForLibs };
})();
