$(document).ready(function () {
  $.get("./projects.json", function (projects) {
    projects.forEach((project, i) => {
      const template = $('.card-template')[0];
      const card = $(template.content.cloneNode(true));

      card.find('.card-title').text(project.name);
      card.find('.card-text').text(project.description);

      if (project.url) {
        card.find('.project-link').attr('href', project.url);
      } else {
        card.find('.project-link').remove(); // Скрыть кнопку
      }

      if (project.github) {
        card.find('.project-github').attr('href', project.github);
      } else {
        card.find('.project-github').remove();
      }

      card.find('.card-img-top').attr('src', './img/projects/' + project.img);

      const technologiesText = card.find('.technologies');
      project.technologies.forEach((technology, i) => {
        const t = '<span class="badge bg-light text-dark">' + technology + '</span>';
        $(t).appendTo(technologiesText);
      });

      $('.cards').append(card);

      document.getElementById('current-year').textContent = new Date().getFullYear();
    });
  });
});
