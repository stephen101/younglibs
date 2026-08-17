import { defineConfig } from 'vite';

// Minimal config — a single-page app that swaps sketches client-side.
// Sketches are discovered at runtime via import.meta.glob in src/main.js,
// so no per-sketch entry points are needed here.
export default defineConfig({
  server: { open: true },
  build: { target: 'esnext' },
});
