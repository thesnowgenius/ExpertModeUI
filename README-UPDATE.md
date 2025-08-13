
# ExpertModeUI Update (Dual-mode + CORS-safe Fetch)

**Files**
- `index.html` — Minimal, accessible form with attributes to select API mode/base.
- `static/script.js` — Best-practice fetch: `mode:'cors'`, `credentials:'omit'`, clear errors.
  - Supports **multi** (`/score_multi_pass`) and **single** (`/score_pass`) payloads.
  - Uses your existing field names; converts to expected keys before POST.

**How to use**
1) Replace your current `index.html` and `static/script.js` with these files.
2) Ensure the form attributes point to the right API:
   - `data-api-mode="multi"`
   - `data-api-base="https://pass-picker-expert-mode-multi.onrender.com"`
   You can also change these at runtime in the UI controls.
3) Push to GitHub Pages and submit a test. If server CORS is correct, you should see JSON.
