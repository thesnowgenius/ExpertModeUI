let currentResults = [];
let currentSort = 'total_cost';

function renderCards(data) {
  const container = document.getElementById("results-container");
  const sortBar = document.getElementById("sortBar");

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No valid passes found.</p>";
    sortBar.style.display = "none";
    sendHeight();
    return;
  }

  currentResults = data;
  sortBar.style.display = "block";
  sortBy(currentSort);
}

function sortBy(field) {
  currentSort = field;
  const sorted = [...currentResults].sort((a, b) => {
    if (typeof a[field] === "boolean") {
      return a[field] === b[field] ? 0 : a[field] ? 1 : -1;
    }
    return a[field] - b[field];
  });

  const container = document.getElementById("results-container");
  container.innerHTML = "";

  sorted.forEach(pass => {
    const card = document.createElement("div");
    card.className = "pass-card";

    let passesHtml = "";
    if (Array.isArray(pass.passes) && pass.passes.length > 0) {
      passesHtml += '<div class="pass-list">';
      pass.passes.forEach(p => {
        passesHtml += `
          <div class="sub-pass">
            <h3>${p.name}</h3>
            ${p.cost !== undefined ? `<div class="meta">Cost: $${p.cost}</div>` : ''}
          </div>`;
      });
      passesHtml += '</div>';
    } else if (pass.name) {
      passesHtml = `<h2>${pass.name}</h2>`;
    }

    card.innerHTML = `
      ${passesHtml}
      <div class="meta">Total Cost: $${pass.total_cost}</div>
      <div class="meta">Total Days: ${pass.total_days}</div>
      <div class="badge ${pass.blackout_true ? 'blackout' : ''}">
        ${pass.blackout_true ? 'Has Blackouts' : 'No Blackouts'}
      </div>
    `;
    container.appendChild(card);
  });

  sendHeight();
}
