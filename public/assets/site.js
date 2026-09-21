/* LearnandForge — platform behaviour. No dependencies. */
(function () {
  // Mobile navigation
  var nav = document.querySelector('.lf-nav');
  var toggle = document.querySelector('.lf-nav__toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Mark the current section in the navigation
  var path = location.pathname.replace(/\/index\.html$/, '/');
  document.querySelectorAll('.lf-nav__links a, .lf-nav__menu a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || href === '/') { if (path === '/') a.setAttribute('aria-current', 'page'); return; }
    if (path.indexOf(href) === 0) a.setAttribute('aria-current', 'page');
  });

  // E-mail capture: no backend yet — validate, thank the visitor, remember locally.
  // To wire a real list: POST to your provider (Buttondown, Mailchimp, a Vercel function) inside submitCapture().
  document.querySelectorAll('.lf-capture').forEach(function (form) {
    var input = form.querySelector('input[type="email"]');
    var msg = form.querySelector('.lf-capture__msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!input || !msg) return;
      var v = (input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        msg.textContent = 'Please enter a valid e‑mail address.';
        msg.style.color = '#B2382C';
        input.focus();
        return;
      }
      submitCapture(v);
      msg.style.color = '';
      msg.textContent = 'Thanks — we will let you know when new courses launch.';
      input.value = '';
    });
  });
  function submitCapture(email) {
    try { localStorage.setItem('lf-capture', JSON.stringify({ email: email, at: new Date().toISOString() })); } catch (e) {}
  }

  // Course list filter (courses index)
  var filterBtns = document.querySelectorAll('.lf-filter');
  if (filterBtns.length) {
    var cards = document.querySelectorAll('[data-category]');
    var empty = document.querySelector('.lf-empty');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-filter');
        filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        var shown = 0;
        cards.forEach(function (c) {
          var show = key === 'all' || c.getAttribute('data-category') === key;
          c.hidden = !show;
          if (show) shown++;
        });
        if (empty) empty.hidden = shown > 0;
      });
    });
  }
})();
