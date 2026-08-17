import p5 from 'p5';
import { Pane } from 'tweakpane';
import { makeRng, seedToInt, randomSeed } from './rng.js';
import { addGlobalControls } from './controls.js';

// createSketch(config, mountEl)
//
// Turns a sketch config ({ params, setup, draw, ... }) into a running p5
// instance with an auto-generated Tweakpane panel. Returns a handle with
// destroy() so the router can tear everything down when navigating away.
//
// The sketch author only writes params + setup + draw. The harness provides
// live-bound params (P), seeded randomness, and the global controls panel.
export function createSketch(config, mountEl) {
  const params = config.params || {};

  // Live param values, bound directly to the panel controls.
  const P = {};
  for (const [key, spec] of Object.entries(params)) {
    if (spec.type === 'button') continue;
    P[key] = spec.value;
  }

  const fpsState = { fps: 0 };
  let instance = null;
  let pane = null;

  // ---- Harness context handed to the sketch (p, P, ctx) ------------------
  const ctx = {
    id: config.id,
    title: config.title || config.id,
    seed: config.seed || randomSeed(),
    paused: false,
    state: {},
    rng: makeRng('placeholder'), // replaced by applySeed()

    setSeed(s) {
      this.seed = s;
      applySeed();
      reinit();
      if (pane) pane.refresh();
    },
    reseed(s) {
      this.setSeed(s ?? randomSeed());
    },
    savePNG() {
      if (instance) instance.saveCanvas(`${config.id}-${this.seed}`, 'png');
    },
  };

  // Seed both the JS rng and p5's own noise()/random().
  function applySeed() {
    const n = seedToInt(ctx.seed);
    ctx.rng = makeRng(ctx.seed);
    if (instance) {
      instance.noiseSeed(n);
      instance.randomSeed(n);
    }
  }

  // Re-run the sketch's setup (rebuild state) without recreating the canvas.
  // Used by reseed and by params marked { rebuild: true }.
  function reinit() {
    if (!instance) return;
    ctx.state = {};
    if (config.setup) config.setup(instance, P, ctx);
  }

  // ---- p5 sketch (instance mode) -----------------------------------------
  const sketch = (p) => {
    instance = p;

    const size = () => ({
      w: mountEl.clientWidth || window.innerWidth,
      h: mountEl.clientHeight || window.innerHeight,
    });

    p.setup = () => {
      const { w, h } = size();
      const mode = config.renderer === 'webgl' ? p.WEBGL : p.P2D;
      p.createCanvas(w, h, mode);
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
      applySeed();
      if (config.setup) config.setup(p, P, ctx);
    };

    p.draw = () => {
      fpsState.fps = p.frameRate();
      if (ctx.paused) return;
      if (config.draw) config.draw(p, P, ctx);
    };

    p.windowResized = () => {
      const { w, h } = size();
      p.resizeCanvas(w, h);
      if (config.onResize) config.onResize(p, P, ctx);
      else if (config.rebuildOnResize !== false) reinit();
    };

    // Forward optional interaction handlers if the sketch defines them.
    for (const name of ['mousePressed', 'mouseDragged', 'mouseReleased', 'keyPressed']) {
      if (config[name]) p[name] = () => config[name](p, P, ctx);
    }
  };

  new p5(sketch, mountEl);

  // ---- Control panel ------------------------------------------------------
  const dock = document.createElement('div');
  dock.className = 'tp-dock';
  document.body.appendChild(dock);

  pane = new Pane({ title: 'controls', container: dock });
  addGlobalControls(pane, ctx, fpsState);

  const keys = Object.keys(params);
  if (keys.length) {
    const folder = pane.addFolder({ title: 'params', expanded: true });
    for (const [key, spec] of Object.entries(params)) {
      if (spec.type === 'button') {
        folder.addButton({ title: spec.title || key }).on('click', () => {
          if (spec.action) spec.action(ctx, P);
        });
        continue;
      }
      const opts = {};
      if (spec.label !== undefined) opts.label = spec.label;
      if (spec.min !== undefined) opts.min = spec.min;
      if (spec.max !== undefined) opts.max = spec.max;
      if (spec.step !== undefined) opts.step = spec.step;
      if (spec.options !== undefined) opts.options = spec.options;
      if (spec.view !== undefined) opts.view = spec.view;
      const binding = folder.addBinding(P, key, opts);
      binding.on('change', (ev) => {
        if (spec.rebuild && ev.last) reinit();
        if (spec.onChange) spec.onChange(P[key], instance, P, ctx);
      });
    }
  }

  return {
    destroy() {
      try { pane.dispose(); } catch {}
      try { dock.remove(); } catch {}
      try { if (instance) instance.remove(); } catch {}
      mountEl.innerHTML = '';
    },
  };
}
