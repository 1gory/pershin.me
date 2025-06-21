document.addEventListener('DOMContentLoaded', function() {
  // Загрузка проектов
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

      // Скрываем индикатор загрузки
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }

      projects.forEach(project => {
        const card = template.content.cloneNode(true);

        // Заполняем данные карточки
        card.querySelector('.card-title').textContent = project.name;
        card.querySelector('.card-text').textContent = project.description;

        // Обрабатываем ссылки
        const projectLink = card.querySelector('.project-link');
        const githubLink = card.querySelector('.project-github');

        if (project.url) {
          projectLink.href = project.url;
        } else {
          projectLink.remove();
        }

        if (project.github) {
          githubLink.href = project.github;
        } else {
          githubLink.remove();
        }

        // Устанавливаем изображение
        const img = card.querySelector('.card-img-top');
        img.src = `./img/projects/${project.img}`;
        img.alt = project.name;

        // Добавляем технологии
        const technologiesContainer = card.querySelector('.technologies');
        project.technologies.forEach(technology => {
          const badge = document.createElement('span');
          badge.className = 'badge bg-light text-dark me-1 mb-1';
          badge.textContent = technology;
          technologiesContainer.appendChild(badge);
        });

        cardsContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error loading projects:', error);
      if (loadingIndicator) {
        loadingIndicator.textContent = 'Failed to load projects. Please try refreshing the page.';
        loadingIndicator.style.color = '#dc3545'; // Bootstrap danger color
      }
    });

  // Установка текущего года в футере
  const currentYearElement = document.getElementById('current-year');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  // Переключение темы
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  if (themeToggle) {
    // Функция для определения текущей активной темы
    function getCurrentTheme() {
      if (body.classList.contains('dark-theme')) return 'dark';
      if (body.classList.contains('light-theme')) return 'light';
      // Если нет принудительного класса, используем системную тему
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Функция для обновления иконки
    function updateThemeIcon(theme) {
      themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // Инициализация при загрузке
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      body.className = savedTheme;
    }
    updateThemeIcon(getCurrentTheme());

    // Обработчик переключения
    themeToggle.addEventListener('click', () => {
      const currentTheme = getCurrentTheme();

      if (currentTheme === 'dark') {
        body.className = 'light-theme';
        localStorage.setItem('theme', 'light-theme');
        updateThemeIcon('light');
      } else {
        body.className = 'dark-theme';
        localStorage.setItem('theme', 'dark-theme');
        updateThemeIcon('dark');
      }
    });

    // Слушатель изменения системной темы
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      // Обновляем иконку только если нет сохраненной темы
      if (!localStorage.getItem('theme')) {
        updateThemeIcon(getCurrentTheme());
      }
    });
  }

  // Оптимизация производительности: добавляем пересечение наблюдателя для изображений
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // Наблюдаем за изображениями проектов после их загрузки
    const observeProjectImages = () => {
      const projectImages = document.querySelectorAll('.card-img-top[data-src]');
      projectImages.forEach(img => imageObserver.observe(img));
    };

    // Если нужно использовать data-src вместо src для ленивой загрузки
    // Раскомментируйте эту функцию и измените логику выше
    // observeProjectImages();
  }
});

// Дополнительная оптимизация: предзагрузка критических изображений
window.addEventListener('load', () => {
  // Предзагружаем иконки социальных сетей, если они не в viewport
  const socialIcons = document.querySelectorAll('section[aria-label="Social media and contact links"] img');
  socialIcons.forEach(img => {
    if (img.loading === 'lazy') {
      const tempImg = new Image();
      tempImg.src = img.src;
    }
  });
});
