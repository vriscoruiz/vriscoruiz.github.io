/* ==========================================================
   vrisco · comportamiento de la página
   tema, idioma, menú, terminal, línea de tiempo, filtros…
   ========================================================== */
(function () {
  'use strict';

  var V = window.VRISCO || {};
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LANGS = ['es', 'ca', 'en'];
  var lang = 'es';

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function t(key) { return (V.JS_TEXT[lang] || V.JS_TEXT.es)[key]; }

  /* ---------- Tema claro / oscuro ---------- */
  var themeMeta = $('meta[name="theme-color"]');
  function applyThemeMeta() {
    if (themeMeta) themeMeta.setAttribute('content', root.getAttribute('data-theme') === 'light' ? '#f4f6f9' : '#0b0e13');
  }
  applyThemeMeta();
  $('#themeBtn').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    store('vrisco-theme', next);
    applyThemeMeta();
  });

  /* ---------- Idioma ---------- */
  var i18nEls = $$('[data-i18n]');
  var ariaEls = $$('[data-i18n-aria]');
  var ES = {};
  i18nEls.forEach(function (el) {                 // el castellano sale del propio HTML
    var k = el.getAttribute('data-i18n');
    if (!(k in ES)) ES[k] = el.innerHTML;
  });
  ariaEls.forEach(function (el) {
    var k = el.getAttribute('data-i18n-aria');
    if (!(k in ES)) ES[k] = el.getAttribute('aria-label');
  });

  function setLang(l, opts) {
    if (LANGS.indexOf(l) < 0) l = 'es';
    lang = l;
    var dict = l === 'es' ? ES : (V.I18N[l] || {});
    i18nEls.forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      var v = dict[k] != null ? dict[k] : ES[k];
      if (v != null && el.innerHTML !== v) el.innerHTML = v;
    });
    ariaEls.forEach(function (el) {
      var k = el.getAttribute('data-i18n-aria');
      var v = dict[k] != null ? dict[k] : ES[k];
      if (v != null) el.setAttribute('aria-label', v);
    });
    root.setAttribute('lang', l);
    document.title = t('title');
    $$('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l));
    });
    renderModules();
    renderTimelineNow();
    fitTimelineLabels();
    syncMenuLabel();
    if (!opts || !opts.initial) startTerminal(true);
    store('vrisco-lang', l);
  }

  $$('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });

  /* ---------- Menú móvil ---------- */
  var nav = $('#nav');
  var menuBtn = $('#menuBtn');
  function syncMenuLabel() {
    var open = nav.classList.contains('open');
    menuBtn.setAttribute('aria-label', open ? t('menuClose') : t('menuOpen'));
  }
  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    syncMenuLabel();
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Módulos de cada ciclo ---------- */
  function renderModules() {
    $$('[data-mods]').forEach(function (ul) {
      var cycle = ul.getAttribute('data-mods');
      var list = (V.MODULES && V.MODULES[cycle]) || [];
      var folder = cycle.toUpperCase();
      ul.innerHTML = list.map(function (m) {
        var href = V.REPO + '/tree/main/' + folder + '/' + encodeURIComponent(m.dir);
        return '<li><a href="' + href + '" target="_blank" rel="noopener"><code>' + m.code + '</code><span>' +
          (m[lang] || m.es) + '</span></a></li>';
      }).join('');
    });
  }

  /* ---------- Terminal de la portada ---------- */
  var termEl = $('#term');
  var termTimer = null;
  var PROMPT = '<span class="u">victor</span><span class="o">@</span><span class="p">lab</span><span class="o">:~$</span> ';

  function startTerminal(instant) {
    if (!termEl) return;
    clearTimeout(termTimer);
    var lines = (V.TERM && (V.TERM[lang] || V.TERM.es)) || [];
    var done = '';

    if (instant || reduceMotion) {
      lines.forEach(function (ln) {
        done += ln[0] === 'cmd' ? PROMPT + ln[1] + '\n' : '<span class="o">' + ln[1] + '</span>\n';
      });
      termEl.innerHTML = done + PROMPT + '<span class="cursor"></span>';
      return;
    }

    var i = 0;
    function next() {
      if (i >= lines.length) {
        termEl.innerHTML = done + PROMPT + '<span class="cursor"></span>';
        return;
      }
      var ln = lines[i++];
      if (ln[0] === 'out') {
        done += '<span class="o">' + ln[1] + '</span>\n';
        termEl.innerHTML = done + '<span class="cursor"></span>';
        termTimer = setTimeout(next, 140);
        return;
      }
      var txt = ln[1], c = 0;
      (function type() {
        termEl.innerHTML = done + PROMPT + txt.slice(0, c) + '<span class="cursor"></span>';
        if (c++ < txt.length) {
          termTimer = setTimeout(type, 45 + Math.random() * 55);
        } else {
          done += PROMPT + txt + '\n';
          termTimer = setTimeout(next, 260);
        }
      })();
    }
    termTimer = setTimeout(next, 500);
  }

  /* ---------- Línea de tiempo ---------- */
  var tl = $('#timeline');
  function ym(s) {
    if (s === 'now') { var d = new Date(); return d.getFullYear() + d.getMonth() / 12; }
    var p = s.split('-');
    return +p[0] + (+p[1] - 1) / 12;
  }
  function renderTimeline() {
    if (!tl) return;
    var start = ym(tl.getAttribute('data-start'));
    var end = ym(tl.getAttribute('data-end'));
    var span = end - start;
    var pct = function (v) { return Math.max(0, Math.min(100, (v - start) / span * 100)); };

    tl.style.setProperty('--yr', (100 / span) + '%');
    var ticks = $('.tl-ticks', tl);
    var html = '';
    for (var y = Math.ceil(start); y < end; y++) {
      html += '<span class="tl-tick" style="left:' + (pct(y + 0.5)) + '%">' + y + '</span>';
    }
    ticks.innerHTML = html;

    var now = ym('now');
    $$('.tl-bar', tl).forEach(function (b) {
      var from = ym(b.getAttribute('data-from'));
      var to = ym(b.getAttribute('data-to'));
      if (b.getAttribute('data-to') === 'now') to = now;
      b.style.left = pct(from) + '%';
      b.style.width = (pct(to) - pct(from)) + '%';
      if (b.classList.contains('tl-plan')) {
        var done = Math.max(0, Math.min(1, (now - from) / (to - from)));
        b.style.setProperty('--done', (done * 100).toFixed(1) + '%');
      }
    });

    $$('.tl-track:not(.tl-ticks)', tl).forEach(function (track) {
      var m = $('.tl-now', track) || track.appendChild(document.createElement('span'));
      m.className = 'tl-now';
      m.style.left = pct(now) + '%';
    });
    renderTimelineNow();
  }
  function fitTimelineLabels() {          // si el texto no cabe en la barra, va al lado
    if (!tl) return;
    $$('.tl-bar', tl).forEach(function (b) {
      b.classList.toggle('tl-out', false);
      var label = $('b', b);
      b.title = label.textContent;
      if (label.scrollWidth > label.clientWidth + 1) b.classList.toggle('tl-out', true);
    });
  }
  window.addEventListener('resize', fitTimelineLabels);

  function renderTimelineNow() {
    if (!tl) return;
    var ticks = $('.tl-ticks', tl);
    var lab = $('.tl-now-lab', ticks) || ticks.appendChild(document.createElement('span'));
    lab.className = 'tl-now-lab';
    var start = ym(tl.getAttribute('data-start'));
    var end = ym(tl.getAttribute('data-end'));
    lab.style.left = ((ym('now') - start) / (end - start) * 100) + '%';
    lab.textContent = t('today');
  }

  /* ---------- Filtro de habilidades ---------- */
  var skills = $('#skills');
  if (skills) {
    $$('.filter button', skills).forEach(function (b) {
      b.addEventListener('click', function () {
        skills.setAttribute('data-filter', b.getAttribute('data-f'));
        $$('.filter button', skills).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      });
    });
  }

  /* ---------- Correo (montado con JS para evitar spam) ---------- */
  var mail = $('#mail');
  var address = '';
  if (mail) {
    address = mail.getAttribute('data-u') + '@' + mail.getAttribute('data-d');
    mail.textContent = address;
    mail.href = 'mailto:' + address;
  }
  var copyBtn = $('#copyMail');
  var copied = $('#copied');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var ok = function () {
        copied.textContent = t('copied');
        setTimeout(function () { copied.textContent = ''; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(ok, function () { window.prompt('', address); });
      } else {
        window.prompt('', address);
      }
    });
  }

  /* ---------- Aparición al hacer scroll ---------- */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Barra de progreso y enlace activo ---------- */
  var progress = $('#progress');
  var links = $$('a', nav);
  var sections = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  var ticking = false;
  function onScroll() {
    ticking = false;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
    var current = null;
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= 140) current = s;
    });
    links.forEach(function (a) {
      a.classList.toggle('on', !!current && a.getAttribute('href') === '#' + current.id);
    });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* ---------- Intro «descifrado» ---------- */
  function runIntro(done) {
    var sp = $('#splash');
    var finished = false, timers = [];
    function finish() {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      if (sp) {
        sp.removeEventListener('click', skip);
        if (sp.parentNode) sp.parentNode.removeChild(sp);
      }
      document.removeEventListener('keydown', skip);
      root.classList.remove('intro-on');
      done();
    }
    if (!sp || !root.classList.contains('intro-on')) { finish(); return; }
    try { sessionStorage.setItem('vrisco-intro', '1'); } catch (e) {}

    var at = function (ms, f) { timers.push(setTimeout(f, ms)); };
    var code = $('#spCode'), st = $('#spSt');
    st.textContent = t('decrypting');
    var touch = window.matchMedia && matchMedia('(hover: none)').matches;
    $('#spSkip').textContent = t(touch ? 'skipTap' : 'skipIntro');

    var target = 'VÍCTOR RISCO RUIZ';
    var pool = '!<>-_/[]{}=+*^?#01ABCDEFGHJKLMNPQRSTUVWXYZ';
    var reveal = target.split('').map(function (_, i) { return 250 + i * 55 + Math.random() * 220; });
    var t0 = Date.now();
    (function frame() {
      var e = Date.now() - t0, html = '', all = true;
      for (var i = 0; i < target.length; i++) {
        var ch = target[i];
        if (ch === ' ') { html += ' '; continue; }
        if (e >= reveal[i]) html += ch;
        else { all = false; html += '<span class="s">' + pool[(Math.random() * pool.length) | 0] + '</span>'; }
      }
      code.innerHTML = html;
      if (!all) at(45, frame);
      else { st.textContent = t('granted'); st.classList.add('ok'); }
    })();

    function open(delay) {
      at(delay, function () { sp.classList.add('fade'); });
      at(delay + 150, function () { sp.classList.add('out'); root.classList.remove('intro-on'); });
      at(delay + 900, finish);
    }
    open(1950);

    function skip() {               // clic, toque o tecla: abrir ya
      timers.forEach(clearTimeout); timers = [];
      open(0);
      sp.removeEventListener('click', skip);
      document.removeEventListener('keydown', skip);
    }
    sp.addEventListener('click', skip);
    document.addEventListener('keydown', skip);
  }

  /* ---------- Inicio ---------- */
  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();

  renderTimeline();
  var saved = store('vrisco-lang');
  var guess = (navigator.language || 'es').slice(0, 2).toLowerCase();
  setLang(saved || (LANGS.indexOf(guess) >= 0 ? guess : 'es'), { initial: true });
  runIntro(function () { startTerminal(false); });
  onScroll();
})();
