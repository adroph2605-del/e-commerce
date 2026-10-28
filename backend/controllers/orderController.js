const db = require('../config/db');
const VAT = 0.18, PROMOS = { SOKO10: 0.10 };
exports.create = async (req, res) => {
  const cx = await db.getConnection();
  try {
    const { items, promo, address, payment_method, currency } = req.body;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Cart is empty' });
    await cx.beginTransaction(); let sub = 0; const lines = [];
    const [[def]] = await cx.query("SELECT v FROM settings WHERE k='commission'");
    for (const it of items) {
      const qty = Math.max(1, parseInt(it.qty) || 1);
      const [p] = await cx.query('SELECT id,name,price,stock,vendor_id FROM products WHERE id=? FOR UPDATE', [it.id]);
      if (!p.length || p[0].stock < qty) throw new Error(`Out of stock: ${p.length ? p[0].name : it.id}`);
      let rate = 0; if (p[0].vendor_id) { const [s] = await cx.query('SELECT commission FROM stores WHERE user_id=?', [p[0].vendor_id]); rate = (s[0] && s[0].commission != null ? +s[0].commission : +def.v) / 100; }
      sub += p[0].price * qty; lines.push([p[0], qty, p[0].price * qty * rate]);
      await cx.query('UPDATE products SET stock=stock-? WHERE id=?', [qty, p[0].id]);
    }
    const disc = sub * (PROMOS[(promo || '').toUpperCase()] || 0), tax = (sub - disc) * VAT, ship = sub > 200000 ? 0 : 5000, total = sub - disc + tax + ship;
    const [o] = await cx.query('INSERT INTO orders(user_id,subtotal,discount,tax,shipping,total,currency,payment_method,address) VALUES(?,?,?,?,?,?,?,?,?)',
      [req.user.id || null, sub, disc, tax, ship, total, currency || 'TZS', payment_method || 'mpesa', address || '']);
    for (const [p, q, fee] of lines) await cx.query('INSERT INTO order_items(order_id,product_id,name,price,qty,vendor_id,commission) VALUES(?,?,?,?,?,?,?)', [o.insertId, p.id, p.name, p.price, q, p.vendor_id, fee]);
    await cx.commit(); res.status(201).json({ id: o.insertId, total });
  } catch (e) { await cx.rollback(); res.status(400).json({ error: e.message }); } finally { cx.release(); }
};
exports.mine = async (req, res) => {
  const [o] = await db.query('SELECT * FROM orders WHERE user_id=? ORDER BY id DESC', [req.user.id]);
  if (o.length) { const [it] = await db.query('SELECT * FROM order_items WHERE order_id IN (?)', [o.map(x => x.id)]); o.forEach(x => x.items = it.filter(i => i.order_id === x.id)); }
  res.json(o);
};
exports.all = async (_q, res) => { const [r] = await db.query('SELECT o.*, u.name customer FROM orders o LEFT JOIN users u ON u.id=o.user_id ORDER BY o.id DESC LIMIT 200'); res.json(r); };
exports.setStatus = async (req, res) => {
  const st = req.body.status, ok = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Refunded']; if (!ok.includes(st)) return res.status(400).json({ error: 'Bad status' });
  if (req.user.role === 'seller') { // sellers may only fulfil orders containing their own items
    const [x] = await db.query('SELECT 1 FROM order_items WHERE order_id=? AND vendor_id=? LIMIT 1', [req.params.id, req.user.id]);
    if (!x.length || !['Processing', 'Shipped'].includes(st)) return res.status(403).json({ error: 'Not allowed' });
  }
  await db.query('UPDATE orders SET status=? WHERE id=?', [st, req.params.id]); res.json({ ok: true });
};
exports.stats = async (_q, res) => {
  const [[a]] = await db.query("SELECT COALESCE(SUM(total),0) gmv, COUNT(*) orders FROM orders WHERE status<>'Refunded'");
  const [[f]] = await db.query("SELECT COALESCE(SUM(i.commission),0) fees FROM order_items i JOIN orders o ON o.id=i.order_id WHERE o.status<>'Refunded'");
  const [[b]] = await db.query('SELECT COUNT(*) products FROM products'), [[c]] = await db.query('SELECT COUNT(*) users FROM users'), [[d]] = await db.query("SELECT COUNT(*) pending FROM stores WHERE status='Pending'");
  res.json({ ...a, ...f, ...b, ...c, ...d });
};
