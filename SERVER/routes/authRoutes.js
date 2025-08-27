const express = require('express');
const { register, login, logout, refreshAccessToken, verifyAuth } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/register', register );
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/refresh-token', refreshAccessToken);
router.get('/verify', authMiddleware, verifyAuth);

module.exports = router;