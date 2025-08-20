
/* ===== Snow Genius Expert Mode - UI Script (with correct payload keys) =====
   - Multi mode  -> POST /score_multi_pass with { riders, resort_days }
   - Single mode -> POST /expert_mode/calculate with { riders, resort_plan }
   - Includes resort typeahead, status updates, and raw request/response boxes.
*/

/* ---------- Typeahead-backed resort picker ---------- */
let RESORTS = [];
let RESORTS_LOADED = false;

async function loadResortsOnce() {
  if (RESORTS_LOADED) return RESORTS;
  const resp = await fetch('static/resorts.json', { cache: 'no-store' });
  RESORTS = await resp.json();
  RESORTS_LOADED = true;
  return RESORTS;
}
function formatResortLabel(r) {
  return r.state ? `${r.resort_name}, ${r.state}` : r.resort_name;
}
function normalizeQuery(q) {
  return q.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '');
}
function resortMatches(r, qNorm) {
  const name = normalizeQuery(r.resort_name || '');
  const id   = normalizeQuery(r.resort_id || '');
  const st   = normalizeQuery(r.state || '');
  return name.includes(qNorm) || id.includes(qNorm) || st.includes(qNorm);
}
function createTypeahead(container) {
  const wrap = document.createElement('div');
  wrap.className = 'ta-wrap';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'ta-input';
  input.placeholder = 'Start typing a resort…';
  input.autocomplete = 'off';
  input.inputMode = 'search';

  const hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.name = 'resort_id';

  const list = document.createElement('ul');
  list.className = 'ta-list';
  list.hidden = true;

  let cursor = -1;
  let currentResults = [];

  function clearList() {
    list.innerHTML = '';
    list.hidden = true;
    cursor = -1;
    currentResults = [];
  }
  function choose(r) {
    input.value = formatResortLabel(r);
    hidden.value = r.resort_id;
    clearList();
  }
  function renderList(items) {
    list.innerHTML = '';
    currentResults = items.slice(0, 20);
    currentResults.forEach((r, idx) => {
      const li = document.createElement('li');
      li.className = 'ta-item';
      li.textContent = formatResortLabel(r);
      li.dataset.id = r.resort_id;
      li.addEventListener('mousedown', (e) => { e.preventDefault(); choose(r); });
      list.appendChild(li);
    });
    list.hidden = currentResults.length === 0;
    cursor = -1;
  }

  input.addEventListener('input', async () => {
    hidden.value = '';
    const q = input.value.trim();
    if (q.length < 3) { clearList(); return; }
    await loadResortsOnce();
    const qNorm = normalizeQuery(q);
    renderList(RESORTS.filter(r => resortMatches(r, qNorm)));
  });
  input.addEventListener('keydown', (e) => {
    if (list.hidden) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      cursor = Math.min(cursor + 1, list.children.length - 1);
      highlight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      cursor = Math.max(cursor - 1, 0);
      highlight();
    } else if (e.key === 'Enter') {
      if (cursor >= 0 && currentResults[cursor]) {
        e.preventDefault();
        choose(currentResults[cursor]);
      }
    } else if (e.key === 'Escape') {
      clearList();
    }
  });
  function highlight() {
    Array.from(list.children).forEach((li, i) => {
      li.classList.toggle('active', i === cursor);
      if (i === cursor) li.scrollIntoView({ block: 'nearest' });
    });
  }
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) clearList(); });

  wrap.appendChild(input);
  wrap.appendChild(hidden);
  wrap.appendChild(list);
  container.appendChild(wrap);
  return { input, hidden, list };
}

/* ---------- Stable row management ---------- */
function addRider() {
  const container = document.getElementById('riders');
  const rider = document.createElement('div');
  rider.className = 'rider';
  rider.innerHTML =
    '<input type="number" placeholder="Age" name="age" required>' +
    '<select name="category">' +
      '<option value="None">None</option>' +
      '<option value="Military">Military</option>' +
      '<option value="Student">Student</option>' +
      '<option value="Nurse">Nurse</option>' +
    '</select>' +
    '<button type="button" class="remove-btn">Remove</button>';
  container.appendChild(rider);
  rider.querySelector('.remove-btn').addEventListener('click', () => rider.remove());
}
async function addResort() {
  const container = document.getElementById('resorts');
  const row = document.createElement('div');
  row.className = 'resort';

  const left = document.createElement('div');
  left.className = 'resort-left';
  const right = document.createElement('div');
  right.className = 'resort-right';

  createTypeahead(left);
  right.innerHTML =
    '<input type="number" placeholder="Days" name="days" required>' +
    '<label class="blk"><input type="checkbox" name="blackout_ok"> Blackout Days OK</label>' +
    '<button type="button" class="remove-btn">Remove</button>';
  row.appendChild(left);
  row.appendChild(right);
  container.appendChild(row);
  right.querySelector('.remove-btn').addEventListener('click', () => row.remove());
}

/* ---------- Helpers for status + raw panes ---------- */
function setStatus(text, cls) {
  const el = document.getElementById('status');
  if (!el) return;
  el.textContent = text;
  el.className = 'status ' + (cls || '');
}
function setRaw(id, dataObj) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    el.textContent = JSON.stringify(dataObj, null, 2);
    const details = el.closest('details');
    if (details) details.open = true; // auto-expand on new data
  } catch (_) {
    el.textContent = String(dataObj);
  }
}

/* ---------- Mode detection (segmented toggle or checkbox fallback) ---------- */
function isMultiModeSelected() {
  // segmented buttons: .seg with data-mode="multi"/"single" and .active
  const activeSeg = document.querySelector('.seg.active');
  if (activeSeg && activeSeg.dataset.mode) {
    return activeSeg.dataset.mode === 'multi';
  }
  // fallback checkbox
  const cb = document.getElementById('multiApiToggle');
  if (cb) return !!cb.checked;
  // default to multi
  return true;
}
function wireSegToggle() {
  const segs = document.querySelectorAll('.seg[data-mode]');
  segs.forEach(seg => {
    seg.addEventListener('click', () => {
      segs.forEach(s => s.classList.remove('active'));
      seg.classList.add('active');
    });
  });
}

/* ---------- Submit handler with correct payload keys ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // seed first rows if empty
  if (!document.getElementById('riders').children.length) addRider();
  if (!document.getElementById('resorts').children.length) addResort();

  // wire add buttons (if present)
  document.getElementById('addRiderBtn')?.addEventListener('click', addRider);
  document.getElementById('addResortBtn')?.addEventListener('click', addResort);

  wireSegToggle();

  document.getElementById('expertForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const riders = Array.from(document.querySelectorAll('#riders .rider')).map(div => ({
      age: parseInt(div.querySelector('input[name="age"]').value, 10),
      category: (div.querySelector('select[name="category"]').value || 'None')
    }));

    const resorts = Array.from(document.querySelectorAll('#resorts .resort')).map(div => {
      const resortId = div.querySelector('input[name="resort_id"]').value.trim();
      const days = parseInt(div.querySelector('input[name="days"]').value, 10);
      const blackout_ok = div.querySelector('input[name="blackout_ok"]').checked;
      return { resort: resortId, days, blackout_ok };
    });

    if (!riders.length || resorts.some(r => !r.resort || !r.days)) {
      alert('Please add at least one rider and one resort (select from the list) and enter days.');
      return;
    }

    const isMulti = isMultiModeSelected();
    const url = isMulti
      ? 'https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass'
      : 'https://pass-picker-expert-mode.onrender.com/expert_mode/calculate';

    const payload = { riders };
    if (isMulti) {
      payload['resort_days'] = resorts;   // multi expects resort_days
    } else {
      payload['resort_plan'] = resorts;   // single expects resort_plan
    }

    setRaw('rawRequest', { url, payload });
    setStatus('Processing…', '');    

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      setRaw('rawResponse', data);
      if (!resp.ok) {
        setStatus('Error', 'err');
      } else {
        setStatus('OK', 'ok');
      }
      if (typeof renderCards === 'function') {
        renderCards(data.valid_passes || data || []);
      }
    } catch (err) {
      console.error(err);
      setRaw('rawResponse', { error: String(err) });
      setStatus('Error', 'err');
      alert('Request failed: ' + (err?.message || err));
    }
  });
});
