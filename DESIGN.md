# Sketchbook — Design

A personal generative-art sketchbook for quickly trying ideas, tweaking values
live, and pulling inspiration from many sources (the *Generative Design* book
and beyond). This document is the blueprint; it precedes the code.

## Context

The goal is a low-friction way to **plant and grow ideas**: sketch fast, expose
every interesting number as a live control, and reproduce/return to happy
accidents. This repo started as a 2017 Java + Processing project (a flow-field
particle sketch). Java/Processing is high-friction for this goal — every change
is a recompile and building tweak-UIs is manual. So the sketchbook is rebuilt on
**p5.js in the browser**, where live-reload and slider panels are effectively
free, and the *Generative Design* book's official
[p5.js code package](https://github.com/generative-design/Code-Package-p5.js)
maps directly in.

The old Java project is preserved (moved to `legacy-java/`) and its flow-field
sketch is ported as the first p5 sketch, so nothing is lost.

## Goals

- **Fast sketching** — new idea to running canvas in minutes, hot-reload on save.
- **Live tweaking** — declare a params object, get a control panel automatically.
- **Broad palette** — a variety of seed sketches across families to remix.
- **Reproducibility** — seeded randomness; save a seed/preset and get it back.
- **Inspiration workflow** — a first-class, built-in habit of collecting and
  adapting ideas from other projects, with attribution.
- **3D-ready** — 3D rides the same harness now (p5 `WEBGL`); three.js later.

## Non-goals (for now)

- No blockchain/minting pipeline, no server backend.
- No three.js yet (deferred until a sketch actually needs heavy 3D).
- Not a polished product — this is a workbench.

## Stack

| Concern        | Choice        | Why |
|----------------|---------------|-----|
| Sketching lib  | **p5.js**     | Sketching-first API, gentle curve, immediate feedback; book has an official p5 edition. |
| Dev/build      | **Vite**      | Instant hot-reload dev server + real production build; lazy sketch loading via `import.meta.glob`. |
| Tweak UI       | **Tweakpane** | Auto-generates the right control per value type (slider, color, checkbox, vector); built-in preset import/export; plugin ecosystem. |
| 3D             | **p5 WEBGL**  | Same API being learned; three.js kept as a future alternate renderer. |
| Package source | **npm**       | `p5`, `tweakpane` installed from the npm registry (CDN is not required). |

## Architecture

The core idea is a **shared harness** so authoring a sketch is *just*
`params + setup + draw`. Everything else — the panel, save button, seeding, FPS,
and gallery entry — is provided.

### A sketch is one self-contained module

```js
// src/sketches/flow-field/index.js
export default {
  id: 'flow-field',
  title: 'Flow Field',
  renderer: '2d',                 // or 'webgl'
  tags: ['particles', 'noise'],
  source: { name: 'Ported from younglibs Java / Nature of Code', url: '' },

  params: {
    count:      { value: 800,   min: 1,     max: 3000, step: 1,     label: 'Particles' },
    noiseScale: { value: 0.008, min: 0.001, max: 0.05, step: 0.001 },
    speed:      { value: 1.5,   min: 0.1,   max: 6,    step: 0.1 },
    bg:         { value: '#101018', view: 'color' },
    reseed:     { type: 'button', title: 'Reseed', action: (ctx) => ctx.reseed() },
  },

  setup(p, P, ctx) { /* build initial state; P.* holds live values */ },
  draw(p, P, ctx)  { /* runs each frame; P.count etc. reflect the panel live */ },

  // optional: mousePressed, keyPressed, windowResized — all (p, P, ctx)
};
```

- **`p`** — the p5 instance (instance mode; no globals leak between sketches).
- **`P`** — a live object of current param values, bound to the panel.
- **`ctx`** — harness services (see below).

### The harness provides, automatically

- A **Tweakpane panel** built from `params`, live-bound to `P`.
- A **global controls** section: pause/play, **save PNG**, **reseed**, live
  **FPS**, and an editable **seed** field.
- A **seeded RNG** (`ctx.rng()`, `ctx.rng(min, max)`) plus seeded p5 `noise`/
  `random`, so a piece is reproducible from its seed.
- **Preset export/import** — dump the current params to JSON and reload them, so
  a happy accident becomes a saved preset per sketch.

### `ctx` surface (sketch-facing API)

| Member          | Purpose |
|-----------------|---------|
| `ctx.rng()`     | Deterministic float in [0,1); `ctx.rng(a,b)` for a range. |
| `ctx.seed`      | Current seed (number/string). |
| `ctx.reseed(s?)`| New random seed (or a given one); re-runs `setup`. |
| `ctx.savePNG()` | Saves the canvas; filename embeds sketch id + seed. |
| `ctx.paused`    | Read pause state (harness gates `draw`). |

## Proposed layout

```
index.html                 gallery shell (loads src/main.js)
package.json  vite.config.js
src/
  main.js                  gallery grid + hash routing (#flow-field is shareable/reloadable)
  harness/
    createSketch.js        p5 instance-mode + Tweakpane wiring, renderer switch, draw gating
    rng.js                 seedable PRNG (e.g. mulberry32) + noise/random seeding
    controls.js            global panel: save / reseed / pause / fps / preset JSON
    palette.js             color + gradient helpers shared across sketches
  sketches/
    flow-field/index.js    ports the old Java sketch          [particles]
    circle-packing/index.js                                   [geometry & packing]
    grid-modules/index.js  signature Generative Design chapter [grid modules]
    noise-mesh-3d/index.js WEBGL, proves 3D on the same harness [3D]
  styles/app.css
docs/
  INSPIRATION.md           curated sources, categorized, "what to mine from each"
  ADDING-A-SKETCH.md       authoring guide + `npm run new <name>` scaffold
legacy-java/               original Processing project, preserved intact
```

### Gallery & routing

`src/main.js` discovers sketches with Vite's `import.meta.glob` (lazy), renders a
gallery grid (title, tags, source), and uses `location.hash` (`#flow-field`) to
open one full-screen with its panel. The hash makes a sketch **reloadable and
shareable** by URL.

## Seed sketches (first batch)

One per family chosen, to give immediate variety to remix:

1. **Flow Field** *(particles)* — Perlin-noise flow field with trailing
   particles; a direct port of the existing Java sketch.
2. **Circle Packing** *(geometry & packing)* — grow non-overlapping circles to
   fill space; composition-focused, print-friendly.
3. **Grid Modules** *(Generative Design)* — a grid of modules with randomized
   rotation / shape / color; the book's signature, very tweak-friendly.
4. **Noise Mesh 3D** *(p5 WEBGL)* — a rotating noise-displaced mesh / point
   cloud, proving 3D runs under the same harness and panel.

## Inspiration workflow (built in, not bolted on)

- **Every sketch records a `source`** (name + url) shown in the gallery — a
  running, credited index of where each idea came from.
- **`docs/INSPIRATION.md`** is the categorized hunting ground:
  - Book/tutorial: *Generative Design* p5 package, *The Nature of Code*, The
    Coding Train.
  - Galleries: OpenProcessing, fxhash, Chrome Experiments, Dwitter.
  - GPU/shaders: Shadertoy (for a future shader renderer).
  - Lists: `awesome-creative-coding`.
  - Each entry notes **what to mine from it**.
- **Adapting an external p5 sketch** = paste it into a new sketch folder, wrap
  `setup`/`draw`, then promote its magic numbers into the `params` object. The
  scaffold (`npm run new <name>`) creates the folder from a template.

## Decisions made

1. **Move old Java → `legacy-java/`**, port the flow-field as sketch #1. Keeps
   the root clean for the Node project while preserving the original.
2. **Tweakpane** over lil-gui (auto-controls-from-type + presets).
3. **Seed all four families**; **p5 WEBGL now, three.js later**.

## Verification

- `npm install` then `npm run dev` opens the gallery with hot-reload.
- Open each of the four sketches; confirm the panel appears and dragging a
  control changes the canvas live.
- Confirm **save PNG**, **reseed**, **pause**, and **preset export/import** work.
- Reload a `#sketch-id` URL and confirm it reopens that sketch.
- `npm run build && npm run preview` serves the production build.

## Future directions

- **three.js** as an alternate renderer under the same harness for heavy 3D.
- **GLSL/shader** sketches (`WEBGL` fragment shaders; Shadertoy-style).
- **Video/GIF capture** of a sketch, not just PNG.
- **Params in URL** so a full tweak state is shareable, not just the sketch id.
- Publish selected sketches as shareable web pages.
