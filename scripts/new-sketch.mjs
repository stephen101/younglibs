#!/usr/bin/env node
// Scaffold a new sketch folder from a template.
//   npm run new my-idea
//   npm run new "Wandering Lines"
//
// Creates src/sketches/<slug>/index.js; the gallery picks it up automatically.

import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const raw = process.argv.slice(2).join(' ').trim();
if (!raw) {
  console.error('Usage: npm run new <name>   e.g.  npm run new "wandering lines"');
  process.exit(1);
}

const slug = raw
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');
const title = raw.replace(/\b\w/g, (m) => m.toUpperCase());

const dir = join(root, 'src', 'sketches', slug);
const file = join(dir, 'index.js');

try {
  await access(file);
  console.error(`✗ ${slug} already exists at src/sketches/${slug}/index.js`);
  process.exit(1);
} catch {
  /* doesn't exist — good */
}

const template = `// ${title}
// A fresh sketch. Promote any interesting number into \`params\` to get a live
// control for free. See docs/ADDING-A-SKETCH.md for the harness API.

import { hexToRgb } from '../../harness/palette.js';

export default {
  id: '${slug}',
  title: '${title}',
  renderer: '2d', // or 'webgl' for 3D
  tags: ['wip'],
  source: { name: '', url: '' },

  params: {
    speed: { value: 1, min: 0, max: 5, step: 0.1, label: 'speed' },
    hue:   { value: 200, min: 0, max: 360, step: 1, label: 'hue' },
    bg:    { value: '#0d0d14', label: 'background' },
    reseed:{ type: 'button', title: 'Reseed ⟳', action: (ctx) => ctx.reseed() },
  },

  setup(p, P, ctx) {
    const bg = hexToRgb(P.bg);
    p.background(bg.r, bg.g, bg.b);
    p.colorMode(p.HSB, 360, 100, 100);
  },

  draw(p, P, ctx) {
    const x = p.width / 2 + Math.cos(p.frameCount * 0.02 * P.speed) * 120;
    const y = p.height / 2 + Math.sin(p.frameCount * 0.02 * P.speed) * 120;
    p.noStroke();
    p.fill(P.hue, 70, 90);
    p.circle(x, y, 24);
  },
};
`;

await mkdir(dir, { recursive: true });
await writeFile(file, template);
console.log(`✓ created src/sketches/${slug}/index.js`);
console.log('  run `npm run dev` and open the gallery to see it.');
