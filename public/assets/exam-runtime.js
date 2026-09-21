/* LearnandForge expert exam runtime.
   - Timed, score-only: answers are never shown; the page holds only salted SHA-256 hashes.
   - Multi-select, matching and ordering questions are all-or-nothing.
   - Draft answers, the start time and results live in this browser's localStorage only. */
(function () {
  var root = document.querySelector('.lfx');
  if (!root) return;
  var slug = root.getAttribute('data-slug');
  var MINUTES = Number(root.getAttribute('data-minutes')) || 75;
  var PASS = Number(root.getAttribute('data-pass')) || 80;
  var Q = JSON.parse(document.getElementById('lfx-data').textContent);
  var KEY = 'lf-exam:' + slug, RKEY = KEY + ':results';
  var MODS = JSON.parse(root.getAttribute('data-modules') || '{}');

  var els = {
    start: document.getElementById('lfx-start'),
    begin: document.getElementById('lfx-begin'),
    best: document.getElementById('lfx-best'),
    bar: document.getElementById('lfx-bar'),
    timer: document.getElementById('lfx-timer'),
    count: document.getElementById('lfx-count'),
    submit: document.getElementById('lfx-submit'),
    submit2: document.getElementById('lfx-submit2'),
    paper: document.getElementById('lfx-paper'),
    result: document.getElementById('lfx-result')
  };

  function load(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var state = load(KEY) || { started: false, startAt: null, answers: {}, submitted: false, result: null };

  /* ---- canonical answer string: MUST match scripts/hash-exam.mjs ---- */
  function canonical(type, val, q) {
    if (val == null) return '';
    switch (type) {
      case 'single': return String(val);
      case 'multi': return val.slice().sort().join(',');
      case 'numeric': {
        var s = String(val).replace(/,/g, '').trim();
        var n = Number(s);
        if (!isFinite(n) || s === '') return '';
        return Math.abs(n).toFixed(q.decimals || 0);
      }
      case 'match':
        return Object.keys(val).sort(function (a, b) { return Number(a) - Number(b); }).map(function (k) { return k + ':' + val[k]; }).join(',');
      case 'order':
        return Array.isArray(val) ? val.join(',') : '';
      default: return '';
    }
  }

  /* ---- read an answer from the form ---- */
  function collect(q) {
    var id = q.id;
    if (q.type === 'single') { var r = els.paper.querySelector('input[name="' + id + '"]:checked'); return r ? r.value : null; }
    if (q.type === 'multi') { var c = els.paper.querySelectorAll('input[name="' + id + '"]:checked'); return c.length ? Array.prototype.map.call(c, function (i) { return i.value; }) : null; }
    if (q.type === 'numeric') { var t = els.paper.querySelector('input[name="' + id + '"]'); return t && t.value.trim() !== '' ? t.value.trim() : null; }
    if (q.type === 'match') {
      var sel = els.paper.querySelectorAll('select[name^="' + id + '__"]'), m = {}, any = false;
      Array.prototype.forEach.call(sel, function (s) { var k = s.name.split('__')[1]; if (s.value) { m[k] = s.value; any = true; } });
      return any ? m : null;
    }
    if (q.type === 'order') {
      var so = els.paper.querySelectorAll('select[name^="' + id + '__"]'), pos = [], any2 = false, seen = {}, dup = false;
      Array.prototype.forEach.call(so, function (s) {
        var letter = s.name.split('__')[1];
        if (s.value) { any2 = true; if (seen[s.value]) dup = true; seen[s.value] = 1; pos.push({ letter: letter, p: Number(s.value) }); }
        else { pos.push({ letter: letter, p: NaN }); }
      });
      if (!any2) return null;
      if (dup || pos.some(function (x) { return isNaN(x.p); })) return { incomplete: true };
      return pos.sort(function (a, b) { return a.p - b.p; }).map(function (x) { return x.letter; });
    }
    return null;
  }
  function isAnswered(q) { var v = collect(q); return v != null && !(v && v.incomplete); }

  /* ---- restore a saved draft into the form ---- */
  function restore() {
    Q.forEach(function (q) {
      var v = state.answers[q.id]; if (v == null) return;
      if (q.type === 'single') { var r = els.paper.querySelector('input[name="' + q.id + '"][value="' + v + '"]'); if (r) r.checked = true; }
      else if (q.type === 'multi') { v.forEach(function (l) { var c = els.paper.querySelector('input[name="' + q.id + '"][value="' + l + '"]'); if (c) c.checked = true; }); }
      else if (q.type === 'numeric') { var t = els.paper.querySelector('input[name="' + q.id + '"]'); if (t) t.value = v; }
      else if (q.type === 'match') { Object.keys(v).forEach(function (k) { var s = els.paper.querySelector('select[name="' + q.id + '__' + k + '"]'); if (s) s.value = v[k]; }); }
      else if (q.type === 'order' && Array.isArray(v)) { v.forEach(function (letter, i) { var s = els.paper.querySelector('select[name="' + q.id + '__' + letter + '"]'); if (s) s.value = String(i + 1); }); }
    });
  }

  /* ---- hashing ---- */
  function sha256(str) {
    if (!(window.crypto && crypto.subtle)) return Promise.reject(new Error('no-subtle'));
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }

  /* ---- timer ---- */
  var tick = null;
  function remaining() { return MINUTES * 60 - Math.floor((Date.now() - state.startAt) / 1000); }
  function fmt(s) { s = Math.max(0, s); var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r; }
  function startTimer() {
    function step() {
      var r = remaining();
      els.timer.textContent = fmt(r);
      els.bar.classList.toggle('is-low', r <= 300);
      if (r <= 0) { clearInterval(tick); submit(true); }
    }
    step(); tick = setInterval(step, 1000);
  }
  function updateCount() {
    var n = Q.filter(isAnswered).length;
    els.count.textContent = 'පිළිතුරු දුන් ' + n + ' / ' + Q.length;
  }

  /* ---- flow ---- */
  function showPaper() {
    els.start.hidden = true; els.result.hidden = true;
    els.paper.hidden = false; els.bar.hidden = false;
    restore(); updateCount(); startTimer();
  }
  function begin() {
    state = { started: true, startAt: Date.now(), answers: {}, submitted: false, result: null };
    save(KEY, state);
    showPaper();
    window.scrollTo({ top: els.bar.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
  }
  function onChange() {
    Q.forEach(function (q) { var v = collect(q); if (v && v.incomplete) return; state.answers[q.id] = v; });
    save(KEY, state); updateCount();
  }

  function submit(auto) {
    if (state.submitted) return;
    var unanswered = Q.filter(function (q) { return !isAnswered(q); }).length;
    if (!auto && unanswered > 0 && !window.confirm('ප්‍රශ්න ' + unanswered + 'කට පිළිතුරු නැත. එසේම ඉදිරිපත් කරන්නද?')) return;
    clearInterval(tick);
    var secs = Math.min(MINUTES * 60, Math.floor((Date.now() - state.startAt) / 1000));
    var checks = Q.map(function (q) {
      var v = collect(q); if (v && v.incomplete) v = null;
      var c = canonical(q.type, v, q);
      if (!c) return Promise.resolve(false);
      return sha256('lf-exam:' + slug + ':' + q.id + '|' + c).then(function (h) { return h === q.h; });
    });
    Promise.all(checks).then(function (ok) {
      var score = 0, byMod = {}, wrong = [];
      Q.forEach(function (q, i) {
        var m = String(q.m); byMod[m] = byMod[m] || { c: 0, t: 0 }; byMod[m].t++;
        if (ok[i]) { score++; byMod[m].c++; } else wrong.push(i + 1);
      });
      var pct = Math.round(score / Q.length * 100);
      var result = { score: score, total: Q.length, pct: pct, pass: pct >= PASS, secs: secs, byMod: byMod, wrong: wrong, auto: !!auto, at: new Date().toISOString() };
      state.submitted = true; state.result = result; save(KEY, state);
      var hist = load(RKEY) || []; hist.push({ at: result.at, score: score, total: Q.length, pct: pct, pass: result.pass, secs: secs }); save(RKEY, hist.slice(-20));
      showResult(result);
    }).catch(function () {
      els.result.hidden = false;
      els.result.innerHTML = '<div class="lfx-card"><h2>ලකුණු කිරීමට නොහැකි විය</h2><p>මේ බ්‍රව්සරයේ ආරක්ෂිත hashing (Web Crypto) නොමැත. https හරහා, නවීන බ්‍රව්සරයකින් නැවත උත්සාහ කරන්න.</p></div>';
    });
  }

  function showResult(r) {
    els.paper.hidden = false; els.bar.hidden = true; els.start.hidden = true;
    Array.prototype.forEach.call(els.paper.querySelectorAll('input,select,button'), function (el) { el.disabled = true; });
    var rows = Object.keys(r.byMod).sort(function (a, b) { return Number(a) - Number(b); }).map(function (m) {
      var x = r.byMod[m], p = Math.round(x.c / x.t * 100);
      return '<tr><td>' + m + '. ' + (MODS[m] || '') + '</td><td class="num">' + x.c + ' / ' + x.t + '</td><td><div class="lfx-mini"><i style="width:' + p + '%"></i></div></td></tr>';
    }).join('');
    els.result.hidden = false;
    els.result.innerHTML =
      '<div class="lfx-card lfx-card--' + (r.pass ? 'pass' : 'fail') + '">' +
        '<div class="lfx-badge">' + (r.pass ? 'සමත් — විශේෂඥ මට්ටම' : 'අසමත්') + '</div>' +
        '<div class="lfx-score"><span class="big">' + r.score + '</span><span class="of">/ ' + r.total + '</span><span class="pct">' + r.pct + '%</span></div>' +
        '<p class="lfx-meta">සමත් වීමට ' + PASS + '% · ගත වූ කාලය ' + fmt(r.secs) + (r.auto ? ' · කාලය අවසන් වූ නිසා ස්වයංක්‍රීයව ඉදිරිපත් විය' : '') + '</p>' +
        '<h3>මොඩියුල අනුව</h3><div class="tablewrap"><table class="lfx-table"><thead><tr><th>මොඩියුලය</th><th>ලකුණු</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        (r.wrong.length ? '<p class="lfx-wrong"><strong>වැරදි හෝ පිළිතුරු නොදුන් ප්‍රශ්න:</strong> ' + r.wrong.join(', ') + '</p>' : '<p class="lfx-wrong">සියලු ප්‍රශ්න නිවැරදියි.</p>') +
        '<p class="lfx-note">මේ විභාගය පිළිතුරු පෙන්වන්නේ නැත. ඒ ප්‍රශ්නවලට අදාළ මොඩියුල නැවත කියවා නැවත උත්සාහ කරන්න.</p>' +
        '<div class="lfx-actions"><button type="button" class="lf-btn lf-btn--yellow" id="lfx-retake">නැවත උත්සාහ කරන්න</button> <a class="lf-btn lf-btn--ghost" href="../learn/">පාඨමාලාවට යන්න</a></div>' +
      '</div>';
    document.getElementById('lfx-retake').addEventListener('click', retake);
    window.scrollTo({ top: els.result.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  }
  function retake() {
    Array.prototype.forEach.call(els.paper.querySelectorAll('input,select,button'), function (el) { el.disabled = false; });
    els.paper.reset();
    state = { started: false, startAt: null, answers: {}, submitted: false, result: null }; save(KEY, state);
    els.result.hidden = true; els.paper.hidden = true; els.bar.hidden = true; els.start.hidden = false;
    renderBest();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function renderBest() {
    var hist = load(RKEY) || [];
    if (!hist.length) { els.best.textContent = ''; return; }
    var best = hist.reduce(function (a, b) { return b.score > a.score ? b : a; });
    els.best.textContent = 'උත්සාහ ' + hist.length + ' · හොඳම ලකුණු ' + best.score + '/' + best.total + ' (' + best.pct + '%)' + (best.pass ? ' · සමත්' : '');
  }

  /* ---- wire up ---- */
  els.begin.addEventListener('click', begin);
  els.submit.addEventListener('click', function () { submit(false); });
  if (els.submit2) els.submit2.addEventListener('click', function () { submit(false); });
  els.paper.addEventListener('change', onChange);
  els.paper.addEventListener('input', onChange);
  els.paper.addEventListener('submit', function (e) { e.preventDefault(); submit(false); });
  window.addEventListener('beforeunload', function (e) { if (state.started && !state.submitted) { e.preventDefault(); e.returnValue = ''; } });

  renderBest();
  if (state.started && state.submitted && state.result) { showResult(state.result); }
  else if (state.started && !state.submitted) { showPaper(); } /* timer resumes; auto-submits if time is already up */
})();
