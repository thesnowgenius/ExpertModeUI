
function addRider() {
    const container = document.getElementById('riders');
    const rider = document.createElement('div');
    rider.className = 'rider';
    rider.innerHTML = '<input type="number" placeholder="Age" name="age">' +
                      '<select name="category">' +
                      '<option value="none">None</option>' +
                      '<option value="military">Military</option>' +
                      '<option value="student">Student</option>' +
                      '<option value="nurse">Nurse</option></select>';
    container.appendChild(rider);
}

function addResort() {
    const container = document.getElementById('resorts');
    const resort = document.createElement('div');
    resort.className = 'resort';
    resort.innerHTML = '<input type="text" placeholder="Resort ID (e.g., loon)" name="resort_id">' +
                       '<input type="number" placeholder="Days" name="days">' +
                       '<label><input type="checkbox" name="blackout"> Blackout Days</label>';
    container.appendChild(resort);
}

document.getElementById('expertForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const riders = Array.from(document.querySelectorAll('#riders .rider')).map(div => ({
        age: parseInt(div.querySelector('input[name="age"]').value),
        category: div.querySelector('select[name="category"]').value
    }));

    const resort_plan = Array.from(document.querySelectorAll('#resorts .resort')).map(div => ({
        resort_id: div.querySelector('input[name="resort_id"]').value,
        days: parseInt(div.querySelector('input[name="days"]').value),
        blackout: div.querySelector('input[name="blackout"]').checked
    }));

    const response = await fetch('https://pass-picker-expert-mode.onrender.com/expert_mode/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riders, resort_plan })
    });

    const result = await response.json();
    document.getElementById('result').textContent = JSON.stringify(result, null, 2);
});
