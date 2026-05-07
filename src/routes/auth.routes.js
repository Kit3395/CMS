const express = require('express');
const authController = require('../controllers/auth.controller');
const { verifyJWT } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', authController.login);
router.get('/me', verifyJWT, authController.me);

module.exports = router;
