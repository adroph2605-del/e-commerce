const db = require('../config/db');
exports.sellers = async (_q, res) => {
  const [r] = await db.query('SELECT s.id,s.name,s.status,s.commission,u.email FROM stores s JOIN users u ON u.id=s.user_id ORDER BY s.id DESC');
  const [[c]] = await db.query("SELECT v FROM settings WHERE k='commission'"); res.json({ sellers: r, commission: +c.v });
};
exports.sellerStatus = async (req, res) => {
  if (!['Pending', 'Active', 'Suspended', 'Rejected'].includes(req.body.status)) return res.status(400).json({ error: 'Bad status' });
  await db.query('UPDATE stores SET status=? WHERE id=?', [req.body.status, req.params.id]); res.json({ ok: true });
};
exports.commission = async (req, res) => {
  const v = +req.body.commission; if (!(v >= 0 && v <= 50)) return res.status(400).json({ error: 'Commission must be 0-50' });
  await db.query("UPDATE settings SET v=? WHERE k='commission'", [v]); res.json({ ok: true });
};
