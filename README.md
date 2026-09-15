# Ouranos

An interactive predictive spacecraft-maintenance concept website. A continuous Three.js camera journey connects early risk signals, autonomous observation, preventive intervention, and orbital fleet coverage.

## Run locally

Requires Python 3. No package installation or build step is needed.

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173 in a browser. Website source and locally vendored Three.js modules are in `dist/`.

## Experience

- Scroll-driven 3D spacecraft and Earth scene with chapter navigation.
- Interactive six-input risk simulator with staged autonomous inspection.
- Rotatable, pannable, zoomable spacecraft explorer with nine predictive sensing systems.
- Animated data-to-intervention scenario, before/after comparison, and fleet-risk demonstration.
- Diagnostic report, capability roadmap, and preventive servicing animation.
- Custom orbital targeting cursor and responsive layouts.
- System reduced-motion preference respected automatically.

All spacecraft, risk scores, probabilities, confidence values, estimated degradation windows, mission findings, and coverage diagrams are illustrative concepts. The risk simulator is not a validated flight model. Inspection and diagnosis are the first planned capability; subsequent interventions and fleet coverage are roadmap concepts, not operational service claims.

## Assets

- Current spacecraft and orbital scene geometry is generated in code.
- Three.js license: `dist/vendor/THREE-LICENSE.txt`.

- Earth color texture: Three.js examples, `textures/planets/earth_atmos_2048.jpg` (https://github.com/mrdoob/three.js).
