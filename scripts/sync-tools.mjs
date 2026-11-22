// builds each standalone tool and mounts it under the main site.
// usage: node scripts/sync-tools.mjs   (expects the tool repos next to this one or under ../rg-github)
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const TOOLS = [
  { slug: 'how-many-clicks', title: 'How Many Clicks?', description: 'the wikipedia game. a bot goes first, then you try to beat it.' },
];

function find(slug) {
  for (const base of [resolve(root, '..', slug), resolve(root, '..', 'rg-github', slug)]) {
    if (existsSync(join(base, 'package.json'))) return base;
  }
  throw new Error(`cannot find the ${slug} repo`);
}

for (const tool of TOOLS) {
  const src = find(tool.slug);
  execSync(`npx vite build --base=/${tool.slug}/`, { cwd: src, stdio: 'inherit' });
  const out = join(root, 'public', tool.slug);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  cpSync(join(src, 'dist'), out, { recursive: true });
  rmSync(join(out, 'index.html'));
  const html = readFileSync(join(src, 'dist', 'index.html'), 'utf8');
  const head = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>'))
    .replace(/<title>[^<]*<\/title>/, '')
    .replace(/<script /g, '<script is:inline ')
    .trim();
  const page = `---\n---\n<!doctype html>\n<html lang="en">\n  <head>\n    <title>${tool.title} | Ronniel Gandhe</title>\n    <meta name="description" content="${tool.description}" />\n    <link rel="icon" type="image/png" href="/icons/baseheadlogo.png" />\n    ${head.split('\n').map((l) => l.trim()).join('\n    ')}\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>\n`;
  writeFileSync(join(root, 'src', 'pages', `${tool.slug}.astro`), page);
  console.log(`mounted /${tool.slug}`);
}
