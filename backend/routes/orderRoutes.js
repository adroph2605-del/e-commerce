const r = require('express').Router(), c = require('../controllers/orderController'), { verifyToken, requireRole } = require('../middleware/authMiddleware');
r.post('/', verifyToken, c.create); r.get('/mine', verifyToken, c.mine);
r.get('/admin/all', verifyToken, requireRole('admin'), c.all); r.get('/admin/stats', verifyToken, requireRole('admin'), c.stats);
r.patch('/:id/status', verifyToken, requireRole('admin', 'seller'), c.setStatus); module.exports = r;
