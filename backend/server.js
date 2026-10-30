require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

const ALLOWED = [
  'https://e-commerce-frontend-lemon-nine.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, cb) {
    if (!origin || ALLOWED.includes(origin) || /\.vercel\.app$/.test(origin || '')) {
      return cb(null, true);
    }
    return cb(null, true); // au: cb(new Error('Not allowed by CORS'))
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'SOKO NEXT API' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/seller', require('./routes/sellerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Backend-only: usitegemee static frontend hapa
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('SOKO NEXT API on port ' + PORT);
});