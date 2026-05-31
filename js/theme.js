// Shared behaviour for project landing + privacy pages:
// goal tracking, footer year, and the light/dark theme toggle.
document.addEventListener('DOMContentLoaded', function () {
  function trackGoal(goalName, params = {}) {
    if (typeof ym !== 'undefined') {
      try { ym(65479363, 'reachGoal', goalName, params); } catch (e) {}
    }
  }

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-goal]');
    if (!el) return;
    const params = {};
    if (el.hasAttribute('data-goal-params')) {
      try { Object.assign(params, JSON.parse(el.getAttribute('data-goal-params'))); } catch (err) {}
    }
    trackGoal(el.getAttribute('data-goal'), params);
  });

  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  if (!themeToggle) return;

  function getCurrentTheme() {
    if (body.classList.contains('dark-theme')) return 'dark';
    if (body.classList.contains('light-theme')) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function updateThemeIcon(theme) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) body.className = savedTheme;
  updateThemeIcon(getCurrentTheme());

  themeToggle.addEventListener('click', () => {
    const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    body.className = next + '-theme';
    localStorage.setItem('theme', next + '-theme');
    updateThemeIcon(next);
    trackGoal('theme_toggle', { theme: next });
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!localStorage.getItem('theme')) updateThemeIcon(getCurrentTheme());
  });
});
