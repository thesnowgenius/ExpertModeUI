// Expert Mode UI script.js hotfix v6
// Restores Stable-4 look/feel, typeahead, per-resort flags, default rows, and logo hook.

document.addEventListener("DOMContentLoaded", () => {
  const ridersContainer = document.getElementById("riders") ||
                          document.getElementById("rider-rows") ||
                          document.getElementById("riderList");
  const resortsContainer = document.getElementById("resorts") ||
                           document.getElementById("resort-rows") ||
                           document.getElementById("resortList");

  const addRiderBtn = document.getElementById("addRider") ||
                      document.getElementById("add-rider");
  const addResortBtn = document.getElementById("addResort") ||
                       document.getElementById("add-resort");
  const clearBtn = document.getElementById("clear") ||
                   document.getElementById("clearAll");
  const submitBtn = document.getElementById("submit") ||
                    document.getElementById("solve");

  const rawRequest = document.getElementById("raw-request") ||
                     document.getElementById("rawRequest");
  const rawResponse = document.getElementById("raw-response") ||
                      document.getElementById("rawResponse");

  // --- Logo ---
  const logo = document.getElementById("brand-logo") || document.getElementById("logo");
  if (logo && !logo.src) logo.src = "static/logo.png";

  // --- Default row creation ---
  function addRider(age=30, category=null) {
    const div = document.createElement("div");
    div.className = "rider-row";
    div.innerHTML = `
      <input type="number" value="${age}" placeholder="Age">
      <select>
        <option value="">None</option>
        <option value="military">Military</option>
        <option value="student">Student</option>
        <option value="nurse">Nurse/Doc</option>
      </select>
      <button type="button" class="remove">Remove</button>`;
    div.querySelector(".remove").onclick = () => div.remove();
    ridersContainer.appendChild(div);
  }

  function addResort(name="", days=1) {
    const div = document.createElement("div");
    div.className = "resort-row";
    div.innerHTML = `
      <input type="text" class="resort-name" value="${name}" placeholder="Start typing a resort…">
      <input type="number" value="${days}" min="1" class="days">
      <label><input type="checkbox" class="no-weekends"> No weekends</label>
      <label><input type="checkbox" class="no-blackouts"> No blackout dates</label>
      <button type="button" class="remove">Remove</button>
      <div class="typeahead"></div>`;
    div.querySelector(".remove").onclick = () => div.remove();
    const input = div.querySelector(".resort-name");
    const ta = div.querySelector(".typeahead");

    input.addEventListener("input", async () => {
      const q = input.value.toLowerCase();
      if (q.length < 2) { ta.innerHTML = ""; return; }
      try {
        const res = await fetch("static/resorts.json");
        const all = await res.json();
        const matches = all.filter(r =>
          r.name.toLowerCase().includes(q) ||
          (r.id && r.id.toLowerCase().includes(q))
        ).slice(0, 6);
        ta.innerHTML = matches.map(m =>
          `<div class="opt" data-id="${m.id}" data-name="${m.name}">${m.name}</div>`).join("");
        ta.querySelectorAll(".opt").forEach(opt => {
          opt.onclick = () => {
            input.value = opt.dataset.name;
            input.dataset.id = opt.dataset.id;
            ta.innerHTML = "";
          };
        });
      } catch(e) { console.error("Typeahead error", e); }
    });

    resortsContainer.appendChild(div);
  }

  // --- Bind buttons ---
  if (addRiderBtn) addRiderBtn.onclick = () => addRider();
  if (addResortBtn) addResortBtn.onclick = () => addResort();
  if (clearBtn) clearBtn.onclick = () => { ridersContainer.innerHTML=""; resortsContainer.innerHTML=""; addRider(); addResort(); };

  // default rows
  addRider();
  addResort();

  // --- Submit ---
  if (submitBtn) submitBtn.onclick = async () => {
    const riders = [...ridersContainer.querySelectorAll(".rider-row")].map((r,i) => {
      return {
        name: "Rider " + (i+1),
        age: parseInt(r.querySelector("input").value) || 0,
        category: r.querySelector("select").value || null
      };
    });
    const resorts = [...resortsContainer.querySelectorAll(".resort-row")].map(r => {
      const input = r.querySelector(".resort-name");
      return {
        id: input.dataset.id || null,
        name: input.value,
        days: parseInt(r.querySelector(".days").value) || 0,
        no_weekends: r.querySelector(".no-weekends").checked,
        no_blackouts: r.querySelector(".no-blackouts").checked
      };
    });
    const payload = { riders, resorts, mode:"auto" };
    if (rawRequest) rawRequest.textContent = JSON.stringify(payload,null,2);
    try {
      const res = await fetch("https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass", {
        method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (rawResponse) rawResponse.textContent = JSON.stringify(data,null,2);
    } catch(e) {
      if (rawResponse) rawResponse.textContent = JSON.stringify({error:e.message});
    }
  };
});
