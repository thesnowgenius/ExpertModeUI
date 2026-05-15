# PLANS.md

This file is a living plan for future coding agents working in the static Expert Mode UI.

## Current Focus

- Keep the static UI compatible with the deployed `POST /score_pass` backend contract.
- Preserve fast, dependency-free local editing unless a task intentionally adds a build system.
- Keep resort selection, rider input, validation, and result rendering accessible and responsive.

## Near-Term Work

- Test UI behavior in normal mode and dev mode after changes to `assets/script.js`.
- Keep `index.html` Content Security Policy aligned with the configured API host.
- Keep pass-family icons and generated badges visually stable across mobile and desktop widths.
- Keep `resorts.json` as the single canonical resort payload for the active UI.

## Validation Gates

Before opening a PR that changes UI behavior or styling:

```bash
python3 -m http.server 5173
```

Then visit `http://127.0.0.1:5173/` and test a representative request. Also check `?devmode` when request/response diagnostics are affected.
