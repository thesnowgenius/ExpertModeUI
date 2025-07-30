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

  console.log("Sending to API:", { riders, resorts });

  const response = await fetch("https://pass-picker-expert-mode.onrender.com/score_pass", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ riders, resorts })
  });

  const result = await response.json();
  console.log("API result:", result);
  console.log("Valid passes:", result.valid_passes);

  if (typeof renderCards === 'function') {
    renderCards(result.valid_passes || []);
  } else {
    console.error("renderCards is not defined!");
  }
});
