/**
 * Injects the shared PWA boilerplate (manifest link, iOS meta tags,
 * favicon/touch-icon links, view-transition CSS, service-worker
 * registration, and an offline-aware toast) into every top-level
 * HTML page.
 *
 * Idempotent — running it twice is safe. Each block is wrapped in a
 * `<!-- KOVIN-PWA:START/END -->` sentinel; if found, that page is
 * skipped so re-running after editing one page doesn't duplicate
 * the injection in the others.
 *
 * Usage: node scripts/inject-pwa-shell.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAGES = [
  'index.html', 'selector.html', 'eliminate.html', 'journey.html',
  'confidence.html', 'lifemode.html', 'library.html', 'horizon.html',
  'secondopinion.html',
];

const HEAD_BLOCK = `<!-- KOVIN-PWA:START -->
<link rel="manifest" href="manifest.json">
<link rel="icon" href="icons/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Kovin">
<meta name="mobile-web-app-capable" content="yes">
<style>
  /* Native-feeling cross-page transitions in browsers that support
     the View Transitions API (Chrome/Edge on Android, desktop).
     Everywhere else this is silently ignored — plain navigation. */
  @view-transition { navigation: auto; }
  ::view-transition-old(root), ::view-transition-new(root) {
    animation-duration: 0.32s;
    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }
  ::view-transition-old(root) { animation-name: kovin-fade-out; }
  ::view-transition-new(root) { animation-name: kovin-fade-in; }
  @keyframes kovin-fade-out { to { opacity: 0; transform: scale(0.99); } }
  @keyframes kovin-fade-in { from { opacity: 0; transform: scale(1.01); } }

  /* Offline-aware in-page banner (separate from offline.html, which
     only appears on a full navigation with nothing cached). */
  #kovin-offline-banner {
    position: fixed; left: 50%; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
    transform: translateX(-50%) translateY(20px);
    background: #1A1612; color: #F7F4EF; font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.8rem; font-weight: 600; padding: 11px 20px; border-radius: 100px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.28); z-index: 9999;
    opacity: 0; pointer-events: none; transition: opacity 0.3s ease, transform 0.3s ease;
    white-space: nowrap; max-width: 90vw;
  }
  #kovin-offline-banner.is-visible { opacity: 1; transform: translateX(-50%) translateY(0); }
</style>
<!-- KOVIN-PWA:END -->`;

const BODY_BLOCK = `<!-- KOVIN-PWA:START -->
<div id="kovin-offline-banner" role="status" aria-live="polite">You're offline — saved products and recent guidance are still available.</div>
<script>
(function () {
  'use strict';

  /* ── Service worker: app-shell caching, offline fallback, push/sync-ready ── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  /* ── In-page offline/online banner (page already loaded, connection drops) ── */
  var offlineBanner = document.getElementById('kovin-offline-banner');
  function setOfflineState(isOffline) {
    if (!offlineBanner) return;
    if (isOffline) {
      offlineBanner.textContent = "You're offline — saved products and recent guidance are still available.";
      offlineBanner.classList.add('is-visible');
    } else {
      offlineBanner.textContent = 'Back online.';
      offlineBanner.classList.add('is-visible');
      setTimeout(function () { offlineBanner.classList.remove('is-visible'); }, 2200);
    }
  }
  window.addEventListener('offline', function () { setOfflineState(true); });
  window.addEventListener('online', function () { setOfflineState(false); });
  if (!navigator.onLine) setOfflineState(true);

  /* ── Native share — used by any element with [data-kovin-share] ── */
  window.kovinShare = function (title, text, url) {
    var shareUrl = url || window.location.href;
    if (navigator.share) {
      navigator.share({ title: title || 'Kovin', text: text || '', url: shareUrl }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(function () {
        if (offlineBanner) {
          offlineBanner.textContent = 'Link copied.';
          offlineBanner.classList.add('is-visible');
          setTimeout(function () { offlineBanner.classList.remove('is-visible'); }, 1800);
        }
      }).catch(function () {});
    }
  };
})();
</script>
<!-- KOVIN-PWA:END -->`;

let changed = 0;
PAGES.forEach((file) => {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) { console.log(`skip (not found): ${file}`); return; }
  let html = fs.readFileSync(filePath, 'utf8');

  if (html.includes('KOVIN-PWA:START')) {
    console.log(`skip (already injected): ${file}`);
    return;
  }

  if (!html.includes('</head>') || !html.includes('</body>')) {
    console.log(`skip (no </head> or </body>): ${file}`);
    return;
  }

  html = html.replace('</head>', `${HEAD_BLOCK}\n</head>`);
  html = html.replace('</body>', `${BODY_BLOCK}\n</body>`);

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`injected: ${file}`);
  changed++;
});

console.log(`\nDone. ${changed} of ${PAGES.length} pages updated.`);
