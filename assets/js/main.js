(function () {
  'use strict';
  var ME = 'Yucheng Fan';
  var PUBS = window.PUBLICATIONS || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- topics ---------- */
  var TOPICS = [
    { id: 'ml', en: 'AI / ML', zh: 'AI / 机器学习', re: /machine learning|data[- ]|neural|intelligent|NSGA|generative|physics.informed|interpretable/i },
    { id: 'model', en: 'Multiscale modelling', zh: '多尺度建模', re: /micromechanical|multiscale|finite element|phase-field|homogenization|simulations|modell?ing/i },
    { id: 'func', en: 'Functional properties', zh: '功能特性', re: /electrical|thermoelectric|pyroelectric|thermal conductivity|sensing|sensors|supercapacitor|energy storage|multifunctional/i },
    { id: 'dyn', en: 'Nonlinear dynamics', zh: '非线性动力学', re: /vibration|dynamics/i },
    { id: 'green', en: 'Low-carbon materials', zh: '低碳材料', re: /low-carbon|geopolymer|self-healing|clay|sludge|freeze/i }
  ];
  PUBS.forEach(function (p) {
    p.first = p.authors[0] === ME;
    p.topics = TOPICS.filter(function (t) { return t.re.test(p.title); }).map(function (t) { return t.id; });
  });

  /* ---------- language ---------- */
  var lang = store.get('lang') || 'en';
  function applyLang() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    $$('[data-en]').forEach(function (el) { el.textContent = el.getAttribute('data-' + lang) || el.getAttribute('data-en'); });
    $('#langBtn').textContent = lang === 'zh' ? 'EN' : '中文';
    $('#pubSearch').placeholder = lang === 'zh' ? '搜索标题、作者、期刊…' : 'Search title, author, journal…';
    renderFilters(); renderPubs(); renderFeatured(); startTyping();
  }
  $('#langBtn').addEventListener('click', function () { lang = lang === 'zh' ? 'en' : 'zh'; store.set('lang', lang); applyLang(); });

  /* ---------- theme ---------- */
  var theme = store.get('theme') || 'dark';
  function applyTheme() { document.documentElement.setAttribute('data-theme', theme); $('#themeBtn').textContent = theme === 'dark' ? '☀' : '☾'; }
  $('#themeBtn').addEventListener('click', function () { theme = theme === 'dark' ? 'light' : 'dark'; store.set('theme', theme); applyTheme(); });
  applyTheme();

  /* ---------- nav ---------- */
  $('#burger').addEventListener('click', function () { $('#navLinks').classList.toggle('open'); });
  $$('#navLinks a').forEach(function (a) { a.addEventListener('click', function () { $('#navLinks').classList.remove('open'); }); });
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    $('#progress').style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
    $('#nav').classList.toggle('scrolled', h.scrollTop > 20);
  }, { passive: true });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) $$('#navLinks a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* ---------- author formatting ---------- */
  function authorsHTML(list) {
    return list.map(function (a) { return a === ME ? '<b>' + a + '</b>' : esc(a); }).join(', ');
  }
  function cite(p) {
    var s = '<em>' + esc(p.journal) + '</em>';
    if (p.volume) s += ' ' + esc(p.volume);
    if (p.page) s += ', ' + esc(p.page);
    return s + ' (' + p.year + ')';
  }

  /* ---------- featured ---------- */
  function renderFeatured() {
    var feats = PUBS.filter(function (p) { return p.first && p.image; });
    // The first card is shown wide; lead with the Carbon papers (landscape graphical abstracts).
    feats.sort(function (a, b) { return (b.journal === 'Carbon') - (a.journal === 'Carbon'); });
    $('#featuredGrid').innerHTML = feats.map(function (p, i) {
      return '<article class="fcard reveal' + (i === 0 ? ' wide' : '') + '">' +
        '<button class="fimg" data-zoom="assets/img/pubs/' + p.image + '" data-cap="' + esc(p.title) + '"><img loading="lazy" src="assets/img/pubs/' + p.image + '" alt="Figure from: ' + esc(p.title) + '"></button>' +
        '<div class="fbody"><span class="venue">' + esc(p.journal) + ' ' + p.year + '</span>' +
        '<h3>' + esc(p.title) + '</h3><p class="authors">' + authorsHTML(p.authors) + '</p>' +
        '<div class="flinks"><a href="https://doi.org/' + p.doi + '" target="_blank" rel="noopener">' + (lang === 'zh' ? '阅读论文 ↗' : 'Read paper ↗') + '</a></div></div></article>';
    }).join('');
    observeReveals();
  }

  /* ---------- publications ---------- */
  var filter = 'all', query = '';
  function renderFilters() {
    var items = [{ id: 'all', en: 'All', zh: '全部' }, { id: 'first', en: 'First author', zh: '第一作者' }].concat(TOPICS);
    $('#filters').innerHTML = items.map(function (t) {
      var n = PUBS.filter(function (p) { return match(p, t.id); }).length;
      return '<button data-f="' + t.id + '" class="' + (filter === t.id ? 'on' : '') + '">' + t[lang] + ' · ' + n + '</button>';
    }).join('');
  }
  function match(p, f) { return f === 'all' || (f === 'first' ? p.first : p.topics.indexOf(f) > -1); }
  $('#filters').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    filter = b.getAttribute('data-f'); renderFilters(); renderPubs();
  });
  $('#pubSearch').addEventListener('input', function (e) { query = e.target.value.toLowerCase(); renderPubs(); });

  function renderPubs() {
    var list = PUBS.filter(function (p) {
      return match(p, filter) && (!query || (p.title + ' ' + p.authors.join(' ') + ' ' + p.journal + ' ' + p.year).toLowerCase().indexOf(query) > -1);
    });
    $('#pubCount').textContent = lang === 'zh' ? '共 ' + list.length + ' 篇' : list.length + ' item' + (list.length === 1 ? '' : 's');
    var html = '', year = null;
    list.forEach(function (p) {
      if (p.year !== year) { year = p.year; html += '<div class="year-head">' + year + '</div>'; }
      html += '<article class="pub' + (p.image ? '' : ' noimg') + '">' +
        (p.image ? '<button class="pthumb" data-zoom="assets/img/pubs/' + p.image + '" data-cap="' + esc(p.title) + '"><img loading="lazy" src="assets/img/pubs/' + p.image + '" alt=""></button>' : '') +
        '<div><h4><a href="https://doi.org/' + p.doi + '" target="_blank" rel="noopener">' + esc(p.title) + '</a></h4>' +
        '<p class="authors">' + authorsHTML(p.authors) + '</p>' +
        '<div class="pmeta"><span>' + cite(p) + '</span>' +
        (p.first ? '<span class="pill first">' + (lang === 'zh' ? '第一作者' : 'First author') + '</span>' : '') +
        (p.type === 'preprint' ? '<span class="pill">' + (lang === 'zh' ? '预印本' : 'Preprint') + '</span>' : '') +
        '<a href="https://doi.org/' + p.doi + '" target="_blank" rel="noopener">DOI ↗</a></div></div></article>';
    });
    $('#pubList').innerHTML = html || '<p class="muted">' + (lang === 'zh' ? '没有匹配的论文。' : 'No matching publications.') + '</p>';
  }

  /* ---------- lightbox ---------- */
  var lb = $('#lightbox');
  document.addEventListener('click', function (e) {
    var z = e.target.closest('[data-zoom]');
    if (z) { $('img', lb).src = z.getAttribute('data-zoom'); $('.lb-cap', lb).textContent = z.getAttribute('data-cap'); lb.classList.add('open'); return; }
    if (e.target.closest('#lightbox')) lb.classList.remove('open');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('open'); });

  /* ---------- stats, bars, marquee ---------- */
  var journals = PUBS.filter(function (p) { return p.type === 'journal'; });
  $('#statPubs').setAttribute('data-count', PUBS.length);
  $('#statFirst').setAttribute('data-count', PUBS.filter(function (p) { return p.first; }).length);

  var names = [];
  journals.forEach(function (p) { if (names.indexOf(p.journal) < 0) names.push(p.journal); });
  var mq = names.map(function (n) { return '<span>' + esc(n) + '</span>'; }).join('');
  $('#marquee').innerHTML = mq + mq;

  var years = {};
  PUBS.forEach(function (p) { years[p.year] = years[p.year] || { n: 0, f: 0 }; years[p.year].n++; if (p.first) years[p.year].f++; });
  var ys = Object.keys(years).sort(), max = Math.max.apply(null, ys.map(function (y) { return years[y].n; }));
  $('#yearBars').innerHTML = ys.map(function (y) {
    var d = years[y];
    return '<div class="bar"><b>' + d.n + '</b><div class="bar-col" data-h="' + (d.n / max * 100) + '"><i class="first" style="flex:' + d.f + '"></i><i style="flex:' + (d.n - d.f) + '"></i></div><span>' + y + '</span></div>';
  }).join('');

  function countUp(el) {
    var end = +el.getAttribute('data-count'), t0 = null;
    function step(t) { if (!t0) t0 = t; var k = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  /* ---------- reveal ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      $$('.bar-col', e.target).forEach(function (b) { b.style.height = 'calc(' + b.getAttribute('data-h') + '% - 50px)'; });
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 }) : null;
  function observeReveals() {
    $$('.reveal:not(.in), #stats').forEach(function (el) {
      if (io) io.observe(el); else { el.classList.add('in'); $$('[data-count]', el).forEach(function (c) { c.textContent = c.getAttribute('data-count'); }); }
    });
  }

  /* ---------- typing ---------- */
  var PHRASES = {
    en: ['AI for Science', 'multiscale modelling', 'smart self-sensing concrete', 'carbon nanomaterial composites', 'low-carbon infrastructure'],
    zh: ['AI for Science', '多尺度建模', '自感知智能混凝土', '碳纳米材料复合材料', '低碳基础设施']
  };
  var typeTimer;
  function startTyping() {
    clearTimeout(typeTimer);
    var el = $('#typed'), list = PHRASES[lang], i = 0, j = 0, del = false;
    (function tick() {
      var w = list[i];
      el.textContent = w.slice(0, j);
      if (!del && j === w.length) { del = true; typeTimer = setTimeout(tick, 1600); return; }
      if (del && j === 0) { del = false; i = (i + 1) % list.length; }
      j += del ? -1 : 1;
      typeTimer = setTimeout(tick, del ? 35 : 75);
    })();
  }

  /* ---------- tilt ---------- */
  if (window.matchMedia('(hover:hover)').matches) {
    $$('.tilt').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = 'perspective(800px) rotateX(' + (-y * 7) + 'deg) rotateY(' + (x * 7) + 'deg)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- hero canvas: a percolating nanofiller network ---------- */
  (function () {
    var c = $('#net'); if (!c || !c.getContext) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var ctx = c.getContext('2d'), W, H, pts = [], mouse = { x: -999, y: -999 }, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      W = c.clientWidth; H = c.clientHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(110, Math.round(W * H / 14000)); pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.8 + .8 });
    }
    window.addEventListener('resize', resize); resize();
    c.parentElement.addEventListener('mousemove', function (e) { var r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    c.parentElement.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });
    (function draw() {
      ctx.clearRect(0, 0, W, H);
      var light = document.documentElement.getAttribute('data-theme') === 'light';
      var a = light ? '8,145,178' : '34,211,238', b = light ? '124,58,237' : '139,92,246';
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 16900) { ctx.strokeStyle = 'rgba(' + b + ',' + (1 - d / 16900) * .35 + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
        var mx = p.x - mouse.x, my = p.y - mouse.y, md = mx * mx + my * my;
        if (md < 32400) { ctx.strokeStyle = 'rgba(' + a + ',' + (1 - md / 32400) * .7 + ')'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
        ctx.fillStyle = 'rgba(' + a + ',.8)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      requestAnimationFrame(draw);
    })();
  })();

  $('#year').textContent = new Date().getFullYear();
  applyLang();
  observeReveals();
})();
