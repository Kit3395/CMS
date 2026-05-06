const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const { errorResponse } = require('../utils/httpError');

function authenticateJwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(
      errorResponse({
        code: 'AUTH_MISSING_TOKEN',
        message: 'Authorization token is required.'
      })
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json(
      errorResponse({
        code: 'AUTH_INVALID_TOKEN',
        message: 'Token is invalid or expired.',
        details: err.name
      })
    );
  }
}

module.exports = { authenticateJwt };
