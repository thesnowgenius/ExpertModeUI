# AGENTS.md

Codex and other coding agents should read this file before changing this repo. Keep the filename uppercase as `AGENTS.md`.

## Repo Purpose

This is the static Snow Genius Expert Mode browser UI. The app starts at `index.html`, uses `assets/bootstrap.js` for dev-mode detection, `assets/script.js` for behavior and API calls, and `assets/styles.css` for the primary styling.

## Local Preview

Open `index.html` directly or serve the folder locally:

```bash
python3 -m http.server 5173
```

Then visit `http://127.0.0.1:5173/`.

Use `?devmode`, `?mode=devmode`, or `?=devmode` to reveal developer panels.

## API Notes

- The default API endpoint is defined in `assets/script.js`.
- `index.html` has a Content Security Policy. Update `connect-src` if adding a new API host.
- Keep API payloads compatible with the backend `POST /score_pass` contract.
- `resorts.json` and `static/resorts.json` should stay aligned if both are intentionally kept.

## Frontend Guidelines

- Keep the UI static and dependency-free unless the task explicitly introduces a build step.
- Preserve accessible labels, input limits, and validation behavior in `assets/script.js`.
- Use existing CSS patterns in `assets/styles.css`; avoid broad visual rewrites for narrow behavior fixes.
- When changing layout or styling, test at mobile and desktop widths and check that text does not overlap or overflow.
- Do not commit `.DS_Store`, local caches, or generated temporary files.
