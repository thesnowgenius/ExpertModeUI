
// Expert Mode UI - Stable-4 + Hotfix v4
document.addEventListener("DOMContentLoaded", () => {
  const ridersDiv = document.getElementById("riders");
  const resortsDiv = document.getElementById("resorts");
  const submitBtn = document.getElementById("submit");
  const rawRequest = document.getElementById("raw-request");
  const rawResponse = document.getElementById("raw-response");
  let resortData = [];

  // Load resorts.json
  fetch("static/resorts.json")
    .then(r => r.json())
    .then(data => { resortData = data; })
    .catch(err => console.error("Failed to load resorts.json", err));

  function createRiderRow() {
    const row = document.createElement("div");
    row.className = "rider-row";
    row.innerHTML = `
      <input type="number" placeholder="Age">
      <select>
        <option value="">None</option>
        <option value="military">Military</option>
        <option value="student">Student</option>
        <option value="nurse">Nurse/Doc</option>
      </select>
      <button type="button" class="remove">Remove</button>`;
    row.querySelector(".remove").onclick = () => row.remove();
    return row;
  }

  function createResortRow() {
    const row = document.createElement("div");
    row.className = "resort-row";
    row.innerHTML = `
      <input type="text" class="resort-name" placeholder="Start typing...">
      <input type="number" class="days" placeholder="Days">
      <label><input type="checkbox" class="no-weekends"> No weekends</label>
      <label><input type="checkbox" class="no-blackouts"> No blackout dates</label>
      <button type="button" class="remove">Remove</button>
      <ul class="suggestions"></ul>`;

    const input = row.querySelector(".resort-name");
    const sugg = row.querySelector(".suggestions");
    let selectedId = null;

    input.addEventListener("input", () => {
      const val = input.value.toLowerCase();
      sugg.innerHTML = "";
      if (!val) return;
      resortData.filter(r => r.name.toLowerCase().includes(val)).slice(0, 6)
        .forEach(r => {
          const li = document.createElement("li");
          li.textContent = r.name;
          li.onclick = () => { input.value = r.name; selectedId = r.id; sugg.innerHTML = ""; };
          sugg.appendChild(li);
        });
    });

    input.addEventListener("blur", () => setTimeout(() => sugg.innerHTML = "", 150));
    row.querySelector(".remove").onclick = () => row.remove();

    row.getResort = () => ({
      id: selectedId,
      name: input.value.trim(),
      days: parseInt(row.querySelector(".days").value || "0"),
      no_weekends: row.querySelector(".no-weekends").checked,
      no_blackouts: row.querySelector(".no-blackouts").checked,
    });
    return row;
  }

  document.getElementById("add-rider").onclick = () => ridersDiv.appendChild(createRiderRow());
  document.getElementById("add-resort").onclick = () => resortsDiv.appendChild(createResortRow());

  submitBtn.onclick = () => {
    const riders = [...ridersDiv.querySelectorAll(".rider-row")].map((r, i) => ({
      name: `Rider ${i+1}`,
      age: parseInt(r.querySelector("input").value || "0"),
      category: r.querySelector("select").value || null,
    }));

    const resorts = [...resortsDiv.querySelectorAll(".resort-row")].map(r => r.getResort());

    const payload = { riders, resorts, mode: "auto" };
    rawRequest.textContent = JSON.stringify(payload, null, 2);

    fetch("https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(data => { rawResponse.textContent = JSON.stringify(data, null, 2); })
    .catch(err => { rawResponse.textContent = JSON.stringify({error: err.message}); });
  };

  // init defaults
  ridersDiv.appendChild(createRiderRow());
  resortsDiv.appendChild(createResortRow());
});
