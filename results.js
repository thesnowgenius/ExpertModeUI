let currentResults = [];
let currentSort = 'total_cost';

function renderCards(data) {
  console.log("renderCards called with:", data);

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
  if (!Array.isArray(currentResults)) {
    console.warn("No currentResults to sort.");
    return;
  }

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
    console.log("Rendering pass:", pass);
    const card = document.createElement("div");
    card.className = "pass-card";
    card.innerHTML = `
      <h2>${pass.name}</h2>
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
