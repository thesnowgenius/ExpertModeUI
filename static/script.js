/* ===== Snow Genius Expert Mode - Stable Form + Typeahead (hardened) =====
   Endpoints:
     Multi  → https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass
     Single → https://pass-picker-expert-mode.onrender.com/expert_mode/calculate
   Payload keys:
     Multi  → { riders, resort_days: [...] }
     Single → { riders, resort_plan: [...] }
   Fixes:
     - Prevent server "'NoneType' has no attribute 'strip'" by normalizing fields
     - Do not add duplicate column headers on additional rows
     - Keep Raw Request/Response + Status + Clear + Results
*/

/* ---------- Typeahead ---------- */
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
  return (q ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '');
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
  let current = [];

  function clearList(){ list.innerHTML=''; list.hidden=true; cursor=-1; current=[]; }
  function choose(r){
    input.value = formatResortLabel(r);
    hidden.value = r.resort_id;   // <- string id guaranteed
    clearList();
  }
  function render(items){
    list.innerHTML=''; current = items.slice(0, 20);
    current.forEach((r)=>{
      const li = document.createElement('li');
      li.className='ta-item';
      li.textContent=formatResortLabel(r);
      li.dataset.id=r.resort_id;
      li.addEventListener('mousedown', e=>{ e.preventDefault(); choose(r); });
      list.appendChild(li);
    });
    list.hidden = current.length === 0;
    cursor = -1;
  }

  input.addEventListener('input', async ()=>{
    hidden.value = ''; // until a real choice is made
    const q = input.value.trim();
    if (q.length < 3) { clearList(); return; }
    await loadResortsOnce();
    render(RESORTS.filter(r => resortMatches(r, normalizeQuery(q))));
  });

  input.addEventListener('keydown', (e)=>{
    if (list.hidden) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault(); cursor = Math.min(cursor + 1, list.children.length - 1); highlight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); cursor = Math.max(cursor - 1, 0); highlight();
    } else if (e.key === 'Enter') {
      if (cursor >= 0 && current[cursor]) { e.preventDefault(); choose(current[cursor]); }
    } else if (e.key === 'Escape') {
      clearList();
    }
  });

  function highlight(){
    Array.from(list.children).forEach((li, i)=>{
      li.classList.toggle('active', i === cursor);
      if (i === cursor) li.scrollIntoView({ block:'nearest' });
    });
  }

  document.addEventListener('click', (e)=>{ if (!wrap.contains(e.target)) clearList(); });

  wrap.appendChild(input);
  wrap.appendChild(hidden);
  wrap.appendChild(list);
  container.appendChild(wrap);
  return { input, hidden, list };
}

/* ---------- Row factories (NO per-row headers) ---------- */
function riderRow() {
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
  rider.querySelector('.remove-btn').addEventListener('click', ()=>rider.remove());
  return rider;
}
function resortRow() {
  const row = document.createElement('div');
  row.className = 'resort';

  const left = document.createElement('div');
  left.className = 'resort-left';
  createTypeahead(left);

  const right = document.createElement('div');
  right.className = 'resort-right';
  right.innerHTML =
    '<input type="number" placeholder="Days" name="days" min="1" required>' +
    '<label class="blk"><input type="checkbox" name="blackout_ok"> Blackout OK</label>' +
    '<button type="button" class="remove-btn">Remove</button>';
  right.querySelector('.remove-btn').addEventListener('click', ()=>row.remove());

  row.appendChild(left);
  row.appendChild(right);
  return row;
}
function addRider(){ document.getElementById('riders').appendChild(riderRow()); }
function addResort(){ document.getElementById('resorts').appendChild(resortRow()); }
function clearAll(){
  const riders = document.getElementById('riders');
  const resorts = document.getElementById('resorts');
  riders.innerHTML = ''; resorts.innerHTML = '';
  addRider(); addResort();
  setStatus('Idle'); setRaw('rawRequest', {}); setRaw('rawResponse', {});
  renderCards([]); // clear results table
}

/* ---------- Toggle ---------- */
function wireSegToggle(){
  const segs = Array.from(document.querySelectorAll('.segmented .seg'));
  segs.forEach(seg=>{
    seg.addEventListener('click', ()=>{
      segs.forEach(s=>s.classList.remove('active'));
      seg.classList.add('active');
    });
  });
}
function isMultiModeSelected(){
  const active = document.querySelector('.segmented .seg.active');
  return !active || active.dataset.mode === 'multi';
}

/* ---------- Status + Raw panes ---------- */
function setStatus(text, cls){
  const el = document.getElementById('status');
  if (!el) return;
  el.textContent = text;
  el.className = 'status' + (cls ? ' ' + cls : '');
}
function setRaw(id, data){
  const el = document.getElementById(id);
  if (!el) return;
  try{
    el.textContent = JSON.stringify(data ?? {}, null, 2);
    const details = el.closest('details');
    if (details) details.open = true;
  }catch(_){
    el.textContent = String(data);
  }
}

/* ---------- Submit ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  // Seed one rider/resort
  addRider(); addResort();

  // Buttons
  wireSegToggle();
  document.getElementById('addRiderBtn').addEventListener('click', addRider);
  document.getElementById('addResortBtn').addEventListener('click', addResort);
  document.getElementById('clearAllBtn').addEventListener('click', clearAll);

  document.getElementById('expertForm').addEventListener('submit', async (e)=>{
    e.preventDefault();

    // Normalize riders → category is always a string
    const riders = Array.from(document.querySelectorAll('#riders .rider')).map(div=>{
      const ageRaw = div.querySelector('input[name="age"]').value;
      const age = parseInt((ageRaw ?? '').toString().trim(), 10);
      const category = (div.querySelector('select[name="category"]').value ?? 'None').toString().trim();
      return { age, category };
    }).filter(r => Number.isFinite(r.age));

    // Normalize resorts → only keep rows with a selected resort_id
    const resorts = Array.from(document.querySelectorAll('#resorts .resort')).map(div=>{
      const resortId = (div.querySelector('input[name="resort_id"]')?.value ?? '').toString().trim();
      const daysRaw = div.querySelector('input[name="days"]').value;
      const days = parseInt((daysRaw ?? '').toString().trim(), 10);
      const blackout_ok = !!div.querySelector('input[name="blackout_ok"]').checked;
      return { resort: resortId, days, blackout_ok };
    }).filter(r => r.resort && Number.isFinite(r.days));

    if (!riders.length || !resorts.length) {
      alert('Please add at least one rider and one resort (select from the list) and enter days.');
      return;
    }

    const multi = isMultiModeSelected();
    const url = multi
      ? 'https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass'
      : 'https://pass-picker-expert-mode.onrender.com/expert_mode/calculate';

    // Build payload exactly like Stable Form:
    const payload = { riders };
    if (multi) {
      payload.resort_days = resorts.map(r => ({
        resort: r.resort.toString().trim(),
        days: r.days,
        blackout_ok: r.blackout_ok
      }));
    } else {
      payload.resort_plan = resorts.map(r => ({
        resort: r.resort.toString().trim(),
        days: r.days,
        blackout_ok: r.blackout_ok
      }));
    }

    setRaw('rawRequest', { url, payload });
    setStatus('Processing…');

    try{
      const resp = await fetch(url, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      setRaw('rawResponse', data);
      setStatus(resp.ok ? 'OK' : 'Error', resp.ok ? 'ok' : 'err');
      renderCards(data);
    }catch(err){
      console.error(err);
      setRaw('rawResponse', { error: String(err) });
      setStatus('Error', 'err');
      alert('Request failed: ' + (err?.message || err));
    }
  });
});