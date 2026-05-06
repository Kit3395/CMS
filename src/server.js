import { createServer } from 'node:http';
import { URL } from 'node:url';
import { logAudit } from './services/audit.js';
import { db, nextResidentId, nextUserId, seedFinancialDataForResident } from './services/store.js';

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function checkAuth(req) {
  const role = req.headers['x-role'];
  if (!['Admin', 'SU'].includes(role)) {
    return { ok: false, actor: null };
  }
  return { ok: true, actor: req.headers['x-actor'] || 'system' };
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export const app = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/health' && req.method === 'GET') return json(res, 200, { status: 'ok' });
  if (!url.pathname.startsWith('/residents')) return json(res, 404, { error: 'Not found' });

  const auth = checkAuth(req);
  if (!auth.ok) return json(res, 403, { error: 'Forbidden. Admin or SU role required.' });

  if (url.pathname === '/residents' && req.method === 'POST') {
    const { fullName, email, phone, phase, block, status = 'active' } = await parseBody(req);
    if (!fullName || !email || !phone || !phase || !block) {
      return json(res, 400, { error: 'fullName, email, phone, phase, and block are required.' });
    }
    const user = { id: nextUserId(), email, role: 'Resident', createdAt: new Date().toISOString() };
    const resident = {
      id: nextResidentId(), userId: user.id, fullName, email, phone, phase, block, status,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    db.users.push(user); db.residents.push(resident); seedFinancialDataForResident(resident.id);
    logAudit({ action: 'resident.create', actor: auth.actor, entityType: 'resident', entityId: resident.id, after: resident });
    return json(res, 201, { resident, user });
  }

  if (url.pathname === '/residents' && req.method === 'GET') {
    const phase = url.searchParams.get('phase');
    const block = url.searchParams.get('block');
    const status = url.searchParams.get('status');
    const data = db.residents.filter((r) => (!phase || r.phase === phase) && (!block || r.block === block) && (!status || r.status === status));
    return json(res, 200, { data, count: data.length });
  }

  const idMatch = url.pathname.match(/^\/residents\/([^/]+)$/);
  if (idMatch && req.method === 'GET') {
    const resident = db.residents.find((r) => r.id === idMatch[1]);
    if (!resident) return json(res, 404, { error: 'Resident not found.' });
    const invoices = db.invoices.filter((i) => i.residentId === resident.id);
    const payments = db.payments.filter((p) => p.residentId === resident.id);
    const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    return json(res, 200, { resident, financialSummary: { totalInvoices: invoices.length, totalPayments: payments.length, totalInvoiced, totalPaid, outstandingBalance: totalInvoiced - totalPaid }, invoices, payments });
  }

  if (idMatch && req.method === 'PATCH') {
    const resident = db.residents.find((r) => r.id === idMatch[1]);
    if (!resident) return json(res, 404, { error: 'Resident not found.' });
    const { email, phone, status } = await parseBody(req);
    const before = { ...resident };
    if (email !== undefined) resident.email = email;
    if (phone !== undefined) resident.phone = phone;
    if (status !== undefined) resident.status = status;
    resident.updatedAt = new Date().toISOString();
    logAudit({ action: 'resident.update', actor: auth.actor, entityType: 'resident', entityId: resident.id, before, after: { ...resident } });
    return json(res, 200, { resident });
  }

  return json(res, 404, { error: 'Not found' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(process.env.PORT || 3000, () => console.log('Server running'));
}
