// Curiosity Button Functionality
(function() {
  'use strict';

  function initCuriosityButton() {
    const curiosityButton = document.getElementById('curiosity-button');
    const curiosityMessage = document.getElementById('curiosity-message');

    if (!curiosityButton || !curiosityMessage) {
      console.log('Curiosity button elements not found');
      return;
    }

    // console.log('Curiosity button elements found, adding event listener');

    curiosityButton.addEventListener('click', function(e) {
      e.preventDefault();
      // console.log('Button clicked!');

      this.disabled = true;
      this.classList.remove('btn-primary');
      this.classList.add('btn-secondary');
      this.textContent = 'Clicked!';

      curiosityMessage.style.display = 'block';
      curiosityMessage.style.opacity = '0';
      curiosityMessage.style.transform = 'translateY(8px)';
      curiosityMessage.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

      setTimeout(() => {
        curiosityMessage.style.opacity = '1';
        curiosityMessage.style.transform = 'translateY(0)';
      }, 50);

      if (typeof ym !== 'undefined' && typeof ym === 'function') {
        try {
          ym(65479363, 'reachGoal', 'curiosity_button_click');
          // console.log('Analytics event sent');
        } catch (error) {
          console.log('Analytics tracking failed:', error);
        }
      }
    });

    // console.log('Curiosity button initialized successfully');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCuriosityButton);
  } else {
    initCuriosityButton();
  }
})();
