import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/server.js';
import { db } from '../src/services/store.js';

const headers = {
  'Content-Type': 'application/json',
  'x-role': 'Admin',
  'x-actor': 'tester'
};

let server;
let baseUrl;

test.before(() => {
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(() => {
  server.close();
});

test('creates resident and user', async () => {
  const res = await fetch(`${baseUrl}/residents`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '1234567',
      phase: '1',
      block: 'A'
    })
  });

  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.resident.fullName, 'Jane Doe');
  assert.equal(body.user.role, 'Resident');
  assert.ok(db.auditLogs.some((log) => log.action === 'resident.create'));
});

test('lists and filters residents', async () => {
  const res = await fetch(`${baseUrl}/residents?phase=1&block=A&status=active`, {
    headers
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.count >= 1);
});

test('gets resident detail with financial summary and update with audit', async () => {
  const residentId = db.residents[0].id;

  const detailRes = await fetch(`${baseUrl}/residents/${residentId}`, { headers });
  assert.equal(detailRes.status, 200);
  const detail = await detailRes.json();
  assert.equal(detail.financialSummary.totalInvoices, 2);

  const patchRes = await fetch(`${baseUrl}/residents/${residentId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ phone: '987654', status: 'inactive' })
  });

  assert.equal(patchRes.status, 200);
  const updated = await patchRes.json();
  assert.equal(updated.resident.status, 'inactive');
  assert.ok(db.auditLogs.some((log) => log.action === 'resident.update'));
});
