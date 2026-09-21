#!/usr/bin/env node
// LearnandForge static build. No dependencies — runs on any Node 18+.
//   node scripts/build.mjs        → writes the whole site to ./dist
// Vercel runs this via `npm run build` (see vercel.json) and serves ./dist.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as T from './templates.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'site.json'), 'utf8'));

/* ---------- validate content ---------- */
const catSlugs = new Set(data.categories.map((c) => c.slug));
for (const course of data.courses) {
  if (!catSlugs.has(course.category)) fail(`Course "${course.slug}" points to unknown category "${course.category}"`);
  if (!/^[a-z0-9-]+$/.test(course.slug)) fail(`Course slug "${course.slug}" must be lowercase letters, digits and dashes`);
  if (course.status === 'available' && !fs.existsSync(path.join(ROOT, course.content.html))) fail(`Course "${course.slug}": content file not found: ${course.content.html}`);
}
for (const cat of data.categories) if (!/^[a-z0-9-]+$/.test(cat.slug)) fail(`Category slug "${cat.slug}" is invalid`);

/* ---------- reset dist & copy static assets ---------- */
try {
  fs.rmSync(DIST, { recursive: true, force: true });
} catch (err) {
  // Some mounted/locked file systems refuse deletes; overwrite in place instead.
  console.warn(`Warning: could not clear dist/ (${err.code}); overwriting files in place.`);
}
fs.mkdirSync(DIST, { recursive: true });
copyDir(path.join(ROOT, 'public'), DIST);

/* ---------- exams (public, hashed) ---------- */
const exams = {};
for (const course of data.courses) {
  if (!course.exam) continue;
  const file = path.join(ROOT, course.exam);
  if (!fs.existsSync(file)) fail(`Course "${course.slug}": exam file not found: ${course.exam} (run scripts/hash-exam.mjs)`);
  const exam = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (exam.slug !== course.slug) fail(`Exam slug "${exam.slug}" does not match course "${course.slug}"`);
  for (const q of exam.questions) {
    if (!/^[0-9a-f]{64}$/.test(q.h || '')) fail(`Exam ${course.slug}: question ${q.id} has no hash — the public exam.json must be generated with scripts/hash-exam.mjs`);
    if ('answer' in q || 'why' in q) fail(`Exam ${course.slug}: question ${q.id} still contains an answer — never ship exam.answers.json content`);
  }
  exams[course.slug] = exam;
  course.examMeta = { count: exam.questions.length, minutes: exam.minutes, pass: exam.pass_percent };
}

/* ---------- pages ---------- */
const pages = [];
write('/', T.homePage(data));
write('/categories/', T.categoriesPage(data));
for (const cat of data.categories) write(`/categories/${cat.slug}/`, T.categoryPage(data, cat));
write('/courses/', T.coursesPage(data));
for (const course of data.courses) {
  if (course.status !== 'available') continue;
  write(`/courses/${course.slug}/`, T.coursePage(data, course));
  const html = fs.readFileSync(path.join(ROOT, course.content.html), 'utf8');
  write(`/courses/${course.slug}/learn/`, T.learnPage(data, course, html));
  if (exams[course.slug]) write(`/courses/${course.slug}/exam/`, T.examPage(data, course, exams[course.slug]));
}
write('/about/', T.aboutPage(data));
fs.writeFileSync(path.join(DIST, '404.html'), T.notFoundPage(data));

/* ---------- sitemap & robots ---------- */
const base = data.site.url.replace(/\/$/, '');
fs.writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    pages.map((p) => `  <url><loc>${base}${p}</loc></url>`).join('\n') +
    `\n</urlset>\n`,
);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);

/* ---------- internal link check ---------- */
let broken = 0;
for (const file of walk(DIST).filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const target = m[1];
    const candidates = [path.join(DIST, target), path.join(DIST, target, 'index.html'), path.join(DIST, target + '.html')];
    if (!candidates.some((c) => fs.existsSync(c) && fs.statSync(c).isFile())) {
      broken++;
      console.error(`  broken link ${target}  (in ${path.relative(DIST, file)})`);
    }
  }
}
if (broken) fail(`${broken} broken internal link(s)`);

console.log(`Built ${pages.length} pages → dist/`);
pages.forEach((p) => console.log('  ' + p));

/* ---------- helpers ---------- */
function write(route, html) {
  const dir = path.join(DIST, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  pages.push(route);
}
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name), d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}
function fail(msg) {
  console.error('Build failed: ' + msg);
  process.exit(1);
}
