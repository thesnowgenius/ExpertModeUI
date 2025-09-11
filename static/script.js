// Stable-4 like JS with per-resort checkboxes, 3-letter typeahead, logo hook
document.addEventListener("DOMContentLoaded", () => {
  const resortInputTemplate = () => {
    const div = document.createElement("div");
    div.className = "resort-row";
    div.innerHTML = `
      <input type="text" class="resort-name" placeholder="Resort"/>
      <input type="number" class="resort-days" placeholder="Days" min="1"/>
      <label><input type="checkbox" class="resort-no-weekends"/> No weekends</label>
      <label><input type="checkbox" class="resort-no-blackouts"/> No blackout dates</label>
      <button type="button" class="remove-resort">Remove</button>
    `;
    return div;
  };

  const riderInputTemplate = () => {
    const div = document.createElement("div");
    div.className = "rider-row";
    div.innerHTML = `
      <input type="number" class="rider-age" placeholder="Age" min="0"/>
      <select class="rider-category">
        <option value="">None</option>
        <option value="military">Military</option>
        <option value="student">Student</option>
        <option value="nurse-doc">Nurse/Doc</option>
      </select>
      <button type="button" class="remove-rider">Remove</button>
    `;
    return div;
  };

  const resortsContainer = document.getElementById("resorts");
  const ridersContainer = document.getElementById("riders");

  // default rows
  resortsContainer.appendChild(resortInputTemplate());
  ridersContainer.appendChild(riderInputTemplate());

  document.getElementById("add-resort").addEventListener("click", () => {
    resortsContainer.appendChild(resortInputTemplate());
  });

  document.getElementById("add-rider").addEventListener("click", () => {
    ridersContainer.appendChild(riderInputTemplate());
  });

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-resort")) {
      e.target.closest(".resort-row").remove();
    }
    if (e.target.classList.contains("remove-rider")) {
      e.target.closest(".rider-row").remove();
    }
  });

  // typeahead logic: requires at least 3 chars
  async function loadResorts() {
    const resp = await fetch("resorts.json");
    return await resp.json();
  }
  let resortsData = [];
  loadResorts().then(d => { resortsData = d; });

  document.addEventListener("input", (e) => {
    if (e.target.classList.contains("resort-name")) {
      const val = e.target.value.toLowerCase();
      let dropdown = e.target.nextElementSibling;
      if (!dropdown || !dropdown.classList.contains("typeahead-list")) {
        dropdown = document.createElement("div");
        dropdown.className = "typeahead-list";
        e.target.parentNode.insertBefore(dropdown, e.target.nextSibling);
      }
      dropdown.innerHTML = "";
      if (val.length >= 3) {
        const matches = resortsData.filter(r => r.name.toLowerCase().includes(val));
        matches.slice(0, 5).forEach(r => {
          const item = document.createElement("div");
          item.className = "typeahead-item";
          item.textContent = r.name;
          item.dataset.id = r.id;
          item.addEventListener("click", () => {
            e.target.value = r.name;
            e.target.dataset.id = r.id;
            dropdown.innerHTML = "";
          });
          dropdown.appendChild(item);
        });
      }
    }
  });

  // Logo fix
  const logoImg = document.querySelector("#brand-logo, #logo, header img");
  if (logoImg && !logoImg.src) {
    logoImg.src = "static/logo.png";
  }

  // submit
  document.getElementById("submit").addEventListener("click", async () => {
    const riders = Array.from(ridersContainer.querySelectorAll(".rider-row")).map(r => ({
      age: parseInt(r.querySelector(".rider-age").value) || 0,
      category: r.querySelector(".rider-category").value || null
    }));

    const resorts = Array.from(resortsContainer.querySelectorAll(".resort-row")).map(r => ({
      id: r.querySelector(".resort-name").dataset.id || null,
      name: r.querySelector(".resort-name").value,
      days: parseInt(r.querySelector(".resort-days").value) || 0,
      no_weekends: r.querySelector(".resort-no-weekends").checked,
      no_blackouts: r.querySelector(".resort-no-blackouts").checked
    }));

    const payload = { riders, resorts, mode: "auto" };

    document.getElementById("raw-request").textContent = JSON.stringify(payload, null, 2);

    try {
      const resp = await fetch("https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      document.getElementById("raw-response").textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      document.getElementById("raw-response").textContent = JSON.stringify({error: err.message});
    }
  });
});
