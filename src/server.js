import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';
import crypto from 'node:crypto';

const port = process.env.PORT || 3000;
const validTypes = new Set(['residents', 'payments', 'invoices']);
const exportsStore = [];

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function badRequest(res, message) {
  json(res, 400, { error: message });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function createCsvContent(type, filters) {
  const filterPairs = Object.entries(filters || {});
  const header = 'type,generatedAt,filterKey,filterValue';
  if (filterPairs.length === 0) {
    return `${header}\n${type},${new Date().toISOString()},,`;
  }
  const rows = filterPairs.map(([key, value]) => `${type},${new Date().toISOString()},${key},${String(value)}`);
  return `${header}\n${rows.join('\n')}`;
}

function makeExportJob(type, filters, host) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const fileName = `${type}-export-${id}.csv`;
  const csv = createCsvContent(type, filters);
  const job = {
    id,
    type,
    filters,
    status: 'completed',
    createdAt,
    fileName,
    csv,
    downloadUrl: `${host}/exports/${id}/download`
  };
  exportsStore.unshift(job);
  return job;
}

async function serveFile(res, path, type = 'text/html') {
  try {
    const content = await readFile(path);
    res.writeHead(200, { 'Content-Type': type });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not Found');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const host = `http://${req.headers.host}`;

  if (req.method === 'GET' && url.pathname === '/') {
    return serveFile(res, 'public/exports.html');
  }

  if (req.method === 'POST' && url.pathname.startsWith('/exports/')) {
    const type = url.pathname.split('/')[2];
    if (!validTypes.has(type)) {
      return badRequest(res, 'Invalid export type. Use residents, payments, or invoices.');
    }

    try {
      const body = await parseBody(req);
      const filters = body.filters && typeof body.filters === 'object' ? body.filters : {};
      const job = makeExportJob(type, filters, host);
      return json(res, 201, {
        id: job.id,
        type: job.type,
        status: job.status,
        createdAt: job.createdAt,
        filters: job.filters,
        downloadUrl: job.downloadUrl
      });
    } catch (error) {
      return badRequest(res, error.message);
    }
  }

  if (req.method === 'GET' && url.pathname === '/exports') {
    return json(
      res,
      200,
      exportsStore.map(({ csv, ...rest }) => rest)
    );
  }

  if (req.method === 'GET' && url.pathname.startsWith('/exports/') && url.pathname.endsWith('/download')) {
    const id = url.pathname.split('/')[2];
    const job = exportsStore.find((item) => item.id === id);
    if (!job) {
      res.writeHead(404);
      res.end('Export not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${job.fileName}"`
    });
    res.end(job.csv);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/app.js') {
    return serveFile(res, 'public/app.js', 'application/javascript');
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
