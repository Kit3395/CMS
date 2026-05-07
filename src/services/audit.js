import { db } from './store.js';

export function logAudit({ action, actor, entityType, entityId, before = null, after = null }) {
  db.auditLogs.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    actor,
    entityType,
    entityId,
    before,
    after,
    occurredAt: new Date().toISOString()
  });
}
