// Scroll reveal — single deliberate treatment, IntersectionObserver based.
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
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });
})();

// Terminal boot sequence — one orchestrated page-load moment on the hero.
(function () {
  var body = document.querySelector('[data-boot]');
  if (!body) return;
  var lines = JSON.parse(body.getAttribute('data-boot'));
  body.innerHTML = '';
  var i = 0;

  function typeLine(text, el, done) {
    var j = 0;
    (function step() {
      el.textContent = text.slice(0, j);
      j++;
      if (j <= text.length) {
        setTimeout(step, 10 + Math.random() * 14);
      } else {
        done();
      }
    })();
  }

  function nextLine() {
    if (i >= lines.length) {
      var caret = document.createElement('span');
      caret.className = 'caret';
      body.appendChild(caret);
      return;
    }
    var div = document.createElement('div');
    div.className = 'line';
    body.appendChild(div);
    typeLine(lines[i], div, function () {
      i++;
      setTimeout(nextLine, 90);
    });
  }
  nextLine();
})();

// Diagram draw-on-scroll — one architectural moment on the homelab page.
(function () {
  var svg = document.querySelector('[data-draw-svg]');
  if (!svg) return;
  var paths = svg.querySelectorAll('path, line');
  paths.forEach(function (p) {
    var len = p.getTotalLength ? p.getTotalLength() : 0;
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
  });
  var nodes = svg.querySelectorAll('[data-node]');
  nodes.forEach(function (n) { n.style.opacity = 0; });

  var triggered = false;
  function draw() {
    if (triggered) return;
    triggered = true;
    paths.forEach(function (p, idx) {
      p.style.transition = 'stroke-dashoffset 900ms ease ' + (idx * 90) + 'ms';
      requestAnimationFrame(function () { p.style.strokeDashoffset = 0; });
    });
    nodes.forEach(function (n, idx) {
      n.style.transition = 'opacity 500ms ease ' + (250 + idx * 110) + 'ms';
      setTimeout(function () { n.style.opacity = 1; }, 20);
    });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) draw(); });
  }, { threshold: 0.3 });
  io.observe(svg);
})();
