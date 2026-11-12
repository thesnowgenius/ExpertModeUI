/* Catalog disclosure only; never adds an offer to recommendation results. */
(() => {
  window.renderCatalogNotices = (rows) => {
    const container = document.getElementById('catalog-unconfirmed');
    if (!container) return;
    container.replaceChildren();
    container.hidden = true;
    if (!Array.isArray(rows)) return;
    const valid = rows.filter(row => row?.status === 'unconfirmed' &&
      typeof row.pass_name === 'string' && typeof row.message === 'string' &&
      ['price_tier', 'product_price', 'tier_access', 'resort_access'].includes(row.topic));
    if (!valid.length) return;
    const details = document.createElement('details');
    details.className = 'sg-eligibility-note';
    const summary = document.createElement('summary');
    summary.textContent = `⚠ Unconfirmed catalog information (${valid.length})`;
    details.appendChild(summary);
    const intro = document.createElement('p');
    intro.textContent = 'These catalog items need confirmation. This list is not a recommendation or a purchase quote. Available prices and supported access remain separate.';
    details.appendChild(intro);
    const list = document.createElement('ul');
    for (const row of valid) {
      const item = document.createElement('li');
      const title = document.createElement('strong');
      let identity = '';
      if (Number.isInteger(row.min_age) && Number.isInteger(row.max_age)) {
        identity = ` — ages ${row.min_age}–${row.max_age}${row.category ? `, ${row.category}` : ''}`;
      } else if (typeof row.resort_name === 'string') identity = ` — ${row.resort_name}`;
      title.textContent = row.pass_name + identity + ' — Unconfirmed';
      item.appendChild(title);
      const text = document.createElement('p'); text.textContent = row.message; item.appendChild(text);
      let href = null;
      try {
        const url = new URL(row.source_url);
        if (url.protocol === 'https:' && !url.username && !url.password && url.hostname.includes('.') &&
            !/\.(localhost|local|internal)$/.test(url.hostname) && !/^[\d.]+$/.test(url.hostname) &&
            !/[\s\x00-\x1f\x7f]/.test(row.source_url)) href = url.href;
      } catch { /* Missing or unsafe links never become navigable. */ }
      if (href) {
        const link = document.createElement('a'); link.href = href;
        link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.textContent = 'View provider information'; item.appendChild(link);
      } else {
        const unavailable = document.createElement('p');
        unavailable.textContent = 'Provider link is not available in this catalog.'; item.appendChild(unavailable);
      }
      list.appendChild(item);
    }
    details.appendChild(list); container.appendChild(details); container.hidden = false;
  };
})();
