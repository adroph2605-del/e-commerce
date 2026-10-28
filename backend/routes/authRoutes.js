const r = require('express').Router();
const c = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

r.post('/register', c.register);
r.post('/login', c.login);
r.post('/forgot', c.forgot);
r.get('/me', verifyToken, c.me);

module.exports = r;