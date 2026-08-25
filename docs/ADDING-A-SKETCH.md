# Adding a sketch

A sketch is one folder under `src/sketches/<id>/` with an `index.js` that
`export default`s a config object. The gallery discovers it automatically — no
registration step.

Fastest start:

```bash
npm run new "my idea"      # creates src/sketches/my-idea/index.js
npm run dev                # open the gallery, click your sketch
```

## The config object

```js
export default {
  id: 'my-idea',            // must match the folder name; used in the URL hash
  title: 'My Idea',
  order: 10,                // optional: gallery sort order (lower = earlier)
  renderer: '2d',           // '2d' (default) or 'webgl' for 3D
  tags: ['particles'],
  source: { name: 'where this came from', url: 'https://…' },

  params: { /* see below */ },

  setup(p, P, ctx) { /* build initial state */ },
  draw(p, P, ctx)  { /* one frame */ },

  // optional: mousePressed, mouseDragged, mouseReleased, keyPressed, onResize
};
```

- **`p`** — the p5 instance (instance mode). Call `p.circle(...)`, `p.noise(...)`,
  etc. In `webgl` mode the origin is the canvas center.
- **`P`** — live param values. `P.count` always reflects the current slider.
- **`ctx`** — harness services (below).

## Params → controls

Each entry in `params` becomes a Tweakpane control, chosen by its shape:

| Spec | Control |
|------|---------|
| `{ value: 800, min, max, step, label }` | slider |
| `{ value: '#0d0d14', label }` | color picker (hex string) |
| `{ value: true, label }` | checkbox |
| `{ value: 'a', options: { A: 'a', B: 'b' } }` | dropdown |
| `{ type: 'button', title, action(ctx, P) }` | button |

Extra flags:

- **`rebuild: true`** — when this param changes, the harness re-runs `setup()`
  (use it for structural values like particle count or grid size).
- **`onChange(value, p, P, ctx)`** — custom hook on change.

## The `ctx` API

| Member | Purpose |
|--------|---------|
| `ctx.rng()` | deterministic float in [0,1); `ctx.rng(a)`→[0,a); `ctx.rng(a,b)`→[a,b) |
| `ctx.rng.int(a,b)` / `ctx.rng.pick(arr)` | integer / random element |
| `ctx.seed` | current seed (string or number) |
| `ctx.reseed()` / `ctx.setSeed(s)` | new/explicit seed → re-runs `setup()` |
| `ctx.savePNG()` | saves the canvas (filename includes id + seed) |
| `ctx.state` | scratch object cleared on each rebuild |

**Use `ctx.rng` (not `Math.random`) for anything you want reproducible.** Build
your composition in `setup()` from `ctx.rng` and store it; then `draw()` just
renders it. That way the same seed always yields the same image, and every
sketch gets a working reseed button and PNG export for free.

Every sketch also automatically gets: seed field, reseed, pause, save PNG, live
FPS, and preset import/export at the top of the panel.

## Porting an external sketch

1. `npm run new the-thing`
2. Paste the external `setup`/`draw` bodies into the template, adapting to
   instance mode (`p.` prefix).
3. Promote its magic numbers into `params` so you can dial them live.
4. Fill in `source` with attribution.
