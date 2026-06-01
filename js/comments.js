// ─────────────────────────────────────────────────────────────────────────────
// Reusable site-wide comments widget (Cusdis-backed).
//
// Drop-in on ANY page — not tied to one project:
//   <div id="comments"></div>
//   <script src="/js/comments.js?v=1.0" defer></script>
//
// It derives a stable per-page thread id from the URL, wires light/dark theme to
// the site theme toggle, and — until you set an App ID below — renders a quiet
// placeholder instead of a live thread, so there is ZERO spam surface before
// you've configured it.
//
// ── Going live (≈1 min) ──────────────────────────────────────────────────────
//   1. Create a free site at https://cusdis.com (or self-host Cusdis via Docker
//      and point CUSDIS_HOST at it).
//   2. Copy the App ID into CUSDIS_APP_ID below and deploy.
//
// ── Anti-bot (important) ─────────────────────────────────────────────────────
//   Cusdis renders its own form inside an iframe, so a custom honeypot can't be
//   injected there. The bot protection IS Cusdis's approval queue: keep
//   "Approve required" ON in the Cusdis dashboard. A comment then posts into your
//   queue (you get an email / Telegram ping) and only shows publicly after a
//   one-tap approve — so a bot can never flood the visible page. Cusdis also
//   rate-limits posting server-side. Recommended: leave approval ON.
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────────────
  var CUSDIS_HOST = 'https://comments.ipershin.me';   // self-hosted Cusdis instance
  var CUSDIS_APP_ID = '3dac5d50-c6c5-4bec-ade1-c5a912070a8c';   // Cusdis website App ID
  var CUSDIS_SCRIPT = CUSDIS_HOST + '/js/cusdis.es.js';

  function currentTheme() {
    if (document.body.classList.contains('dark-theme')) return 'dark';
    if (document.body.classList.contains('light-theme')) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Stable, unique id per page (independent of query string / trailing slash).
  function pageId() {
    var p = location.pathname.replace(/\/+$/, '');
    return p === '' ? '/' : p;
  }

  function init() {
    var mount = document.getElementById('comments');
    if (!mount) return;

    var heading = document.createElement('h2');
    heading.className = 'comments-heading';
    heading.textContent = 'Comments';
    mount.appendChild(heading);

    // Not configured yet → friendly placeholder, no network, no spam surface.
    if (!CUSDIS_APP_ID) {
      var note = document.createElement('p');
      note.className = 'comments-placeholder';
      note.textContent = 'Comments are opening soon.';
      mount.appendChild(note);
      return;
    }

    var thread = document.createElement('div');
    thread.id = 'cusdis_thread';
    thread.setAttribute('data-host', CUSDIS_HOST);
    thread.setAttribute('data-app-id', CUSDIS_APP_ID);
    thread.setAttribute('data-page-id', pageId());
    thread.setAttribute('data-page-url', location.href);
    thread.setAttribute('data-page-title', document.title);
    thread.setAttribute('data-theme', currentTheme());
    mount.appendChild(thread);

    var s = document.createElement('script');
    s.async = true;
    s.defer = true;
    s.src = CUSDIS_SCRIPT;
    document.body.appendChild(s);

    // Keep the embedded thread in sync with the site's light/dark toggle.
    var themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        // Defer so body class is already updated by theme.js.
        setTimeout(function () {
          if (window.CUSDIS && typeof window.CUSDIS.setTheme === 'function') {
            window.CUSDIS.setTheme(currentTheme());
          }
        }, 0);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
