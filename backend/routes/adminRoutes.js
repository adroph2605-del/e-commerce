const r = require('express').Router(), c = require('../controllers/adminController'), { verifyToken, requireRole } = require('../middleware/authMiddleware');
r.use(verifyToken, requireRole('admin'));
r.get('/sellers', c.sellers); r.patch('/sellers/:id/status', c.sellerStatus); r.put('/commission', c.commission); module.exports = r;
