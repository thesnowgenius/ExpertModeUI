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

  const response = await fetch("https://pass-picker-expert-mode.onrender.com/score_pass", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ riders, resorts })
  });

  const result = await response.json();
  renderCards(result.valid_passes || []);
});
