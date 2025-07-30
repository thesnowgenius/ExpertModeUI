// Expect a global `data.valid_passes` object already injected or returned from API
// This is example data structure; replace with dynamic source as needed

const data = {
  valid_passes: [
    {
      pass_id: "ikon_session_2",
      pass_family_id: "ikon",
      name: "Ikon Session 2 ",
      blackout_true: true,
      total_days: 2,
      total_cost: 259
    },
    {
      pass_id: "ikon_session_3",
      pass_family_id: "ikon",
      name: "Ikon Session 3",
      blackout_true: true,
      total_days: 3,
      total_cost: 389
    },
    {
      pass_id: "ikon_session_4",
      pass_family_id: "ikon",
      name: "Ikon Session 4",
      blackout_true: true,
      total_days: 4,
      total_cost: 459
    },
    {
      pass_id: "mountain_collective",
      pass_family_id: "mountain_collective",
      name: "Mountain Collective",
      blackout_true: false,
      total_days: 34,
      total_cost: 639
    },
    {
      pass_id: "ikon_base",
      pass_family_id: "ikon",
      name: "Ikon Base",
      blackout_true: true,
      total_days: 180,
      total_cost: 909
    },
    {
      pass_id: "ikon",
      pass_family_id: "ikon",
      name: "Ikon",
      blackout_true: false,
      total_days: 180,
      total_cost: 1329
    }
  ]
};

let currentSort = 'total_cost';

function renderCards(sorted) {
  const container = document.getElementById("results-container");
  container.innerHTML = "";

  sorted.forEach(pass => {
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

  sendHeight(); // notify iframe parent of height change
}

function sortBy(field) {
  currentSort = field;
  const sorted = [...data.valid_passes].sort((a, b) => {
    if (typeof a[field] === "boolean") {
      return a[field] === b[field] ? 0 : a[field] ? 1 : -1;
    }
    return a[field] - b[field];
  });
  renderCards(sorted);
}

window.addEventListener("DOMContentLoaded", () => {
  sortBy(currentSort);
});
