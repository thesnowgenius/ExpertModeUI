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
  window.appendEligibilityGuidance = (container, notes) => {
    if (!Array.isArray(notes)) return;
    notes.forEach(note => {
      if (!note || !['age_requirement', 'provider_verification'].includes(note.kind) || typeof note.message !== 'string') return;
      const details = document.createElement('details');
      details.className = 'sg-eligibility-note';
      const summary = document.createElement('summary');
      const icon = document.createElement('span');
      icon.className = 'sg-eligibility-icon';
      icon.textContent = note.kind === 'age_requirement' ? '⚠' : 'ⓘ';
      icon.setAttribute('aria-hidden', 'true');
      summary.appendChild(icon);
      const rider = Number.isInteger(note.rider_index) && note.rider_index >= 0 ? `Rider ${note.rider_index + 1}: ` : '';
      summary.appendChild(document.createTextNode(rider + (note.kind === 'age_requirement' ? 'Check age requirement' : 'Provider verification required')));
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
        link.textContent = 'Check provider requirements'; details.appendChild(link);
      }
      container.appendChild(details);
    });
  };
})();
