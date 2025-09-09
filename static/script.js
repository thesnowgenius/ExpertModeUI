/* Snow Genius – Stable 4 UI (forced multi mode) */
const API_BASE = window.API_BASE || "";
const API_URL = (API_BASE.replace(/\/$/, "") + "/api/plan").replace(/\/+/, "/");
const FORCED_MODE = "multi";

/* -------- State -------- */
const state = {
  riders: [],
  resorts: [],
  resortsIndex: [], // [{id,name,state}]
};

/* -------- DOM -------- */
const ridersEl  = document.getElementById("riders");
const resortsEl = document.getElementById("resorts");
const rawReqEl  = document.getElementById("rawRequest");
const rawResEl  = document.getElementById("rawResponse");
const resultsEl = document.getElementById("results-container");
const statusEl  = document.getElementById("status");

/* -------- Utils -------- */
const uid = () => Math.random().toString(36).slice(2, 9);
const clampInt = (v, min, max) => Math.max(min, Math.min(max, parseInt(v || 0, 10)));
const debounce = (fn, ms = 150) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

/* -------- Boot data (typeahead) -------- */
async function loadResortsIndex() {
  try {
    const res = await fetch("static/resorts.json", { cache: "no-store" });
    const list = await res.json();
    state.resortsIndex = list.map(r => ({
      id: r.id || r.code || r.name,
      name: r.name,
      state: r.state || r.region || ""
    }));
  } catch (err) {
    console.error("Failed loading resorts.json", err);
    state.resortsIndex = [];
  }
}

/* -------- Riders -------- */
function addRider(r = { id: uid(), age: "", category: "None" }) {
  state.riders.push(r);
  renderRiders();
}
function removeRider(id) {
  state.riders = state.riders.filter(x => x.id !== id);
  renderRiders();
}
function updateRider(id, patch) {
  Object.assign(state.riders.find(x => x.id === id), patch);
}

function riderRow(r) {
  const row = document.createElement("div");
  row.className = "grid riders-row";
  row.innerHTML = `
    <input type="number" min="0" max="120" placeholder="Age" value="${r.age ?? ""}" data-k="age" class="input" />
    <select data-k="category" class="select">
      <option>None</option>
      <option>Child</option>
      <option>Teen</option>
      <option>Adult</option>
      <option>Senior</option>
    </select>
    <button type="button" class="btn btn-ghost" data-action="remove">Remove</button>
  `;
  row.querySelector('[data-k="category"]').value = r.category || "None";
  row.addEventListener("input", e => {
    const k = e.target.dataset.k;
    if (!k) return;
    const v = k === "age"
      ? (e.target.value === "" ? "" : clampInt(e.target.value, 0, 120))
      : e.target.value;
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

/* -------- Resorts -------- */
function addResort(r = { id: uid(), name: "", days: 1, blackoutOk: false }) {
  state.resorts.push(r);
  renderResorts();
}
function removeResort(id) {
  state.resorts = state.resorts.filter(x => x.id !== id);
  renderResorts();
}
function updateResort(id, patch) {
  Object.assign(state.resorts.find(x => x.id === id), patch);
}

function resortRow(r) {
  const row = document.createElement("div");
  row.className = "grid resorts-row";
  const suggId = uid();
  row.innerHTML = `
    <div style="position:relative">
      <input type="text" class="input" placeholder="Start typing… e.g. Loon, NH" value="${r.name}" data-k="name"
             aria-autocomplete="list" aria-expanded="false" aria-owns="${suggId}" />
      <div class="suggestion-list" id="${suggId}" hidden></div>
    </div>
    <input type="number" min="1" max="60" value="${r.days}" data-k="days" class="input" />
    <input type="checkbox" data-k="blackoutOk" ${r.blackoutOk ? "checked" : ""} />
    <button type="button" class="btn btn-ghost" data-action="remove">Remove</button>
  `;

  const nameInput = row.querySelector('[data-k="name"]');
  const list = row.querySelector(".suggestion-list");

  function renderSuggestions(q) {
    list.innerHTML = "";
    if (!q || q.length < 1) { list.hidden = true; return; }
    const norm = q.toLowerCase();
    const matches = state.resortsIndex
      .filter(x => x.name.toLowerCase().includes(norm) || (x.state && x.state.toLowerCase().includes(norm)))
      .slice(0, 12);

    if (matches.length === 0) { list.hidden = true; return; }

    matches.forEach((m, i) => {
      const item = document.createElement("div");
      item.className = "suggestion-item" + (i === 0 ? " active" : "");
      item.textContent = m.name + (m.state ? `, ${m.state}` : "");
      item.addEventListener("mousedown", e => {
        e.preventDefault(); // before blur
        nameInput.value = item.textContent;
        updateResort(r.id, { name: nameInput.value });
        list.hidden = true;
      });
      list.appendChild(item);
    });
    list.hidden = false;
  }

  nameInput.addEventListener("input", debounce(() => {
    updateResort(r.id, { name: nameInput.value });
    renderSuggestions(nameInput.value);
  }, 100));

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

/* -------- Submit -------- */
async function handleSubmit(e) {
  e.preventDefault();

  const riders = state.riders.map(r => ({
    age: r.age === "" ? null : Number(r.age),
    category: r.category
  }));
  const resorts = state.resorts
    .filter(r => r.name && r.days > 0)
    .map(r => ({ name: r.name, days: Number(r.days), blackoutOk: !!r.blackoutOk }));

  const payload = { mode: FORCED_MODE, riders, resorts };
  rawReqEl.textContent = JSON.stringify(payload, null, 2);

  if (resorts.length === 0) { statusEl.textContent = "Please add a resort"; return; }

  statusEl.textContent = "Submitting…";
  try {
    const res  = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json();
    rawResEl.textContent = JSON.stringify(json, null, 2);
    renderResults(json);
    statusEl.textContent = res.ok ? "OK" : "Error";
  } catch (err) {
    rawResEl.textContent = JSON.stringify({ error: err.message }, null, 2);
    statusEl.textContent = "Network error";
  }
}

/* -------- Results -------- */
function renderResults(json) {
  resultsEl.innerHTML = "";
  if (!json || !Array.isArray(json.results) || json.results.length === 0) {
    resultsEl.innerHTML = '<div class="muted">No results.</div>';
    return;
  }
  const table = document.createElement("table");
  table.innerHTML = '<thead><tr><th>Plan</th><th>Price</th><th>Description</th></tr></thead>';
  const tbody = document.createElement("tbody");
  json.results.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${p.name || p.plan || "Plan"}</td>
                    <td>${p.price != null ? "$" + p.price : "—"}</td>
                    <td>${p.description || ""}</td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  resultsEl.appendChild(table);
}

/* -------- Wire-up -------- */
document.getElementById("addRiderBtn").addEventListener("click", () => addRider());
document.getElementById("addResortBtn").addEventListener("click", () => addResort());
document.getElementById("clearAllBtn").addEventListener("click", () => { state.resorts = []; renderResorts(); });
document.getElementById("expertForm").addEventListener("submit", handleSubmit);

/* -------- Init -------- */
await loadResortsIndex();
renderRiders();
renderResorts();