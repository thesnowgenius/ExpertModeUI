/* Conditional-v1 display contract. Pricing and eligibility remain server-owned. */
(() => {
  const fail = () => { throw new Error('Family pricing could not be verified. Refresh and try again.'); };
  const cents = value => Number.isSafeInteger(value) && value >= 0;
  const money = value => new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:2, minimumFractionDigits:value % 100 ? 2 : 0}).format(value / 100);
  const publicSource = value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password && url.hostname.includes('.') &&
        !/\.(localhost|local|internal)$/.test(url.hostname) && !/^[\d.]+$/.test(url.hostname) &&
        !/[\s\x00-\x1f\x7f]/.test(value) ? url.href : null;
    } catch { return null; }
  };
  function validate(quote, total) {
    if (!quote || quote.version !== 1 || quote.currency !== 'USD' || !cents(quote.total_cents) ||
        !Array.isArray(quote.purchases) || !quote.purchases.length || !Array.isArray(quote.adjustments) ||
        !Array.isArray(quote.unconfirmed_offers) || !Number.isFinite(total) ||
        Math.abs(total * 100 - quote.total_cents) > 0.00001) fail();
    const rows = new Map();
    let paid = 0, regular = 0;
    for (const row of quote.purchases) {
      if (!row || typeof row.purchase_id !== 'string' || rows.has(row.purchase_id) ||
          !Number.isInteger(row.rider_index) || row.rider_index < 0 || !cents(row.payable_price_cents) ||
          (row.regular_price_cents !== null && !cents(row.regular_price_cents)) ||
          typeof row.conditional_beneficiary !== 'boolean' || typeof row.qualifying_purchase !== 'boolean') fail();
      rows.set(row.purchase_id, row);
      paid += row.payable_price_cents;
      regular = regular === null || row.regular_price_cents === null ? null : regular + row.regular_price_cents;
    }
    if (!cents(paid) || paid !== quote.total_cents || regular !== quote.regular_total_cents ||
        (regular !== null && (!cents(regular) || regular < paid || quote.savings_cents !== regular - paid)) ||
        (regular === null && quote.savings_cents !== null)) fail();
    const beneficiaries = new Set(), qualifiers = new Set();
    for (const adjustment of quote.adjustments) {
      const child = rows.get(adjustment.beneficiary_purchase_id), adult = rows.get(adjustment.qualifying_purchase_id);
      if (!child || !adult || child === adult || child.rider_index === adult.rider_index ||
          beneficiaries.has(child.purchase_id) || !child.conditional_beneficiary || !adult.qualifying_purchase ||
          adult.payable_price_cents <= 0 || adjustment.promo_price_cents !== child.payable_price_cents ||
          adjustment.regular_price_cents !== child.regular_price_cents ||
          adjustment.discount_cents !== (child.regular_price_cents === null ? null : child.regular_price_cents-child.payable_price_cents) ||
          !Array.isArray(adjustment.terms) || !adjustment.terms.length || adjustment.terms.some(t => typeof t !== 'string') ||
          !publicSource(adjustment.source_url) || !Number.isFinite(Date.parse(adjustment.review_by)) ||
          Date.now() >= Date.parse(adjustment.review_by)) fail();
      beneficiaries.add(child.purchase_id); qualifiers.add(adult.purchase_id);
    }
    for (const row of rows.values()) {
      if (row.conditional_beneficiary !== beneficiaries.has(row.purchase_id) ||
          row.qualifying_purchase !== qualifiers.has(row.purchase_id) ||
          (!row.conditional_beneficiary && row.regular_price_cents !== row.payable_price_cents)) fail();
    }
    if (quote.next_offer_transition_at !== null &&
        (!Number.isFinite(Date.parse(quote.next_offer_transition_at)) || Date.now() >= Date.parse(quote.next_offer_transition_at))) fail();
    return quote;
  }
  function validateRows(rows, required = false) {
    for (const row of rows) {
      if (row.conditional_pricing) validate(row.conditional_pricing, row.price ?? row.total_cost);
      else if (required && !['standalone_partial_coverage','standalone_limited_session'].includes(row.conditional_pricing_status)) fail();
    }
  }
  function requireContract(contract) {
    if (contract !== undefined && contract !== 'conditional-v1') fail();
    return contract === 'conditional-v1';
  }
  function text(parent, tag, value, className) {
    const node = document.createElement(tag); node.textContent = value;
    if (className) node.className = className;
    parent.appendChild(node); return node;
  }
  function totalPrice(container, row) {
    const q = row.conditional_pricing;
    if (!q) return;
    container.replaceChildren();
    text(container, 'span', (q.adjustments.length ? 'Promo total ' : '') + money(q.total_cents), 'sg-payable-price');
    if (q.adjustments.length && q.regular_total_cents !== null) text(container, 'small', 'Regular ' + money(q.regular_total_cents), 'sg-regular-price');
  }
  function purchasePrice(container, pass, quote) {
    if (!quote) return;
    const row = quote.purchases.find(p => p.purchase_id === pass.purchase_id);
    if (!row) return; // Genius summary rows represent the entire party.
    container.replaceChildren();
    text(container, 'span', (row.conditional_beneficiary ? 'Promo ' : '') + money(row.payable_price_cents), 'sg-payable-price');
    if (row.conditional_beneficiary && row.regular_price_cents !== null) text(container, 'small', 'Regular ' + money(row.regular_price_cents), 'sg-regular-price');
  }
  function link(parent, value, label) {
    const href = publicSource(value);
    if (!href) return;
    const a = text(parent, 'a', label); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
  }
  function details(parent, label) {
    const box = document.createElement('details'); box.className = 'sg-promo-rules';
    text(box, 'summary', label); parent.appendChild(box); return box;
  }
  function appendDetails(container, row) {
    const q = row.conditional_pricing;
    if (!q) {
      if (row.conditional_pricing_status) text(container, 'p',
        row.conditional_pricing_status === 'standalone_partial_coverage'
          ? 'Partial coverage uses regular prices; conditional discounts have not been applied.'
          : 'This limited-session option uses regular prices; conditional discounts have not been applied.', 'sg-pricing-note');
      return;
    }
    for (const adjustment of q.adjustments) {
      const child = q.purchases.find(p => p.purchase_id === adjustment.beneficiary_purchase_id);
      const adult = q.purchases.find(p => p.purchase_id === adjustment.qualifying_purchase_id);
      const label = `Rider ${child.rider_index + 1}: Promo ${money(adjustment.promo_price_cents)}` +
        (adjustment.regular_price_cents !== null ? ` · Regular ${money(adjustment.regular_price_cents)}` : '') + ' — rules';
      const box = details(container, label);
      text(box, 'p', `Requires the qualifying purchase shown for Rider ${adult.rider_index + 1}.`);
      const list = document.createElement('ul');
      adjustment.terms.forEach(term => text(list, 'li', term)); box.appendChild(list);
      link(box, adjustment.source_url, 'View provider promotion rules');
    }
    // These rules can concern other products in the catalog, not this basket.
    for (const held of q.unconfirmed_offers) {
      const box = details(container, 'Unconfirmed catalog promotion');
      const messages = {review_expired:'The source review has expired.',future_observation:'The source observation is not yet current.',review_pending:'The provider rules still need review.'};
      text(box, 'p', (messages[held.reason] || 'The provider rules are unconfirmed.') + ' This promotion is not included in the price above.');
      link(box, held.source_url, 'View provider information');
    }
  }
  let timer = null, expiry = null, expire = null;
  function cancel() {
    if (timer !== null) clearTimeout(timer);
    timer = null; expiry = null; expire = null;
  }
  function checkExpiry() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    if (expiry === null) return;
    if (Date.now() >= expiry) { const callback = expire; cancel(); callback(); }
    else timer = setTimeout(checkExpiry, Math.min(expiry-Date.now()+1, 86400000));
  }
  function watch(rows, callback) {
    cancel();
    const dates = rows.map(r => r.conditional_pricing?.next_offer_transition_at).filter(Boolean).map(Date.parse);
    if (!dates.length) return;
    expiry = Math.min(...dates); expire = callback; checkExpiry();
  }
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', checkExpiry);
  window.SGConditionalPricing = {validate, validateRows, requireContract, totalPrice, purchasePrice, appendDetails, watch, cancel};
})();
