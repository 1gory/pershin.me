$(document).ready(function () {
  // Загрузка проектов
  $.get("./projects.json", function (projects) {
    projects.forEach((project, i) => {
      const template = $('.card-template')[0];
      const card = $(template.content.cloneNode(true));

      card.find('.card-title').text(project.name);
      card.find('.card-text').text(project.description);

      if (project.url) {
        card.find('.project-link').attr('href', project.url);
      } else {
        card.find('.project-link').remove();
      }

      if (project.github) {
        card.find('.project-github').attr('href', project.github);
      } else {
        card.find('.project-github').remove();
      }

      card.find('.card-img-top').attr('src', './img/projects/' + project.img);

      const technologiesText = card.find('.technologies');
      project.technologies.forEach((technology, i) => {
        const t = '<span class="badge bg-light text-dark me-1 mb-1">' + technology + '</span>';
        $(t).appendTo(technologiesText);
      });

      $('.cards').append(card);
    });
  });

  // Год в футере
  document.getElementById('current-year').textContent = new Date().getFullYear();

  // Переключение темы
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

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
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    // Обновляем иконку только если нет сохраненной темы
    if (!localStorage.getItem('theme')) {
      updateThemeIcon(getCurrentTheme());
    }
  });
});
