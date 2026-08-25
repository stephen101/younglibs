// Flow Field — a Perlin-noise flow field with particles steering along it.
// Ported from the original younglibs Java sketch (Reynolds' flow-field
// following, http://www.red3d.com/cwr/steer/FlowFollow.html), with trails and
// color promoted to live params.

import { hexToRgb } from '../../harness/palette.js';

let field;              // Float32Array of flow angles, cols*rows
let cols, rows;
let zoff;
let particles;

function buildField(p, P) {
  cols = Math.max(1, Math.ceil(p.width / P.gridRes));
  rows = Math.max(1, Math.ceil(p.height / P.gridRes));
  field = new Float32Array(cols * rows);
  zoff = 0;
}

function stepField(p, P) {
  zoff += P.fieldSpeed;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const theta = p.map(
        p.noise(i * P.noiseScale, j * P.noiseScale, zoff),
        0, 1, 0, p.TWO_PI * 2
      );
      field[i * rows + j] = theta;
    }
  }
}

function lookup(p, P, x, y) {
  const c = p.constrain(Math.floor(x / P.gridRes), 0, cols - 1);
  const r = p.constrain(Math.floor(y / P.gridRes), 0, rows - 1);
  return field[c * rows + r];
}

function spawn(p, ctx) {
  return {
    x: ctx.rng(p.width),
    y: ctx.rng(p.height),
    px: 0, py: 0,
    vx: 0, vy: 0,
    ms: ctx.rng(2, 5),
    mf: ctx.rng(0.1, 0.5),
  };
}

export default {
  id: 'flow-field',
  title: 'Flow Field',
  order: 1,
  renderer: '2d',
  tags: ['particles', 'noise', '2d'],
  source: {
    name: 'Ported from younglibs Java · Reynolds flow-following',
    url: 'http://www.red3d.com/cwr/steer/FlowFollow.html',
  },

  params: {
    particles: { value: 900, min: 50, max: 4000, step: 50, label: 'particles', rebuild: true },
    gridRes:   { value: 18, min: 6, max: 60, step: 1, label: 'grid res', rebuild: true },
    noiseScale:{ value: 0.08, min: 0.005, max: 0.3, step: 0.005, label: 'noise scale' },
    fieldSpeed:{ value: 0.004, min: 0, max: 0.03, step: 0.001, label: 'field speed' },
    maxSpeed:  { value: 3.2, min: 0.5, max: 8, step: 0.1, label: 'max speed' },
    trail:     { value: 14, min: 0, max: 80, step: 1, label: 'trail fade' },
    ink:       { value: 42, min: 2, max: 255, step: 1, label: 'ink alpha' },
    inkColor:  { value: '#e8e6df', label: 'ink' },
    bg:        { value: '#0d0d14', label: 'background' },
    showField: { value: false, label: 'show field' },
    reseed:    { type: 'button', title: 'Reseed ⟳', action: (ctx) => ctx.reseed() },
  },

  setup(p, P, ctx) {
    buildField(p, P);
    stepField(p, P);
    particles = Array.from({ length: P.particles }, () => spawn(p, ctx));
    const bg = hexToRgb(P.bg);
    p.background(bg.r, bg.g, bg.b);
  },

  draw(p, P, ctx) {
    // Fade toward the background color for trails.
    const bg = hexToRgb(P.bg);
    p.noStroke();
    p.fill(bg.r, bg.g, bg.b, P.trail);
    p.rect(0, 0, p.width, p.height);

    stepField(p, P);

    if (P.showField) {
      p.stroke(255, 40);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const a = field[i * rows + j];
          const x = i * P.gridRes, y = j * P.gridRes;
          p.line(x, y, x + Math.cos(a) * (P.gridRes - 3), y + Math.sin(a) * (P.gridRes - 3));
        }
      }
    }

    const ink = hexToRgb(P.inkColor);
    p.stroke(ink.r, ink.g, ink.b, P.ink);
    p.strokeWeight(1);

    for (const q of particles) {
      // Steer toward the field vector (desired - velocity, limited by maxforce).
      const a = lookup(p, P, q.x, q.y);
      const dx = Math.cos(a) * P.maxSpeed - q.vx;
      const dy = Math.sin(a) * P.maxSpeed - q.vy;
      const dm = Math.hypot(dx, dy) || 1;
      const f = Math.min(dm, q.mf) / dm;
      q.vx += dx * f;
      q.vy += dy * f;

      // Limit speed.
      const sm = Math.hypot(q.vx, q.vy);
      if (sm > P.maxSpeed) {
        q.vx = (q.vx / sm) * P.maxSpeed;
        q.vy = (q.vy / sm) * P.maxSpeed;
      }

      q.px = q.x; q.py = q.y;
      q.x += q.vx; q.y += q.vy;

      // Wrap around edges; reset the trail anchor so no line streaks across.
      let wrapped = false;
      if (q.x < 0) { q.x += p.width; wrapped = true; }
      else if (q.x > p.width) { q.x -= p.width; wrapped = true; }
      if (q.y < 0) { q.y += p.height; wrapped = true; }
      else if (q.y > p.height) { q.y -= p.height; wrapped = true; }

      if (!wrapped) p.line(q.px, q.py, q.x, q.y);
    }
  },

  mousePressed(p, P, ctx) {
    // Nudge: drop a fresh burst of particles at the cursor.
    for (let i = 0; i < 40; i++) {
      const q = spawn(p, ctx);
      q.x = p.mouseX; q.y = p.mouseY;
      particles.push(q);
    }
  },
};
