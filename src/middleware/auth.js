const ROLE_RANK = {
  user: 1,
  staff: 2,
  admin: 3,
};

function mockAuthenticate(req, _res, next) {
  const userId = req.get('x-user-id');
  const role = req.get('x-user-role') || 'user';

  if (!userId) {
    req.user = null;
    return next();
  }

  req.user = { id: userId, role };
  return next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}

function requireRole(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if ((ROLE_RANK[req.user.role] || 0) < (ROLE_RANK[minRole] || 0)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return next();
  };
}

module.exports = {
  mockAuthenticate,
  requireAuth,
  requireRole,
};
