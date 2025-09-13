// Question 1: Get polling unit results
async function fetchPU() {
  const id = document.getElementById('pollingUnitId').value;
  if (!id) return alert('Enter polling unit id');

  const res = await fetch(`/api/polling-unit/${id}`);
  const data = await res.json();

  let table = '<tr><th>Party</th><th>Score</th></tr>';
  data.forEach((row) => {
    table += `<tr><td>${row.party_abbreviation}</td><td>${row.party_score}</td></tr>`;
  });
  document.getElementById('puTable').innerHTML = table;
}

// Question 2: Populate LGAs + fetch result
async function loadLGAs() {
  // ideally fetch LGAs from DB; here hardcoded
  const lgas = [
    { id: 1, name: 'LGA 1' },
    { id: 2, name: 'LGA 2' },
  ];

  const select = document.getElementById('lgaSelect');
  lgas.forEach((lga) => {
    const opt = document.createElement('option');
    opt.value = lga.id;
    opt.textContent = lga.name;
    select.appendChild(opt);
  });
}

async function fetchLGA() {
  const id = document.getElementById('lgaSelect').value;
  if (!id) return;

  const res = await fetch(`/api/lga/${id}`);
  const data = await res.json();

  let table = '<tr><th>Party</th><th>Total Score</th></tr>';
  data.forEach((row) => {
    table += `<tr><td>${row.party_abbreviation}</td><td>${row.total_score}</td></tr>`;
  });
  document.getElementById('lgaTable').innerHTML = table;
}

// Question 3: Submit results
function createPartyInputs() {
  const parties = ['PDP', 'APC', 'LP', 'ANPP'];
  const div = document.getElementById('partyInputs');

  parties.forEach((p) => {
    div.innerHTML += `
      <label>${p}: </label>
      <input type="number" id="score-${p}" value="0"><br>
    `;
  });
}

async function submitResults() {
  const pollingUnitId = document.getElementById('newPU').value;
  if (!pollingUnitId) return alert('Enter polling unit id');

  const parties = ['PDP', 'APC', 'LP', 'ANPP'];
  const results = parties.map((p) => ({
    party: p,
    score: parseInt(document.getElementById(`score-${p}`).value) || 0,
  }));

  await fetch('/api/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pollingUnitId, results, user: 'tester' }),
  });

  alert('Results saved!');
}

// run on page load
loadLGAs();
createPartyInputs();
