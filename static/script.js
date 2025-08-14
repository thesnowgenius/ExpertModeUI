/* Expert Mode (Stable Form)
   - Clean UI (no URL bars)
   - Toggle Multi/Single API
   - Riders + Resorts add/clear, with age & blackout_ok
   - Strong validation & input sanitization (prevents NoneType.strip server errors)
   - Results filter + sort
   - Auto-height postMessage for Squarespace embeds
*/
(() => {
  // ---- Endpoints
  const MULTI_API  = 'https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass';
  const SINGLE_API = 'https://pass-picker-expert-mode.onrender.com/expert_mode/calculate';

  // ---- Helpers
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const el = (t, c) => { const n = document.createElement(t); if (c) n.className = c; return n; };
  const toStr  = (v, d='') => (v === null || v === undefined) ? d : String(v);
  const toInt  = (v, d=0)  => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; };
  const toBool = (v)      => !!v;
  const setJSON = (node, obj) => node.textContent = JSON.stringify(obj, null, 2);

  // ---- Elements
  const modeHidden = $('#mode');
  const segMulti   = $('#mode-multi');
  const segSingle  = $('#mode-single');

  const ridersWrap  = $('#riders');
  const resortsWrap = $('#resorts');

  const btnAddRider    = $('#addRider');
  const btnClearRiders = $('#clearRiders');
  const btnAddResort   = $('#addResort');
  const btnClearResorts= $('#clearResorts');

  const btnSubmit = $('#submit');
  const btnReset  = $('#resetAll');
  const btnExample= $('#loadExample');

  const statusEl  = $('#status');
  const rawEl     = $('#raw');
  const reqEl     = $('#req');

  const resultsWrap = $('#resultsTable');
  const filterText  = $('#filterText');
  const sortKeySel  = $('#sortKey');
  const sortDirBtn  = $('#sortDir');

  // ---- State
  let mode = 'multi';
  let lastRows = [];
  let sortAsc = true;

  // ---- Mode toggle
  function setMode(next) {
    mode = next;
    modeHidden.value = next;
    segMulti.classList.toggle('active', next === 'multi');
    segSingle.classList.toggle('active', next === 'single');
    segMulti.setAttribute('aria-selected', String(next === 'multi'));
    segSingle.setAttribute('aria-selected', String(next === 'single'));
    postHeightSoon();
  }
  segMulti.addEventListener('click', () => setMode('multi'));
  segSingle.addEventListener('click', () => setMode('single'));

  // ---- Row builders (Stable Form style)
  function riderRow(age=39, category='None') {
    const row = el('div', 'riderline');

    const ageField = el('div', 'field');
    const ageLabel = el('label'); ageLabel.textContent = 'Age';
    const ageInput = el('input'); ageInput.type='number'; ageInput.min='0'; ageInput.value=String(age);
    ageField.append(ageLabel, ageInput);

    const catField = el('div', 'field');
    const catLabel = el('label'); catLabel.textContent = 'Category';
    const sel = el('select');
    ['None','Student','Military','Nurse'].forEach(v => {
      const o = el('option'); o.value=v; o.textContent=v; if (v===category) o.selected=true; sel.append(o);
    });
    catField.append(catLabel, sel);

    const del = el('button','btn'); del.type='button'; del.title='Remove'; del.textContent='✕';
    del.addEventListener('click', () => { row.remove(); postHeightSoon(); });

    row.append(ageField, catField, del);
    return row;
  }

  function resortRow(resort='loon', days=7, blackout_ok=false) {
    const row = el('div','rowline');

    const resField = el('div','field');
    const resLabel = el('label'); resLabel.textContent='Resort';
    const resInput = el('input'); resInput.type='text'; resInput.placeholder='e.g., loon'; resInput.value=toStr(resort);
    resField.append(resLabel, resInput);

    const daysField = el('div','field');
    const daysLabel = el('label'); daysLabel.textContent='Days';
    const daysInput = el('input'); daysInput.type='number'; daysInput.min='1'; daysInput.value=String(days);
    daysField.append(daysLabel, daysInput);

    const inline = el('div','inline');
    const box = el('input'); box.type='checkbox'; box.checked=!!blackout_ok; box.id = `bo_${Math.random().toString(36).slice(2,7)}`;
    const boxLabel = el('label'); boxLabel.setAttribute('for', box.id); boxLabel.textContent='Blackout OK';
    inline.append(box, boxLabel);
    const boxField = el('div','field'); boxField.append(inline);

    const del = el('button','btn'); del.type='button'; del.title='Remove'; del.textContent='✕';
    del.addEventListener('click', () => { row.remove(); postHeightSoon(); });

    row.append(resField, daysField, boxField, del);
    return row;
  }

  // ---- CRUD buttons
  btnAddRider.addEventListener('click', () => { ridersWrap.append(riderRow()); postHeightSoon(); });
  btnClearRiders.addEventListener('click', () => { ridersWrap.innerHTML=''; postHeightSoon(); });

  btnAddResort.addEventListener('click', () => { resortsWrap.append(resortRow()); postHeightSoon(); });
  btnClearResorts.addEventListener('click', () => { resortsWrap.innerHTML=''; postHeightSoon(); });

  btnReset.addEventListener('click', () => {
    ridersWrap.innerHTML=''; resortsWrap.innerHTML='';
    setMode('multi');
    status('');
    resultsWrap.innerHTML='';
    setJSON(rawEl, {}); setJSON(reqEl, {});
    filterText.value=''; sortKeySel.innerHTML=''; sortAsc=true; sortDirBtn.textContent='Asc';
    postHeightSoon();
  });

  btnExample.addEventListener('click', () => {
    ridersWrap.innerHTML=''; resortsWrap.innerHTML='';
    ridersWrap.append(riderRow(39,'None'));
    resortsWrap.append(resortRow('loon',7,false));
    resortsWrap.append(resortRow('okemo',10,false));
    postHeightSoon();
  });

  // ---- Read + validation (prevents NoneType.strip on server)
  function readRiders() {
    return $$('.riderline').map(line => {
      const [ageField, catField] = $$('.field', line);
      const age = toInt($('input', ageField).value, 0);
      let category = toStr($('select', catField).value, 'None').trim();
      if (!category) category = 'None';
      return { age, category };
    });
  }

  function readResorts() {
    return $$('.rowline').map(line => {
      const [resField, daysField, boxField] = $$('.field', line);
      let resort = toStr($('input', resField).value, '').trim().toLowerCase();
      const days = toInt($('input', daysField).value, 0);
      const blackout_ok = toBool($('input[type="checkbox"]', boxField).checked);
      return { resort, days, blackout_ok };
    });
  }

  function validate(riders, resorts) {
    if (!riders.length) return 'Add at least one rider.';
    if (riders.some(r => !Number.isFinite(r.age) || r.age < 0)) return 'Rider ages must be 0 or higher.';
    if (riders.some(r => !toStr(r.category).trim())) return 'Each rider needs a category. Use "None" if not applicable.';
    if (!resorts.length) return 'Add at least one resort.';
    if (resorts.some(p => !toStr(p.resort).trim())) return 'Every resort row needs a resort id/name.';
    if (resorts.some(p => !Number.isFinite(p.days) || p.days <= 0)) return 'Days must be 1 or higher for each resort.';
    return null;
  }

  // ---- Network
  async function postJson(url, body) {
    const r = await fetch(url, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    });
    const text = await r.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch {
      throw new Error(`HTTP ${r.status} ${r.statusText}\n\n${text.slice(0,1200)}`);
    }
    if (!r.ok) {
      const msg = data?.detail?.error || data?.error || JSON.stringify(data, null, 2);
      throw new Error(`HTTP ${r.status} ${r.statusText}\n\n${msg}`);
    }
    return data;
  }

  function status(msg, cls='') {
    statusEl.className = `status ${cls}`.trim();
    statusEl.textContent = msg || '';
  }

  // ---- Results utilities (filter & sort)
  function extractRows(json) {
    if (Array.isArray(json)) return json;
    if (!json || typeof json !== 'object') return [];
    const keys = ['results','solutions','options','passes','items','data','choices'];
    for (const k of keys) if (Array.isArray(json[k])) return json[k];
    return [];
  }

  function applyFilter(rows, query) {
    const q = toStr(query).toLowerCase();
    if (!q) return rows;
    return rows.filter(row =>
      Object.values(row || {}).some(v => String(v).toLowerCase().includes(q))
    );
  }

  function buildTable(rows) {
    resultsWrap.innerHTML = '';
    if (!rows.length) {
      resultsWrap.innerHTML = '<div class="status">No tabular results to display.</div>';
      sortKeySel.innerHTML = '';
      return;
    }
    const cols = new Set();
    rows.forEach(r => Object.keys(r || {}).forEach(k => cols.add(k)));
    const columns = Array.from(cols);

    const numeric = columns.filter(k => rows.every(r => typeof r?.[k] === 'number'));
    const others  = columns.filter(k => !numeric.includes(k));
    sortKeySel.innerHTML = '';
    [...numeric, ...others].forEach(k => {
      const o = el('option'); o.value=k; o.textContent=k; sortKeySel.append(o);
    });

    const key = sortKeySel.value || sortKeySel.options[0]?.value;
    if (key && sortKeySel.value !== key) sortKeySel.value = key;

    const sorted = [...rows].sort((a,b) => {
      const av = a?.[key]; const bv = b?.[key];
      if (typeof av === 'number' && typeof bv === 'number') return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

    const table = document.createElement('table');
    const thead = document.createElement('thead'); const trh = document.createElement('tr');
    columns.forEach(c => { const th = document.createElement('th'); th.textContent = c; trh.append(th); });
    thead.append(trh);

    const tbody = document.createElement('tbody');
    sorted.forEach(row => {
      const tr = document.createElement('tr');
      columns.forEach(c => {
        const td = document.createElement('td');
        const v = row?.[c];
        td.textContent = (v !== null && v !== undefined) ? (typeof v === 'object' ? JSON.stringify(v) : String(v)) : '';
        tr.append(td);
      });
      tbody.append(tr);
    });

    table.append(thead, tbody);
    resultsWrap.append(table);
  }

  // ---- Sort/Filter events
  filterText.addEventListener('input', () => buildTable(applyFilter(lastRows, filterText.value)));
  sortKeySel.addEventListener('change', () => buildTable(applyFilter(lastRows, filterText.value)));
  sortDirBtn.addEventListener('click', () => {
    sortAsc = !sortAsc;
    sortDirBtn.textContent = sortAsc ? 'Asc' : 'Desc';
    buildTable(applyFilter(lastRows, filterText.value));
  });

  // ---- Submit
  btnSubmit.addEventListener('click', async () => {
    const riders = readRiders();
    const resorts = readResorts();

    const err = validate(riders, resorts);
    if (err) { status(err, 'err'); return; }

    // Ensure safe strings/bools
    riders.forEach(r => { r.category = toStr(r.category,'None').trim() || 'None'; });
    resorts.forEach(p => { p.resort = toStr(p.resort,'').trim().toLowerCase(); p.blackout_ok = !!p.blackout_ok; });

    // Payloads (resort model restored per STABLE FORM)
    const multiPayload = { riders, resort_days: resorts };
    const singlePayload = {
      riders,
      resort_plan: resorts.map(p => ({
        resort: p.resort,
        days: p.days,
        blackout_ok: p.blackout_ok,
        blackout: p.blackout_ok // mirror for compatibility
      }))
    };

    const url  = (mode === 'multi') ? MULTI_API : SINGLE_API;
    const body = (mode === 'multi') ? multiPayload : singlePayload;

    setJSON(reqEl, { url, body });
    status('Submitting…');

    try {
      const json = await postJson(url, body);
      setJSON(rawEl, json);
      lastRows = extractRows(json);
      buildTable(applyFilter(lastRows, filterText.value));
      status('OK', 'ok');
    } catch (e) {
      status(`Error: ${(e && e.message) || e}`, 'err');
      lastRows = [];
      buildTable(lastRows);
      setJSON(rawEl, { error: String(e) });
    } finally {
      postHeightSoon();
    }
  });

  // ---- Initial rows
  ridersWrap.append(riderRow(39,'None'));
  resortsWrap.append(resortRow('loon',7,false));
  setMode('multi');

  // ---- Auto-height to parent (Squarespace embed)
  function postHeight() {
    const h = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    try { parent.postMessage({ type:'setHeight', height:h }, 'https://www.snow-genius.com'); } catch {}
    try { parent.postMessage({ type:'setHeight', height:h }, 'https://snow-genius.com'); } catch {}
  }
  const postHeightSoon = () => requestAnimationFrame(postHeight);
  window.addEventListener('load', postHeightSoon);
  window.addEventListener('resize', postHeightSoon);
})();