const jwt = require('jsonwebtoken');

/**
 * Verifies a JWT from the Authorization header and attaches user context to req.
 * Expected payload shape:
 * {
 *   sub: string,
 *   email?: string,
 *   role: string
 * }
 */
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      claims: payload,
    };

    req.role = payload.role;

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Role guard helper.
 * @param {string[]} allowedRoles
 */
function requireRole(allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!req.user || !req.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }

    return next();
  };
}

module.exports = {
  authenticateJWT,
  requireRole,
};
