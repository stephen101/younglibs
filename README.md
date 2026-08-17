# younglibs — Sketchbook

A personal generative-art sketchbook. Each sketch is a self-contained folder
that declares a `params` object and `setup`/`draw`; a shared harness auto-builds
a live tweak panel (sliders, color pickers, save PNG, seed/reseed, FPS) around
it, so trying an idea and dialling it in takes minutes.

Built on **p5.js** + **Vite** + **Tweakpane**. See [`DESIGN.md`](DESIGN.md) for
the why, and [`docs/ADDING-A-SKETCH.md`](docs/ADDING-A-SKETCH.md) for the how.

## Quick start

```bash
npm install
npm run dev        # opens the gallery with hot-reload
```

Click a sketch to open it; drag the controls to tweak it live. The URL hash
(e.g. `#flow-field`) is shareable and reloadable.

```bash
npm run new "my idea"   # scaffold a new sketch folder
npm run build           # production build → dist/
npm run preview         # serve the build
```

## What's here

| Sketch | Family | Renderer |
|--------|--------|----------|
| Flow Field | particles / noise | 2D |
| Circle Packing | geometry / packing | 2D |
| Grid Modules | grid (Generative Design) | 2D |
| Noise Mesh 3D | 3D point cloud | WEBGL |

## Layout

```
index.html              gallery shell
src/
  main.js               gallery + hash routing
  harness/              createSketch, rng, controls, palette
  sketches/<id>/        one folder per sketch
  styles/app.css
docs/                   ADDING-A-SKETCH, INSPIRATION
scripts/new-sketch.mjs  `npm run new`
legacy-java/            the original 2017 Processing project, preserved
```

The original Java/Processing project now lives in `legacy-java/`; its flow-field
sketch is ported to `src/sketches/flow-field/`.
