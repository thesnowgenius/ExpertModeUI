function addRider() {
  const container = document.getElementById('riders');
  const rider = document.createElement('div');
  rider.className = 'rider';
  rider.innerHTML =
    '<input type="number" placeholder="Age" name="age" required>' +
    '<select name="category">' +
    '<option value="none">None</option>' +
    '<option value="military">Military</option>' +
    '<option value="student">Student</option>' +
    '<option value="nurse">Nurse</option>' +
    '</select>';
  container.appendChild(rider);
}

function addResort() {
  const container = document.getElementById('resorts');
  const resort = document.createElement('div');
  resort.className = 'resort';
  resort.innerHTML =
    '<select name="resort_id" required>' +
    '<option value="">-- Select resort --</option>' +
    '<option value="loon">Loon</option>' +
    '<option value="stratton">Stratton</option>' +
    '<option value="sunday_river">Sunday River</option>' +
    '<option value="sugarloaf">Sugarloaf</option>' +
    '<option value="okemo">Okemo</option>' +
    '<option value="killington">Killington</option>' +
    '<option value="cannon">Cannon</option>' +
    '</select>' +
    '<input type="number" placeholder="Days" name="days" required>' +
    '<label><input type="checkbox" name="blackout_ok"> Blackout Days</label>';
  container.appendChild(resort);
}

document.getElementById("expertForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const riders = [...document.querySelectorAll("#riders .rider")].map(div => ({
    age: parseInt(div.querySelector('input[name="age"]').value),
    category: div.querySelector('select[name="category"]').value
  }));

  const resorts = [...document.querySelectorAll("#resorts .resort")].map(div => ({
    resort_id: div.querySelector('select[name="resort_id"]').value,
    days: parseInt(div.querySelector('input[name="days"]').value),
    blackout_ok: div.querySelector('input[name="blackout_ok"]').checked
  }));

  if (riders.length === 0 || resorts.length === 0) {
    alert("Please add at least one rider and one resort.");
    return;
  }

  const useMulti = document.getElementById('multiApiToggle')?.checked;
  const url = useMulti
    ? "https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass"
    : "https://pass-picker-expert-mode.onrender.com/score_pass";
  const payload = useMulti
    ? {
        riders,
        resort_days: resorts.map(r => ({
          resort: r.resort_id,
          days: r.days,
          blackout_ok: r.blackout_ok
        }))
      }
    : { riders, resorts };

  try {
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (typeof renderCards === 'function') {
      renderCards(result.valid_passes || []);
    }
  } catch (err) {
    console.error(err);
    alert("Request failed: " + (err?.message || err));
  }
});
