const express = require('express');

const router = express.Router();

router.get('/health', async (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'cms-hoa-go-backend',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
