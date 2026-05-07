const jwt = require('jsonwebtoken');

function signAccessToken(user) {
  const payload = {
    id: user.id,
    role: user.role,
    email: user.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

module.exports = {
  signAccessToken,
};
