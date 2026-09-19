// Rough-draft behavior only: fade-up reveal on scroll.
// Real scroll-driven / stage animations (case popping open, scroll-scrubbed
// video, etc.) are the next pass — build those in the IDE with the
// gsap-scrolltrigger skill once this structure is approved.
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  els.forEach(function (el) { io.observe(el); });
})();
