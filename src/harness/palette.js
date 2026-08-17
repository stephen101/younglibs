// Small, shared color helpers and a few curated palettes.
// Sketches can import these so they don't each reinvent color handling.

// Curated palettes (hex). Add your own as you collect favourites.
export const PALETTES = {
  ink: ['#0d0d14', '#e8e6df', '#8a8f98', '#c04a3b', '#3b6ea5'],
  ember: ['#1a1023', '#ff6b35', '#f7c59f', '#efefd0', '#004e64'],
  forest: ['#0b1d13', '#1f7a3f', '#a3d9a5', '#f2e8cf', '#d68c45'],
  pastel: ['#faf3dd', '#c8d5b9', '#8fc0a9', '#68b0ab', '#4a7c59'],
  mono: ['#0a0a0a', '#3a3a3a', '#6b6b6b', '#a5a5a5', '#e8e8e8'],
};

// Convert "#rrggbb" to {r,g,b} (0-255).
export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// Linear interpolation between two hex colors; t in [0,1] -> {r,g,b}.
export function lerpRgb(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}
