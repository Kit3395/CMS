const form = document.querySelector('#export-form');
const message = document.querySelector('#message');
const rows = document.querySelector('#export-rows');

async function loadExports() {
  const response = await fetch('/exports');
  const exportsList = await response.json();

  rows.innerHTML = '';
  exportsList.forEach((job) => {
    const tr = document.createElement('tr');
    const filterText = Object.keys(job.filters || {}).length ? JSON.stringify(job.filters) : '-';
    tr.innerHTML = `
      <td>${job.type}</td>
      <td>${new Date(job.createdAt).toLocaleString()}</td>
      <td>${job.status}</td>
      <td>${filterText}</td>
      <td><a href="${job.downloadUrl}">Download</a></td>
    `;
    rows.appendChild(tr);
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = 'Creating export...';

  const type = document.querySelector('#type').value;
  const filters = {
    fromDate: document.querySelector('#fromDate').value,
    toDate: document.querySelector('#toDate').value,
    status: document.querySelector('#status').value
  };

  Object.keys(filters).forEach((key) => !filters[key] && delete filters[key]);

  const response = await fetch(`/exports/${type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters })
  });

  if (!response.ok) {
    const payload = await response.json();
    message.textContent = payload.error || 'Unable to create export';
    return;
  }

  message.textContent = 'Export created successfully.';
  form.reset();
  await loadExports();
});

loadExports();
