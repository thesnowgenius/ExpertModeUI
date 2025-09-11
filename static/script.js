const API_URL = (new URLSearchParams(location.search).get('api') || '').trim() || 'https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass';

let RESORTS = []; // [{id,name,...}]

async function loadResorts(){
  try{
    const data = await fetch('static/resorts.json').then(r=>r.json());
    if(!Array.isArray(data)) throw new Error('resorts.json must be array');
    RESORTS = data;
  }catch(e){
    console.error('Failed to load resorts.json', e);
  }
}

function typeahead(input, onPick){
  let box;
  function close(){ if(box){ box.remove(); box = null; } }
  input.addEventListener('input', ()=>{
    const q = input.value.trim().toLowerCase();
    close();
    if(!q) return;
    const matches = RESORTS.filter(r => (r.name||'').toLowerCase().includes(q) || (r.id||'').toLowerCase()===q).slice(0,8);
    if(!matches.length) return;
    box = document.createElement('div'); box.className='typeahead';
    const rect = input.getBoundingClientRect();
    box.style.left = rect.left + 'px';
    box.style.top  = (rect.bottom + window.scrollY) + 'px';
    box.style.width= rect.width + 'px';
    matches.forEach(m=>{
      const d = document.createElement('div');
      d.textContent = m.name || m.id; d.onclick = ()=>{ onPick(m); close(); };
      box.appendChild(d);
    });
    document.body.appendChild(box);
  });
  input.addEventListener('blur', ()=> setTimeout(close, 200));
}

function riderRow(defaults={age:30, category:""}){
  const row = document.createElement('div');
  row.className='row';
  row.innerHTML = `
    <input type="number" class="age" min="0" placeholder="Age" value="${defaults.age}">
    <select class="cat">
      <option value="">Category: None</option>
      <option value="military">Military</option>
      <option value="student">Student</option>
      <option value="nurse">Nurse/Doc</option>
    </select>
    <button class="btn ghost remove">Remove</button>
  `;
  row.querySelector('.cat').value = defaults.category || "";
  row.querySelector('.remove').onclick = ()=> row.remove();
  return row;
}

function resortRow(){
  const row = document.createElement('div');
  row.className='grid row';
  row.innerHTML = `
    <div><input type="text" class="resort" placeholder="Start typing a resort..."></div>
    <div><input type="number" class="days" min="1" value="1"></div>
    <div><label class="inline"><input type="checkbox" class="no_weekends"> No weekends</label></div>
    <div><label class="inline"><input type="checkbox" class="no_blackouts"> No blackout dates</label></div>
    <div><button class="btn ghost remove">Remove</button></div>
  `;
  const input = row.querySelector('.resort');
  const state = {id:null, name:null};
  typeahead(input, (m)=>{ input.value = m.name || m.id; state.id = m.id || m.name; state.name = m.name || m.id; });
  row.querySelector('.remove').onclick = ()=> row.remove();
  row._state = state;
  return row;
}

function buildPayload(){
  const riders = Array.from(document.querySelectorAll('#riders .row')).map((r,i)=>{
    return {
      name: `Rider ${i+1}`,
      age: Number(r.querySelector('.age').value || 0),
      category: (r.querySelector('.cat').value || null)
    };
  });
  const resorts = Array.from(document.querySelectorAll('#resorts .row')).map(r => {
    const s = r._state || {};
    return {
      id: s.id,
      name: s.name || r.querySelector('.resort').value.trim() || null,
      days: Number(r.querySelector('.days').value || 0),
      no_weekends: !!r.querySelector('.no_weekends').checked,
      no_blackouts: !!r.querySelector('.no_blackouts').checked
    };
  });
  return { riders, resorts, mode: 'auto' };
}

async function submit(){
  const payload = buildPayload();
  document.getElementById('rawRequest').textContent = JSON.stringify(payload, null, 2);
  try{
    const res = await fetch(API_URL, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
    const data = await res.json();
    document.getElementById('rawResponse').textContent = JSON.stringify(data, null, 2);
    renderResults(data);
  }catch(e){
    document.getElementById('rawResponse').textContent = JSON.stringify({error: e.message}, null, 2);
  }
}

function renderResults(data){
  const box = document.getElementById('results'); box.innerHTML='';
  if(!data || !Array.isArray(data.results) || !data.results.length){
    box.textContent = 'No exact solution. Showing nothing.'; return;
  }
  data.results.forEach(r=>{
    const d = document.createElement('div'); d.className='result';
    const count = (r.pass_count!=null)? r.pass_count : (r.passes? r.passes.length : '?');
    d.innerHTML = `<strong>${r.strategy||''}</strong> — ${count} pass(es)`;
    box.appendChild(d);
  });
}

function boot(){
  document.getElementById('addRider').onclick = ()=> document.getElementById('riders').appendChild(riderRow());
  document.getElementById('addResort').onclick= ()=> document.getElementById('resorts').appendChild(resortRow());
  document.getElementById('clearAll').onclick = ()=>{ document.getElementById('riders').innerHTML=''; document.getElementById('resorts').innerHTML=''; };
  document.getElementById('solve').onclick    = (e)=>{ e.preventDefault(); submit(); };

  // default rows
  document.getElementById('riders').appendChild(riderRow());
  document.getElementById('resorts').appendChild(resortRow());
}

window.addEventListener('DOMContentLoaded', async ()=>{ await loadResorts(); boot(); });
