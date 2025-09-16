// Stable-4 drop-in logic with fixed wiring, 3+ letter typeahead, per-resort flags
(() => {
  // Use window.API_URL if provided; otherwise default to Render endpoint
  const API_URL = window.API_URL || 'https://pass-picker-expert-mode-multi.onrender.com/score_pass';

  // --------- Typeahead data ---------
  let RESORTS = [];
  let NAME_LUT = new Map(); // lowercase name -> {id,name}
  let ID_LUT = new Map();   // id -> name

  fetch('resorts.json')
    .then(r => r.json())
    .then(list => {
      // support both {resort_id,resort_name} and {id,name}
      RESORTS = list.map(r => ({
        id: r.resort_id ?? r.id ?? r.ResortID ?? r.ResortId ?? r.slug ?? '',
        name: r.resort_name ?? r.name ?? r.ResortName ?? r.title ?? ''
      })).filter(r => r.id && r.name);
      RESORTS.forEach(r => { NAME_LUT.set(r.name.toLowerCase(), r); ID_LUT.set(String(r.id), r.name); });
      // wire any existing resort inputs
      document.querySelectorAll('.resort-input').forEach(wireTypeahead);
    })
    .catch(() => {});

  function wireTypeahead(input) {
    const box = input.closest('.typeahead');
    const ul = box.querySelector('.suggestions');
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 3) { ul.style.display = 'none'; return; }
      const items = RESORTS.filter(r => r.name.toLowerCase().includes(q)).slice(0, 10);
      ul.innerHTML = items.map(i => `<li data-id="${i.id}">${i.name}</li>`).join('');
      ul.style.display = items.length ? 'block' : 'none';
    });
    ul.addEventListener('click', (e) => {
      const li = e.target.closest('li'); if (!li) return;
      const id = li.dataset.id; const name = ID_LUT.get(String(id)) || li.textContent;
      input.value = name;
      input.dataset.resortId = String(id);
      ul.style.display = 'none';
    });
    document.addEventListener('click', (e) => {
      if (!box.contains(e.target)) ul.style.display = 'none';
    });
  }

  // ---------- DOM helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const ridersWrap = $('#riders');
  const resortsWrap = $('#resorts');

  // Add / Remove Riders
  function addRider(age = '', category = '') {
    const row = document.createElement('div');
    row.className = 'row rider-row';
    row.innerHTML = `
      <input type="number" min="0" placeholder="Age" class="input rider-age" value="${age}">
      <select class="select rider-category">
        <option value="">None</option>
        <option value="military">Military</option>
        <option value="student">Student</option>
        <option value="medical">Nurse/Doc</option>
      </select>
      <button type="button" class="btn subtle remove-rider">Remove</button>
    `;
    row.querySelector('.rider-category').value = category || '';
    row.querySelector('.remove-rider').onclick = () => row.remove();
    ridersWrap.appendChild(row);
  }

  // Add / Remove Resorts
  function addResort() {
    const row = document.createElement('div');
    row.className = 'row resort-row';
    row.innerHTML = `
      <div class="typeahead">
        <input type="text" class="input resort-input" placeholder="Start typing a resort…" autocomplete="off" />
        <ul class="suggestions"></ul>
      </div>
      <input type="number" min="1" class="input days-input" placeholder="Days" />
      <label class="chk"><input type="checkbox" class="no-weekends" /> No weekends</label>
      <label class="chk"><input type="checkbox" class="no-blackouts" /> No blackout dates</label>
      <button type="button" class="btn subtle remove-resort">Remove</button>
    `;
    row.querySelector('.remove-resort').onclick = () => row.remove();
    resortsWrap.appendChild(row);
    wireTypeahead(row.querySelector('.resort-input'));
  }

  // Wire initial remove buttons
  $$('.remove-rider').forEach(b => b.onclick = () => b.closest('.rider-row')?.remove());
  $$('.remove-resort').forEach(b => b.onclick = () => b.closest('.resort-row')?.remove());

  // Add buttons
  $('#add-rider').onclick = () => addRider();
  $('#add-resort').onclick = () => addResort();

  // Clear
  $('#clear').onclick = () => {
    ridersWrap.innerHTML = '';
    resortsWrap.innerHTML = '';
    addRider(); // Keep at least one rider row
    addResort(); // Keep at least one resort row
    $('#raw-request').textContent = '{}';
    $('#raw-response').textContent = '{}';
    $('#results').innerHTML = '';
  };

  // Build payload
  function buildRequest() {
    const riders = $$('.rider-row', ridersWrap).map(r => ({
      age: parseInt($('.rider-age', r)?.value || '0', 10) || 0,
      category: ($('.rider-category', r)?.value || '') || null
    }));
    if (!riders.length) riders.push({ age: 30, category: null });

    const resorts = $$('.resort-row', resortsWrap).map(row => {
      const input = $('.resort-input', row);
      const id = input?.dataset.resortId || null;
      const name = input?.value?.trim() || '';
      const days = parseInt($('.days-input', row)?.value || '0', 10) || 0;
      const no_weekends = $('.no-weekends', row)?.checked || false;
      const no_blackouts = $('.no-blackouts', row)?.checked || false;
      return { id, name, days, no_weekends, no_blackouts };
    }).filter(r => r.name);

    return { riders, resorts, mode: 'auto' };
  }

  // Submit
  $('#submit').onclick = async () => {
    const payload = buildRequest();
    $('#raw-request').textContent = JSON.stringify(payload, null, 2);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({ error: 'Bad JSON' }));
      $('#raw-response').textContent = JSON.stringify(data, null, 2);
      renderResults(data);
    } catch (e) {
      $('#raw-response').textContent = JSON.stringify({ error: 'Failed to fetch' }, null, 2);
    }
  };

  function renderResults(data) {
    const root = $('#results');
    root.innerHTML = '';
    if (!data || !data.results || !data.results.length) return;
    data.results.forEach(item => {
      const div = document.createElement('div');
      div.className = 'result row';
      const passes = (item.passes || []).join(', ');
      div.innerHTML = `<strong>Recommendation:</strong> <span>${passes || '—'}</span>`;
      root.appendChild(div);
    });
  }
})();