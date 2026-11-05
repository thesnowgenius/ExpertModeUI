/* Advisory only: never changes pass selection, eligibility, or displayed prices. */
(() => {
  function publicSource(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password || !url.hostname.includes('.') ||
          /\.(localhost|local|internal)$/.test(url.hostname) || /^[\d.]+$/.test(url.hostname) || /[\s\x00-\x1f\x7f]/.test(value)) return null;
      return url.href;
    } catch { return null; }
  }
  // One expiry timer serves every displayed result, including re-rendered strategies.
  let nextExpiry = Infinity;
  let expiryTimer;
  function scheduleExpiry(end) {
    if (end >= nextExpiry) return;
    clearTimeout(expiryTimer);
    nextExpiry = end;
    expiryTimer = setTimeout(() => {
      nextExpiry = Infinity;
      let following = Infinity;
      for (const link of document.querySelectorAll('a[data-seller-expiry][href]')) {
        const deadline = Number(link.dataset.sellerExpiry);
        if (deadline <= Date.now()) {
          link.removeAttribute('href');
          link.textContent = link.dataset.seller + ' offer needs a new price check';
        } else {
          following = Math.min(following, deadline);
        }
      }
      if (Number.isFinite(following)) scheduleExpiry(following);
    }, Math.max(0, end - Date.now()));
  }
  function addSellerOptions(container, note) {
    if (!Array.isArray(note.options) || !Number.isInteger(note.rider_index) || note.rider_index < 0) return;
    const details = document.createElement('details');
    details.className = 'sg-eligibility-note sg-seller-options';
    const summary = document.createElement('summary');
    summary.textContent = 'Rider ' + (note.rider_index + 1) + ': Choose a home mountain';
    details.appendChild(summary);
    const prefixes = {'Loon Mountain':'LM', Sugarloaf:'SL', 'Sunday River':'SR'};
    for (const option of note.options) {
      const prefix = prefixes[option?.seller];
      const href = publicSource(option?.url);
      if (typeof prefix !== 'string' || !href) continue;
      const url = new URL(href);
      if (url.origin !== 'https://www.newenglandpass.com' || url.pathname !== '/new-england-pass' || url.hash ||
          !new RegExp('^\\?variant=' + prefix + '-' + prefix + '-[0-9]{1,12}$').test(url.search)) continue;
      const end = Date.parse(option.expires_at);
      if (!Number.isFinite(end) || end <= Date.now()) continue;
      const link = document.createElement('a');
      link.href = href;
      link.textContent = 'View ' + option.seller + ' offer';
      link.dataset.sellerExpiry = String(end);
      link.dataset.seller = option.seller;
      scheduleExpiry(end);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const expire = () => {
        if (Date.now() < end) return;
        link.removeAttribute('href');
        link.textContent = option.seller + ' offer needs a new price check';
      };
      details.addEventListener('toggle', expire);
      link.addEventListener('focus', expire);
      link.addEventListener('click', event => {
        if (Date.now() >= end) { event.preventDefault(); expire(); }
      });
      const row = document.createElement('p');
      row.appendChild(link);
      details.appendChild(row);
    }
    if (details.childElementCount > 1) container.appendChild(details);
  }
  window.appendEligibilityGuidance = (container, notes) => {
    if (!Array.isArray(notes)) return;
    notes.forEach(note => {
      if (note?.kind === 'seller_options') { addSellerOptions(container,note); return; }
      if (!note || !['age_requirement', 'provider_verification', 'tier_rules'].includes(note.kind) || typeof note.message !== 'string') return;
      const details = document.createElement('details');
      details.className = 'sg-eligibility-note';
      const summary = document.createElement('summary');
      const icon = document.createElement('span');
      icon.className = 'sg-eligibility-icon';
      icon.textContent = note.kind === 'age_requirement' ? '⚠' : 'ⓘ';
      icon.setAttribute('aria-hidden', 'true');
      summary.appendChild(icon);
      const rider = Number.isInteger(note.rider_index) && note.rider_index >= 0 ? `Rider ${note.rider_index + 1}: ` : '';
      const label = note.kind === 'age_requirement' ? 'Check age requirement' : (note.kind === 'tier_rules' ? 'Pass rules' : 'Provider verification required');
      const unconfirmed = note.source_status === 'unconfirmed';
      summary.appendChild(document.createTextNode(rider + (unconfirmed ? 'Unconfirmed — ' : '') + label));
      details.appendChild(summary);
      const message = document.createElement('p');
      message.textContent = note.message;
      details.appendChild(message);
      if (note.source_status === 'current' && Array.isArray(note.steps) && note.steps.length) {
        const steps = document.createElement('ol');
        note.steps.filter(step => typeof step === 'string').forEach(step => {
          const item = document.createElement('li'); item.textContent = step; steps.appendChild(item);
        });
        details.appendChild(steps);
      }
      const href = publicSource(note.source_url);
      if (href) {
        const link = document.createElement('a');
        link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.textContent = unconfirmed ? 'View provider information' : 'Check provider requirements'; details.appendChild(link);
      }
      container.appendChild(details);
    });
  };
})();
