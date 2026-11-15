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

  /* Topics are assigned from keywords in each title. */
  var TOPICS = [
    { id: 'ml', en: 'AI / ML', zh: 'AI / 机器学习', re: /machine learning|data[- ]|neural|intelligent|NSGA|generative|physics.informed|interpretable|Kolmogorov/i },
    { id: 'model', en: 'Multiscale modelling', zh: '多尺度建模', re: /micromechanical|multiscale|finite element|phase-field|homogenization|simulations|modell?ing/i },
    { id: 'func', en: 'Functional properties', zh: '功能特性', re: /electrical|thermoelectric|pyroelectric|thermal conductivity|sensing|sensors|supercapacitor|energy storage|multifunctional/i },
    { id: 'dyn', en: 'Nonlinear dynamics', zh: '非线性动力学', re: /vibration|dynamics/i },
    { id: 'green', en: 'Low-carbon materials', zh: '低碳材料', re: /low-carbon|geopolymer|self-healing|clay|sludge|freeze/i }
  ];
  PUBS.forEach(function (p) {
    p.first = p.authors[0] === ME;
    p.topics = TOPICS.filter(function (t) { return t.re.test(p.title); }).map(function (t) { return t.id; });
  });

  /* Language */
  var lang = store.get('lang') || 'en';
  function applyLang() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    $$('[data-en]').forEach(function (el) { el.innerHTML = el.getAttribute('data-' + lang) || el.getAttribute('data-en'); });
    $('#langBtn').textContent = lang === 'zh' ? 'EN' : '中文';
    renderFilters(); renderPubs();
  }
  $('#langBtn').addEventListener('click', function () { lang = lang === 'zh' ? 'en' : 'zh'; store.set('lang', lang); applyLang(); });

  /* Publications */
  var filter = 'all';
  function match(p, f) { return f === 'all' || (f === 'first' ? p.first : p.topics.indexOf(f) > -1); }
  function renderFilters() {
    var items = [{ id: 'all', en: 'All work', zh: '全部' }, { id: 'first', en: 'First author', zh: '第一作者' }].concat(TOPICS);
    $('#filters').innerHTML = items.map(function (t) {
      return '<button data-f="' + t.id + '" class="' + (filter === t.id ? 'on' : '') + '">' + t[lang] + '</button>';
    }).join('');
  }
  $('#filters').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    filter = b.getAttribute('data-f'); renderFilters(); renderPubs();
  });

  function authorsHTML(list) {
    return list.map(function (a) { return a === ME ? '<b>' + a + '</b>' : esc(a); }).join(', ');
  }
  function pubHTML(p) {
    var tags = [];
    if (p.badge) tags.push(p.badge);
    if (p.first) tags.push(lang === 'zh' ? '第一作者' : 'First author');
    if (p.type === 'preprint') tags.push(lang === 'zh' ? '预印本' : 'Preprint');
    var where = esc(p.journal) + (p.volume ? ' ' + esc(p.volume) : '') + (p.page ? ': ' + esc(p.page) : '');
    var img = 'assets/img/pubs/' + p.image;
    return '<article class="pub' + (p.image ? '' : ' noimg') + '">' +
      (p.image ? '<button class="pthumb" data-zoom="' + img + '" data-cap="' + esc(p.title) + '"><img loading="lazy" src="' + img + '" alt=""></button>' : '') +
      '<div><p class="venue">' + where + tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</p>' +
      '<h4><a href="https://doi.org/' + p.doi + '" target="_blank" rel="noopener">' + esc(p.title) + '</a></h4>' +
      '<p class="authors">' + authorsHTML(p.authors) + '</p>' +
      '<div class="work-links"><a href="https://doi.org/' + p.doi + '" target="_blank" rel="noopener">' + (lang === 'zh' ? '论文' : 'Paper') + ' <i>↗</i></a></div></div></article>';
  }
  function renderPubs() {
    var list = PUBS.filter(function (p) { return match(p, filter); });
    $('#pubCount').textContent = lang === 'zh' ? list.length + ' 篇 · 按时间倒序' : list.length + ' publications · newest first';
    var years = [];
    list.forEach(function (p) {
      var g = years[years.length - 1];
      if (!g || g.year !== p.year) { g = { year: p.year, items: [] }; years.push(g); }
      g.items.push(p);
    });
    $('#pubList').innerHTML = years.map(function (g) {
      return '<div class="year-group"><div class="year-label"><b>' + g.year + '</b><span>' + g.items.length + (lang === 'zh' ? ' 篇' : g.items.length === 1 ? ' paper' : ' papers') + '</span></div><div>' +
        g.items.map(pubHTML).join('') + '</div></div>';
    }).join('');
  }

  /* Figure viewer */
  var lb = $('#lightbox');
  document.addEventListener('click', function (e) {
    var z = e.target.closest('[data-zoom]');
    if (z) { $('img', lb).src = z.getAttribute('data-zoom'); $('.lb-cap', lb).textContent = z.getAttribute('data-cap'); lb.classList.add('open'); return; }
    if (e.target.closest('#lightbox')) lb.classList.remove('open');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('open'); });

  $('#year').textContent = new Date().getFullYear();
  applyLang();
})();
