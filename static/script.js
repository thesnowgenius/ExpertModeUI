// Stable-4 compatible script (no selector).
const API_URL = (new URLSearchParams(location.search).get('api') || '').trim() || 'https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass';
let RESORTS = [];
let riders = [];
let resortRows = [];

async function loadResorts(){
  try{
    const r = await fetch('static/resorts.json').then(x=>x.json());
    if(!Array.isArray(r)) throw new Error('resorts.json must be an array');
    RESORTS = r;
  }catch(e){
    console.error('Failed to load resorts.json', e);
    alert('Could not load resorts.json.');
  }
}

function init(){
  const addRiderBtn = document.querySelector('[data-action="add-rider"]') || document.getElementById('addRider');
  const ridersBox   = document.getElementById('ridersBox') || document.getElementById('riders');
  const addResortBtn= document.querySelector('[data-action="add-resort"]') || document.getElementById('addResort');
  const resortsBox  = document.getElementById('resortsBox') || document.getElementById('resorts');
  const submitBtn   = document.querySelector('[data-action="submit"]') || document.getElementById('solve');
  const noWeekends  = document.getElementById('no_weekends_global') || document.getElementById('no_weekends');
  const noBlackouts = document.getElementById('no_blackouts_global') || document.getElementById('no_blackouts');
  const rawReqEl    = document.getElementById('rawRequest');
  const rawResEl    = document.getElementById('rawResponse');
  const resultsEl   = document.getElementById('solutions') || document.getElementById('results');

  function addRiderRow(preset){
    const row = document.createElement('div');
    row.className = 'row rider-row';
    row.innerHTML = `
      <input class="rider-age" type="number" min="0" placeholder="Age" value="${(preset && preset.age) || 30}"/>
      <select class="rider-category">
        <option value="">None</option>
        <option value="military">Military</option>
        <option value="student">Student</option>
        <option value="nurse">Nurse</option>
      </select>
      <button type="button" class="remove small">Remove</button>
    `;
    const ageEl = row.querySelector('.rider-age');
    const catEl = row.querySelector('.rider-category');
    const btn   = row.querySelector('.remove');
    const obj   = {name:'Rider '+(riders.length+1), age:+ageEl.value, category:catEl.value||null, _row:row};
    ageEl.oninput = ()=> obj.age = +ageEl.value;
    catEl.oninput = ()=> obj.category = catEl.value || null;
    btn.onclick = ()=>{ row.remove(); riders = riders.filter(x=>x!==obj); };
    riders.push(obj);
    ridersBox.appendChild(row);
  }

  function attachTypeahead(input, onSelect){
    let box;
    input.addEventListener('input', ()=>{
      const q = input.value.trim().toLowerCase();
      if(box) box.remove();
      if(!q) return;
      const matches = RESORTS.filter(r => (r.name||'').toLowerCase().includes(q) || (r.id||'').toLowerCase()===q).slice(0,8);
      if(!matches.length) return;
      box = document.createElement('div');
      box.className = 'typeahead';
      box.style.position='absolute'; box.style.background='#fff'; box.style.border='1px solid #ddd'; box.style.zIndex='1000';
      matches.forEach(m=>{
        const item = document.createElement('div');
        item.textContent = m.name || m.id;
        item.style.padding='6px 8px'; item.style.cursor='pointer';
        item.onmousedown = ()=>{ onSelect(m); box.remove(); };
        box.appendChild(item);
      });
      const rect = input.getBoundingClientRect();
      box.style.left = rect.left + 'px';
      box.style.top  = (rect.bottom + window.scrollY) + 'px';
      box.style.width= rect.width + 'px';
      document.body.appendChild(box);
    });
    input.addEventListener('blur', ()=> setTimeout(()=> box && box.remove(), 200));
  }

  function addResortRow(preset){
    const row = document.createElement('div');
    row.className='row resort-row';
    row.innerHTML = `
      <input class="resort-input" placeholder="Start typing a resort..." />
      <input class="resort-days" type="number" min="1" placeholder="Days" value="${(preset && preset.days) || 1}"/>
      <label class="inline"><input type="checkbox" class="resort-blackout-ok"> Blackout OK</label>
      <button type="button" class="remove small">Remove</button>
    `;
    const inputEl   = row.querySelector('.resort-input');
    const daysEl    = row.querySelector('.resort-days');
    const blackoutEl= row.querySelector('.resort-blackout-ok');
    const remBtn    = row.querySelector('.remove');

    const obj = {inputEl, daysEl, blackoutEl, selected: null, _row:row};
    attachTypeahead(inputEl, (m)=>{
      inputEl.value = m.name || m.id;
      obj.selected = {id: m.id || m.name, name: m.name || m.id};
    });
    remBtn.onclick = ()=>{ row.remove(); resortRows = resortRows.filter(x=>x!==obj); };
    resortRows.push(obj);
    resortsBox.appendChild(row);
  }

  function buildPayload(){
    const payload = {
      riders: riders.map((r,i)=>({name: r.name || `Rider ${i+1}`, age: r.age, category: r.category})),
      resorts: resortRows.map(rr => {
        const name = rr.inputEl.value.trim();
        const sel  = rr.selected;
        return {
          id: sel && sel.id ? sel.id : null,
          name: name || (sel && sel.name) || null,
          days: +(rr.daysEl.value || 0),
          no_blackouts: !rr.blackoutEl.checked ? true : false
        };
      }),
      no_weekends: !!noWeekends?.checked,
      no_blackouts: !!noBlackouts?.checked,
      mode: 'auto'
    };
    return payload;
  }

  async function submit(){
    const payload = buildPayload();
    const rawReqEl = document.getElementById('rawRequest');
    const rawResEl = document.getElementById('rawResponse');
    const resultsEl= document.getElementById('solutions') || document.getElementById('results');
    if(rawReqEl) rawReqEl.textContent = JSON.stringify(payload, null, 2);
    try{
      const res = await fetch(API_URL, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
      const data = await res.json();
      if(rawResEl) rawResEl.textContent = JSON.stringify(data, null, 2);
      if(resultsEl){
        resultsEl.innerHTML='';
        if(!data.results || !data.results.length){
          resultsEl.textContent = 'No exact solution returned.';
        }else{
          data.results.forEach(sol=>{
            const div = document.createElement('div');
            div.className='result-card';
            div.textContent = `${sol.strategy||'strategy'} — ${sol.pass_count||'?'} pass(es)`;
            resultsEl.appendChild(div);
          });
        }
      }
    }catch(e){
      alert('Request failed: '+e.message);
      console.error(e);
    }
  }

  // Defaults
  (function(){ addRiderRow({age:30}); addResortRow(); })();

  if(addRiderBtn) addRiderBtn.addEventListener('click', (e)=>{ e.preventDefault(); addRiderRow(); });
  if(addResortBtn) addResortBtn.addEventListener('click', (e)=>{ e.preventDefault(); addResortRow(); });
  if(submitBtn)    submitBtn.addEventListener('click', (e)=>{ e.preventDefault(); submit(); });
}

window.addEventListener('DOMContentLoaded', async ()=>{ await loadResorts(); init(); });
