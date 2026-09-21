// HTML templates for LearnandForge. Plain template literals, no dependencies.
// Every page is rendered through layout(); data comes from content/site.json.

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const FONTS_BASE =
  'https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700&family=Noto+Sans+Sinhala:wght@400;500;600;700';

/* ---------- icons (inline SVG, stroke = currentColor) ---------- */
const svg = (inner, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${inner}</svg>`;

export const icons = {
  textile: svg('<path d="M8 4l4 2 4-2 4 4-3 3v9H7v-9L4 8z"/><path d="M9 20v-6l3 1 3-1v6"/>'),
  leaf: svg('<path d="M5 20C5 11 11 5 20 4c0 9-6 15-15 16z"/><path d="M5 20c3-5 7-9 11-12"/>'),
  food: svg('<path d="M4 12h16a8 8 0 0 1-16 0z"/><path d="M12 12V4"/><path d="M8 4h8"/><path d="M5 20h14"/>'),
  craft: svg('<path d="M6 9h12l-1 11H7z"/><path d="M4 9h16"/><path d="M9 5a3 3 0 0 1 6 0v4H9z"/>'),
  shop: svg('<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 11v9h14v-9"/><path d="M10 20v-5h4v5"/>'),
  laptop: svg('<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M2 20h20"/><path d="M10 9h4"/>'),
  compass: svg('<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-4 2 2-6z"/>'),
  spec: svg('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>'),
  flask: svg('<path d="M9 3h6"/><path d="M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4A1.5 1.5 0 0 0 19.5 19L14 9V3"/><path d="M7 15h10"/>'),
  checklist: svg('<path d="M4 6l1.5 1.5L8 5"/><path d="M4 12l1.5 1.5L8 11"/><path d="M4 18l1.5 1.5L8 17"/><path d="M11 6h9M11 12h9M11 18h9"/>'),
  pin: svg('<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  arrow: svg('<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>'),
  play: svg('<path d="M8 5v14l11-7z"/>'),
  book: svg('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>'),
};

/* ---------- shell ---------- */
export function layout({ site, categories, title, description, body, path, extraFonts = '', extraHead = '', lang = 'en', bodyClass = '' }) {
  const fonts = FONTS_BASE + (extraFonts ? `&family=${extraFonts}` : '') + '&display=swap';
  const canonical = site.url.replace(/\/$/, '') + path;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#FFD23F">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fonts}">
<link rel="stylesheet" href="/assets/site.css">
${extraHead}
</head>
<body class="${bodyClass}">
${nav(path)}
<main id="main">
${body}
</main>
${footer(site, categories)}
<script src="/assets/site.js" defer></script>
</body>
</html>
`;
}

function nav(path) {
  const links = [
    ['/categories/', 'Categories'],
    ['/courses/', 'Courses'],
    ['/about/', 'About'],
  ];
  const a = (href, label) =>
    `<a href="${href}"${path.startsWith(href) ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<header class="lf-nav">
  <div class="lf-wrap lf-nav__inner">
    <a class="lf-logo" href="/" aria-label="LearnandForge home">Learn<span class="lf-logo__amp">&amp;</span>Forge</a>
    <nav class="lf-nav__links" aria-label="Primary">${links.map(([h, l]) => a(h, l)).join('')}</nav>
    <a class="lf-btn lf-btn--yellow lf-btn--sm lf-nav__cta" href="/courses/">Start learning</a>
    <button class="lf-nav__toggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="lf-menu"><span></span></button>
  </div>
  <nav class="lf-nav__menu" id="lf-menu" aria-label="Mobile">${links.map(([h, l]) => a(h, l)).join('')}<a href="/courses/">Start learning →</a></nav>
</header>`;
}

function footer(site, categories) {
  return `<footer class="lf-footer">
  <div class="lf-wrap">
    <div class="lf-footer__grid">
      <div>
        <a class="lf-logo" href="/">Learn<span class="lf-logo__amp">&amp;</span>Forge</a>
        <p style="margin-top:14px;max-width:44ch">${esc(site.description)}</p>
      </div>
      <div>
        <h4>Learn</h4>
        <ul>
          <li><a href="/courses/">All courses</a></li>
          <li><a href="/categories/">Categories</a></li>
          <li><a href="/courses/knit-tshirt-brand/">Start: From Yarn to Brand</a></li>
        </ul>
      </div>
      <div>
        <h4>Trades</h4>
        <ul>${categories.slice(0, 5).map((c) => `<li><a href="/categories/${c.slug}/">${esc(c.name)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h4>Platform</h4>
        <ul>
          <li><a href="/about/">About</a></li>
          <li><a href="${site.repo}" rel="noopener" target="_blank">Source on GitHub</a></li>
          <li><a href="${site.repo}/issues" rel="noopener" target="_blank">Suggest a course</a></li>
        </ul>
      </div>
    </div>
    <div class="lf-footer__bottom">
      <span>© ${site.year} ${esc(site.name)} · Made in Sri Lanka</span>
      <span>Course content is educational information, not legal, tax or financial advice.</span>
    </div>
  </div>
</footer>`;
}

/* ---------- reusable blocks ---------- */
export function categoryCard(cat, courseCount) {
  const count = courseCount > 0
    ? `<span class="lf-chip lf-chip--green">${courseCount} course${courseCount === 1 ? '' : 's'}</span>`
    : `<span class="lf-chip">Coming soon</span>`;
  return `<a class="lf-cat" href="/categories/${cat.slug}/">
  <div class="lf-cat__icon">${icons[cat.icon] || icons.compass}</div>
  <h3>${esc(cat.name)}</h3>
  <p class="lf-cat__si lf-si">${esc(cat.si)}</p>
  <p>${esc(cat.tagline)}</p>
  <div class="lf-cat__meta">${count}<span class="lf-cat__arrow">${icons.arrow}</span></div>
</a>`;
}

export function courseCard(course, cat) {
  return `<a class="lf-course" href="/courses/${course.slug}/" data-category="${cat.slug}">
  <div class="lf-course__cover">
    <span class="lf-chip lf-chip--yellow">${esc(cat.name)}</span>
    <div class="lf-si" style="margin-top:14px">${esc(course.title_si)}</div>
  </div>
  <div class="lf-course__body">
    <h3>${esc(course.title_en)}</h3>
    <p>${esc(course.subtitle_en)}</p>
    <div class="lf-course__meta">
      <span class="lf-chip">${course.modules_count} modules</span>
      <span class="lf-chip">${esc(course.hours)}</span>
      <span class="lf-chip">Sinhala</span>
      <span class="lf-chip lf-chip--green">${esc(course.price)}</span>
    </div>
  </div>
</a>`;
}

export function plannedCard(title, cat) {
  return `<div class="lf-course lf-course--soon" data-category="${cat.slug}" aria-label="Planned course">
  <div class="lf-course__cover">
    <span class="lf-chip">${esc(cat.name)}</span>
    <div style="margin-top:14px;font-family:var(--lf-display);font-weight:700;font-size:22px;line-height:1.3">${esc(title)}</div>
  </div>
  <div class="lf-course__body">
    <p>Planned — not yet published. Follow the repository or leave your e‑mail on the home page to hear when it launches.</p>
    <div class="lf-course__meta"><span class="lf-chip lf-chip--teal">Planned</span></div>
  </div>
</div>`;
}

const crumbs = (items) =>
  `<nav class="lf-crumbs" aria-label="Breadcrumb">${items
    .map(([href, label]) => (href ? `<span><a href="${href}">${esc(label)}</a></span>` : `<span>${esc(label)}</span>`))
    .join('')}</nav>`;

/* ---------- pages ---------- */
export function homePage({ site, categories, courses }) {
  const featured = courses.find((c) => c.status === 'available');
  const featCat = categories.find((c) => c.slug === featured.category);
  const countFor = (slug) => courses.filter((c) => c.status === 'available' && c.category === slug).length;

  const body = `
<section class="lf-hero">
  <div class="lf-wrap lf-hero__grid">
    <div class="lf-hero__copy">
      <p class="lf-eyebrow">Sinhala‑first learning for Sri Lankan entrepreneurs</p>
      <h1>Learn the trade.<br>Build the <span class="lf-hl">business.</span></h1>
      <p class="lf-lede">Practical courses on the trades Sri Lankans actually build businesses on — weaving, knitting and apparel, plantation, food, crafts and more. Every course is written in Sinhala, tested with quizzes, and packed with real suppliers, standards and templates.</p>
      <form class="lf-capture" novalidate>
        <label class="lf-sr" for="hero-email">E‑mail address</label>
        <input class="lf-capture__input" id="hero-email" type="email" name="email" placeholder="Your e‑mail address" autocomplete="email" required>
        <button class="lf-btn lf-btn--green" type="submit">Notify me</button>
        <p class="lf-capture__msg" aria-live="polite"></p>
      </form>
      <p class="lf-fineprint"><span>Free to learn</span><span>New courses announced by e‑mail</span><span>Sinhala + English terms</span></p>
    </div>
    <div class="lf-hero__art">
      <div class="lf-art" aria-hidden="true">
        <div class="lf-art__blob lf-art__blob--yellow"></div>
        <div class="lf-art__blob lf-art__blob--teal"></div>
        ${weaveSvg()}
        <div class="lf-art__card">
          <p class="lf-eyebrow">Module 3 · ${esc(featured.modules[2].si)}</p>
          <h3>${esc(featured.title_si)}</h3>
          <p>${esc(featured.title_en)} · ${featured.modules_count} modules · ${esc(featured.hours)}</p>
          <div class="lf-art__bar"><i></i></div>
          <div class="lf-art__mods">${featured.modules.map((m) => `<span class="${m.n <= 4 ? 'done' : ''}">${String(m.n).padStart(2, '0')}</span>`).join('')}</div>
        </div>
        <div class="lf-art__badge lf-art__badge--a"><i></i>GSM 190 · within spec</div>
        <div class="lf-art__badge lf-art__badge--b"><i></i>Fabric lot test: PASS</div>
        <div class="lf-art__badge lf-art__badge--c"><i></i>AQL 2.5 · lot accepted</div>
        <div class="lf-art__badge lf-art__badge--d"><i></i>Quiz 4 · 5/5</div>
      </div>
    </div>
  </div>
</section>

<section class="lf-band" aria-label="What every course includes">
  <div class="lf-wrap lf-band__inner">
    <p class="lf-band__title">Built the way export factories work</p>
    <ul class="lf-band__items">
      <li>${icons.spec}<span>Spec sheets you can hand to a supplier</span></li>
      <li>${icons.flask}<span>Tests and standards, with target values</span></li>
      <li>${icons.checklist}<span>Checklists, templates and quizzes</span></li>
      <li>${icons.pin}<span>Real Sri Lankan mills, factories, labs and institutes</span></li>
    </ul>
  </div>
</section>

<section class="lf-section" id="categories">
  <div class="lf-wrap">
    <div class="lf-section__head lf-section__head--row">
      <div>
        <p class="lf-eyebrow">Categories</p>
        <h2>Every trade, one place</h2>
        <p class="lf-lede">From the loom to the tea field to the online shop. Pick the trade you are building in — each category grows as new courses are published.</p>
      </div>
      <a class="lf-btn lf-btn--ghost" href="/categories/">All categories</a>
    </div>
    <div class="lf-grid lf-grid--3">${categories.map((c) => categoryCard(c, countFor(c.slug))).join('')}</div>
  </div>
</section>

<section class="lf-section lf-section--surface" id="featured">
  <div class="lf-wrap">
    <div class="lf-featured">
      <div>
        <p class="lf-eyebrow">Start here · ${esc(featCat.name)}</p>
        <div class="lf-title-si">${esc(featured.title_si)}</div>
        <h2>${esc(featured.title_en)}</h2>
        <p style="margin-top:14px;font-size:17px">${esc(featured.subtitle_en)}.</p>
        <p>${esc(featured.why)}</p>
        <div class="lf-chips">
          <span class="lf-chip">${featured.modules_count} modules</span>
          <span class="lf-chip">${esc(featured.hours)}</span>
          <span class="lf-chip">${featured.question_count} quiz questions</span>
          <span class="lf-chip">Sinhala</span>
          <span class="lf-chip">${esc(featured.price)}</span>
        </div>
        <div class="lf-featured__actions">
          <a class="lf-btn lf-btn--yellow" href="/courses/${featured.slug}/learn/">${icons.play} Start module 1</a>
          <a class="lf-btn lf-btn--ghost" style="color:#fff;border-color:rgba(255,255,255,.3)" href="/courses/${featured.slug}/">Course overview</a>
        </div>
      </div>
      <div class="lf-featured__panel">
        <h4>Modules</h4>
        <ul class="lf-mods">${featured.modules.slice(0, 5).map((m) => `<li><span class="n">${String(m.n).padStart(2, '0')}</span><span class="si">${esc(m.si)}<span class="en">${esc(m.en)}</span></span><span class="h">${esc(m.hours)}</span></li>`).join('')}</ul>
        <p class="lf-featured__more">+ ${featured.modules.length - 5} more modules, a final exam, glossary, templates and a link library.</p>
      </div>
    </div>
  </div>
</section>

<section class="lf-section" id="how">
  <div class="lf-wrap">
    <div class="lf-section__head">
      <p class="lf-eyebrow">How it works</p>
      <h2>Read. Do. Prove it.</h2>
      <p class="lf-lede">No video to sit through. Each module is written to be read in an evening and used the next morning.</p>
    </div>
    <div class="lf-steps">
      <div class="lf-step"><h3>Read a module</h3><p>Clear Sinhala with the English industry terms kept in brackets, so you can talk to a mill or a factory in their own words. Every module has a Sri Lanka example box.</p></div>
      <div class="lf-step"><h3>Do the field exercise</h3><p>Weigh a fabric swatch, visit Pettah, e‑mail three factories, ask a lab for a quotation. The exercises are the course — the reading just prepares you.</p></div>
      <div class="lf-step"><h3>Pass the quiz</h3><p>Five questions per module with an explanation for every answer, and a final exam. Progress is saved in your browser; nothing to sign up for.</p></div>
    </div>
  </div>
</section>

<section class="lf-section lf-section--surface" id="roadmap">
  <div class="lf-wrap">
    <div class="lf-section__head">
      <p class="lf-eyebrow">Coming next</p>
      <h2>Courses on the way</h2>
      <p class="lf-lede">Planned titles for each trade. Leave your e‑mail above to hear when one goes live, or <a href="${site.repo}/issues" target="_blank" rel="noopener">suggest a course</a>.</p>
    </div>
    <div class="lf-roadmap">${categories.map((c) => `<div class="lf-road"><h4>${esc(c.name)}</h4><ul>${c.planned.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>`).join('')}</div>
  </div>
</section>

<section class="lf-section">
  <div class="lf-wrap">
    <div class="lf-cta">
      <h2>Start with the first course today</h2>
      <p>${esc(featured.title_si)} — ${esc(featured.title_en)}. Nine modules on knit fabrics, testing, printing, production and sourcing in Sri Lanka, free, in Sinhala.</p>
      <div class="lf-cta__actions">
        <a class="lf-btn lf-btn--ink" href="/courses/${featured.slug}/learn/">Open the course</a>
        <a class="lf-btn lf-btn--ghost" href="/courses/">Browse all courses</a>
      </div>
    </div>
  </div>
</section>`;

  return layout({
    site, categories, path: '/',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    body,
  });
}

function weaveSvg() {
  // A simple weave pattern: alternating horizontal/vertical strands.
  let cells = '';
  const n = 6, s = 100 / n;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const horiz = (r + c) % 2 === 0;
      const x = c * s, y = r * s, pad = s * 0.18;
      cells += horiz
        ? `<rect x="${x.toFixed(1)}" y="${(y + pad).toFixed(1)}" width="${s.toFixed(1)}" height="${(s - 2 * pad).toFixed(1)}" rx="2" fill="#1C9C9A" opacity=".55"/>`
        : `<rect x="${(x + pad).toFixed(1)}" y="${y.toFixed(1)}" width="${(s - 2 * pad).toFixed(1)}" height="${s.toFixed(1)}" rx="2" fill="#14171F" opacity=".22"/>`;
    }
  }
  return `<svg class="lf-art__weave" viewBox="0 0 100 100" aria-hidden="true">${cells}</svg>`;
}

export function categoriesPage({ site, categories, courses }) {
  const countFor = (slug) => courses.filter((c) => c.status === 'available' && c.category === slug).length;
  const body = `
<section class="lf-page-hero"><div class="lf-wrap">
  ${crumbs([['/', 'Home'], [null, 'Categories']])}
  <p class="lf-eyebrow">Categories</p>
  <h1>Trades Sri Lankans build businesses on</h1>
  <p class="lf-lede" style="margin-top:16px">Seven categories, from apparel to plantation to the online shop. Each one lists what is published now and what is planned next.</p>
</div></section>
<section class="lf-section"><div class="lf-wrap">
  <div class="lf-grid lf-grid--3">${categories.map((c) => categoryCard(c, countFor(c.slug))).join('')}</div>
</div></section>`;
  return layout({ site, categories, path: '/categories/', title: `Categories — ${site.name}`, description: 'Browse LearnandForge courses by trade: textiles and apparel, agriculture and plantation, food, handicrafts, retail, services and business foundations.', body });
}

export function categoryPage({ site, categories, courses }, cat) {
  const available = courses.filter((c) => c.status === 'available' && c.category === cat.slug);
  const body = `
<section class="lf-page-hero"><div class="lf-wrap">
  ${crumbs([['/', 'Home'], ['/categories/', 'Categories'], [null, cat.name]])}
  <div class="lf-page-hero__row">
    <div class="lf-cat__icon">${icons[cat.icon] || icons.compass}</div>
    <div>
      <h1>${esc(cat.name)}</h1>
      <p class="lf-si">${esc(cat.si)}</p>
      <p class="lf-lede" style="margin-top:16px">${esc(cat.description)}</p>
    </div>
  </div>
</div></section>
<section class="lf-section"><div class="lf-wrap">
  <div class="lf-section__head lf-section__head--row">
    <div><p class="lf-eyebrow">Published</p><h2>${available.length ? `${available.length} course${available.length === 1 ? '' : 's'} available` : 'No course published yet'}</h2></div>
    <a class="lf-btn lf-btn--ghost" href="/courses/">All courses</a>
  </div>
  ${available.length
    ? `<div class="lf-grid lf-grid--3">${available.map((c) => courseCard(c, cat)).join('')}</div>`
    : `<div class="lf-empty">The first course in this category is being written. The planned titles are below — <a href="${site.repo}/issues" target="_blank" rel="noopener">tell us which one you need first</a>.</div>`}
</div></section>
<section class="lf-section lf-section--surface"><div class="lf-wrap">
  <div class="lf-section__head"><p class="lf-eyebrow">Planned</p><h2>Coming to ${esc(cat.name)}</h2></div>
  <div class="lf-grid lf-grid--3">${cat.planned.map((p) => plannedCard(p, cat)).join('')}</div>
</div></section>`;
  return layout({ site, categories, path: `/categories/${cat.slug}/`, title: `${cat.name} — ${site.name}`, description: cat.description, body });
}

export function coursesPage({ site, categories, courses }) {
  const available = courses.filter((c) => c.status === 'available');
  const catOf = (slug) => categories.find((c) => c.slug === slug);
  const planned = categories.flatMap((c) => c.planned.map((p) => plannedCard(p, c)));
  const body = `
<section class="lf-page-hero"><div class="lf-wrap">
  ${crumbs([['/', 'Home'], [null, 'Courses']])}
  <p class="lf-eyebrow">Courses</p>
  <h1>All courses</h1>
  <p class="lf-lede" style="margin-top:16px">${available.length} published, ${planned.length} planned. Filter by trade.</p>
</div></section>
<section class="lf-section"><div class="lf-wrap">
  <div class="lf-filters" role="group" aria-label="Filter by category">
    <button class="lf-filter" type="button" data-filter="all" aria-pressed="true">All</button>
    ${categories.map((c) => `<button class="lf-filter" type="button" data-filter="${c.slug}" aria-pressed="false">${esc(c.name)}</button>`).join('')}
  </div>
  <div class="lf-grid lf-grid--3">
    ${available.map((c) => courseCard(c, catOf(c.category))).join('')}
    ${planned.join('')}
  </div>
  <div class="lf-empty" hidden>No courses in this category yet.</div>
</div></section>`;
  return layout({ site, categories, path: '/courses/', title: `Courses — ${site.name}`, description: 'Published and planned LearnandForge courses for Sri Lankan entrepreneurs, in Sinhala.', body });
}

export function coursePage({ site, categories }, course) {
  const cat = categories.find((c) => c.slug === course.category);
  const body = `
<section class="lf-course-hero"><div class="lf-wrap">
  ${crumbs([['/', 'Home'], ['/courses/', 'Courses'], [`/categories/${cat.slug}/`, cat.name], [null, course.title_en]])}
  <div class="lf-course-hero__grid">
    <div>
      <div class="lf-chips" style="margin-bottom:18px"><span class="lf-chip lf-chip--yellow">${esc(cat.name)}</span><span class="lf-chip lf-chip--green">${esc(course.price)}</span><span class="lf-chip">Updated ${esc(course.updated)}</span></div>
      <div class="lf-title-si">${esc(course.title_si)}</div>
      <h1>${esc(course.title_en)} — ${esc(course.subtitle_en)}</h1>
      <p class="lf-lede">${esc(course.summary)}</p>
    </div>
    <aside class="lf-enroll" aria-label="Start this course">
      <div class="lf-enroll__price">${esc(course.price)}</div>
      <p class="lf-enroll__note">No account needed. Quiz progress is saved in this browser only.</p>
      <a class="lf-btn lf-btn--yellow" href="/courses/${course.slug}/learn/">${icons.play} Start the course</a>
      <dl>
        <dt>Language</dt><dd>${esc(course.language)}</dd>
        <dt>Level</dt><dd>${esc(course.level)}</dd>
        <dt>Time</dt><dd>${esc(course.hours)}</dd>
        <dt>Modules</dt><dd>${course.modules_count} + final exam</dd>
        <dt>Quizzes</dt><dd>${course.quiz_count} (${course.question_count} questions)</dd>
      </dl>
    </aside>
  </div>
</div></section>
<section class="lf-detail"><div class="lf-wrap lf-detail__grid">
  <div>
    <h2>What you will be able to do</h2>
    <ul class="lf-list--check">${course.outcomes.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
    <h2>Modules</h2>
    <ol class="lf-modules">
      ${course.modules.map((m) => `<li><span class="n">${String(m.n).padStart(2, '0')}</span><span class="si">${esc(m.si)}<span class="en">${esc(m.en)}</span></span><span class="h">${esc(m.hours)}</span></li>`).join('')}
      ${course.extras.map((x) => `<li class="extra"><span class="n">+</span><span class="si">${esc(x)}</span></li>`).join('')}
    </ol>
    <h2>Why this course exists</h2>
    <p class="lf-lede" style="font-size:17px">${esc(course.why)}</p>
    <div style="margin-top:28px"><a class="lf-btn lf-btn--yellow" href="/courses/${course.slug}/learn/">${icons.play} Start module 1</a></div>
  </div>
  <div class="lf-aside">
    <div class="lf-aside__card"><h3>Who it is for</h3><ul>${course.audience.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>
    <div class="lf-aside__card"><h3>What you need</h3><ul>${course.requirements.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>
    <div class="lf-aside__card"><h3>Included</h3><ul>${course.includes.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>
    <div class="lf-aside__card"><h3>Category</h3><p><a href="/categories/${cat.slug}/">${esc(cat.name)}</a> · <span class="lf-si">${esc(cat.si)}</span></p></div>
  </div>
</div></section>`;
  return layout({ site, categories, path: `/courses/${course.slug}/`, title: `${course.title_si} · ${course.title_en} — ${site.name}`, description: course.summary.slice(0, 200), body });
}

export function learnPage({ site, categories }, course, contentHtml) {
  const cat = categories.find((c) => c.slug === course.category);
  const body = `
<div class="lf-learnbar"><div class="lf-wrap lf-learnbar__inner">
  ${crumbs([['/courses/', 'Courses'], [`/categories/${cat.slug}/`, cat.name], [`/courses/${course.slug}/`, course.title_en], [null, 'Reader']])}
  <a class="lf-btn lf-btn--ghost lf-btn--sm" href="/courses/${course.slug}/">Course overview</a>
</div></div>
<div class="course-root" lang="si" data-course="${course.slug}">
${contentHtml}
</div>
<script src="${course.content.runtime}" defer></script>`;
  return layout({
    site, categories, path: `/courses/${course.slug}/learn/`,
    title: `${course.title_si} — ${site.name}`,
    description: course.summary.slice(0, 200),
    body, extraFonts: course.content.fonts, bodyClass: 'lf-learn',
    extraHead: `<link rel="stylesheet" href="${course.content.css}">`,
  });
}

export function aboutPage({ site, categories }) {
  const body = `
<section class="lf-page-hero"><div class="lf-wrap">
  ${crumbs([['/', 'Home'], [null, 'About']])}
  <p class="lf-eyebrow">About</p>
  <h1>Trade knowledge, written down in Sinhala</h1>
</div></section>
<section class="lf-section"><div class="lf-wrap lf-prose">
  <p class="lf-lede">Sri Lanka's export industries run on knowledge that rarely leaves the factory floor: which fabric spec a brand nominates, how a lot is tested, what an AQL inspection accepts. LearnandForge writes that knowledge down — in Sinhala, at a size a one‑person business can use.</p>
  <h2>What a course is here</h2>
  <p>Every course is a set of modules you can read in an evening, each ending in a field exercise and a quiz. The exercises send you to real places — Pettah, a mill's stock lot, a lab in Colombo, a print house — because a trade is learned with your hands. The quizzes are marked instantly, with the reasoning for every answer.</p>
  <h2>How courses are made</h2>
  <ul>
    <li>Start from how the export industry actually does it, then scale the process down.</li>
    <li>Use real standards (ISO, AATCC, OEKO‑TEX, AQL) with target values a beginner can hand to a supplier.</li>
    <li>Link only to sources we have checked: institutes, labs, mills, official registries.</li>
    <li>Mark every price, MOQ and lead time as a typical range to be replaced by real quotations.</li>
    <li>Give templates, not just advice — spec sheets, acceptance sheets, inspection sheets.</li>
  </ul>
  <h2>Open source</h2>
  <p>The platform and its courses live in a public repository: <a href="${site.repo}" target="_blank" rel="noopener">${site.repo.replace('https://', '')}</a>. Corrections, new Sri Lanka examples and new course proposals are welcome as issues or pull requests.</p>
  <h2>What this is not</h2>
  <p>Educational information. Business registration, tax and import sections are general guidance — check with a lawyer or accountant before acting.</p>
</div></section>`;
  return layout({ site, categories, path: '/about/', title: `About — ${site.name}`, description: 'Why LearnandForge exists and how its Sinhala courses for Sri Lankan entrepreneurs are made.', body });
}

export function notFoundPage({ site, categories }) {
  const body = `
<section class="lf-404"><div class="lf-wrap">
  <div class="n">404</div>
  <h1 style="font-size:32px;margin:12px 0">That page is not here</h1>
  <p class="lf-lede" style="margin:0 auto 24px">Try the courses list or go back home.</p>
  <div class="lf-cta__actions"><a class="lf-btn lf-btn--yellow" href="/courses/">Courses</a><a class="lf-btn lf-btn--ghost" href="/">Home</a></div>
</div></section>`;
  return layout({ site, categories, path: '/404', title: `Not found — ${site.name}`, description: 'Page not found.', body });
}
