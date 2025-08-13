(function () {
  // ---- utilities
  const $ = (sel) => document.querySelector(sel);
  const byId = (id) => document.getElementById(id);
  const raw = byId('raw') || { textContent: "" };
  const errors = byId('errors') || { textContent: "" };
  const setRaw = (v) => raw.textContent = typeof v === 'string' ? v : JSON.stringify(v, null, 2);
  const setError = (m) => { errors.textContent = m || ""; };

  // ---- ensure a root
  let root = byId('sg-expert-multi-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'sg-expert-multi-root';
    document.currentScript.parentElement.insertBefore(root, document.currentScript);
  }

  // ---- create form if missing
  let form = byId('expertForm');
  if (!form) {
    form = document.createElement('form');
    form.id = 'expertForm';
    form.className = 'card';
    form.innerHTML = `
      <div class="row">
        <div>
          <label>Rider Age</label>
          <input id="age" type="number" min="0" value="39" required />
        </div>
        <div>
          <label>Category</label>
          <select id="category">
            <option value="None" selected>None</option>
            <option value="Student">Student</option>
            <option value="Military">Military</option>
            <option value="Nurse">Nurse</option>
          </select>
        </div>
      </div>

      <h3>Resort Plan</h3>
      <div class="row">
        <div>
          <label>Resort</label>
          <input id="resort" type="text" placeholder="loon" value="loon" />
        </div>
        <div>
          <label>Days</label>
          <input id="days" type="number" min="1" value="7" />
        </div>
        <div style="display:flex;align-items:center;gap:.5rem">
          <input id="blackout_ok" name="blackout_ok" type="checkbox" />
          <label for="blackout_ok">Blackout OK</label>
        </div>
      </div>

      <div class="row">
        <div>
          <label>Mode</label>
          <select id="apiMode">
            <option value="multi" selected>Multi</option>
            <option value="single">Single</option>
          </select>
        </div>
        <div>
          <label>API Base</label>
          <input id="apiBase" type="text"
            value="https://pass-picker-expert-mode-multi.onrender.com" />
        </div>
      </div>

      <p><button type="submit">Submit</button></p>
    `;
    root.appendChild(form);

    // optional consoles
    if (!byId('errors')) {
      const e = document.createElement('div'); e.id = 'errors'; e.className = 'error'; root.appendChild(e);
    }
    if (!byId('raw')) {
      const h = document.createElement('h3'); h.textContent = 'Raw Response'; root.appendChild(h);
      const p = document.createElement('pre'); p.id = 'raw'; root.appendChild(p);
    }
  }

  // ---- helpers
  async function postJson(url, body) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  function readUI() {
    const age = Number(byId('age')?.value ?? 0);
    const category = byId('category')?.value ?? 'None';
    const resort = byId('resort')?.value?.trim() || '';
    const days = Number(byId('days')?.value ?? 0);
    const blackout_ok = !!byId('blackout_ok')?.checked;

    return {
      riders: [{ age, category }],
      resort_days: resort && days ? [{ resort, days, blackout_ok }] : []
    };
  }

  // ---- submit handler
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    setError('');
    setRaw('');

    const apiBase = byId('apiBase')?.value?.trim()
      || 'https://pass-picker-expert-mode-multi.onrender.com';
    const mode = byId('apiMode')?.value || 'multi';
    const url = `${apiBase}/${mode === 'multi' ? 'score_multi_pass' : 'score_pass'}`;

    const body = readUI();
    if (!body.resort_days.length) {
      setError('Please provide at least one resort and days.');
      return;
    }

    try {
      setRaw({ url, body });
      const json = await postJson(url, body);
      setRaw(json);
    } catch (e) {
      setError('Request failed: ' + (e?.message || String(e)));
      console.error(e);
    }
  });
})();
