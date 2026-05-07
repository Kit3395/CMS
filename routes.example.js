const express = require('express');
const { authenticateJWT, requireRole } = require('./authMiddleware');

const router = express.Router();

// Only Admin can access this route.
router.get('/admin-only', authenticateJWT, requireRole(['Admin']), (req, res) => {
  res.json({
    message: 'Welcome, Admin',
    user: req.user,
  });
});

// Admin and SU can access this route.
router.get('/admin-or-su', authenticateJWT, requireRole(['Admin', 'SU']), (req, res) => {
  res.json({
    message: 'Welcome, privileged user',
    user: req.user,
  });
});

module.exports = router;
