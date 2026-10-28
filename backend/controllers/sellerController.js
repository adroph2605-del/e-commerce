const db = require('../config/db');
exports.me = async (req, res) => {
  const [s] = await db.query('SELECT name,status FROM stores WHERE user_id=?', [req.user.id]);
  const [[a]] = await db.query('SELECT COALESCE(SUM(price*qty),0) sales, COALESCE(SUM(commission),0) fee, COALESCE(SUM(qty),0) units FROM order_items WHERE vendor_id=?', [req.user.id]);
  res.json({ store: s[0] || null, sales: +a.sales, earnings: a.sales - a.fee, units: +a.units });
};
exports.products = async (req, res) => { const [r] = await db.query('SELECT * FROM products WHERE vendor_id=? ORDER BY id DESC', [req.user.id]); res.json(r); };
exports.orders = async (req, res) => {
  const [r] = await db.query('SELECT i.*, o.status, o.address, o.created_at FROM order_items i JOIN orders o ON o.id=i.order_id WHERE i.vendor_id=? ORDER BY i.id DESC LIMIT 200', [req.user.id]); res.json(r);
};
