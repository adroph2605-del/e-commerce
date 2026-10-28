const r = require('express').Router(), c = require('../controllers/sellerController'), { verifyToken, requireRole } = require('../middleware/authMiddleware');
r.use(verifyToken, requireRole('seller'));
r.get('/me', c.me); r.get('/products', c.products); r.get('/orders', c.orders); module.exports = r;
