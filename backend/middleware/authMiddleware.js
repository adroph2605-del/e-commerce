const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const SA = () => process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
exports.SECRET = SECRET;
exports.verifyToken = (req, res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return res.status(401).json({ error: 'Login required' });
  try {
    const u = jwt.verify(h.slice(7), SECRET);
    const adminEmail = SA();
    if (u.id === 0 && u.role === 'admin' && adminEmail && u.email?.toLowerCase() === adminEmail) {
      u.superAdmin = true;
    }
    req.user = u; next();
  } catch { res.status(401).json({ error: 'Invalid or expired token' }); }
};
exports.requireRole = (...roles) => (req, res, next) =>
  (req.user.superAdmin || roles.includes(req.user.role)) ? next() : res.status(403).json({ error: 'Access denied' });
