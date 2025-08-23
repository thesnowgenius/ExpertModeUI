// === Expert Mode UI: unified payload + category support (v2) ===

const SELECTORS = {
  riderRow: '.rider-row',
  riderAge: '.rider-age',
  riderCategory: '.rider-category',
  resortRow: '.resort-row',
  resortId: '.resort-id',
  resortDays: '.resort-days',
  resortBlackout: '.resort-blackout',
  useMulti: '#useMulti',
  multiApi: '#multiApi',
  singleApi: '#singleApi',
};

function normCategory(v) {
  if (!v) return 'none';
  const s = String(v).trim().toLowerCase();
  const synonyms = {
    '': 'none','null': 'none','n/a': 'none','na': 'none',
    'general': 'none','standard': 'none','regular': 'none',
    'retired_military':'military','active_military':'military',
    'military_retired_or_active':'military','veteran':'military','military_veteran':'military',
  };
  return synonyms[s] || s;
}

function normResortId(v) {
  if (!v) return '';
  let s = String(v).trim().toLowerCase();
  s = s.replace(/\s+/g,'_').replace(/_+$/g,'');
  return s;
}

function buildPayload() {
  const riders = Array.from(document.querySelectorAll(SELECTORS.riderRow))
    .map(row => {
      const age = Number(row.querySelector(SELECTORS.riderAge)?.value || 0);
      const cat = row.querySelector(SELECTORS.riderCategory)?.value;
      return {age, category: normCategory(cat)};
    })
    .filter(r => Number.isFinite(r.age) && r.age > 0);

  const resort_days = Array.from(document.querySelectorAll(SELECTORS.resortRow))
    .map(row => {
      const resort = normResortId(row.querySelector(SELECTORS.resortId)?.value);
      const days = Number(row.querySelector(SELECTORS.resortDays)?.value || 0);
      const blackout_ok = !!row.querySelector(SELECTORS.resortBlackout)?.checked;
      return {resort, days, blackout_ok};
    })
    .filter(r => r.resort && r.days > 0);

  const weekends_only = !!document.querySelector('#weekendsOnly')?.checked;
  return {riders, resort_days, weekends_only};
}

async function submitForm(ev) {
  if (ev && ev.preventDefault) ev.preventDefault();
  const useMulti = !!document.querySelector(SELECTORS.useMulti)?.checked;
  const multiApi = document.querySelector(SELECTORS.multiApi)?.value?.trim();
  const singleApi = document.querySelector(SELECTORS.singleApi)?.value?.trim();
  const payload = buildPayload();

  if (!payload.riders.length) throw new Error('Add at least one rider with a valid age.');
  if (!payload.resort_days.length) throw new Error('Add at least one resort with days.');

  const url = useMulti ? multiApi : singleApi;
  if (!url) throw new Error('Missing API URL.');

  const res = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),mode:'cors'});
  const data = await res.json().catch(() => ({}));
  console.log('Request URL:', url);
  console.log('Payload:', payload);
  console.log('Response:', data);
  return data;
}

window.buildPayload = buildPayload;
window.submitForm = submitForm;
