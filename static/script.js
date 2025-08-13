// static/script.js  — drop-in replacement
(function () {
  const form = document.getElementById('expertForm');
  const raw = document.getElementById('raw') || { textContent: "" };
  const errors = document.getElementById('errors') || { textContent: "" };
  const selectMode = document.getElementById('apiMode');
  const inputBase = document.getElementById('apiBase');

  const setRaw = (obj) => raw.textContent = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
  const setError = (msg) => errors.textContent = msg || "";

  // TODO: adapt to your real form; this demo reads a single row from ids
  function readUIIntoCommonShape() {
    const age = Number(document.getElementById('age')?.value ?? 0);
    const category = (document.getElementById('category')?.value ?? "None");
    const resortVal = document.getElementById('resort')?.value ?? "loon";
    const daysVal = Number(document.getElementById('days')?.value ?? 1);
    const blackout_ok = !!document.getElementById('blackout_ok')?.checked;

    return {
      riders: [{ age, category }],
      resorts: [{ resort_id: resortVal, days: daysVal, blackout_ok }],
    };
  }

  function toMultiPayload(common) {
    // normalize category casing (backend doesn't care, but for consistency)
    const riders = (common.riders || []).map(r => ({
      age: Number(r.age),
      category: (r.category ?? "None")
        .toString()
        .trim()
        .replace(/^none$/i, "None")
    }));

    // Accept both shapes: resorts[{resort_id,...}] OR resort_days[{resort,...}]
    let resortDays = common.resort_days;
    if (!Array.isArray(resortDays) && Array.isArray(common.resorts)) {
      resortDays = common.resorts.map(r => ({
        resort: r.resort ?? r.resort_id ?? "",
        days: Number(r.days ?? 0),
        blackout_ok: !!r.blackout_ok
      }));
    }
    return { riders, resort_days: resortDays || [] };
  }

  async function postJson(url, body) {
    const resp = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await resp.text();
    let data = text;
    try { data = JSON.parse(text); } catch {}
    if (!resp.ok) {
      const msg = (data && data.detail) ? data.detail : resp.status + ' ' + resp.statusText;
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
    return data;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setError(""); setRaw("");

    const modeAttr = (form.getAttribute('data-api-mode') || '').toLowerCase();
    const mode = (selectMode && selectMode.value) || modeAttr || 'multi';
    const baseAttr = form.getAttribute('data-api-base') || '';
    const base = (inputBase && inputBase.value) || baseAttr || '';
    const baseClean = base.replace(/\/$/, "");
    const path = mode === 'multi' ? '/score_multi_pass' : '/score_pass';
    const url = baseClean + path;

    // 1) Read UI → common shape
    const common = readUIIntoCommonShape();

    // 2) Convert based on mode (this fixes your 422)
    const body = (mode === 'multi')
      ? toMultiPayload(common)
      : { ...common }; // single-pass still uses { riders, resorts: [...] }

    // Quick guardrails
    if (mode === 'multi' && (!Array.isArray(body.resort_days) || body.resort_days.length === 0)) {
      setError("No resorts provided. Please add at least one resort.");
      return;
    }

    try {
      setRaw({ url, body });
      const json = await postJson(url, body);
      setRaw(json);
      // renderCards(json); // if you have a renderer
    } catch (err) {
      setError('Request failed: ' + (err?.message || String(err)));
      console.error(err);
    }
  });
})();