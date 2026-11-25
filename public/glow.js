(() => {
  const start = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = document.querySelectorAll(
      '.collection-card, .featured-still-life, .real-work-photo-wrap, .craft-printing-services article, .product-card, .product-gallery-image, .occasion-tile, .contact-card, .inner-feature-card'
    );

    targets.forEach((element) => {
      element.classList.add('glow-card');
      element.addEventListener('pointermove', (event) => {
        const bounds = element.getBoundingClientRect();
        element.style.setProperty('--glow-x', (event.clientX - bounds.left) + 'px');
        element.style.setProperty('--glow-y', (event.clientY - bounds.top) + 'px');
      }, { passive: true });
    });

    if (reducedMotion) return;

    const revealTargets = document.querySelectorAll(
      '.about-grid, .section-heading, .collection-card, .featured-copy, .real-work-copy, .real-work-photo-wrap, .craft-printing-intro, .craft-printing-services article, .custom-order-heading, .experience-grid, .review-content, .visit-details, .occasion-tile, .contact-card, .inner-feature-card'
    );

    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach((element) => {
      element.classList.add('reveal-on-scroll');
      observer.observe(element);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();