#!/usr/bin/env node
// Tiny local preview server for ./dist (mirrors Vercel's clean URLs + 404 page). No dependencies.
//   npm run dev   → build, then serve on http://localhost:3000
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT) || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  const candidates = [path.join(DIST, safe), path.join(DIST, safe, 'index.html'), path.join(DIST, safe + '.html')];
  let file = candidates.find((f) => fs.existsSync(f) && fs.statSync(f).isFile());
  let status = 200;
  if (!file) { file = path.join(DIST, '404.html'); status = 404; }
  res.writeHead(status, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`LearnandForge preview → http://localhost:${PORT}`));
