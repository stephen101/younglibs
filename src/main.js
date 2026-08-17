import './styles/app.css';
import { createSketch } from './harness/createSketch.js';

// Discover every sketch at build time. Each sketch folder exports a default
// config from its index.js. Eager loading keeps the gallery simple; the set is
// small and Vite tree-shakes what a production build doesn't use.
const modules = import.meta.glob('./sketches/*/index.js', { eager: true });

const registry = Object.values(modules)
  .map((m) => m.default)
  .filter(Boolean)
  .sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.title.localeCompare(b.title));

const byId = new Map(registry.map((s) => [s.id, s]));

const app = document.getElementById('app');
let active = null; // current { destroy } handle

function teardown() {
  if (active) {
    active.destroy();
    active = null;
  }
  document.body.classList.remove('is-sketch');
}

function renderGallery() {
  teardown();
  document.title = 'Sketchbook';
  app.innerHTML = `
    <header class="gallery-head">
      <h1>Sketchbook</h1>
      <p>A workbench for generative sketches — click one to open it and tweak.</p>
    </header>
    <div class="grid">
      ${registry
        .map(
          (s) => `
        <a class="card" href="#${s.id}">
          <div class="card-thumb" data-id="${s.id}"><span>${s.title}</span></div>
          <div class="card-body">
            <div class="card-title">${s.title}</div>
            <div class="card-tags">${(s.tags || []).map((t) => `<span>${t}</span>`).join('')}</div>
            ${s.source?.name ? `<div class="card-source">↳ ${s.source.name}</div>` : ''}
          </div>
        </a>`
        )
        .join('')}
    </div>
    <footer class="gallery-foot">
      ${registry.length} sketch${registry.length === 1 ? '' : 'es'} ·
      new one: <code>npm run new &lt;name&gt;</code>
    </footer>`;
}

function openSketch(id) {
  const config = byId.get(id);
  if (!config) {
    location.hash = '';
    return;
  }
  teardown();
  document.body.classList.add('is-sketch');
  document.title = `${config.title} · Sketchbook`;
  app.innerHTML = `
    <a class="back" href="#">← gallery</a>
    <div id="stage" class="stage"></div>`;
  const stage = document.getElementById('stage');
  active = createSketch(config, stage);
}

function route() {
  const id = location.hash.replace(/^#/, '');
  if (id && byId.has(id)) openSketch(id);
  else renderGallery();
}

window.addEventListener('hashchange', route);
route();
