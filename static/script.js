// -------- Resort Typeahead helpers --------
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
  return q.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g,'');
}
function resortMatches(r, qNorm) {
  const name = normalizeQuery(r.resort_name||'');
  const id   = normalizeQuery(r.resort_id||'');
  const st   = normalizeQuery(r.state||'');
  return name.includes(qNorm)||id.includes(qNorm)||st.includes(qNorm);
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
  function choose(r){ input.value = formatResortLabel(r); hidden.value = r.resort_id; clearList(); }
  function render(items){
    list.innerHTML=''; current = items.slice(0,20);
    current.forEach((r,i)=>{
      const li = document.createElement('li');
      li.className='ta-item'; li.textContent=formatResortLabel(r); li.dataset.id=r.resort_id;
      li.addEventListener('mousedown', e=>{ e.preventDefault(); choose(r); });
      list.appendChild(li);
    });
    list.hidden = current.length===0;
    cursor=-1;
  }
  input.addEventListener('input', async ()=>{
    hidden.value='';
    const q=input.value.trim();
    if(q.length<3){ clearList(); return; }
    await loadResortsOnce();
    const qn = normalizeQuery(q);
    render(RESORTS.filter(r=>resortMatches(r,qn)));
  });
  input.addEventListener('keydown', e=>{
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
  document.addEventListener('click', e=>{ if(!wrap.contains(e.target)) clearList(); });

  wrap.appendChild(input); wrap.appendChild(hidden); wrap.appendChild(list);
  container.appendChild(wrap);
  return {input, hidden, list};
}

// -------- Stable Form behaviors (restored) --------
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
  rider.querySelector('.remove-btn').addEventListener('click', ()=>rider.remove());
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
  right.querySelector('.remove-btn').addEventListener('click', ()=>row.remove());
}

document.addEventListener('DOMContentLoaded', ()=>{
  // inject typeahead into the first resort row
  const firstLeft = document.querySelector('#resorts .resort .resort-left');
  if(firstLeft && !firstLeft.querySelector('.ta-wrap')) createTypeahead(firstLeft);
});

document.getElementById('expertForm').addEventListener('submit', async function(e){
  e.preventDefault();

  const riders = [...document.querySelectorAll('#riders .rider')].map(div => ({
    age: parseInt(div.querySelector('input[name="age"]').value,10),
    category: (div.querySelector('select[name="category"]').value || 'None')
  }));

  const resorts = [...document.querySelectorAll('#resorts .resort')].map(div => {
    const ridEl = div.querySelector('input[name="resort_id"]');
    const days = parseInt(div.querySelector('input[name="days"]').value,10);
    const blackout_ok = div.querySelector('input[name="blackout_ok"]').checked;
    return { resort: (ridEl ? ridEl.value.trim() : ''), days, blackout_ok };
  });

  if (riders.length===0 || resorts.length===0 || resorts.some(r=>!r.resort || !r.days)) {
    alert('Please add at least one rider and one resort (select from the list) and enter days.');
    return;
  }

  const useMulti = document.getElementById('multiApiToggle')?.checked;
  const url = useMulti
    ? 'https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass'
    : 'https://pass-picker-expert-mode.onrender.com/score_pass';
  const payload = useMulti
    ? { riders, resort_days: resorts }
    : { riders, resort_days: resorts };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (typeof renderCards === 'function') {
      renderCards(result.valid_passes || []);
    } else { console.log(result); }
  } catch (err) {
    console.error(err);
    alert('Request failed: ' + (err?.message || err));
  }
});
