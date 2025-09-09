<script>
// =======================
// Config
// =======================
const MULTI_URL  = "https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass";
// kept for display only (disabled below)
const SINGLE_URL = "https://pass-picker-expert-mode.onrender.com/expert_mode/calculate";

// =======================
// DOM helpers
// =======================
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const setText = (el, txt) => { el.textContent = txt; };
const pretty = (obj) => JSON.stringify(obj, null, 2);
const safeJson = (v) => { try { return JSON.stringify(v, null, 2); } catch { return String(v); } };

// UI Elements
const els = {
  pillMulti:  $("#pill-multi"),
  pillSingle: $("#pill-single"),
  multiUrl:   $("#multi-url"),
  singleUrl:  $("#single-url"),
  ageInput:   $("#age"),
  categorySel:$("#category"),
  resortsList:$("#resorts-list"),
  addResort:  $("#add-resort"),
  clearResort:$("#clear-resorts"),
  submit:     $("#submit"),
  status:     $("#status"),
  rawReq:     $("#raw-request"),
  rawRes:     $("#raw-response"),
  results:    $("#results-body"),
};

// Keep page header text untouched, but disable Single pill
function initHeader() {
  if (els.multiUrl)  setText(els.multiUrl, `Multi = ${MULTI_URL}`);
  if (els.singleUrl) setText(els.singleUrl, `Single = ${SINGLE_URL} (disabled)`);
  if (els.pillSingle) {
    els.pillSingle.classList.add("opacity-50","pointer-events-none","cursor-not-allowed");
    els.pillSingle.setAttribute("aria-disabled","true");
    els.pillSingle.title = "Single endpoint retired — multi handles single + combos.";
  }
}

// =======================
// Resorts UI
// =======================
function resortRow({resort="", days=1, blackout=false}={}) {
  const row = document.createElement("div");
  row.className = "resort-row flex items-center gap-2 mb-2";

  row.innerHTML = `
    <input class="resort-name input" placeholder="Resort" value="${resort}">
    <input class="resort-days input w-16 text-right" type="number" min="1" value="${days}">
    <label class="inline-flex items-center gap-1 text-sm">
      <input class="resort-blackout" type="checkbox" ${blackout ? "checked": ""}>
      Blackout OK
    </label>
    <button class="remove-resort btn btn-sm">Remove</button>
  `;

  row.querySelector(".remove-resort").addEventListener("click", () => {
    row.remove();
    validateForm();
  });
  return row;
}

function addResort(resort="", days=1, blackout=false) {
  els.resortsList.appendChild(resortRow({resort, days, blackout}));
  validateForm();
}

function clearResorts() {
  els.resortsList.innerHTML = "";
  validateForm();
}

// =======================
// Validation + Payload
// =======================
function getCategoryValue() {
  // UI shows "None", "Military". Backend expects lowercase key or "none".
  const raw = (els.categorySel.value || "").trim().toLowerCase();
  if (!raw || raw === "none") return "none";
  return raw; // "military", future specials can pass through
}

function buildPayload() {
  const age = parseInt(els.ageInput.value || "0", 10);
  const category = getCategoryValue();

  const rider = { age, quantity: 1, category }; // quantity kept for future multi-rider
  const resort_days = [];

  $$(".resort-row", els.resortsList).forEach(row => {
    const resort = row.querySelector(".resort-name").value.trim();
    const days   = parseInt(row.querySelector(".resort-days").value || "0", 10);
    const blackout_ok = !!row.querySelector(".resort-blackout").checked;

    if (resort && days > 0) {
      // The backend normalizer can resolve names → canonical IDs.
      resort_days.push({ resort, days, blackout_ok });
    }
  });

  return { riders: [rider], resort_days };
}

function validateForm() {
  const payload = buildPayload();

  if (payload.riders.length === 0 || payload.resort_days.length === 0) {
    setStatus("Error");
    return false;
  }
  setStatus("OK");
  return true;
}

function setStatus(kind) {
  const node = els.status;
  node.textContent = kind;
  node.classList.remove("text-green-600","text-red-600");
  node.classList.add(kind === "OK" ? "text-green-600" : "text-red-600");
}

// =======================
// Fetch Wrapper (CORS-safe)
// =======================
async function postJSON(url, bodyObj) {
  const res = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyObj),
  });
  const text = await res.text(); // allow non-JSON error shapes
  try { return { ok: res.ok, json: JSON.parse(text), raw: text }; }
  catch { return { ok: res.ok, json: null, raw: text }; }
}

// =======================
// Result renderers
// =======================
function renderResults(data) {
  // Accept a few backend shapes to be future-proof.
  // 1) { best_combo: [...], total_cost, line_items? }
  // 2) { result: {...}, total_cost }
  // 3) { combos: [{passes:[...], cost:...}], best: ... }
  const tbody = els.results;
  tbody.innerHTML = "";

  let bestCombo = null;
  let totalCost = null;

  if (data && typeof data === "object") {
    if (Array.isArray(data.best_combo)) bestCombo = data.best_combo;
    if (typeof data.total_cost === "number") totalCost = data.total_cost;

    // alt shapes
    if (!bestCombo && data.result && Array.isArray(data.result.best_combo)) {
      bestCombo = data.result.best_combo;
    }
    if (totalCost == null && data.result && typeof data.result.total_cost === "number") {
      totalCost = data.result.total_cost;
    }
  }

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td class="py-2 pl-3">Best Combo</td>
    <td class="py-2 pr-3 text-right">${bestCombo ? bestCombo.join(" + ") : "—"}</td>
  `;
  tbody.appendChild(tr);

  const tr2 = document.createElement("tr");
  tr2.innerHTML = `
    <td class="py-2 pl-3">Total Cost</td>
    <td class="py-2 pr-3 text-right">${totalCost != null ? `$${totalCost}` : "—"}</td>
  `;
  tbody.appendChild(tr2);
}

// =======================
// Submit
// =======================
async function onSubmit() {
  if (!validateForm()) {
    els.rawReq.textContent = pretty({error: "invalid form"});
    els.rawRes.textContent = pretty({error: "form not valid"});
    return;
  }

  const payload = buildPayload();
  els.rawReq.textContent = pretty({ url: MULTI_URL, payload });

  try {
    const { ok, json, raw } = await postJSON(MULTI_URL, payload);
    if (!ok) {
      els.rawRes.textContent = pretty({ error: "HTTP error", raw });
      renderResults({});
      return;
    }
    els.rawRes.textContent = pretty(json ?? raw);
    renderResults(json ?? {});
  } catch (e) {
    els.rawRes.textContent = pretty({ error: String(e) });
    renderResults({});
  }
}

// =======================
// Wire up
// =======================
function boot() {
  initHeader();

  els.addResort?.addEventListener("click", () => addResort());
  els.clearResort?.addEventListener("click", clearResorts);
  els.submit?.addEventListener("click", onSubmit);

  ["input","change"].forEach(ev => {
    els.ageInput?.addEventListener(ev, validateForm);
    els.categorySel?.addEventListener(ev, validateForm);
  });

  // start with one blank row if none present
  if ($$(".resort-row", els.resortsList).length === 0) addResort();

  validateForm();
}

document.addEventListener("DOMContentLoaded", boot);
</script>