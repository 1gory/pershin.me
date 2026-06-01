document.addEventListener('DOMContentLoaded', function() {
  // Universal goal tracking function
  function trackGoal(goalName, params = {}) {
    if (typeof ym !== 'undefined') {
      try {
        ym(65479363, 'reachGoal', goalName, params);
        console.log('✅ Goal successfully tracked:', goalName, params);
      } catch (error) {
        console.error('❌ Error tracking goal:', goalName, error);
      }
    } else {
      console.warn('⚠️ Yandex.Metrika not available, goal not tracked:', goalName, params);
    }
  }

  // Universal click handler for elements with data-goal attribute
  document.addEventListener('click', function(e) {
    const element = e.target.closest('[data-goal]');
    if (element) {
      const goalName = element.getAttribute('data-goal');
      const goalParams = {};

      // Parse additional parameters if present
      if (element.hasAttribute('data-goal-params')) {
        try {
          Object.assign(goalParams, JSON.parse(element.getAttribute('data-goal-params')));
        } catch (error) {
          console.error('❌ Error parsing goal params:', error);
        }
      }

      trackGoal(goalName, goalParams);
    }
  });

  function renderStoreStats(stats, cs) {
    const parts = [];
    if (typeof cs.rating === 'number') {
      const reviews = cs.ratingCount ? ` (${cs.ratingCount})` : '';
      parts.push(`<span class="rating-star" aria-hidden="true">★</span> ${cs.rating.toFixed(1)}${reviews}`);
    }
    if (typeof cs.users === 'number') {
      parts.push(`${cs.users.toLocaleString('en-US')} users`);
    }
    if (cs.version) {
      const safeVersion = String(cs.version).replace(/[^\w.-]/g, '');
      if (safeVersion) parts.push(`v${safeVersion}`);
    }
    if (parts.length) {
      stats.innerHTML = parts.join(' · ');
      stats.style.display = '';
    }
  }

  function extractExtensionId(url) {
    const m = url && url.match(/\/detail\/[^/]+\/([a-p]{32})/);
    return m ? m[1] : null;
  }

  // Chrome Web Store stats are prepared server-side: an hourly cron writes
  // /stats.json into the web root (see ops/update-stats.py), so the client just
  // reads its own origin — no shields.io calls, no rate-limit flakiness, and a
  // field can't vanish on a flaky fetch (the server keeps last-known-good values).
  // One request is shared across every card via the cached promise.
  let _serverStatsPromise = null;
  function fetchLiveChromeStoreStats(extId) {
    if (!_serverStatsPromise) {
      _serverStatsPromise = fetch('/stats.json', { cache: 'no-store' })
        .then(r => (r.ok ? r.json() : null))
        .then(d => (d && d.stats) ? d.stats : {})
        .catch(() => ({}));
    }
    return _serverStatsPromise.then(all => all[extId] || {});
  }

  // Projects loading
  const loadingIndicator = document.getElementById('loading-indicator');

  fetch('./projects.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(projects => {
      const cardsContainer = document.querySelector('.cards');
      const template = document.querySelector('.card-template');

      // Hide loading indicator
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }

      projects.forEach(project => {
        const card = template.content.cloneNode(true);

        // Fill card data — make the title link to the project homepage if set
        const titleEl = card.querySelector('.card-title');
        titleEl.textContent = '';
        if (project.homepage) {
          const titleLink = document.createElement('a');
          titleLink.href = project.homepage;
          titleLink.target = '_blank';
          titleLink.rel = 'noopener';
          titleLink.className = 'card-title-link';
          titleLink.textContent = project.name;
          titleLink.setAttribute('data-goal', 'project_homepage_click');
          titleLink.setAttribute('data-goal-params', JSON.stringify({project_name: project.name}));
          titleEl.appendChild(titleLink);
        } else {
          titleEl.textContent = project.name;
        }
        card.querySelector('.card-text').textContent = project.description;

        // Optional status pill (e.g. "In development") — generic, any project may set it
        const statusEl = card.querySelector('.card-status');
        if (project.status) {
          statusEl.innerHTML = '<span class="dot"></span>';
          statusEl.appendChild(document.createTextNode(project.status));
          statusEl.style.display = '';
        }

        // Handle project links
        const projectLink = card.querySelector('.project-link');
        const githubLink = card.querySelector('.project-github');

        const extId = extractExtensionId(project.url);

        if (project.url) {
          projectLink.href = project.url;
          projectLink.setAttribute('data-goal', 'project_view_click');
          projectLink.setAttribute('data-goal-params', JSON.stringify({project_name: project.name}));
          if (extId) {
            projectLink.textContent = 'Chrome Web Store';
          }
        } else if (project.homepage) {
          // No store/external URL — fall back to the on-domain project page
          projectLink.href = project.homepage;
          projectLink.setAttribute('data-goal', 'project_view_click');
          projectLink.setAttribute('data-goal-params', JSON.stringify({project_name: project.name}));
        } else {
          projectLink.remove();
        }

        if (project.github) {
          githubLink.href = project.github;
          githubLink.setAttribute('data-goal', 'project_github_click');
          githubLink.setAttribute('data-goal-params', JSON.stringify({project_name: project.name}));
        } else {
          githubLink.remove();
        }

        // Set project image
        const img = card.querySelector('.card-img-top');
        img.src = `./img/projects/${project.img}`;
        img.alt = project.name;

        // Add technology badges
        const technologiesContainer = card.querySelector('.technologies');
        project.technologies.forEach(technology => {
          const badge = document.createElement('span');
          badge.className = 'badge bg-light text-dark me-1 mb-1';
          badge.textContent = technology;
          technologiesContainer.appendChild(badge);
        });

        // Chrome Web Store stats — fetched live from shields.io
        if (extId) {
          const stats = card.querySelector('.store-stats');
          fetchLiveChromeStoreStats(extId).then(live => {
            if (live && Object.keys(live).length) {
              renderStoreStats(stats, live);
            }
          });
        }

        cardsContainer.appendChild(card);
      });

      console.log('✅ Projects loaded successfully:', projects.length, 'projects');
    })
    .catch(error => {
      console.error('❌ Error loading projects:', error);
      if (loadingIndicator) {
        loadingIndicator.textContent = 'Failed to load projects. Please try refreshing the page.';
        loadingIndicator.style.color = '#dc3545'; // Bootstrap danger color
      }
    });

  // Set current year in footer
  const currentYearElement = document.getElementById('current-year');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  // Theme switching functionality
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  if (themeToggle) {
    // Function to determine current active theme
    function getCurrentTheme() {
      if (body.classList.contains('dark-theme')) return 'dark';
      if (body.classList.contains('light-theme')) return 'light';
      // If no forced class, use system theme
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Function to update theme icon
    function updateThemeIcon(theme) {
      themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // Initialize theme on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      body.className = savedTheme;
      console.log('🎨 Theme loaded from localStorage:', savedTheme);
    }
    updateThemeIcon(getCurrentTheme());

    // Theme toggle handler
    themeToggle.addEventListener('click', () => {
      const currentTheme = getCurrentTheme();
      let newTheme;

      if (currentTheme === 'dark') {
        body.className = 'light-theme';
        localStorage.setItem('theme', 'light-theme');
        updateThemeIcon('light');
        newTheme = 'light';
      } else {
        body.className = 'dark-theme';
        localStorage.setItem('theme', 'dark-theme');
        updateThemeIcon('dark');
        newTheme = 'dark';
      }

      console.log('🎨 Theme switched to:', newTheme);
      trackGoal('theme_toggle', { theme: newTheme });
    });

    // System theme change listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      // Update icon only if no saved theme
      if (!localStorage.getItem('theme')) {
        updateThemeIcon(getCurrentTheme());
        console.log('🎨 System theme changed, icon updated');
      }
    });
  }

  // Performance optimization: Intersection Observer for images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
            console.log('🖼️ Lazy loaded image:', img.src);
          }
        }
      });
    });

    // Observe project images after loading
    const observeProjectImages = () => {
      const projectImages = document.querySelectorAll('.card-img-top[data-src]');
      projectImages.forEach(img => imageObserver.observe(img));
    };

    // Uncomment if using data-src for lazy loading
    // observeProjectImages();
  }

  console.log('🚀 Application initialized successfully');
});

// Additional optimization: preload critical images
window.addEventListener('load', () => {
  // Preload social media icons if they're not in viewport
  const socialIcons = document.querySelectorAll('section[aria-label="Social media and contact links"] img');
  socialIcons.forEach(img => {
    if (img.loading === 'lazy') {
      const tempImg = new Image();
      tempImg.src = img.src;
    }
  });

  console.log('🖼️ Social media icons preloaded:', socialIcons.length, 'icons');
});
