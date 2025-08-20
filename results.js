/* Results renderer that works for both API shapes (single & multi) */

function renderCards(data) {
  const mount = document.getElementById('results-container');
  if (!mount) return;

  // Clear
  mount.innerHTML = '';

  // Accept either {valid_passes: [...]} or an object like {best_combo: [...], total_cost: N}
  let rows = [];

  if (Array.isArray(data)) {
    rows = data;
  } else if (Array.isArray(data?.valid_passes)) {
    rows = data.valid_passes;
  } else if (data && (data.best_combo || data.total_cost)) {
    // Multi-pass minimal view
    const combo = (data.best_combo || []).join(' + ') || '—';
    const total = (typeof data.total_cost === 'number') ? `$${data.total_cost}` : '—';
    const html = `
      <table>
        <thead><tr><th>Best Combo</th><th>Total Cost</th></tr></thead>
        <tbody><tr><td>${combo}</td><td>${total}</td></tr></tbody>
      </table>`;
    mount.innerHTML = html;
    document.getElementById('sortBar')?.style?.setProperty('display','');
    return;
  } else if (data) {
    // Fallback generic JSON
    mount.innerHTML = `<pre class="codeblock">${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
    document.getElementById('sortBar')?.style?.setProperty('display','none');
    return;
  } else {
    document.getElementById('sortBar')?.style?.setProperty('display','none');
    return;
  }

  if (!rows.length) {
    mount.innerHTML = '<div class="small muted">No results.</div>';
    document.getElementById('sortBar')?.style?.setProperty('display','none');
    return;
  }

  // If it's an array of passes, render table
  const headers = new Set();
  rows.forEach(r => Object.keys(r).forEach(k => headers.add(k)));
  const cols = Array.from(headers);

  let thead = '<tr>' + cols.map(c=>`<th>${escapeHtml(c)}</th>`).join('') + '</tr>';
  let tbody = rows.map(r => {
    return '<tr>' + cols.map(c => `<td>${escapeHtml(String(r[c] ?? ''))}</td>`).join('') + '</tr>';
  }).join('');

  mount.innerHTML = `<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
  document.getElementById('sortBar')?.style?.setProperty('display','');
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, m =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])
  );
}