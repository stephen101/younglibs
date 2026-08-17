// Seedable pseudo-random number generation.
//
// A sketch's randomness should be reproducible: the same seed must always
// produce the same image. We use mulberry32 (a small, fast, decent-quality
// PRNG) plus xmur3 to hash string seeds into a 32-bit integer, so seeds can be
// human-friendly words as well as numbers.

// Hash an arbitrary string into a 32-bit unsigned integer.
export function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

// mulberry32: returns a function producing floats in [0, 1).
export function mulberry32(intSeed) {
  let a = intSeed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Turn any seed (number or string) into a 32-bit integer for the generators.
export function seedToInt(seed) {
  if (typeof seed === 'number' && Number.isFinite(seed)) return seed >>> 0;
  return xmur3(String(seed))();
}

// Build a convenient random helper bound to a seed.
//   rng()        -> float in [0, 1)
//   rng(a)       -> float in [0, a)
//   rng(a, b)    -> float in [a, b)
//   rng.int(a,b) -> integer in [a, b)
//   rng.pick(arr)-> a random element
export function makeRng(seed) {
  const next = mulberry32(seedToInt(seed));
  const rng = (a, b) => {
    if (a === undefined) return next();
    if (b === undefined) return next() * a;
    return a + next() * (b - a);
  };
  rng.int = (a, b) => Math.floor(rng(a, b));
  rng.pick = (arr) => arr[Math.floor(next() * arr.length)];
  return rng;
}

// A fresh, human-friendly random seed string, e.g. "am4k9x2".
export function randomSeed() {
  return Math.random().toString(36).slice(2, 9);
}
