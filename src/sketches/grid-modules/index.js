// Grid Modules — a grid of cells, each drawing a randomized module with a
// random rotation and color. This is the signature "Generative Design" idea
// (P.2 shape chapters): a simple module × a grid × controlled randomness.
//
// The composition is built once in setup() from the seeded RNG and stored, so
// it stays static across frames; params marked { rebuild: true } regenerate it.

import { PALETTES, hexToRgb } from '../../harness/palette.js';

let cells;   // [{ col, row, variant, rot, color, scale }]
let size;    // cell size in px

const VARIANTS = ['lines', 'arcs', 'circles', 'triangles'];

function build(p, P, ctx) {
  const palette = PALETTES[P.palette] || PALETTES.ink;
  size = p.width / P.cols;
  const rows = Math.ceil(p.height / size);
  cells = [];
  for (let col = 0; col < P.cols; col++) {
    for (let row = 0; row < rows; row++) {
      const variant = P.moduleSet === 'mixed' ? ctx.rng.pick(VARIANTS) : P.moduleSet;
      cells.push({
        col, row, variant,
        rot: ctx.rng.int(0, 4),
        color: ctx.rng.pick(palette),
        scale: ctx.rng(0.55, 1),
      });
    }
  }
}

function renderCell(p, c, P) {
  const s = size;
  const col = hexToRgb(c.color);
  p.push();
  p.translate(c.col * s + s / 2, c.row * s + s / 2);
  p.rotate((c.rot * p.HALF_PI));

  p.stroke(col.r, col.g, col.b);
  p.strokeWeight(P.weight);
  p.strokeCap(p.PROJECT);

  if (c.variant === 'lines') {
    p.line(-s / 2, -s / 2, s / 2, s / 2);
  } else if (c.variant === 'arcs') {
    p.noFill();
    p.arc(-s / 2, -s / 2, s, s, 0, p.HALF_PI);
    p.arc(s / 2, s / 2, s, s, p.PI, p.PI + p.HALF_PI);
  } else if (c.variant === 'circles') {
    if (P.fill) { p.fill(col.r, col.g, col.b); } else p.noFill();
    p.circle(0, 0, s * c.scale);
  } else if (c.variant === 'triangles') {
    if (P.fill) { p.fill(col.r, col.g, col.b); } else p.noFill();
    const h = (s * c.scale) / 2;
    p.triangle(0, -h, h, h, -h, h);
  }
  p.pop();
}

export default {
  id: 'grid-modules',
  title: 'Grid Modules',
  order: 3,
  renderer: '2d',
  tags: ['grid', 'generative-design', '2d'],
  source: {
    name: 'Generative Design — grid of modules',
    url: 'https://github.com/generative-design/Code-Package-p5.js',
  },

  params: {
    cols:      { value: 16, min: 2, max: 80, step: 1, label: 'columns', rebuild: true },
    moduleSet: { value: 'mixed', label: 'module', rebuild: true,
                 options: { Mixed: 'mixed', Lines: 'lines', Arcs: 'arcs', Circles: 'circles', Triangles: 'triangles' } },
    palette:   { value: 'ember', label: 'palette', rebuild: true,
                 options: { Ink: 'ink', Ember: 'ember', Forest: 'forest', Pastel: 'pastel', Mono: 'mono' } },
    weight:    { value: 3, min: 0.5, max: 14, step: 0.5, label: 'stroke' },
    fill:      { value: false, label: 'fill shapes' },
    bg:        { value: '#0d0d14', label: 'background' },
    reseed:    { type: 'button', title: 'Reseed ⟳', action: (ctx) => ctx.reseed() },
  },

  setup(p, P, ctx) {
    build(p, P, ctx);
  },

  draw(p, P) {
    // Deterministic composition — the stored cells don't change between frames,
    // so every frame paints the same image (cheap for a grid). Tweaking a
    // { rebuild: true } param regenerates `cells`; other params are read live.
    const bg = hexToRgb(P.bg);
    p.background(bg.r, bg.g, bg.b);
    for (const c of cells) renderCell(p, c, P);
  },
};
