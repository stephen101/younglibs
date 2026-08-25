// Circle Packing — grow non-overlapping circles to fill the canvas.
// Each frame: try to drop new seed circles in empty space, then grow every
// still-growing circle until it touches a neighbour or an edge.

import { PALETTES, hexToRgb } from '../../harness/palette.js';

let circles;
let colors;

function insideAny(circles, x, y, gap) {
  for (const c of circles) {
    if (Math.hypot(c.x - x, c.y - y) < c.r + gap) return true;
  }
  return false;
}

export default {
  id: 'circle-packing',
  title: 'Circle Packing',
  order: 2,
  renderer: '2d',
  tags: ['geometry', 'packing', '2d'],
  source: { name: 'Classic circle-packing (Coding Train family)', url: 'https://natureofcode.com' },

  params: {
    attempts:  { value: 30, min: 1, max: 200, step: 1, label: 'spawn/frame' },
    maxRadius: { value: 60, min: 4, max: 200, step: 1, label: 'max radius' },
    growth:    { value: 1.2, min: 0.1, max: 5, step: 0.1, label: 'growth' },
    gap:       { value: 3, min: 0, max: 30, step: 1, label: 'gap' },
    weight:    { value: 1.5, min: 0, max: 6, step: 0.5, label: 'stroke' },
    fill:      { value: 0.85, min: 0, max: 1, step: 0.05, label: 'fill' },
    palette:   { value: 'ink', label: 'palette',
                 options: { Ink: 'ink', Ember: 'ember', Forest: 'forest', Pastel: 'pastel', Mono: 'mono' } },
    bg:        { value: '#0d0d14', label: 'background' },
    reseed:    { type: 'button', title: 'Reseed ⟳', action: (ctx) => ctx.reseed() },
  },

  setup(p, P, ctx) {
    circles = [];
    colors = PALETTES[P.palette] || PALETTES.ink;
    const bg = hexToRgb(P.bg);
    p.background(bg.r, bg.g, bg.b);
  },

  draw(p, P, ctx) {
    colors = PALETTES[P.palette] || PALETTES.ink;

    // Try to seed new circles in empty space.
    for (let i = 0; i < P.attempts; i++) {
      const x = ctx.rng(p.width);
      const y = ctx.rng(p.height);
      if (!insideAny(circles, x, y, P.gap)) {
        circles.push({ x, y, r: 1, growing: true, c: ctx.rng.pick(colors) });
      }
    }

    // Grow circles that still can.
    for (const c of circles) {
      if (!c.growing) continue;
      if (
        c.r >= P.maxRadius ||
        c.x - c.r <= P.gap || c.x + c.r >= p.width - P.gap ||
        c.y - c.r <= P.gap || c.y + c.r >= p.height - P.gap
      ) {
        c.growing = false;
        continue;
      }
      for (const o of circles) {
        if (o === c) continue;
        if (Math.hypot(o.x - c.x, o.y - c.y) < c.r + o.r + P.gap) {
          c.growing = false;
          break;
        }
      }
      if (c.growing) c.r += P.growth;
    }

    // Render.
    const bg = hexToRgb(P.bg);
    p.background(bg.r, bg.g, bg.b);
    for (const c of circles) {
      const col = hexToRgb(c.c);
      if (P.fill > 0) p.fill(col.r, col.g, col.b, P.fill * 255);
      else p.noFill();
      if (P.weight > 0) { p.stroke(col.r, col.g, col.b); p.strokeWeight(P.weight); }
      else p.noStroke();
      p.circle(c.x, c.y, c.r * 2);
    }
  },
};
