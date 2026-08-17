// Global controls shared by every sketch, added to the top of the Tweakpane
// panel: seed field, reseed, pause, save PNG, live FPS, and preset import/export.

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function pickJsonFile(onLoad) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onLoad(JSON.parse(String(reader.result)));
      } catch (err) {
        console.error('Could not parse preset file:', err);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// pane: the Tweakpane instance. ctx: harness context. fpsState: {fps}.
export function addGlobalControls(pane, ctx, fpsState) {
  const f = pane.addFolder({ title: `◆ ${ctx.title}`, expanded: true });

  // Seed field — edit it to jump to a specific seed.
  const seedBinding = f.addBinding(ctx, 'seed', { label: 'seed' });
  seedBinding.on('change', (ev) => {
    if (!ev.last) return;
    ctx.setSeed(ctx.seed);
  });

  f.addButton({ title: 'Reseed ⟳' }).on('click', () => ctx.reseed());
  f.addBinding(ctx, 'paused', { label: 'pause' });
  f.addButton({ title: 'Save PNG ⭳' }).on('click', () => ctx.savePNG());

  // Live frame rate as a rolling graph.
  f.addBinding(fpsState, 'fps', {
    label: 'fps',
    readonly: true,
    view: 'graph',
    min: 0,
    max: 90,
  });

  // Presets: dump / restore the full panel state as JSON.
  const presets = f.addFolder({ title: 'presets', expanded: false });
  presets.addButton({ title: 'Export ⭳' }).on('click', () => {
    downloadJson(`${ctx.id}-${ctx.seed}.json`, pane.exportState());
  });
  presets.addButton({ title: 'Import ⭱' }).on('click', () => {
    pickJsonFile((state) => {
      pane.importState(state);
      pane.refresh();
    });
  });

  return { seedBinding };
}
