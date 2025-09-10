// Configuration
const API_URL = (new URLSearchParams(location.search).get('api') || '').trim() || 'https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass';
const RESORTS_URL = 'resorts.json'; // expects full resorts.json in same directory (no fake data).

// State
let riders = [];
let resorts = [];
const categories = ['none','military','student','nurse'];

// UI helpers
function el(tag, attrs={}, ...children){
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{
    if(k==='class') e.className = v;
    else if(k==='for') e.htmlFor = v;
    else e.setAttribute(k,v);
  });
  children.flat().forEach(c=>{
    if(typeof c==='string') e.appendChild(document.createTextNode(c));
    else if(c) e.appendChild(c);
  });
  return e;
}

function addRider(r){
  const idx = riders.length;
  const row = el('div', {class:'row'});
  const name = el('input', {placeholder:'Name', value: (r && r.name) || `Rider ${idx+1}`});
  const age = el('input', {type:'number', min:'0', class:'small', placeholder:'Age', value:(r && r.age) || 30});
  const cat = el('select', {},
    ...categories.map(c => el('option', {value:c, selected: (r && r.category)===c}, c))
  );
  row.append(name, age, cat, el('button',{class:'secondary'},'Remove'));
  row.querySelector('button').onclick = ()=>{
    row.remove();
    riders = riders.filter(x => x._row !== row);
  };
  const obj = {name:name.value, age:+age.value, category:cat.value, _row:row};
  name.oninput = () => obj.name = name.value;
  age.oninput = () => obj.age = +age.value;
  cat.oninput = () => obj.category = cat.value;
  riders.push(obj);
  document.getElementById('riders').appendChild(row);
}

function addResortRow(rr){
  const row = el('div', {class:'row'});
  const resort = el('input', {placeholder:'Resort (typeahead)', value: (rr && rr.resort)||''});
  const days = el('input', {type:'number', min:'1', class:'small', placeholder:'Days', value:(rr && rr.days)||1});
  const blackout = el('select', {}, el('option',{value:'false'},'Blackouts OK'), el('option',{value:'true', selected: rr&&rr.blackout_true===true},'No Blackouts'));
  const remove = el('button',{class:'secondary'},'Remove');
  row.append(resort, days, blackout, remove);
  remove.onclick = ()=>{
    row.remove();
    resorts = resorts.filter(x => x._row !== row);
  };
  const obj = {resort: resort.value, days:+days.value, blackout_true:(blackout.value==='true'), _row:row};
  resort.oninput = ()=> obj.resort = resort.value;
  days.oninput = ()=> obj.days = +days.value;
  blackout.oninput = ()=> obj.blackout_true = (blackout.value==='true');
  resorts.push(obj);
  document.getElementById('resorts').appendChild(row);
  attachTypeahead(resort);
}

// Minimal typeahead using full resorts.json
let RESORTS = [];
async function loadResorts(){
  try{
    const r = await fetch(RESORTS_URL);
    RESORTS = await r.json();
  }catch(e){
    console.error('Failed to load resorts.json', e);
  }
}
function attachTypeahead(input){
  let box;
  input.addEventListener('input', ()=>{
    const q = input.value.trim().toLowerCase();
    if(box) box.remove();
    if(!q) return;
    const matches = RESORTS.filter(r => (r.name||'').toLowerCase().includes(q)).slice(0,8);
    if(!matches.length) return;
    box = el('div', {class:'typeahead'});
    Object.assign(box.style, {position:'absolute', background:'#0e121a', border:'1px solid #2a2f3a', zIndex:'9999'});
    matches.forEach(m=>{
      const item = el('div', {class:'item'}, m.name);
      Object.assign(item.style, {padding:'6px 8px', cursor:'pointer'});
      item.onmousedown = () => { input.value = m.name; input.dispatchEvent(new Event('input')); box.remove(); };
      box.appendChild(item);
    });
    const rect = input.getBoundingClientRect();
    box.style.left = rect.left + 'px'; box.style.top = (rect.bottom + window.scrollY) + 'px'; box.style.width = rect.width + 'px';
    document.body.appendChild(box);
  });
  input.addEventListener('blur', () => setTimeout(()=> box && box.remove(), 200));
}

// Build request payload in unified shape
function buildPayload(){
  return {
    riders: riders.map(r => ({name:r.name, age:r.age, category:(r.category==='none'?null:r.category)})),
    resorts: resorts.map(x => ({name:x.resort, days:x.days, no_blackouts: x.blackout_true})),
    no_weekends: document.getElementById('no_weekends').checked,
    no_blackouts: document.getElementById('no_blackouts').checked,
    mode: 'auto' // backend will try single -> multi -> closest-coverage
  };
}

// Render helpers
function renderSolutions(resp){
  const host = document.getElementById('solutions');
  host.innerHTML='';
  if(!resp || !resp.results || !resp.results.length){
    host.appendChild(el('div', {}, 'No exact solution. Showing closest/cheapest if available.'));
    return;
  }
  resp.results.forEach(sol => {
    const card = el('div', {class:'result-card'});
    card.appendChild(el('div', {}, el('span',{class:'badge'}, sol.strategy || 'unknown'), el('span',{class:'badge'}, `${sol.pass_count} pass(es)`)));
    if(sol.passes){
      sol.passes.forEach(p => {
        card.appendChild(el('div', {}, `${p.pass_id} — ${p.name || ''} — $${p.price || 'N/A'} — days:${p.total_days}`));
      });
    }
    if(sol.unmet){
      card.appendChild(el('div', {}, 'Unmet days: ' + JSON.stringify(sol.unmet)));
    }
    host.appendChild(card);
  });
}

document.getElementById('addRider').onclick = ()=> addRider();
document.getElementById('addResort').onclick = ()=> addResortRow();
document.getElementById('reset').onclick = ()=> location.reload();
document.getElementById('solve').onclick = async () => {
  const payload = buildPayload();
  document.getElementById('rawRequest').textContent = JSON.stringify(payload, null, 2);
  try{
    const r = await fetch(API_URL, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
    const data = await r.json();
    document.getElementById('rawResponse').textContent = JSON.stringify(data, null, 2);
    renderSolutions(data);
  }catch(e){
    document.getElementById('rawResponse').textContent = 'Request failed: ' + e.message;
  }
};

// Initialize
addRider({name:'Rider 1', age:30, category:'none'});
addResortRow();
loadResorts();
