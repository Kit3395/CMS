const express = require('express');
const { authenticateJwt } = require('../middleware/authenticateJwt');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

router.get('/dashboard', authenticateJwt, requireRole(['ADMIN', 'SU']), (req, res) => {
  return res.json({
    success: true,
    data: {
      message: 'Welcome to admin dashboard.',
      role: req.user.role
    }
  });
});

module.exports = router;
