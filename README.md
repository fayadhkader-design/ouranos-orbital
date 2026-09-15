# Ouranos

An interactive orbital emergency-response concept website. A continuous Three.js camera journey follows an autonomous servicing spacecraft through dispatch, rendezvous, inspection, future intervention, and a distributed orbital network.

## Run locally

Requires Python 3. No package installation or build step is needed.

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173 in a browser. Website source and locally vendored Three.js modules are in `dist/`.

## Experience

- Scroll-driven 3D spacecraft and Earth scene with chapter navigation.
- Inspection report, sensor explanations, five-stage roadmap, and inspection overlay.
- Custom orbital targeting cursor and responsive layouts.
- System reduced-motion preference respected automatically.

All spacecraft, mission findings, and coverage diagrams are illustrative concepts. Inspection and diagnosis are the first planned capability; subsequent interventions and fleet coverage are roadmap concepts, not operational service claims.

## Assets

- Current spacecraft and orbital scene geometry is generated in code.
- Three.js license: `dist/vendor/THREE-LICENSE.txt`.

- Earth color texture: Three.js examples, `textures/planets/earth_atmos_2048.jpg` (https://github.com/mrdoob/three.js).
