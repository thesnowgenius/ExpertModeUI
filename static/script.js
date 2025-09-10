/* Snow Genius — Expert Mode (Multi-only, production)
   - Posts to Render backend with endpoint fallbacks to survive BE route drift.
   - Canonical payload: { mode:"multi", riders:[{age,category}], resort_days:[{resort_id,days,blackout_ok}] }
   - Uses your REAL resorts.json (no invented IDs)
*/

const API_BASE = (window.API_BASE || "").replace(/\/$/, "");
const RESORTS_LIST_URL = window.RESORTS_LIST_URL || "static/resorts.json";
const FORCED_MODE = "multi";

// Endpoint choice: override or use smart fallback
const ENDPOINT_OVERRIDE = window.API_ENDPOINT_OVERRIDE || null;
const ENDPOINT_CANDIDATES = ENDPOINT_OVERRIDE
  ? [ENDPOINT_OVERRIDE]
  : ["/score", "/score_plan", "/score_multi_pass"];

/* ---------------- State ---------------- */
const state = {
  riders: [],
  resorts: [],           // { id, resort_id, label, days, blackoutOk }
  resortsIndex: [],      // [{ resort_id, resort_name, state }]
};

/* ---------------- DOM ---------------- */
const ridersEl  = document.getElementById("riders");
const resortsEl = document.getElementById("resorts");
const statusEl  = document.getElementById("status");
const rawReqEl  = document.getElementById("rawRequest");
const rawResEl  = document.getElementById("rawResponse");
const resultsEl = document.getElementById("results-container");

/* ---------------- Utils ---------------- */
const uid = () => Math.random().toString(36).slice(2, 9);
const clampInt = (v, min, max) => Math.max(min, Math.min(max, parseInt(v || 0, 10)));
const debounce = (fn, ms = 120) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

async function safeJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Non-JSON response (HTTP ${res.status}): ${text.slice(0,200)}…`); }
}

/* Smart POST with endpoint fallback */
async function postWithFallback(payload) {
  const attempts = [];
  for (const path of ENDPOINT_CANDIDATES) {
    const url = `${API_BASE}${path}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const bodyText = await res.text();
      if (!res.ok) {
        attempts.push({ path, status: res.status, body: bodyText.slice(0,250) });
        continue;
      }
      try {
        return { endpoint: path, json: JSON.parse(bodyText) };
      } catch {
        attempts.push({ path, status: res.status, body: `Non-JSON: ${bodyText.slice(0,250)}` });
      }
    } catch (e) {
      attempts.push({ path, error: String(e) });
    }
  }
  const diag = { error: "All endpoints failed", base: API_BASE, attempts };
  throw new Error(JSON.stringify(diag, null, 2));
}

/* ---------------- Boot data ---------------- */
async function loadResortsIndex() {
  const res = await fetch(RESORTS_LIST_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load resorts.json: HTTP ${res.status}`);
  const list = await res.json();
  state.resortsIndex = list.map(r => ({
    resort_id: r.resort_id,                // use exactly as provided
    resort_name: r.resort_name || "",
    state: r.state || ""
  }));
}

/* ---------------- Riders ---------------- */
function addRider(r = { id: uid(), age: "", category: "None" }) {
  state.riders.push(r);
  renderRiders();
}
function removeRider(id) {
  state.riders = state.riders.filter(x => x.id !== id);
  renderRiders();
}
function updateRider(id, patch) {
  const node = state.riders.find(x => x.id === id);
  if (node) Object.assign(node, patch);
}
function riderRow(r) {
  const row = document.createElement("div");
  row.className = "grid row";
  row.innerHTML = `
    <input data-k="age" class="input" type="number" placeholder="Age" value="${r.age ?? ""}" min="0" max="120"/>
    <select data-k="category" class="input">
      <option ${r.category==="None"?"selected":""}>None</option>
      <option ${r.category==="Military"?"selected":""}>Military</option>
      <option ${r.category==="Student"?"selected":""}>Student</option>
      <option ${r.category==="Nurse"?"selected":""}>Nurse</option>
    </select>
    <button type="button" class="btn btn-ghost" data-action="remove">Remove</button>`;
  row.addEventListener("input", e => {
    const k = e.target.dataset.k;
    if (!k) return;
    const v = k === "age" ? (e.target.value === "" ? "" : clampInt(e.target.value, 0, 120)) : e.target.value;
    updateRider(r.id, { [k]: v });
  });
  row.querySelector('[data-action="remove"]').addEventListener("click", () => removeRider(r.id));
  return row;
}
function renderRiders() {
  ridersEl.innerHTML = "";
  if (state.riders.length === 0) addRider();
  state.riders.forEach(r => ridersEl.appendChild(riderRow(r)));
}

/* ---------------- Resorts ---------------- */
function addResort(r = { id: uid(), resort_id: "", label: "", days: 1, blackoutOk: false }) {
  state.resorts.push(r);
  renderResorts();
}
function removeResort(id) {
  state.resorts = state.resorts.filter(x => x.id !== id);
  renderResorts();
}
function updateResort(id, patch) {
  const node = state.resorts.find(x => x.id === id);
  if (node) Object.assign(node, patch);
}
function resortRow(r) {
  const row = document.createElement("div");
  row.className = "grid row";
  row.innerHTML = `
    <div class="typeahead">
      <input class="input" data-k="label" type="text" placeholder="Start typing a resort..." value="${r.label || ""}"/>
      <ul class="suggestions" id="sugg-${r.id}" hidden></ul>
    </div>
    <input class="input" data-k="days" type="number" min="1" max="60" value="${r.days}"/>
    <label class="checkbox">
      <input data-k="blackoutOk" type="checkbox" ${r.blackoutOk ? "checked" : ""}/>
      <span>OK</span>
    </label>
    <button type="button" class="btn btn-ghost" data-action="remove">Remove</button>`;

  const nameInput = row.querySelector('[data-k="label"]');
  const list = row.querySelector(`#sugg-${r.id}`);

  function renderSuggestions(q) {
    const query = (q || "").trim().toLowerCase();
    if (!query) { list.hidden = true; list.innerHTML = ""; return; }
    const matches = state.resortsIndex.filter(x =>
      x.resort_name.toLowerCase().includes(query) ||
      x.state.toLowerCase().includes(query) ||
      x.resort_id.toLowerCase().includes(query)
    ).slice(0, 14);
    list.innerHTML = matches.map(x => `<li data-id="${x.resort_id}">${x.resort_name} — ${x.state}</li>`).join("");
    list.hidden = matches.length === 0;
    list.querySelectorAll("li").forEach(li => {
      li.addEventListener("mousedown", () => {
        updateResort(r.id, { resort_id: li.dataset.id, label: li.textContent });
        nameInput.value = li.textContent;
        list.hidden = true;
      });
    });
  }

  nameInput.addEventListener("input", debounce(() => {
    updateResort(r.id, { label: nameInput.value, resort_id: "" });
    renderSuggestions(nameInput.value);
  }));
  nameInput.addEventListener("keydown", e => {
    const items = Array.from(list.children);
    if (list.hidden || !["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) return;
    e.preventDefault();
    let idx = items.findIndex(x => x.classList.contains("active"));
    if (e.key === "ArrowDown") idx = Math.min(items.length - 1, idx + 1);
    if (e.key === "ArrowUp")   idx = Math.max(0, idx - 1);
    items.forEach(x => x.classList.remove("active"));
    if (e.key === "Enter" && idx >= 0) items[idx].dispatchEvent(new Event("mousedown"));
    else if (e.key === "Escape") list.hidden = true;
    else items[idx]?.classList.add("active");
  });
  nameInput.addEventListener("blur", () => setTimeout(() => (list.hidden = true), 120));

  row.addEventListener("input", e => {
    const k = e.target.dataset.k;
    if (!k) return;
    if (k === "days") updateResort(r.id, { days: clampInt(e.target.value, 1, 60) });
    else if (k === "blackoutOk") updateResort(r.id, { blackoutOk: e.target.checked });
  });

  row.querySelector('[data-action="remove"]').addEventListener("click", () => removeResort(r.id));
  return row;
}
function renderResorts() {
  resortsEl.innerHTML = "";
  if (state.resorts.length === 0) addResort();
  state.resorts.forEach(r => resortsEl.appendChild(resortRow(r)));
}

/* ---------------- Results rendering ---------------- */
function renderResults(data) {
  resultsEl.innerHTML = "";
  const makeTable = (rows) => {
    const table = document.createElement("table");
    table.innerHTML = "<thead><tr><th>Plan / Pass</th><th>Price</th><th>Notes</th></tr></thead>";
    const tbody = document.createElement("tbody");
    rows.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${p.name || p.plan || p.pass || "Plan"}</td>
                      <td>${p.price != null ? "$" + p.price : "—"}</td>
                      <td>${p.description || p.notes || ""}</td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    resultsEl.appendChild(table);
  };

  if (Array.isArray(data?.valid_passes)) return makeTable(data.valid_passes);
  if (Array.isArray(data)) return makeTable(data);
  if (data?.best_combo || data?.total_cost != null) {
    const combo = (data.best_combo || []).join(" + ") || (data.combo_text || "—");
    const total = (typeof data.total_cost === "number") ? `$${data.total_cost}` : "—";
    resultsEl.innerHTML = `<table><thead><tr><th>Best Combo</th><th>Total Cost</th></tr></thead>
      <tbody><tr><td>${combo}</td><td>${total}</td></tr></tbody></table>`;
    return;
  }
  resultsEl.innerHTML = `<pre class="codeblock">${JSON.stringify(data, null, 2)}</pre>`;
}

/* ---------------- Submit ---------------- */
async function handleSubmit(e) {
  e.preventDefault();

  const riders = state.riders.map(r => ({
    age: r.age === "" ? null : Number(r.age),
    category: r.category
  }));

  const resort_days = state.resorts
    .filter(r => r.resort_id && r.days > 0)
    .map(r => ({ resort_id: r.resort_id, days: Number(r.days), blackout_ok: !!r.blackoutOk }));

  const payload = { riders, resort_days, mode: FORCED_MODE };
  rawReqEl.textContent = JSON.stringify(payload, null, 2);
  resultsEl.innerHTML = "";
  statusEl.textContent = "Submitting…";

  try {
    const { endpoint, json } = await postWithFallback(payload);
    rawResEl.textContent = JSON.stringify({ endpoint_used: endpoint, response: json }, null, 2);
    renderResults(json);
    statusEl.textContent = "OK";
  } catch (err) {
    let diag;
    try { diag = JSON.parse(String(err.message)); }
    catch { diag = { error: String(err) }; }
    rawResEl.textContent = JSON.stringify(diag, null, 2);
    statusEl.textContent = "Error";
  }
}

/* ---------------- Wire-up ---------------- */
document.getElementById("addRiderBtn").addEventListener("click", () => addRider());
document.getElementById("addResortBtn").addEventListener("click", () => addResort());
document.getElementById("clearAllBtn").addEventListener("click", () => { state.resorts = []; renderResorts(); });
document.getElementById("expertForm").addEventListener("submit", handleSubmit);

/* ---------------- Init ---------------- */
(async () => {
  try { await loadResortsIndex(); } catch (e) { console.error(e); }
  renderRiders();
  renderResorts();
})();