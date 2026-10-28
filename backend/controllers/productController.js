const db = require('../config/db');
exports.list = async (req, res) => {
  try {
    const { q, category, page = 1 } = req.query; const lim = 24, off = (Math.max(1, +page) - 1) * lim;
    let sql = "SELECT p.*, c.slug category, COALESCE(s.name,'SOKO NEXT') store FROM products p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN stores s ON s.user_id=p.vendor_id WHERE (p.vendor_id IS NULL OR s.status='Active')"; const a = [];
    if (q) { sql += ' AND (p.name LIKE ? OR p.description LIKE ?)'; a.push(`%${q}%`, `%${q}%`); }
    if (category) { sql += ' AND c.slug=?'; a.push(category); }
    const [rows] = await db.query(sql + ' ORDER BY p.id DESC LIMIT ? OFFSET ?', [...a, lim, off]); res.json(rows);
  } catch { res.status(500).json({ error: 'Server error' }); }
};
exports.get = async (req, res) => {
  const [r] = await db.query('SELECT p.*, COALESCE(s.name,"SOKO NEXT") store FROM products p LEFT JOIN stores s ON s.user_id=p.vendor_id WHERE p.id=?', [req.params.id]);
  r.length ? res.json(r[0]) : res.status(404).json({ error: 'Not found' });
};
exports.categories = async (_q, res) => { const [r] = await db.query('SELECT * FROM categories'); res.json(r); };
const f = b => [+b.category_id || null, String(b.name || '').trim(), b.description || '', +b.price, +b.stock || 0, b.image || '', b.badge || null];
const seller = r => r.user.role === 'seller';
exports.create = async (req, res) => {
  const b = req.body; if (!b.name || !(+b.price > 0)) return res.status(400).json({ error: 'Name and price required' });
  if (seller(req)) { const [s] = await db.query("SELECT status FROM stores WHERE user_id=?", [req.user.id]); if (!s.length || s[0].status !== 'Active') return res.status(403).json({ error: 'Store not approved yet' }); }
  const [r] = await db.query('INSERT INTO products(category_id,name,description,price,stock,image,badge,vendor_id) VALUES(?,?,?,?,?,?,?,?)', [...f(b), seller(req) ? req.user.id : null]);
  res.status(201).json({ id: r.insertId });
};
exports.update = async (req, res) => {
  const [r] = await db.query('UPDATE products SET category_id=?,name=?,description=?,price=?,stock=?,image=?,badge=? WHERE id=?' + (seller(req) ? ' AND vendor_id=?' : ''), [...f(req.body), req.params.id, ...(seller(req) ? [req.user.id] : [])]);
  r.affectedRows ? res.json({ ok: true }) : res.status(403).json({ error: 'Not your product' });
};
exports.remove = async (req, res) => { await db.query('DELETE FROM products WHERE id=?' + (seller(req) ? ' AND vendor_id=?' : ''), [req.params.id, ...(seller(req) ? [req.user.id] : [])]); res.json({ ok: true }); };
