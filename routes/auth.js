const express = require('express');
const { signup, login, forgot, verify, UpdatePassword } = require('../controllers/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot', forgot);
router.post('/verify', verify);
router.post('/UpdatePassword', UpdatePassword);

module.exports = router;