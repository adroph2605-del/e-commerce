/* ========== RENDER API – badilisha URL baada ya deploy ========== */
const API_BASE = localStorage.getItem('sn_api') ||
  (['localhost', '127.0.0.1'].includes(location.hostname)
    ? 'http://localhost:3000/api'
    : 'https://YOUR-RENDER-SERVICE.onrender.com/api');
/* mfano: 'https://soko-next-api.onrender.com/api' */

const RATES = { TZS: 1, USD: 0.0004, KES: 0.0516, EUR: 0.00037 };
const SYM = { TZS: 'TSh', USD: '$', KES: 'KSh', EUR: '€' };
const CUR = () => localStorage.sn_cur || 'TZS';
const fmt = n => SYM[CUR()] + ' ' + (n * RATES[CUR()]).toLocaleString(undefined, { maximumFractionDigits: CUR() === 'TZS' || CUR() === 'KES' ? 0 : 2 });
const user = () => { try { return JSON.parse(localStorage.sn_user); } catch { return null; } };
const FALLBACK = [
  { id: 1, name: 'Pro Laptop 15"', price: 2450000, image: '/assets/images/img6.jpg', rating: 4.8, badge: 'Hot', category: 'electronics', stock: 25, description: 'Fast, light laptop for work and study.' },
  { id: 2, name: 'Smartphone X', price: 980000, image: '/assets/images/img3.jpg', rating: 4.6, badge: 'New', category: 'electronics', stock: 60, description: 'Dual SIM, 5G, all-day battery.' },
  { id: 3, name: 'Mustard Sofa 3-Seater', price: 1350000, image: '/assets/images/img6.jpg', rating: 4.7, badge: '-15%', category: 'home', stock: 8, description: 'Soft fabric, solid wood legs.' },
  { id: 4, name: 'Shipping Boxes (50 pack)', price: 85000, image: '/assets/images/img4.jpg', rating: 4.5, badge: 'Bulk', category: 'business', stock: 300, description: 'Strong cardboard boxes for sellers.' },
  { id: 5, name: 'Starter Seller Kit', price: 120000, image: '/assets/images/img1.jpg', rating: 4.4, badge: 'Deal', category: 'business', stock: 120, description: 'Boxes, tape, labels and bags.' },
  { id: 6, name: 'Rainbow Socks (6 pairs)', price: 35000, image: '/assets/images/img2.jpg', rating: 4.9, badge: 'Top', category: 'fashion', stock: 200, description: 'Colourful cotton socks.' }
];

async function api(path, opts = {}) {
  const h = { 'Content-Type': 'application/json' };
  if (localStorage.sn_token) h.Authorization = 'Bearer ' + localStorage.sn_token;
  const r = await fetch(API_BASE + path, {
    ...opts,
    headers: h,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Error');
  return d;
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const clean = p => ({
  ...p,
  name: esc(p.name),
  description: esc(p.description),
  store: esc(p.store),
  badge: p.badge ? esc(p.badge) : p.badge,
  image: /^(\/|https:\/\/)/.test(p.image || '') ? p.image : '/assets/images/img1.jpg'
});
async function getProducts(qs = '') { return (await rawProducts(qs)).map(clean); }
async function rawProducts(qs = '') {
  try { return await api('/products' + qs); } catch {
    const p = new URLSearchParams(qs.replace('?', '')), q = (p.get('q') || '').toLowerCase(), c = p.get('category');
    return FALLBACK.filter(x => (!q || x.name.toLowerCase().includes(q)) && (!c || x.category === c));
  }
}
function toast(msg, type = 'ok') {
  let box = document.getElementById('toasts');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toasts';
    box.setAttribute('aria-live', 'polite');
    document.body.append(box);
  }
  const e = document.createElement('div');
  e.className = 'toast ' + type;
  e.textContent = msg;
  box.append(e);
  setTimeout(() => { e.classList.add('out'); setTimeout(() => e.remove(), 300); }, 3000);
}
const stars = r => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

function layout() {
  document.documentElement.dataset.theme = localStorage.sn_theme || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  if (!document.getElementById('hdr') || !document.getElementById('ftr')) return;
  const u = user(), cats = ['electronics', 'home', 'fashion', 'business'];
  document.getElementById('hdr').innerHTML = `<div class="bar glass"><a class="logo" href="index.html">SOKO<b>NEXT</b></a>
  <form class="search" id="sf"><input id="q" data-ph="search" autocomplete="off" aria-label="Search"><button type="button" id="mic" title="Voice search">🎤</button></form>
  <div class="tools"><select id="cur" aria-label="Currency">${Object.keys(RATES).map(c => `<option ${c === CUR() ? 'selected' : ''}>${c}</option>`).join('')}</select>
  <button id="lang">${(localStorage.sn_lang || 'en') === 'en' ? 'SW' : 'EN'}</button><button id="theme" aria-label="Theme">◐</button>
  <a class="cartb" href="cart.html">🛒<span id="cc">0</span></a>
  ${u ? `<a href="${{ admin: 'admin.html', seller: 'seller.html', customer: 'account.html' }[u.role]}" class="btn sm ghost">${esc(u.name.split(' ')[0])} · ${t(u.role)}</a>` : '<a href="auth.html?role=seller" class="btn sm ghost" data-i18n="becomeSeller"></a>'}
  ${u ? `<a href="#" id="out" class="btn sm ghost" data-i18n="logout"></a>` : '<a href="auth.html" class="btn sm" data-i18n="login"></a>'}</div></div>
  <nav class="cats"><a href="index.html" data-i18n="all"></a>${cats.map(c => `<a href="index.html?category=${c}">${c[0].toUpperCase() + c.slice(1)}</a>`).join('')}</nav>`;

  document.getElementById('ftr').innerHTML = `
  <div class="foot">
    <div class="foot-brand">
      <a class="logo" href="index.html">SOKO<b>NEXT</b></a>
      <p class="foot-about">Africa’s multi-vendor marketplace. Shop electronics, fashion, home &amp; business supplies — or open your store and sell.</p>
      <div class="foot-social">
        <a href="https://www.facebook.com/share/1GnGqjyskN/" target="_blank" rel="noopener" aria-label="Facebook" class="soc fb">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04v-2.66c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.93-1.95 1.89v2.28h3.32l-.53 3.49h-2.79V24C19.62 23.1 24 18.1 24 12.07z"/></svg>
          <span>Facebook</span>
        </a>
        <a href="https://www.instagram.com/ADROPH26/" target="_blank" rel="noopener" aria-label="Instagram" class="soc ig">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16m0-2.16C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.41-11.85a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/></svg>
          <span>@ADROPH26</span>
        </a>
        <a href="https://www.linkedin.com/in/adroph-audiphance-andrea-207555429" target="_blank" rel="noopener" aria-label="LinkedIn" class="soc li">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0z"/></svg>
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
    <div class="foot-col">
      <h4 data-i18n="links">Quick links</h4>
      <ul class="foot-links">
        <li><a href="index.html">Home / Shop</a></li>
        <li><a href="auth.html?role=seller">Sell on SOKO NEXT</a></li>
        <li><a href="account.html">My orders</a></li>
        <li><a href="cart.html">Cart</a></li>
        <li><a href="auth.html">Login / Register</a></li>
      </ul>
    </div>
    <div class="foot-col">
      <h4>Contact</h4>
      <ul class="foot-links">
        <li><a href="mailto:adroph2605@gmail.com">✉ adroph2605@gmail.com</a></li>
        <li><span>📍 Dar es Salaam, Tanzania</span></li>
        <li><span>🕒 Mon–Sat · 8:00–18:00 EAT</span></li>
        <li><a href="mailto:adroph2605@gmail.com">Support &amp; partnerships</a></li>
      </ul>
    </div>
    <div class="foot-col">
      <h4 data-i18n="newsletter">Newsletter</h4>
      <p class="foot-note">Deals, new arrivals &amp; seller tips — no spam.</p>
      <form id="nl" class="foot-nl">
        <input type="email" required placeholder="you@example.com" aria-label="Email">
        <button class="btn sm" type="submit" data-i18n="subscribe">Subscribe</button>
      </form>
      <p class="pay">M-PESA · Tigo Pesa · Airtel · Visa · Mastercard · PayPal</p>
    </div>
  </div>
  <div class="foot-bottom">
    <p>© <span id="yr"></span> SOKO NEXT. <span data-i18n="rights">All rights reserved.</span></p>
    <p class="foot-legal"><a href="mailto:adroph2605@gmail.com">Contact</a> · Privacy · Terms</p>
  </div>`;

  document.getElementById('yr').textContent = new Date().getFullYear();
  document.getElementById('theme').onclick = () => {
    localStorage.sn_theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    layout(); applyI18n(); wire();
  };
  document.getElementById('lang').onclick = () => {
    localStorage.sn_lang = (localStorage.sn_lang || 'en') === 'en' ? 'sw' : 'en';
    location.reload();
  };
  document.getElementById('cur').onchange = e => {
    localStorage.sn_cur = e.target.value;
    location.reload();
  };
  const o = document.getElementById('out');
  if (o) o.onclick = e => {
    e.preventDefault();
    localStorage.removeItem('sn_token');
    localStorage.removeItem('sn_user');
    location.href = 'index.html';
  };
  document.getElementById('nl').onsubmit = e => {
    e.preventDefault();
    toast(t('subOk'));
    e.target.reset();
  };
  document.getElementById('sf').onsubmit = e => {
    e.preventDefault();
    location.href = 'index.html?q=' + encodeURIComponent(document.getElementById('q').value);
  };
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition, mic = document.getElementById('mic');
  if (!SR) mic.hidden = true;
  else mic.onclick = () => {
    const r = new SR();
    r.lang = localStorage.sn_lang === 'sw' ? 'sw-TZ' : 'en-US';
    r.onresult = ev => {
      document.getElementById('q').value = ev.results[0][0].transcript;
      document.getElementById('sf').requestSubmit();
    };
    r.start();
  };
  if (window.updateCartBadge) updateCartBadge();
}
function wire() { applyI18n(); }
document.addEventListener('DOMContentLoaded', () => { layout(); applyI18n(); });