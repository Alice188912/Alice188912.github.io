(function () {
  // ----- Post-Impressionist brushstroke canvas -----
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var palette = ["#1d3a8a", "#2c56b8", "#4f7fd6", "#0f1c4d", "#e9c46a", "#c58a1b", "#c2452d", "#f6f1e7", "#2a9d8f"];
  var weights = [5, 5, 4, 5, 2, 2, 1, 1, 1];
  var bag = [];
  palette.forEach(function (c, i) { for (var k = 0; k < weights[i]; k++) bag.push(c); });

  var w, h, dpr, seed, drawn, total, raf;

  function field(x, y) {
    // swirling flow field in the manner of a Van Gogh sky / Woolf's waves
    var a = Math.sin(x * 0.0042 + seed) + Math.cos(y * 0.0055 - seed * 1.3);
    var b = Math.sin((x + y) * 0.0021 + seed * 0.7);
    var cx = w * 0.72, cy = h * 0.38, dx = x - cx, dy = y - cy;
    var swirl = Math.atan2(dy, dx) + Math.PI / 2;
    var d = Math.sqrt(dx * dx + dy * dy);
    var k = Math.exp(-d / (Math.min(w, h) * 0.55));
    return (a + b) * 0.9 * (1 - k) + swirl * k;
  }

  function stroke() {
    var x = Math.random() * w, y = Math.random() * h;
    var color = bag[(Math.random() * bag.length) | 0];
    var len = 6 + Math.random() * 14, width = 1.5 + Math.random() * 3.5;
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.35 + Math.random() * 0.5;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (var i = 0; i < len; i++) {
      var a = field(x, y);
      x += Math.cos(a) * 3;
      y += Math.sin(a) * 3;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function resize() {
    cancelAnimationFrame(raf);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#14224f";
    ctx.fillRect(0, 0, w, h);
    seed = Math.random() * 10;
    total = Math.round((w * h) / 55);
    drawn = 0;
    if (reduce) {
      for (; drawn < total; drawn++) stroke();
    } else {
      loop();
    }
  }

  function loop() {
    var batch = Math.max(30, total / 150);
    for (var i = 0; i < batch && drawn < total; i++, drawn++) stroke();
    if (drawn < total) raf = requestAnimationFrame(loop);
  }

  var timer;
  var lastW = 0;
  window.addEventListener("resize", function () {
    // ignore mobile address-bar height changes
    if (Math.abs(window.innerWidth - lastW) < 40) return;
    lastW = window.innerWidth;
    clearTimeout(timer);
    timer = setTimeout(resize, 300);
  });
  lastW = window.innerWidth;
  resize();

  // ----- reveal on scroll -----
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // ----- nav -----
  var list = document.getElementById("menu");
  document.getElementById("toggle").addEventListener("click", function () { list.classList.toggle("open"); });
  list.addEventListener("click", function () { list.classList.remove("open"); });

  var links = list.querySelectorAll("a");
  var sections = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute("href")); });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { if (s) spy.observe(s); });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
