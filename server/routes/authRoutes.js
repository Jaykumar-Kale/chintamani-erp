const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const protect = require('../middleware/auth');

router.post('/register', protect, register);
router.post('/login', login);

module.exports = router;