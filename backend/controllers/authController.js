const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { SECRET } = require('../middleware/authMiddleware');

const sign = (u, days = 7) =>
  jwt.sign({ id: u.id, email: u.email, name: u.name, role: u.role }, SECRET, { expiresIn: days + 'd' });

const same = (a, b) =>
  crypto.timingSafeEqual(
    crypto.createHash('sha256').update(String(a)).digest(),
    crypto.createHash('sha256').update(String(b)).digest()
  );

exports.register = async (req, res) => {
  try {
    const { name, email, password, store_name, tin, payout } = req.body;
    const role = req.body.role === 'seller' ? 'seller' : 'customer';

    if (!name || !/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 6) {
      return res.status(400).json({ error: 'Invalid name, email or password (min 6)' });
    }
    if (role === 'seller' && !(store_name || '').trim()) {
      return res.status(400).json({ error: 'Store name required' });
    }

    const [ex] = await db.query('SELECT id FROM users WHERE email=?', [email.toLowerCase()]);
    if (ex.length) return res.status(409).json({ error: 'Email already registered' });

    const [r] = await db.query(
      'INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)',
      [name.trim(), email.toLowerCase(), await bcrypt.hash(password, 10), role]
    );

    if (role === 'seller') {
      await db.query('INSERT INTO stores(user_id,name) VALUES(?,?)', [r.insertId, store_name.trim()]);
      // tin / payout stored client-side for now; extend schema later if needed
    }

    const u = { id: r.insertId, name: name.trim(), email: email.toLowerCase(), role };
    res.status(201).json({
      token: sign(u),
      user: u,
      storeStatus: role === 'seller' ? 'Pending' : null
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email = '', password = '', remember } = req.body;
    const days = remember === false ? 1 : 7;

    const saEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
    const saPass = process.env.SUPER_ADMIN_PASSWORD;

    if (saEmail && saPass && email.toLowerCase() === saEmail && same(password, saPass)) {
      const u = { id: 0, name: 'Super Admin', email: saEmail, role: 'admin' };
      return res.json({ token: sign(u, days), user: u, requiresMfa: true });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email=?', [email.toLowerCase()]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ error: 'Wrong email or password' });
    }

    const row = rows[0];
    const u = { id: row.id, name: row.name, email: row.email, role: row.role };

    let storeStatus = null;
    if (row.role === 'seller') {
      const [s] = await db.query('SELECT status FROM stores WHERE user_id=?', [row.id]);
      storeStatus = s[0]?.status || 'Pending';
    }

    res.json({ token: sign(u, days), user: u, storeStatus });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.forgot = async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    console.log('[auth/forgot] reset requested for', email);
    res.json({ ok: true, message: 'If the email exists, a reset link was sent' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    if (!req.user?.id && req.user?.role === 'admin') {
      return res.json({ user: req.user });
    }
    const [rows] = await db.query(
      'SELECT id,name,email,role,created_at FROM users WHERE id=?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    let store = null;
    if (rows[0].role === 'seller') {
      const [s] = await db.query(
        'SELECT id,name,status,commission FROM stores WHERE user_id=?',
        [rows[0].id]
      );
      store = s[0] || null;
    }
    res.json({ user: rows[0], store });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};