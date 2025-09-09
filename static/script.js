/* Snow Genius — Expert Mode UI
 * Single-API client (Multi only). Keeps original UX: riders, resort rows,
 * raw request/response, results table.
 */

const API_URL = "https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass";

const el = (id) => document.getElementById(id);

// ---------- Resort rows ----------
function makeResortRow(defaults = { resort: "", days: 1, blackout_ok: false }) {
  const row = document.createElement("div");
  row.className = "grid resort-row";

  const resortInput = document.createElement("input");
  resortInput.type = "text";
  resortInput.placeholder = "Start typing… e.g. Loon, NH";
  resortInput.value = defaults.resort;

  const daysInput = document.createElement("input");
  daysInput.type = "number";
  daysInput.min = "1";
  daysInput.value = String(defaults.days || 1);

  const blackoutInput = document.createElement("input");
  blackoutInput.type = "checkbox";
  blackoutInput.checked = Boolean(defaults.blackout_ok);

  const removeBtn = document.createElement("button");
  removeBtn.className = "btn btn-danger";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => row.remove());

  // spacer for grid alignment
  const spacer = document.createElement("div");

  row.appendChild(resortInput);
  row.appendChild(daysInput);
  row.appendChild(blackoutInput);
  row.appendChild(spacer);
  row.appendChild(removeBtn);

  return row;
}

function addResortRow(defaults) {
  el("resort-rows").appendChild(makeResortRow(defaults));
  setStatus("OK", true);
}

function clearResorts() {
  el("resort-rows").innerHTML = "";
  setStatus("Idle", true);
}

// ---------- Status / Raw panes ----------
function setStatus(text, ok = true) {
  const pill = el("status-pill");
  const row = el("status-row");
  pill.textContent = text;
  pill.className = ok ? "pill-ok" : "pill-err";
  row.style.display = "flex";
}

function showRawRequest(obj) {
  el("raw-request").textContent = JSON.stringify(obj, null, 2);
}
function showRawResponse(obj) {
  el("raw-response").textContent = JSON.stringify(obj, null, 2);
}

// ---------- Payload builder ----------
function buildPayload() {
  const age = parseInt(el("age-input").value, 10) || 18;
  const category = (el("category-select").value || "none").toLowerCase();

  const rows = [...document.querySelectorAll("#resort-rows .resort-row")];
  const resort_days = rows.map(r => {
    const [resortInput, daysInput, blackoutInput] = r.querySelectorAll("input");
    return {
      resort: (resortInput.value || "").trim(),
      days: Math.max(1, parseInt(daysInput.value, 10) || 1),
      blackout_ok: Boolean(blackoutInput.checked)
    };
  }).filter(r => r.resort.length > 0);

  return {
    riders: [{ age, category }],
    resort_days
  };
}

// ---------- Results renderer ----------
function renderResults(obj) {
  const mount = el("results");
  mount.innerHTML = "";

  if (!obj || typeof obj !== "object") {
    mount.innerHTML = `<pre>{"error":"No response"}</pre>`;
    return;
  }

  if (obj.error) {
    mount.innerHTML = `<pre>${JSON.stringify(obj, null, 2)}</pre>`;
    setStatus("Error", false);
    return;
  }

  // Expected minimal fields from backend
  const best = obj.best_combo || obj.best || [];
  const total = obj.total_cost ?? obj.total ?? null;

  if ((!best || best.length === 0) && total === null) {
    mount.innerHTML = `<pre>${JSON.stringify(obj, null, 2)}</pre>`;
    setStatus("OK (no best_combo?)", true);
    return;
  }

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const tfoot = document.createElement("tfoot");

  thead.innerHTML = `<tr><th>Best Combo</th><th>Total Cost</th></tr>`;
  const row = document.createElement("tr");
  row.innerHTML = `<td>${Array.isArray(best) ? best.join(" + ") : String(best)}</td>
                   <td>$${Number(total).toLocaleString()}</td>`;
  tbody.appendChild(row);
  table.appendChild(thead);
  table.appendChild(tbody);
  mount.appendChild(table);

  setStatus("OK", true);
}

// ---------- Submit ----------
async function submitPlan() {
  const payload = buildPayload();

  // Basic client-side validation
  if (!payload.resort_days || payload.resort_days.length === 0) {
    setStatus("Add at least one resort", false);
    return;
  }

  showRawRequest({ url: API_URL, payload });

  try {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      body: JSON.stringify(payload)
    });

    const data = await resp.json().catch(() => ({}));
    showRawResponse(data);
    renderResults(data);
  } catch (err) {
    const e = { error: String(err) };
    showRawResponse(e);
    renderResults(e);
    setStatus("Network error", false);
  }
}

// ---------- Wire up ----------
document.addEventListener("DOMContentLoaded", () => {
  // a single starter row
  addResortRow();

  el("add-resort").addEventListener("click", () => addResortRow());
  el("clear-resorts").addEventListener("click", clearResorts);
  el("submit-btn").addEventListener("click", submitPlan);
});