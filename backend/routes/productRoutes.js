const r = require('express').Router(), c = require('../controllers/productController'), { verifyToken, requireRole } = require('../middleware/authMiddleware');
r.get('/', c.list); r.get('/categories', c.categories); r.get('/:id', c.get);
const g = [verifyToken, requireRole('admin', 'seller')];
r.post('/', g, c.create); r.put('/:id', g, c.update); r.delete('/:id', g, c.remove); module.exports = r;
