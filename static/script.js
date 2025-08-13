/*  ExpertModeUI front-end
    - Supports Multi + Single API
    - Dynamic riders & resorts, robust validation
    - Posts height to parent for Squarespace embeds
*/
(() => {
  // ---------- DOM helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const el = (tag, cls) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  };
  const setJSON = (node, obj) => node.textContent = JSON.stringify(obj, null, 2);

  // ---------- Elements
  const multiApi = $('#multiApi');
  const singleApi = $('#singleApi');
  const useMultiBox = $('#useMulti');

  const ridersWrap = $('#riders');
  const resortsWrap = $('#resorts');

  const btnAddRider = $('#addRider');
  const btnClearRiders = $('#clearRiders');
  const btnAddResort = $('#addResort');
  const btnClearResorts = $('#clearResorts');

  const btnSubmit = $('#submit');
  const btnReset = $('#resetAll');
  const btnExample = $('#loadExample');

  const statusEl = $('#status');
  const reqEl = $('#req');
  const resEl = $('#res');

  // ---------- Builders
  function riderRow(age = 39, category = 'None') {
    const row = el('div', 'riderline');

    // Age
    const ageField = el('div', 'field');
    const ageLabel = el('label'); ageLabel.textContent = 'Age';
    const ageInput = el('input'); ageInput.type = 'number'; ageInput.min = '0'; ageInput.value = String(age);
    ageField.append(ageLabel, ageInput);

    // Category
    const catField = el('div', 'field');
    const catLabel = el('label'); catLabel.textContent = 'Category';
    const catSel = el('select');
    ['None','Student','Military','Nurse'].forEach(v => {
      const o = el('option'); o.value = v; o.textContent = v; if (v === category) o.selected = true; catSel.append(o);
    });
    catField.append(catLabel, catSel);

    // Remove
    const del = el('button', 'btn'); del.type = 'button'; del.title = 'Remove'; del.textContent = '✕';

    del.addEventListener('click', () => { row.remove(); postHeightSoon(); });

    row.append(ageField, catField, del);
    return row;
  }

  function resortRow(resort = 'loon', days = 7, blackout_ok = false) {
    const row = el('div', 'rowline');

    // Resort
    const resField = el('div', 'field');
    const resLabel = el('label'); resLabel.textContent = 'Resort';
    const resInput = el('input'); resInput.type = 'text'; resInput.placeholder = 'e.g., loon';
    resInput.value = resort;
    resField.append(resLabel, resInput);

    // Days
    const daysField = el('div', 'field');
    const daysLabel = el('label'); daysLabel.textContent = 'Days';
    const daysInput = el('input'); daysInput.type = 'number'; daysInput.min = '1'; daysInput.value = String(days);
    daysField.append(daysLabel, daysInput);

    // Blackout
    const boxWrap = el('div', 'inline');
    const box = el('input'); box.type = 'checkbox'; box.checked = !!blackout_ok; box.id = `blackout_ok_${Math.random().toString(36).slice(2,7)}`;
    const boxLabel = el('label'); boxLabel.setAttribute('for', box.id); boxLabel.textContent = 'Blackout OK';
    const boxField = el('div', 'field'); boxField.append(boxWrap); boxWrap.append(box, boxLabel);

    // Remove
    const del = el('button', 'btn'); del.type = 'button'; del.title = 'Remove'; del.textContent = '✕';
    del.addEventListener('click', () => { row.remove(); postHeightSoon(); });

    row.append(resField, daysField, boxField, del);
    return row;
  }

  // ---------- CRUD buttons
  btnAddRider.addEventListener('click', () => { ridersWrap.append(riderRow()); postHeightSoon(); });
  btnClearRiders.addEventListener('click', () => { ridersWrap.innerHTML = ''; postHeightSoon(); });

  btnAddResort.addEventListener('click', () => { resortsWrap.append(resortRow()); postHeightSoon(); });
  btnClearResorts.addEventListener('click', () => { resortsWrap.innerHTML = ''; postHeightSoon(); });

  btnReset.addEventListener('click', () => {
    ridersWrap.innerHTML = '';
    resortsWrap.innerHTML = '';
    useMultiBox.checked = false;
    status('');
    setJSON(reqEl, {});
    setJSON(resEl, {});
    renderCards([]);
    postHeightSoon();
  });

  btnExample.addEventListener('click', () => {
    // Example suitable for Multi; also valid to send to Single as resort_plan
    ridersWrap.innerHTML = '';
    resortsWrap.innerHTML = '';
    ridersWrap.append(riderRow(39, 'None'));
    resortsWrap.append(resortRow('loon', 7, false));
    resortsWrap.append(resortRow('okemo', 10, false));
    postHeightSoon();
  });

  // ---------- Serialization
  function readRiders() {
    return $$('.riderline').map(line => {
      const [ageField, catField] = $$('.field', line);
      const age = Number($('input', ageField).value || 0);
      const category = $('select', catField).value || 'None';
      return { age, category };
    });
  }

  function readResorts() {
    return $$('.rowline').map(line => {
      const [resField, daysField, boxField] = $$('.field', line);
      const resort = ($('input', resField).value || '').trim();
      const days = Number($('input', daysField).value || 0);
      const blackout_ok = !!$('input[type="checkbox"]', boxField).checked;
      return { resort, days, blackout_ok };
    });
  }

  function validate(riders, resorts) {
    if (!riders.length) return 'Add at least one rider.';
    if (riders.some(r => !Number.isFinite(r.age) || r.age < 0)) return 'All riders need a valid age (0+).';
    if (!resorts.length) return 'Add at least one resort.';
    if (resorts.some(p => !p.resort)) return 'Every resort row needs a resort id/name.';
    if (resorts.some(p => !Number.isFinite(p.days) || p.days <= 0)) return 'Every resort row needs days (1+).';
    return null;
  }

  // ---------- Fetch
  async function postJson(url, body) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await r.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch {
      // Non-JSON body; return raw text for debugging
      throw new Error(`HTTP ${r.status} ${r.statusText}\n\n${text.slice(0, 2000)}`);
    }
    if (!r.ok) {
      // Pass through server-provided JSON error if present
      const msg = data?.detail?.error || data?.error || JSON.stringify(data, null, 2);
      throw new Error(`HTTP ${r.status} ${r.statusText}\n\n${msg}`);
    }
    return data;
  }

  // ---------- Status
  function status(msg, cls = '') {
    statusEl.className = `status ${cls}`.trim();
    statusEl.textContent = msg || '';
  }

  // ---------- Submit
  btnSubmit.addEventListener('click', async () => {
    const riders = readRiders();
    const resorts = readResorts();
    const err = validate(riders, resorts);
    if (err) { status(err, 'err'); return; }

    // Build payloads
    const multiPayload = { riders, resort_days: resorts };
    const singlePayload = { riders, resort_plan: resorts };

    const useMulti = useMultiBox.checked;
    const url = useMulti ? (multiApi.value || '').trim() : (singleApi.value || '').trim();
    const body = useMulti ? multiPayload : singlePayload;

    setJSON(reqEl, { url, body });
    status('Submitting…');

    try {
      const json = await postJson(url, body);
      setJSON(resEl, json);
      const passes = json.best_combo_passes || json.best_combos || json.valid_passes || (Array.isArray(json) ? json : []);
      renderCards(Array.isArray(passes) ? passes : []);
      status('OK', 'ok');
    } catch (e) {
      status(`Error: ${(e && e.message) || e}`, 'err');
      setJSON(resEl, { error: String(e) });
      renderCards([]);
    } finally {
      postHeightSoon();
    }
  });

  // ---------- Initial rows
  ridersWrap.append(riderRow(39, 'None'));
  resortsWrap.append(resortRow('loon', 7, false));
  useMultiBox.checked = false;
  renderCards([]);

  // ---------- Auto-height to parent (Squarespace embed)
  function postHeight() {
    const h = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    // allow both www and apex; customize if you only use one
    try { parent.postMessage({ type: 'setHeight', height: h }, 'https://www.snow-genius.com'); } catch {}
    try { parent.postMessage({ type: 'setHeight', height: h }, 'https://snow-genius.com'); } catch {}
  }
  const postHeightSoon = () => requestAnimationFrame(postHeight);
  window.addEventListener('load', postHeightSoon);
  window.addEventListener('resize', postHeightSoon);
  window.sendHeight = postHeightSoon;
})();