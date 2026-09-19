// Runs only on pages/homelab.html. Requires GSAP + ScrollTrigger (loaded via CDN
// in the page head) — ask Claude Code to swap this for the freshtechbro
// gsap-scrolltrigger skill's reference patterns once you're refining further.

(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  var seqSection = document.getElementById('homelab-sequence');
  if (!seqSection) return;

  var grid = seqSection.querySelector('.sequence-grid');
  var images = Array.prototype.slice.call(seqSection.querySelectorAll('.seq-img'));
  var copies = Array.prototype.slice.call(seqSection.querySelectorAll('.seq-copy'));
  var dots = Array.prototype.slice.call(seqSection.querySelectorAll('.sequence-progress span'));
  var steps = images.length; // 3 photos -> 2 crossfade transitions

  // Entrance: fade/scale the whole block in once, the first time it's reached.
  ScrollTrigger.create({
    trigger: seqSection,
    start: 'top 75%',
    once: true,
    onEnter: function () { grid.classList.add('in'); }
  });

  function setStep(idx, localT) {
    images.forEach(function (img, i) {
      var op = 0;
      if (i === idx) op = 1 - localT;
      if (i === idx + 1) op = localT;
      img.style.opacity = op;
    });
    copies.forEach(function (c, i) {
      var op = 0;
      if (i === idx) op = 1 - localT;
      if (i === idx + 1) op = localT;
      c.style.opacity = op;
    });
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === idx || (localT > 0.5 && i === idx + 1));
    });
  }

  // Pin the visual/text pair while the user scrolls through the tall
  // #homelab-sequence wrapper (min-height: 300vh, set in main.css), and
  // scrub a crossfade across the (steps-1) transitions based on progress.
  ScrollTrigger.create({
    trigger: seqSection,
    start: 'top top',
    end: 'bottom bottom',
    pin: grid,
    scrub: 0.4,
    onUpdate: function (self) {
      var segment = self.progress * (steps - 1);
      var idx = Math.min(Math.floor(segment), steps - 2);
      var localT = segment - idx;
      setStep(idx, localT);
    }
  });
})();

// ---------- interactive hotspots ----------
(function () {
  var wrap = document.querySelector('.hotspot-wrap');
  if (!wrap) return;
  var panel = document.getElementById('hotspot-panel');
  var titleEl = document.getElementById('hotspot-panel-title');
  var descEl = document.getElementById('hotspot-panel-desc');
  var closeBtn = document.getElementById('hotspot-close');
  var hotspots = Array.prototype.slice.call(wrap.querySelectorAll('.hotspot'));

  function openPanel(btn) {
    hotspots.forEach(function (h) { h.classList.remove('active'); });
    btn.classList.add('active');
    titleEl.textContent = btn.getAttribute('data-title') || '';
    descEl.textContent = btn.getAttribute('data-desc') || '';
    panel.hidden = false;
  }

  hotspots.forEach(function (btn) {
    btn.addEventListener('click', function () { openPanel(btn); });
  });
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      panel.hidden = true;
      hotspots.forEach(function (h) { h.classList.remove('active'); });
    });
  }
})();
