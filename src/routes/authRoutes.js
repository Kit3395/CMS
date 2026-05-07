const express = require('express');
const bcrypt = require('bcryptjs');
const { findByEmail, findById } = require('../data/users');
const { signToken } = require('../auth/token');
const { authenticateJwt } = require('../middleware/authenticateJwt');
const { errorResponse } = require('../utils/httpError');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(
      errorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Email and password are required.',
        details: { required: ['email', 'password'] }
      })
    );
  }

  const user = findByEmail(email);
  if (!user) {
    return res.status(401).json(
      errorResponse({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      })
    );
  }

  const matched = await bcrypt.compare(password, user.passwordHash);
  if (!matched) {
    return res.status(401).json(
      errorResponse({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      })
    );
  }

  const token = signToken(user);
  return res.json({
    success: true,
    data: {
      accessToken: token,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    }
  });
});

router.get('/me', authenticateJwt, (req, res) => {
  const user = findById(req.user.sub);
  if (!user) {
    return res.status(404).json(
      errorResponse({
        code: 'USER_NOT_FOUND',
        message: 'User from token no longer exists.'
      })
    );
  }

  return res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }
  });
});

module.exports = router;
