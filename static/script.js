/* ===== Snow Genius Expert Mode - Stable Form + Typeahead (hardened) ===== */

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
function normalizeQuery(q){ return (q ?? '').toString().toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g,''); }
function resortMatches(r,q){ return [r.resort_name,r.resort_id,r.state].some(v=>normalizeQuery(v||'').includes(q)); }

function createTypeahead(container){
  const wrap=document.createElement('div'); wrap.className='ta-wrap';
  const input=document.createElement('input'); input.type='text'; input.className='ta-input'; input.placeholder='Start typing a resort…'; input.autocomplete='off'; input.inputMode='search';
  const hidden=document.createElement('input'); hidden.type='hidden'; hidden.name='resort_id';
  const list=document.createElement('ul'); list.className='ta-list'; list.hidden=true;
  let cursor=-1, current=[];

  function clearList(){ list.innerHTML=''; list.hidden=true; cursor=-1; current=[]; }
  function choose(r){ input.value=formatResortLabel(r); hidden.value=r.resort_id; clearList(); }
  function render(items){ list.innerHTML=''; current=items.slice(0,20);
    current.forEach(r=>{ const li=document.createElement('li'); li.className='ta-item'; li.textContent=formatResortLabel(r);
      li.addEventListener('mousedown',e=>{e.preventDefault(); choose(r);}); list.appendChild(li);});
    list.hidden=current.length===0; cursor=-1;
  }
  input.addEventListener('input', async ()=>{
    hidden.value=''; const q=input.value.trim(); if(q.length<3){clearList(); return;}
    await loadResortsOnce(); render(RESORTS.filter(r=>resortMatches(r, normalizeQuery(q))));
  });
  input.addEventListener('keydown', e=>{
    if(list.hidden) return;
    if(e.key==='ArrowDown'){ e.preventDefault(); cursor=Math.min(cursor+1,list.children.length-1); highlight(); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); cursor=Math.max(cursor-1,0); highlight(); }
    else if(e.key==='Enter'){ if(cursor>=0 && current[cursor]){ e.preventDefault(); choose(current[cursor]); } }
    else if(e.key==='Escape'){ clearList(); }
  });
  function highlight(){ Array.from(list.children).forEach((li,i)=>{ li.classList.toggle('active', i===cursor); if(i===cursor) li.scrollIntoView({block:'nearest'});}); }
  document.addEventListener('click', e=>{ if(!wrap.contains(e.target)) clearList(); });

  wrap.appendChild(input); wrap.appendChild(hidden); wrap.appendChild(list); container.appendChild(wrap);
}

function riderRow(){
  const row=document.createElement('div'); row.className='rider';
  row.innerHTML =
    '<input type="number" placeholder="Age" name="age" required>' +
    '<select name="category">' +
      '<option value="none">None</option>' +
      '<option value="military">Military</option>' +
      '<option value="student">Student</option>' +
      '<option value="nurse">Nurse</option>' +
    '</select>' +
    '<button type="button" class="remove-btn">Remove</button>';
  row.querySelector('.remove-btn').addEventListener('click', ()=>row.remove());
  return row;
}
function resortRow(){
  const row=document.createElement('div'); row.className='resort';
  const left=document.createElement('div'); left.className='resort-left'; createTypeahead(left);
  const right=document.createElement('div'); right.className='resort-right';
  right.innerHTML =
    '<input type="number" placeholder="Days" name="days" min="1" required>' +
    '<label class="blk"><input type="checkbox" name="blackout_ok"> Blackout OK</label>' +
    '<button type="button" class="remove-btn">Remove</button>';
  right.querySelector('.remove-btn').addEventListener('click', ()=>row.remove());
  row.appendChild(left); row.appendChild(right); return row;
}
function addRider(){ document.getElementById('riders').appendChild(riderRow()); }
function addResort(){ document.getElementById('resorts').appendChild(resortRow()); }
function clearAll(){
  document.getElementById('riders').innerHTML=''; document.getElementById('resorts').innerHTML='';
  addRider(); addResort(); setStatus('Idle'); setRaw('rawRequest',{}); setRaw('rawResponse',{}); renderCards([]);
}

function wireSegToggle(){ const segs=[...document.querySelectorAll('.segmented .seg')];
  segs.forEach(seg=>seg.addEventListener('click',()=>{ segs.forEach(s=>s.classList.remove('active')); seg.classList.add('active'); }));
}
function isMultiModeSelected(){ const a=document.querySelector('.segmented .seg.active'); return !a || a.dataset.mode==='multi'; }

function setStatus(text, cls){ const el=document.getElementById('status'); if(!el) return; el.textContent=text; el.className='status'+(cls?(' '+cls):''); }
function setRaw(id, data){ const el=document.getElementById(id); if(!el) return; try{ el.textContent=JSON.stringify(data??{},null,2); const det=el.closest('details'); if(det) det.open=true; }catch{ el.textContent=String(data); } }

document.addEventListener('DOMContentLoaded', ()=>{
  addRider(); addResort();
  wireSegToggle();
  document.getElementById('addRiderBtn').addEventListener('click', addRider);
  document.getElementById('addResortBtn').addEventListener('click', addResort);
  document.getElementById('clearAllBtn').addEventListener('click', clearAll);

  document.getElementById('expertForm').addEventListener('submit', async (e)=>{
    e.preventDefault();

    // Riders: keep Stable Form's lowercase categories
    const riders = [...document.querySelectorAll('#riders .rider')].map(div => ({
      age: parseInt((div.querySelector('input[name="age"]').value ?? '').toString().trim(), 10),
      category: (div.querySelector('select[name="category"]').value ?? 'none').toString().trim()
    })).filter(r => Number.isFinite(r.age));

    // Resorts: only keep selected rows (resort_id present)
    const resorts = [...document.querySelectorAll('#resorts .resort')].map(div => {
      const resort_id = (div.querySelector('input[name="resort_id"]')?.value ?? '').toString().trim();
      const days = parseInt((div.querySelector('input[name="days"]').value ?? '').toString().trim(), 10);
      const blackout_ok = !!div.querySelector('input[name="blackout_ok"]').checked;
      return { resort_id, days, blackout_ok };
    }).filter(r => r.resort_id && Number.isFinite(r.days));

    if (!riders.length || !resorts.length) {
      alert('Please add at least one rider and one resort (select from the list) and enter days.');
      return;
    }

    const multi = isMultiModeSelected();
    const url = multi
      ? 'https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass'
      : 'https://pass-picker-expert-mode.onrender.com/expert_mode/calculate';

    // 🔑 Server expectations:
    // - Multi: resort_days[{ resort: <id>, days, blackout_ok }]
    // - Single: resort_plan[{ resort_id: <id>, days, blackout_ok }]
    const payload = { riders };
    if (multi) {
      payload.resort_days = resorts.map(r => ({ resort: r.resort_id, days: r.days, blackout_ok: r.blackout_ok }));
    } else {
      payload.resort_plan = resorts.map(r => ({ resort_id: r.resort_id, days: r.days, blackout_ok: r.blackout_ok }));
    }

    setRaw('rawRequest', { url, payload });
    setStatus('Processing…');

    try{
      const resp = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await resp.json();
      setRaw('rawResponse', data);
      setStatus(resp.ok ? 'OK' : 'Error', resp.ok ? 'ok' : 'err');
      renderCards(data);
    }catch(err){
      console.error(err);
      setRaw('rawResponse', { error:String(err) });
      setStatus('Error', 'err');
      alert('Request failed: ' + (err?.message || err));
    }
  });
});