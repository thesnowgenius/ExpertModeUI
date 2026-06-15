# AGENTS.md

Codex and other coding agents should read this file before changing this repo. Keep the filename uppercase as `AGENTS.md`.

## Repo Purpose

This is the static Snow Genius Expert Mode browser UI. The app starts at `index.html`, uses `assets/bootstrap.js` for dev-mode detection, `assets/script.js` for behavior and API calls, and `assets/styles.css` for the primary styling.

## Local Preview

Serve the folder locally so `resorts.json` and API requests use normal browser origins:

```bash
python3 -m http.server 5173
```

Then visit `http://127.0.0.1:5173/`.

Use `?devmode`, `?mode=devmode`, or `?=devmode` to reveal developer panels.

## API Notes

- The default API endpoint is defined in `assets/script.js`.
- `index.html` has a Content Security Policy. Update `connect-src` if adding a new API host.
- Keep API payloads compatible with the backend `POST /score_pass` contract.
- Send the anonymous `tracking_session_id` with recommendation requests. Prefer backend-provided `tracking_url` values for pass links, retain `destination_url` only as fallback metadata, and treat `pass_family` as the reporting group.
- Developer mode can switch between the deployed Render API, `http://127.0.0.1:8000/score_pass`, and an allowlisted custom endpoint. Keep URL validation, local-storage behavior, reset behavior, and `GET /catalog_status` diagnostics aligned.
- `resorts.json` is the canonical resort payload for the active UI. Do not reintroduce duplicate resort payloads under `static/` unless a deployment target explicitly needs them.
- Display human-readable resort names and state labels, but retain and submit canonical resort IDs. Shared-link restore must preserve that boundary.

## Frontend Guidelines

- Keep the UI static and dependency-free unless the task explicitly introduces a build step.
- Preserve accessible labels, keyboard typeahead, input limits, aggregated validation errors, invalid-field focus, and live status behavior in `assets/script.js`.
- Use existing CSS patterns in `assets/styles.css`; avoid broad visual rewrites for narrow behavior fixes.
- Recommendation comparison cards link to detailed options; the first result is the recommendation and later results are collapsible alternatives. Preserve deterministic result order from the API.
- There is no build or automated browser test suite. For behavior or styling changes, serve the app, submit a representative request, inspect `?devmode`, test keyboard interaction, and check mobile and desktop widths for overlap or overflow.
- Do not commit `.DS_Store`, local caches, or generated temporary files.
