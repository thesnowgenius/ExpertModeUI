
function addRider() {
    const container = document.getElementById('riders');
    const rider = document.createElement('div');
    rider.className = 'rider';
    rider.innerHTML = '<input type="number" placeholder="Age" name="age">' +
                      '<select name="type"><option>Adult</option><option>Teen</option><option>Child</option></select>' +
                      '<select name="category"><option>None</option><option>Military</option><option>Student</option><option>Nurse</option></select>';
    container.appendChild(rider);
}

function addResort() {
    const container = document.getElementById('resorts');
    const resort = document.createElement('div');
    resort.className = 'resort';
    resort.innerHTML = '<select name="resort"><option value="">-- Select resort --</option></select>' +
                       '<input type="number" placeholder="Days" name="days">' +
                       '<label><input type="checkbox" name="blackout"> Blackout Days</label>';
    container.appendChild(resort);
}

document.getElementById('expertForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const riders = Array.from(document.querySelectorAll('#riders .rider')).map(div => ({
        age: parseInt(div.querySelector('input[name="age"]').value),
        type: div.querySelector('select[name="type"]').value.toLowerCase(),
        category: div.querySelector('select[name="category"]').value.toLowerCase()
    }));

    const resorts = Array.from(document.querySelectorAll('#resorts .resort')).map(div => ({
        resort: div.querySelector('select[name="resort"]').value,
        days: parseInt(div.querySelector('input[name="days"]').value),
        blackout: div.querySelector('input[name="blackout"]').checked
    }));

    const response = await fetch('https://pass-picker-expert-mode.onrender.com/score_passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riders, resorts })
    });

    const result = await response.json();
    alert(JSON.stringify(result, null, 2)); // You can replace this with more elegant rendering logic
});
