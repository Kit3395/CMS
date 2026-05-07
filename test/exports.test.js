import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const baseUrl = 'http://127.0.0.1:3111';
let server;

test.before(async () => {
  server = spawn('node', ['src/server.js'], { env: { ...process.env, PORT: '3111' } });
  await new Promise((resolve) => setTimeout(resolve, 400));
});

test.after(() => {
  server.kill();
});

test('create and list export', async () => {
  const create = await fetch(`${baseUrl}/exports/payments`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ filters: { status: 'paid' } })
  });
  assert.equal(create.status, 201);
  const job = await create.json();
  assert.equal(job.type, 'payments');

  const list = await fetch(`${baseUrl}/exports`);
  assert.equal(list.status, 200);
  const listJson = await list.json();
  assert.equal(listJson.length > 0, true);
  assert.equal(listJson[0].downloadUrl.includes('/download'), true);
});
