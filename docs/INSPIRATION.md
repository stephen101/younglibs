# Inspiration

A hunting ground for ideas to sketch and remix. When you build something from a
source here, record it in that sketch's `source` field so the gallery keeps a
credited trail of where ideas came from.

## Books & courses (technique, explained)

- **Generative Design** — the book this project started from. Official p5.js code
  package, organized by chapter: shape (`01_P`), color/motion (`02_M`),
  type/data (`03_A`). https://github.com/generative-design/Code-Package-p5.js
  *Mine: grid-of-modules systems, color rules, type-as-shape.*
- **The Nature of Code** (Daniel Shiffman) — physics, agents, autonomous steering,
  fractals, cellular automata, evolution. https://natureofcode.com
  *Mine: particle systems, flow fields, forces, L-systems.*
- **The Coding Train** — video walkthroughs of the above and hundreds of
  challenges. https://thecodingtrain.com
  *Mine: bite-size "coding challenges" that port cleanly to a sketch each.*

## Galleries (finished work, for taste)

- **OpenProcessing** — huge searchable archive of p5/Processing sketches, most
  with source. https://openprocessing.org *Mine: browse, read source, adapt.*
- **fxhash** — generative art platform; strong on deterministic, seed-driven
  pieces. https://www.fxhash.xyz *Mine: how artists structure seed → image.*
- **Chrome Experiments** — WebGL / interactive showcase.
  https://experiments.withgoogle.com *Mine: 3D and interaction ideas.*
- **Dwitter** — 140-character JS demos; extreme constraint breeds clever tricks.
  https://www.dwitter.net *Mine: tiny math tricks for motion and pattern.*

## Shaders / GPU (a future renderer)

- **Shadertoy** — fragment shaders, raymarching, procedural textures, all on the
  GPU. https://www.shadertoy.com
  *Mine: when we add a shader renderer, these port as fragment shaders.*
- **The Book of Shaders** — gentle GLSL intro. https://thebookofshaders.com

## Lists (go wider)

- **awesome-creative-coding** — libraries, tools, learning, communities.
  https://github.com/terkelg/awesome-creative-coding
- **awesome-generative-art** — curated generative-art resources.
  https://github.com/kosmos/awesome-generative-art

## A porting recipe

1. Find a piece whose *mechanism* you like (not just the output).
2. `npm run new <name>`, paste in its core loop, adapt to p5 instance mode.
3. Promote its magic numbers into `params` and tweak live until it's yours.
4. Fill in `source`. Save a preset when you hit something good.
