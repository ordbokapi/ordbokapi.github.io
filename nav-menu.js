document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.navbar-links');
  const container = document.querySelector('#navbar .container');

  hamburger.addEventListener('click', () => {
    if (navLinks.dataset.shown === 'false') {
      navLinks.dataset.shown = 'true';

      container.style.maxHeight = '100vh';
    } else {
      navLinks.dataset.shown = 'false';

      container.style.maxHeight = '84px';
    }
  });
});
