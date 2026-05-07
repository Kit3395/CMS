const express = require('express');
const { verifyJWT } = require('../middleware/auth.middleware');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.get('/test', verifyJWT, requireRole(['ADMIN', 'SU']), (req, res) => {
  return res.status(200).json({
    message: 'Admin route access granted',
    user: req.user,
  });
});

module.exports = router;
