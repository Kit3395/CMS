const announcements = [];
let nextId = 1;

export function createAnnouncement(payload) {
  const now = new Date().toISOString();
  const announcement = {
    id: nextId++,
    title: payload.title,
    content: payload.content,
    category: payload.category ?? null,
    status: payload.status ?? 'active',
    target_scope: payload.target_scope ?? 'all',
    phase: payload.phase ?? null,
    block: payload.block ?? null,
    start_at: payload.start_at,
    end_at: payload.end_at,
    created_at: now,
    updated_at: now,
  };

  announcements.push(announcement);
  return announcement;
}

export function listAnnouncements(filters = {}) {
  const now = new Date();

  return announcements.filter((a) => {
    if (filters.category && a.category !== filters.category) {
      return false;
    }

    if (filters.phase && a.target_scope === 'phase' && a.phase !== filters.phase) {
      return false;
    }

    if (filters.block && a.target_scope === 'block' && a.block !== filters.block) {
      return false;
    }

    if (filters.active_only) {
      if (a.status !== 'active') {
        return false;
      }

      const start = a.start_at ? new Date(a.start_at) : null;
      const end = a.end_at ? new Date(a.end_at) : null;

      if (start && start > now) {
        return false;
      }

      if (end && end < now) {
        return false;
      }
    }

    return true;
  });
}

export function listAnnouncementsForResident(filters = {}) {
  const now = new Date();

  return announcements.filter((a) => {
    if (a.status !== 'active') {
      return false;
    }

    const start = a.start_at ? new Date(a.start_at) : null;
    const end = a.end_at ? new Date(a.end_at) : null;

    if (start && start > now) {
      return false;
    }

    if (end && end < now) {
      return false;
    }

    if (filters.category && a.category !== filters.category) {
      return false;
    }

    if (a.target_scope === 'phase' && filters.phase && a.phase !== filters.phase) {
      return false;
    }

    if (a.target_scope === 'block' && filters.block && a.block !== filters.block) {
      return false;
    }

    if (a.target_scope === 'phase' && !filters.phase) {
      return false;
    }

    if (a.target_scope === 'block' && !filters.block) {
      return false;
    }

    return true;
  });
}

export function updateAnnouncement(id, patch) {
  const announcement = announcements.find((a) => a.id === id);

  if (!announcement) {
    return null;
  }

  const allowed = ['status', 'start_at', 'end_at', 'content', 'title', 'category', 'phase', 'block', 'target_scope'];

  for (const key of allowed) {
    if (Object.hasOwn(patch, key)) {
      announcement[key] = patch[key];
    }
  }

  announcement.updated_at = new Date().toISOString();
  return announcement;
}
