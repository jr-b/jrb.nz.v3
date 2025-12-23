// Navbar scroll behavior - hide on scroll down, show on scroll up
(function() {
  let lastScrollTop = 0;
  let ticking = false;
  const header = document.querySelector('header');
  const scrollThreshold = 100; // Only activate after scrolling 100px

  if (!header) return;

  function updateNavbar() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Only hide/show if scrolled past threshold
    if (scrollTop > scrollThreshold) {
      // Check scroll direction
      if (scrollTop > lastScrollTop) {
        // Scrolling down - hide
        header.classList.add('nav-hidden');
      } else {
        // Scrolling up - show
        header.classList.remove('nav-hidden');
      }
    } else {
      // Near the top - always show
      header.classList.remove('nav-hidden');
    }

    lastScrollTop = scrollTop;
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
})();
