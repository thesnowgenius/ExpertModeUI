
const MULTI_URL = 'https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass';
const SINGLE_URL = 'https://pass-picker-expert-mode.onrender.com/expert_mode/calculate';

let RESORTS = [];
let RESORTS_LOADED = false;
async function loadResortsOnce() {
  if (RESORTS_LOADED) return RESORTS;
  const resp = await fetch('static/resorts.json', { cache: 'no-store' });
  RESORTS = await resp.json();
  RESORTS_LOADED = true;
  return RESORTS;
}
function formatResortLabel(r){ return r.state ? `${r.resort_name}, ${r.state}` : r.resort_name; }
function normalizeQuery(q){ return q.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g,''); }
function resortMatches(r, qNorm){
  const name = normalizeQuery(r.resort_name||'');
  const id   = normalizeQuery(r.resort_id||'');
  const st   = normalizeQuery(r.state||'');
  return name.includes(qNorm) || id.includes(qNorm) || st.includes(qNorm);
}
function createTypeahead(container){
  const wrap = document.createElement('div');
  wrap.className = 'ta-wrap';
  const input = document.createElement('input');
  input.type = 'text'; input.className='ta-input'; input.placeholder='Start typing a resort…';
  input.autocomplete='off'; input.inputMode='search';
  const hidden = document.createElement('input'); hidden.type='hidden'; hidden.name='resort_id';
  const list = document.createElement('ul'); list.className='ta-list'; list.hidden=true;
  let cursor=-1, current=[];
  function clearList(){ list.innerHTML=''; list.hidden=true; cursor=-1; current=[]; }
  function choose(r){ input.value=formatResortLabel(r); hidden.value=r.resort_id; clearList(); }
  function render(items){
    list.innerHTML=''; current=items.slice(0,20);
    current.forEach(r=>{
      const li=document.createElement('li'); li.className='ta-item'; li.textContent=formatResortLabel(r);
      li.addEventListener('mousedown', e=>{ e.preventDefault(); choose(r); });
      list.appendChild(li);
    });
    list.hidden=current.length===0; cursor=-1;
  }
  input.addEventListener('input', async ()=>{
    hidden.value=''; const q=input.value.trim();
    if(q.length<3){ clearList(); return; }
    await loadResortsOnce(); const qn = normalizeQuery(q);
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
}

function addRider(){
  const container = document.getElementById('riders');
  const rider = document.createElement('div'); rider.className='rider';
  rider.innerHTML =
    '<div class="field"><label>Age</label><input type="number" name="age" required></div>' +
    '<div class="field"><label>Category</label><select name="category"><option value="None">None</option><option value="Military">Military</option><option value="Student">Student</option><option value="Nurse">Nurse</option></select></div>' +
    '<button type="button" class="remove-btn">Remove</button>';
  container.appendChild(rider);
  rider.querySelector('.remove-btn').addEventListener('click',()=>rider.remove());
}
async function addResort(){
  const container = document.getElementById('resorts');
  const row = document.createElement('div'); row.className='resort';
  const left = document.createElement('div'); left.className='resort-left';
  const right = document.createElement('div'); right.className='resort-right';
  createTypeahead(left);
  right.innerHTML =
    '<input type="number" placeholder="Days" name="days" min="1" required>' +
    '<label class="blk"><input type="checkbox" name="blackout_ok"> Blackout Days OK</label>' +
    '<button type="button" class="remove-btn">Remove</button>';
  row.appendChild(left); row.appendChild(right); container.appendChild(row);
  right.querySelector('.remove-btn').addEventListener('click',()=>row.remove());
}

function renderCards(data){
  const body = document.getElementById('resultsBody');
  body.innerHTML='';
  const rows = [];
  if(Array.isArray(data)){
    data.forEach(d=>{
      rows.push({name: d.pass_name||d.name||'Pass', variant: d.variant||d.id||'', price: d.price||d.total_cost||''});
    });
  } else if (data && typeof data==='object'){
    if (Array.isArray(data.valid_passes)) {
      data.valid_passes.forEach(d=>rows.push({name:d.pass_name||d.name||'Pass', variant:d.variant||'', price:d.price||''}));
    } else if (data.best_combo || data.total_cost) {
      rows.push({name: (Array.isArray(data.best_combo)?data.best_combo.join(' + '):'Best Combo'), variant:'', price:data.total_cost});
    }
  }
  rows.forEach(r=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${r.name}</td><td>${r.variant}</td><td>${r.price}</td>`;
    body.appendChild(tr);
  });
}

let currentMode = 'multi';
function setMode(mode){
  currentMode = mode;
  document.getElementById('segMulti').classList.toggle('active', mode==='multi');
  document.getElementById('segSingle').classList.toggle('active', mode==='single');
}

document.addEventListener('DOMContentLoaded', ()=>{
  addRider(); addResort();
  document.getElementById('segMulti').addEventListener('click', ()=>setMode('multi'));
  document.getElementById('segSingle').addEventListener('click', ()=>setMode('single'));
  document.getElementById('clearRidersBtn').addEventListener('click', ()=>{ document.getElementById('riders').innerHTML=''; addRider(); });
  document.getElementById('clearResortsBtn').addEventListener('click', ()=>{ document.getElementById('resorts').innerHTML=''; addResort(); });
  document.getElementById('addRiderBtn').addEventListener('click', addRider);
  document.getElementById('addResortBtn').addEventListener('click', addResort);
  document.getElementById('loadExampleBtn').addEventListener('click', ()=>{
    document.getElementById('riders').innerHTML=''; addRider();
    const rider = document.querySelector('#riders .rider');
    rider.querySelector('input[name="age"]').value = 39;
    rider.querySelector('select[name="category"]').value = 'None';
  });

  const form = document.getElementById('expertForm');
  const statusEl = document.getElementById('statusLabel');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const riders = Array.from(document.querySelectorAll('#riders .rider')).map(div=>({
      age: parseInt(div.querySelector('input[name="age"]').value,10),
      category: (div.querySelector('select[name="category"]').value || 'None')
    }));
    const resorts = Array.from(document.querySelectorAll('#resorts .resort')).map(div=>{
      const resortId = (div.querySelector('input[name="resort_id"]')?.value||'').trim();
      const days = parseInt(div.querySelector('input[name="days"]').value,10);
      const blackout_ok = div.querySelector('input[name="blackout_ok"]').checked;
      return { resort: resortId, days, blackout_ok };
    });
    if(resorts.some(r=>!r.resort || !r.days)){
      alert('Select a resort from the list and enter days.'); return;
    }

    const payload = { riders, resort_days: resorts };
    const url = currentMode === 'multi' ? MULTI_URL : SINGLE_URL;

    document.getElementById('rawRequest').textContent = JSON.stringify({url, payload}, null, 2);
    statusEl.textContent = 'Processing…'; statusEl.classList.remove('ok','err');

    try{
      const resp = await fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
      const json = await resp.json();
      document.getElementById('rawResponse').textContent = JSON.stringify(json, null, 2);
      renderCards(json);
      statusEl.textContent = 'OK'; statusEl.classList.add('ok'); statusEl.classList.remove('err');
    }catch(err){
      document.getElementById('rawResponse').textContent = String(err);
      statusEl.textContent = 'Error'; statusEl.classList.add('err'); statusEl.classList.remove('ok');
      console.error(err);
    }
  });
});
