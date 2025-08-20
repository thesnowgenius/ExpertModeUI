/* ===== Snow Genius Expert Mode - Restored Stable Form + Typeahead =====
   - Segmented toggle drives endpoints:
       Multi  → https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass
       Single → https://pass-picker-expert-mode.onrender.com/expert_mode/calculate
   - Payload keys:
       Multi  → { riders, resort_days: [...] }
       Single → { riders, resort_plan: [...] }
   - Raw Request / Raw Response + Status restored
   - Add/Remove/Clear riders & resorts restored
   - Type-ahead resort selector (sends resort_id, shows Resort Name, ST)
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
  let current = [];

  function clearList() { list.innerHTML=''; list.hidden=true; cursor=-1; current=[]; }
  function choose(r) { input.value = formatResortLabel(r); hidden.value = r.resort_id; clearList(); }
  function render(items){
    list.innerHTML=''; current = items.slice(0, 20);
    current.forEach((r) => {
      const li = document.createElement('li');
      li.className='ta-item'; li.textContent=formatResortLabel(r); li.dataset.id=r.resort_id;
      li.addEventListener('mousedown', (e)=>{ e.preventDefault(); choose(r); });
      list.appendChild(li);
    });
    list.hidden = current.length === 0;
    cursor = -1;
  }

  input.addEventListener('input', async ()=>{
    hidden.value='';
    const q=input.value.trim();
    if(q.length<3){ clearList(); return; }
    await loadResortsOnce();
    const qn = normalizeQuery(q);
    render(RESORTS.filter(r=>resortMatches(r, qn)));
  });
  input.addEventListener('keydown', (e)=>{
    if(list.hidden) return;
    if(e.key==='ArrowDown'){ e.preventDefault(); cursor=Math.min(cursor+1, list.children.length-1); highlight(); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); cursor=Math.max(cursor-1, 0); highlight(); }
    else if(e.key==='Enter'){ if(cursor>=0 && current[cursor]){ e.preventDefault(); choose(current[cursor]); } }
    else if(e.key==='Escape'){ clearList(); }
  });
  function highlight(){
    Array.from(list.children).forEach((li,i)=>{
      li.classList.toggle('active', i===cursor);
      if(i===cursor) li.scrollIntoView({block:'nearest'});
    });
  }
  document.addEventListener('click', (e)=>{ if(!wrap.contains(e.target)) clearList(); });

  wrap.appendChild(input); wrap.appendChild(hidden); wrap.appendChild(list);
  container.appendChild(wrap);
  return { input, hidden, list };
}

/* ---------- UI Builders (restored) ---------- */
function riderRow() {
  const rider = document.createElement('div');
  rider.className = 'rider';
  rider.innerHTML =
    '<div class="field"><label>Age</label><input type="number" placeholder="Age" name="age" required></div>' +
    '<div class="field"><label>Category</label><select name="category">' +
      '<option value="None">None</option>' +
      '<option value="Military">Military</option>' +
      '<option value="Student">Student</option>' +
      '<option value="Nurse">Nurse</option>' +
    '</select></div>' +
    '<button type="button" class="remove-btn">Remove</button>';
  rider.querySelector('.remove-btn').addEventListener('click', ()=>rider.remove());
  return rider;
}

function resortRow() {
  const row = document.createElement('div');
  row.className = 'resort';

  const left = document.createElement('div');
  left.className = 'resort-left field';
  left.innerHTML = '<label>Resort</label>';
  createTypeahead(left);

  const right = document.createElement('div');
  right.className = 'resort-right';
  right.innerHTML =
    '<div class="field"><label>Days</label><input type="number" placeholder="Days" name="days" min="1" required></div>' +
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
  riders.innerHTML = '';
  resorts.innerHTML = '';
  addRider();
  addResort();
  setStatus('Idle');
  setRaw('rawRequest', {});
  setRaw('rawResponse', {});
  renderCards([]); // clear results
}

/* ---------- Toggle handling ---------- */
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
  if(!el) return;
  el.textContent = text;
  el.className = 'status' + (cls ? ' ' + cls : '');
}
function setRaw(id, data){
  const el = document.getElementById(id);
  if(!el) return;
  try{
    el.textContent = JSON.stringify(data, null, 2);
    const details = el.closest('details');
    if(details) details.open = true;
  }catch(_){
    el.textContent = String(data);
  }
}

/* ---------- Submit ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  // Seed default rows
  addRider(); addResort();

  wireSegToggle();
  document.getElementById('addRiderBtn').addEventListener('click', addRider);
  document.getElementById('addResortBtn').addEventListener('click', addResort);
  document.getElementById('clearAllBtn').addEventListener('click', clearAll);

  document.getElementById('expertForm').addEventListener('submit', async (e)=>{
    e.preventDefault();

    const riders = Array.from(document.querySelectorAll('#riders .rider')).map(div=>({
      age: parseInt(div.querySelector('input[name="age"]').value, 10),
      category: (div.querySelector('select[name="category"]').value || 'None')
    }));

    const resorts = Array.from(document.querySelectorAll('#resorts .resort')).map(div=>{
      const resortId = (div.querySelector('input[name="resort_id"]')?.value || '').trim();
      const days = parseInt(div.querySelector('input[name="days"]').value, 10);
      const blackout_ok = div.querySelector('input[name="blackout_ok"]').checked;
      return { resort: resortId, days, blackout_ok };
    });

    if (!riders.length || resorts.some(r=>!r.resort || !r.days)) {
      alert('Please add at least one rider and one resort (select from the list) and enter days.');
      return;
    }

    const multi = isMultiModeSelected();
    const url = multi
      ? 'https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass'
      : 'https://pass-picker-expert-mode.onrender.com/expert_mode/calculate';

    const payload = { riders };
    if (multi) payload.resort_days = resorts;
    else payload.resort_plan = resorts;

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

      // Results rendering (works for both APIs)
      renderCards(data);
    }catch(err){
      console.error(err);
      setRaw('rawResponse', { error: String(err) });
      setStatus('Error', 'err');
      alert('Request failed: ' + (err?.message || err));
    }
  });
});