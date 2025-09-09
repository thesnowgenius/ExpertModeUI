// static/script.js
const API_BASE = window.API_BASE || '';
const API_URL = (API_BASE.replace(/\/$/, '') + '/api/plan').replace(/\/+/, '/'); // force single '/'
// Force 'multi' mode – the selector is removed by design.
const FORCED_MODE = 'multi';

// Simple state
const state = {
  riders: [],
  resorts: [],
  resortsIndex: [], // for typeahead
};

// Elements
const ridersEl = document.getElementById('riders');
const resortsEl = document.getElementById('resorts');
const rawReqEl = document.getElementById('rawReq');
const rawResEl = document.getElementById('rawRes');
const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('status');

// Utils
const uid = () => Math.random().toString(36).slice(2, 9);
const clampInt = (v, min, max) => Math.max(min, Math.min(max, parseInt(v || 0, 10)));
const debounce = (fn, ms=150) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }};

// Data: load resorts list for typeahead
async function loadResorts() {
  try {
    const res = await fetch('static/resorts.json', { cache: 'no-store' });
    const json = await res.json();
    state.resortsIndex = json.map(r => ({ id: r.id || r.code || r.name, name: r.name, state: r.state || r.region || '' }));
  } catch (e) {
    console.error('Failed to load resorts.json', e);
    state.resortsIndex = [];
  }
}

// Riders
function addRider(rider = { id: uid(), age: '', category: 'None' }) {
  state.riders.push(rider);
  renderRiders();
}
function removeRider(id) {
  state.riders = state.riders.filter(r => r.id !== id);
  renderRiders();
}
function updateRider(id, patch) {
  const r = state.riders.find(x => x.id === id);
  Object.assign(r, patch);
}

function riderRow(r) {
  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = `
    <div class="grow">
      <div class="row">
        <input type="number" inputmode="numeric" min="0" max="120" placeholder="Age" class="number small" value="${r.age ?? ''}" data-k="age"/>
        <select class="select small" data-k="category">
          <option>None</option>
          <option>Child</option>
          <option>Teen</option>
          <option>Adult</option>
          <option>Senior</option>
        </select>
        <button type="button" class="btn btn-danger" data-action="remove">Remove</button>
      </div>
    </div>
  `;
  row.querySelector('[data-k="category"]').value = r.category || 'None';
  row.addEventListener('input', (e) => {
    const k = e.target.dataset.k;
    if (!k) return;
    const v = k === 'age' ? (e.target.value === '' ? '' : clampInt(e.target.value, 0, 120)) : e.target.value;
    updateRider(r.id, { [k]: v });
  });
  row.querySelector('[data-action="remove"]').addEventListener('click', () => removeRider(r.id));
  return row;
}
function renderRiders() {
  ridersEl.innerHTML = '';
  if (state.riders.length === 0) addRider(); // always keep at least one
  state.riders.forEach(r => ridersEl.appendChild(riderRow(r)));
}

// Resorts
function addResort(resort = { id: uid(), name: '', days: 1, blackoutOk: false }) {
  state.resorts.push(resort);
  renderResorts();
}
function removeResort(id) {
  state.resorts = state.resorts.filter(x => x.id !== id);
  renderResorts();
}
function updateResort(id, patch) {
  const r = state.resorts.find(x => x.id === id);
  Object.assign(r, patch);
}
function resortRow(r) {
  const row = document.createElement('div');
  row.className = 'flexcol';
  const wrapId = uid();
  row.innerHTML = `
    <div class="row">
      <div class="grow" style="position:relative">
        <input type="text" placeholder="Start typing… e.g. Loon, NH" class="input" value="${r.name ?? ''}" data-k="name" aria-autocomplete="list" aria-expanded="false" aria-owns="${wrapId}"/>
        <div class="suggestion-list" id="${wrapId}" hidden></div>
      </div>
      <input type="number" min="1" max="60" class="number small" value="${r.days}" data-k="days" />
      <label class="row badge"><input type="checkbox" class="checkbox" ${r.blackoutOk?'checked':''} data-k="blackoutOk" />&nbsp;Blackout OK</label>
      <button type="button" class="btn btn-danger" data-action="remove">Remove</button>
    </div>`;

  const nameInput = row.querySelector('[data-k="name"]');
  const list = row.querySelector('.suggestion-list');

  function renderSuggestions(q) {
    list.innerHTML = '';
    if (!q || q.length < 1) { list.hidden = true; return; }
    const norm = q.toLowerCase();
    const matches = state.resortsIndex
      .filter(x => x.name.toLowerCase().includes(norm) || (x.state && x.state.toLowerCase().includes(norm)))
      .slice(0, 12);
    if (matches.length === 0) { list.hidden = true; return; }
    matches.forEach((m, i) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item' + (i === 0 ? ' active' : '');
      item.textContent = m.name + (m.state ? `, ${m.state}` : '');
      item.addEventListener('mousedown', (e) => { // mousedown to run before blur
        e.preventDefault();
        nameInput.value = item.textContent;
        updateResort(r.id, { name: nameInput.value });
        list.hidden = true;
      });
      list.appendChild(item);
    });
    list.hidden = false;
  }

  nameInput.addEventListener('input'