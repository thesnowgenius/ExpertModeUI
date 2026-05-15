This folder contains legacy static assets that are not part of the active Expert Mode entry point.

The production UI loads from `index.html`, `assets/bootstrap.js`, `assets/script.js`, `assets/styles.css`, and the root `resorts.json`.
The old `static/script.js` and duplicate `static/resorts.json` were removed to avoid stale endpoint references and duplicate payload downloads.
