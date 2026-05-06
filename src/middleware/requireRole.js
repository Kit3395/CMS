const { errorResponse } = require('../utils/httpError');

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json(
        errorResponse({
          code: 'RBAC_NO_ROLE',
          message: 'User role is missing from token.'
        })
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(
        errorResponse({
          code: 'RBAC_FORBIDDEN',
          message: `Access denied. Required role: ${allowedRoles.join(', ')}.`,
          details: { currentRole: req.user.role }
        })
      );
    }

    return next();
  };
}

module.exports = { requireRole };
