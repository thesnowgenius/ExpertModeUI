(function () {
  const form = document.getElementById('expertForm');
  const raw = document.getElementById('raw');
  const errors = document.getElementById('errors');

  function setRaw(obj) { raw.textContent = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2); }
  function setError(msg) { errors.textContent = msg || ""; }

  function readUI() {
    const age = Number(document.getElementById('age').value || 0);
    const category = (document.getElementById('category').value || "None").trim();
    const resort = document.getElementById('resort').value || "loon";
    const days = Number(document.getElementById('days').value || 1);
    const blackout_ok = !!document.getElementById('blackout_ok').checked;
    return {
      riders: [{ age, category }],
      resorts: [{ resort_id: resort, days, blackout_ok }] // legacy shape; we'll normalize before sending
    };
  }

  function toResortDays(common) {
    if (Array.isArray(common.resort_days)) return common.resort_days;
    const resorts = Array.isArray(common.resorts) ? common.resorts : [];
    return resorts.map(r => ({
      resort: r.resort || r.resort_id || "",
      days: Number(r.days || 0),
      blackout_ok: !!r.blackout_ok,
    })).filter(r => r.resort && r.days > 0);
  }

  async function postJson(url, body) {
    const resp = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
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

    const base = (form.getAttribute('data-api-base') || '').replace(/\/$/, "");
    const url = base + "/score_multi_pass";

    const common = readUI();
    const payload = {
      riders: (common.riders || []).map(r => ({ age: Number(r.age), category: String(r.category || "None") })),
      resort_days: toResortDays(common),
    };

    if (!payload.resort_days.length) {
      setError("Please add at least one resort with days > 0.");
      return;
    }

    try {
      setRaw({ url, payload });
      const json = await postJson(url, payload);
      setRaw(json);
    } catch (err) {
      setError('Request failed: ' + (err && err.message ? err.message : String(err)));
      console.error(err);
    }
  });
})();