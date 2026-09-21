#!/usr/bin/env node
// Turns a PRIVATE exam answer file into the PUBLIC exam.json the site is built from.
//   node scripts/hash-exam.mjs content/courses/<slug>/exam.answers.json
// The public file keeps every question and option but replaces each answer with a
// SHA-256 hash (salted with the course slug and question id). The browser grades by
// hashing the candidate's answer the same way, so no plain answers ship in the page.
// Keep *.answers.json out of git (see .gitignore).

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const src = process.argv[2];
if (!src) {
  console.error('usage: node scripts/hash-exam.mjs <exam.answers.json>');
  process.exit(1);
}
const priv = JSON.parse(fs.readFileSync(src, 'utf8'));
const out = path.join(path.dirname(src), 'exam.json');

/** Canonical answer string — MUST stay identical to canonical() in public/assets/exam-runtime.js */
export function canonical(type, val, q) {
  if (val == null) return '';
  switch (type) {
    case 'single':
      return String(val);
    case 'multi':
      return [...val].sort().join(',');
    case 'numeric': {
      const s = String(val).replace(/,/g, '').trim();
      const n = Number(s);
      if (!Number.isFinite(n)) return '';
      return Math.abs(n).toFixed(q.decimals || 0);
    }
    case 'match':
      return Object.keys(val).sort((a, b) => Number(a) - Number(b)).map((k) => `${k}:${val[k]}`).join(',');
    case 'order':
      return Array.isArray(val) ? val.join(',') : '';
    default:
      return '';
  }
}

const sha = (s) => createHash('sha256').update(s, 'utf8').digest('hex');

const questions = priv.questions.map((q) => {
  const { answer, why, ...pub } = q;
  const c = canonical(q.type, answer, q);
  if (!c) throw new Error(`Question ${q.id}: could not canonicalise answer`);
  // sanity checks
  if (q.type === 'single' && !(q.options || [])[c.charCodeAt(0) - 97]) throw new Error(`${q.id}: answer letter out of range`);
  if (q.type === 'multi') for (const l of answer) if (!(q.options || [])[l.charCodeAt(0) - 97]) throw new Error(`${q.id}: letter ${l} out of range`);
  if (q.type === 'match' && Object.keys(answer).length !== q.left.length) throw new Error(`${q.id}: match answer incomplete`);
  if (q.type === 'order' && answer.length !== q.items.length) throw new Error(`${q.id}: order answer incomplete`);
  return { ...pub, h: sha(`lf-exam:${priv.slug}:${q.id}|${c}`) };
});

const pub = {
  slug: priv.slug,
  title: priv.title,
  subtitle: priv.subtitle,
  minutes: priv.minutes,
  pass_percent: priv.pass_percent,
  modules: priv.modules,
  questions,
};
fs.writeFileSync(out, JSON.stringify(pub, null, 2) + '\n');
const types = questions.reduce((a, q) => ((a[q.type] = (a[q.type] || 0) + 1), a), {});
console.log(`Wrote ${out}: ${questions.length} questions`, types);
