$(document).ready(function () {
  $.get("./projects.json", function (projects) {
    projects.forEach((project, i) => {
      const card = $('.d-none.card-template').clone().removeClass('d-none');
      card.find('.card-title').text(project.name);
      card.find('.card-text').text(project.description);
      card.find('.project-link').attr('href', project.url);
      if (project.github) {
        card.find('.project-github').attr('href', project.github);
      } else {
        card.find('.project-github').remove();
      }
      card.find('.card-img-top').attr('src', './img/projects/' + project.img);
      card.appendTo('.cards');
      const technologiesText = card.find('.technologies');

      project.technologies.forEach((technology, i) => {
        const t = '<span class="badge bg-light text-dark">' + technology + '</span>';
        $(t).appendTo(technologiesText);
      });
    });
  });
});
