// Noise Mesh 3D — a sphere of points displaced by evolving 3D Perlin noise,
// slowly rotating. Runs in p5's WEBGL renderer to prove 3D sketches ride the
// same harness (params, seeding, save PNG) as the 2D ones.

import { hexToRgb } from '../../harness/palette.js';

let base; // Float32Array of unit-sphere points (fibonacci distribution), xyz

function fibonacciSphere(n) {
  const pts = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts[i * 3] = Math.cos(theta) * rad;
    pts[i * 3 + 1] = y;
    pts[i * 3 + 2] = Math.sin(theta) * rad;
  }
  return pts;
}

export default {
  id: 'noise-mesh-3d',
  title: 'Noise Mesh 3D',
  order: 4,
  renderer: 'webgl',
  tags: ['3d', 'webgl', 'noise'],
  source: { name: 'Displaced point sphere (WEBGL)', url: 'https://p5js.org/reference/#/p5/noise' },

  params: {
    count:     { value: 6000, min: 200, max: 30000, step: 100, label: 'points', rebuild: true },
    radius:    { value: 220, min: 40, max: 500, step: 10, label: 'radius' },
    noiseScale:{ value: 1.1, min: 0.1, max: 4, step: 0.1, label: 'noise scale' },
    displace:  { value: 0.45, min: 0, max: 1.5, step: 0.05, label: 'displace' },
    evolve:    { value: 0.4, min: 0, max: 3, step: 0.1, label: 'evolve' },
    spin:      { value: 0.5, min: 0, max: 4, step: 0.1, label: 'spin' },
    pointSize: { value: 2.5, min: 1, max: 8, step: 0.5, label: 'point size' },
    color:     { value: '#8fc0a9', label: 'points' },
    bg:        { value: '#0b0e13', label: 'background' },
    reseed:    { type: 'button', title: 'Reseed ⟳', action: (ctx) => ctx.reseed() },
  },

  setup(p, P) {
    base = fibonacciSphere(P.count);
  },

  draw(p, P) {
    const bg = hexToRgb(P.bg);
    p.background(bg.r, bg.g, bg.b);

    const t = (p.frameCount * P.evolve) / 100;
    p.rotateY(p.frameCount * P.spin * 0.003);
    p.rotateX(p.frameCount * P.spin * 0.0013);

    const col = hexToRgb(P.color);
    p.stroke(col.r, col.g, col.b);
    p.strokeWeight(P.pointSize);
    p.noFill();

    const ns = P.noiseScale;
    p.beginShape(p.POINTS);
    for (let i = 0; i < base.length; i += 3) {
      const ux = base[i], uy = base[i + 1], uz = base[i + 2];
      const n = p.noise(
        (ux + 1) * ns + t,
        (uy + 1) * ns + 5,
        (uz + 1) * ns + 10
      );
      const r = P.radius * (1 + P.displace * (n - 0.5) * 2);
      p.vertex(ux * r, uy * r, uz * r);
    }
    p.endShape();
  },
};
