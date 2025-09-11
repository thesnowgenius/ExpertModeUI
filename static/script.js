
/* Expert Mode UI — Stable-4 hotfix v7 (minimal, targeted)
 * - Keep your existing HTML/CSS and IDs; attaches defensively.
 * - Guarantees one rider & one resort row on load.
 * - Typeahead backed by static/resorts.json (id+name), supports Enter/↑/↓.
 * - Sends {id,name,days,no_weekends,no_blackouts} per resort.
 * - If logo img has id=brand-logo or logo and no src, set src="static/logo.png".
 */
(function(){
  const API_URL = "https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass";

  const $ = (ids)=> ids.map(id=>document.getElementById(id)).find(Boolean) || null;
  const ridersBox  = $(["riders","rider-rows","riderList","rider_list"]);
  const resortsBox = $(["resorts","resort-rows","resortList","resort_list"]);
  const addRider   = $(["addRider","add-rider","add_rider"]);
  const addResort  = $(["addResort","add-resort","add_resort"]);
  const clearBtn   = $(["clear","clearAll","reset"]);
  const submitBtn  = $(["submit","solve"]);
  const rawReqEl   = $(["raw-request","rawRequest"]);
  const rawResEl   = $(["raw-response","rawResponse"]);
  const logo       = $(["brand-logo","logo"]);
  if (logo && !logo.getAttribute("src")) logo.setAttribute("src","static/logo.png");

  let RESORTS = [];
  fetch("static/resorts.json",{cache:"no-store"}).then(r=>r.json()).then(a=>{RESORTS=Array.isArray(a)?a:[];});

  const toInt = (v)=>{ const n=parseInt(v,10); return Number.isFinite(n)?n:0; };
  const qMatch = (r,q)=> (r.name||"").toLowerCase().includes(q) || (r.id||"").toLowerCase()===q;
  const bestIdFor = (txt)=>{
    const q=(txt||"").trim().toLowerCase(); if(!q) return null;
    let hit = RESORTS.find(r=> (r.id||"").toLowerCase()===q || (r.name||"").toLowerCase()===q);
    if (hit) return hit.id || hit.name || null;
    hit = RESORTS.find(r=> (r.name||"").toLowerCase().startsWith(q));
    return hit ? (hit.id || hit.name || null) : null;
  };

  function el(html){ const t=document.createElement("template"); t.innerHTML=html.trim(); return t.content.firstChild; }

  function riderRow(d={age:30,category:""}){
    const row = el(`<div class="rider-row" style="display:flex;gap:.5rem;align-items:center">
      <input type="number" class="age" min="0" value="${d.age}" placeholder="Age">
      <select class="cat">
        <option value="">Category: None</option>
        <option value="military">Military</option>
        <option value="student">Student</option>
        <option value="nurse">Nurse/Doc</option>
      </select>
      <button type="button" class="remove">Remove</button>
    </div>`);
    row.querySelector(".cat").value = d.category || "";
    row.querySelector(".remove").onclick = ()=> row.remove();
    return row;
  }

  function attachTypeahead(input, state){
    let box=null, sel=-1;
    function close(){ if(box){ box.remove(); box=null; sel=-1; } }
    function render(matches){
      close(); if(!matches.length) return;
      const rect = input.getBoundingClientRect();
      box = el(`<div class="sg-ta" style="position:absolute;z-index:50;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.08);max-height:240px;overflow:auto"></div>`);
      box.style.left = rect.left + window.scrollX + "px";
      box.style.top  = rect.bottom + window.scrollY + "px";
      box.style.width= rect.width + "px";
      matches.forEach(m=>{
        const item = el(`<div class="opt" style="padding:8px 10px;cursor:pointer">${m.name}</div>`);
        item.onmousedown = ()=>{ input.value=m.name; state.id=m.id||m.name; state.name=m.name||m.id; close(); };
        box.appendChild(item);
      });
      document.body.appendChild(box);
    }
    input.addEventListener("input", ()=>{
      const q=input.value.trim().toLowerCase();
      if(q.length<2){ close(); return; }
      render(RESORTS.filter(r=>qMatch(r,q)).slice(0,8));
    });
    input.addEventListener("keydown", (e)=>{
      if(!box) return;
      const items=[...box.children];
      if(e.key==="ArrowDown"){ sel=Math.min(items.length-1, sel+1); e.preventDefault();}
      if(e.key==="ArrowUp"){ sel=Math.max(0, sel-1); e.preventDefault();}
      if(e.key==="Enter" && sel>=0){ items[sel].dispatchEvent(new Event("mousedown")); e.preventDefault();}
      items.forEach((it,i)=> it.style.background=(i===sel)?"#f3f4f6":"#fff");
    });
    input.addEventListener("blur", ()=> setTimeout(close,150));
  }

  function resortRow(){
    const row = el(`<div class="resort-row" style="display:grid;grid-template-columns:1fr 90px 150px 180px 90px;gap:.5rem;align-items:center">
      <input type="text" class="resort" placeholder="Start typing a resort…">
      <input type="number" class="days" value="1" min="1">
      <label class="inline"><input type="checkbox" class="no_weekends"> No weekends</label>
      <label class="inline"><input type="checkbox" class="no_blackouts"> No blackout dates</label>
      <button type="button" class="remove">Remove</button>
    </div>`);
    const state={id:null,name:null};
    attachTypeahead(row.querySelector(".resort"), state);
    row.querySelector(".remove").onclick = ()=> row.remove();
    row._state = state;
    return row;
  }

  function ensureDefaults(){
    if (ridersBox && !ridersBox.querySelector(".rider-row")) ridersBox.appendChild(riderRow());
    if (resortsBox && !resortsBox.querySelector(".resort-row")) resortsBox.appendChild(resortRow());
  }

  if (addRider)  addRider.onclick  = ()=> ridersBox && ridersBox.appendChild(riderRow());
  if (addResort) addResort.onclick = ()=> resortsBox && resortsBox.appendChild(resortRow());
  if (clearBtn)  clearBtn.onclick  = ()=> { if(ridersBox) ridersBox.innerHTML=""; if(resortsBox) resortsBox.innerHTML=""; ensureDefaults(); };

  async function submit(){
    ensureDefaults();
    const riders = ridersBox ? [...ridersBox.querySelectorAll(".rider-row")].map((r,i)=>({
      name: "Rider "+(i+1),
      age: toInt(r.querySelector(".age")?.value||0),
      category: (r.querySelector(".cat")?.value||"") || null,
    })) : [];
    const resorts = resortsBox ? [...resortsBox.querySelectorAll(".resort-row")].map(r=>{
      const t = r.querySelector(".resort")?.value || "";
      const id = (r._state && r._state.id) || bestIdFor(t);
      return {
        id, name: (r._state && r._state.name) || t || null,
        days: toInt(r.querySelector(".days")?.value||0),
        no_weekends: !!r.querySelector(".no_weekends")?.checked,
        no_blackouts: !!r.querySelector(".no_blackouts")?.checked,
      };
    }) : [];
    const payload = { riders, resorts, mode:"auto" };
    if (rawReqEl) rawReqEl.textContent = JSON.stringify(payload,null,2);
    try{
      const res = await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const data = await res.json();
      if (rawResEl) rawResEl.textContent = JSON.stringify(data,null,2);
    }catch(e){
      if (rawResEl) rawResEl.textContent = JSON.stringify({error:e.message},null,2);
    }
  }

  if (submitBtn) submitBtn.onclick = (e)=>{ e.preventDefault(); submit(); };
  ensureDefaults();
})();
