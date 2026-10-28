/* SOKO NEXT – AI Shopping Assistant (Alibaba-style) */
(function () {
  if (window.__sokoAI) return;
  window.__sokoAI = true;

  const isSw = () => (localStorage.sn_lang || 'en') === 'sw';
  const L = (en, sw) => (isSw() ? sw : en);
  const $ = (s, el = document) => el.querySelector(s);

  const FAQ = [
    {
      keys: ['shipping', 'delivery', 'deliver', 'usafirishaji', 'upelekaji', 'delivery time', 'muda'],
      reply: () => L(
        '🚚 Free shipping on orders above <b>TSh 200,000</b>. Below that = TSh 5,000. Delivery: 1–5 business days across Tanzania.',
        '🚚 Usafirishaji <b>bure</b> kwa oda zaidi ya TSh 200,000. Chini ya hiyo = TSh 5,000. Muda: siku 1–5 za kazi Tanzania nzima.'
      )
    },
    {
      keys: ['payment', 'pay', 'malipo', 'mpesa', 'pesa', 'visa', 'card'],
      reply: () => L(
        '💳 We accept <b>M-PESA, Tigo Pesa, Airtel Money, Visa, Mastercard</b> and PayPal.',
        '💳 Tunakubali <b>M-PESA, Tigo Pesa, Airtel Money, Visa, Mastercard</b> na PayPal.'
      )
    },
    {
      keys: ['promo', 'discount', 'code', 'coupon', 'ofani', 'punguzo', 'soko10'],
      reply: () => L(
        '🎁 Promo code: <b>SOKO10</b> → 10% off at checkout.',
        '🎁 Code ya punguzo: <b>SOKO10</b> → punguzo la 10% unapomaliza oda.'
      )
    },
    {
      keys: ['return', 'refund', 'rudisha', 'rejesha', 'warranty'],
      reply: () => L(
        '↩️ Returns within 7 days if unused + original packaging.',
        '↩️ Unaweza kurudisha ndani ya siku 7 ikiwa bidhaa haijatumika.'
      )
    },
    {
      keys: ['seller', 'sell', 'uza', 'duka', 'store', 'vendor', 'become seller', 'muuzaji'],
      reply: () => L(
        '🏪 Want to sell? <a href="auth.html?role=seller">Open seller account</a>. After admin approval you can list products (commission ~10%).',
        '🏪 Unataka kuuza? <a href="auth.html?role=seller">Fungua akaunti ya muuzaji</a>. Baada ya idhini ya admin unaweza kuweka bidhaa (tume ~10%).'
      )
    },
    {
      keys: ['help', 'msaada', 'support', 'contact', 'wasiliana'],
      reply: () => L(
        'I can help with: products, shipping, payments, promo codes, becoming a seller, or take you to Cart / Orders / Login.',
        'Ninaweza kusaidia: bidhaa, usafirishaji, malipo, promo, kuwa muuzaji, au kukupeleka Cart / Oda / Login.'
      )
    }
  ];

  const CATS = {
    electronics: ['laptop', 'phone', 'smartphone', 'simu', 'electronics', 'elektroniki', 'gadget'],
    home: ['sofa', 'home', 'living', 'nyumbani', 'fanicha', 'furniture'],
    fashion: ['fashion', 'socks', 'nguo', 'vazi', 'mitindo'],
    business: ['box', 'boxes', 'seller kit', 'biashara', 'sanduku', 'packaging']
  };

  function injectCSS() {
    if ($('#soko-ai-css')) return;
    const s = document.createElement('style');
    s.id = 'soko-ai-css';
    s.textContent = `
#soko-ai-btn{position:fixed;bottom:1.4rem;right:1.4rem;z-index:9999;width:60px;height:60px;border-radius:50%;border:none;background:linear-gradient(135deg,#FF6A00,#FF8C00);color:#fff;cursor:pointer;box-shadow:0 8px 28px rgba(255,106,0,.45);display:flex;align-items:center;justify-content:center;transition:.25s}
#soko-ai-btn:hover{transform:scale(1.08)}
#soko-ai-btn .pulse{position:absolute;inset:-4px;border-radius:50%;border:2px solid #FF6A00;animation:sokoPulse 1.8s infinite}
@keyframes sokoPulse{0%{transform:scale(.85);opacity:.8}70%{transform:scale(1.25);opacity:0}100%{opacity:0}}
#soko-ai-btn.open{background:#1a1a1a}
#soko-ai-panel{position:fixed;bottom:5.5rem;right:1.4rem;z-index:9999;width:min(380px,calc(100vw - 1.5rem));height:min(520px,70vh);background:#0f1420;border:1px solid #2a3548;border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.5);font-family:DM Sans,system-ui,sans-serif}
#soko-ai-panel.hidden{display:none}
.ai-head{display:flex;align-items:center;gap:.75rem;padding:.9rem 1rem;background:linear-gradient(90deg,#FF6A00,#e65c00);color:#fff}
.ai-avatar{font-size:1.6rem}
.ai-head strong{display:block;font-size:.95rem}
.ai-head small{opacity:.9;font-size:.75rem}
#soko-ai-close{margin-left:auto;background:transparent;border:none;color:#fff;font-size:1.5rem;cursor:pointer;line-height:1}
#soko-ai-msgs{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.7rem}
.msg{max-width:88%;padding:.65rem .9rem;border-radius:14px;font-size:.88rem;line-height:1.45}
.msg.bot{align-self:flex-start;background:#1a2233;border:1px solid #2a3548;color:#e8eef8}
.msg.user{align-self:flex-end;background:#FF6A00;color:#fff}
.msg a{color:#ffb347;text-decoration:underline}
#soko-ai-chips{display:flex;flex-wrap:wrap;gap:.4rem;padding:.5rem .8rem;border-top:1px solid #1f2937}
.chip{background:#1a2233;border:1px solid #2a3548;color:#cfd8e8;padding:.35rem .7rem;border-radius:999px;font-size:.75rem;cursor:pointer}
.chip:hover{border-color:#FF6A00;color:#FF6A00}
#soko-ai-form{display:flex;gap:.4rem;padding:.7rem;border-top:1px solid #1f2937}
#soko-ai-input{flex:1;background:#0B0F19;border:1px solid #2a3548;border-radius:10px;padding:.6rem .8rem;color:#fff;font-size:.9rem;outline:none}
#soko-ai-input:focus{border-color:#FF6A00}
#soko-ai-form button{background:#FF6A00;border:none;color:#fff;width:42px;border-radius:10px;cursor:pointer;font-size:1.1rem}
.ai-card{display:flex;gap:.6rem;background:#0B0F19;border:1px solid #2a3548;border-radius:12px;padding:.5rem;margin-top:.4rem;cursor:pointer}
.ai-card img{width:52px;height:52px;object-fit:cover;border-radius:8px}
.ai-card b{font-size:.82rem;display:block;color:#fff}
.ai-card span{font-size:.78rem;color:#FF6A00}
@media(max-width:480px){#soko-ai-panel{width:calc(100vw - 1rem);right:.5rem;bottom:5rem}}
`;
    document.head.appendChild(s);
  }

  function injectUI() {
    if ($('#soko-ai-root')) return;
    const root = document.createElement('div');
    root.id = 'soko-ai-root';
    root.innerHTML = `
      <button id="soko-ai-btn" aria-label="Soko AI">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 0 6h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1 0-6h1V6a4 4 0 0 1 4-4z"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><path d="M9 15c.5.6 1.5 1 3 1s2.5-.4 3-1"/></svg>
        <span class="pulse"></span>
      </button>
      <div id="soko-ai-panel" class="hidden">
        <div class="ai-head">
          <div class="ai-avatar">🤖</div>
          <div><strong>Soko AI</strong><small>${L('Your shopping assistant', 'Msaidizi wako wa ununuzi')}</small></div>
          <button id="soko-ai-close">×</button>
        </div>
        <div id="soko-ai-msgs"></div>
        <div id="soko-ai-chips"></div>
        <form id="soko-ai-form">
          <input id="soko-ai-input" type="text" autocomplete="off" placeholder="${L('Ask about products, shipping…', 'Uliza kuhusu bidhaa, usafirishaji…')}" />
          <button type="submit">➤</button>
        </form>
      </div>`;
    document.body.appendChild(root);

    $('#soko-ai-btn').onclick = () => toggle(true);
    $('#soko-ai-close').onclick = () => toggle(false);
    $('#soko-ai-form').onsubmit = e => {
      e.preventDefault();
      const input = $('#soko-ai-input');
      const text = (input.value || '').trim();
      if (!text) return;
      input.value = '';
      handleUser(text);
    };
  }

  function toggle(open) {
    const panel = $('#soko-ai-panel');
    const btn = $('#soko-ai-btn');
    if (open) {
      panel.classList.remove('hidden');
      btn.classList.add('open');
      if (!$('#soko-ai-msgs').children.length) greet();
      setTimeout(() => $('#soko-ai-input').focus(), 150);
    } else {
      panel.classList.add('hidden');
      btn.classList.remove('open');
    }
  }

  function addBot(html) {
    const d = document.createElement('div');
    d.className = 'msg bot';
    d.innerHTML = html;
    $('#soko-ai-msgs').appendChild(d);
    d.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  function addUser(text) {
    const d = document.createElement('div');
    d.className = 'msg user';
    d.textContent = text;
    $('#soko-ai-msgs').appendChild(d);
    d.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  function showChips(list) {
    const box = $('#soko-ai-chips');
    box.innerHTML = '';
    list.forEach(t => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.textContent = t;
      b.onclick = () => handleUser(t);
      box.appendChild(b);
    });
  }

  function greet() {
    addBot(L(
      'Karibu! 👋 Mimi ni <b>Soko AI</b>. Ninaweza kutafuta bidhaa, kueleza shipping & malipo, promo, au kukupeleka ukurasa sahihi.',
      'Karibu! 👋 Mimi ni <b>Soko AI</b>. Ninaweza kutafuta bidhaa, kueleza shipping & malipo, promo, au kukupeleka ukurasa sahihi.'
    ));
    showChips([
      L('Show laptops', 'Onyesha laptop'),
      L('Promo SOKO10', 'Promo SOKO10'),
      L('Shipping cost', 'Gharama ya usafirishaji'),
      L('Become a seller', 'Kuwa muuzaji')
    ]);
  }

  async function handleUser(text) {
    addUser(text);
    const q = text.toLowerCase().trim();

    // Navigation
    if (/cart|kikapu|basket/.test(q)) {
      addBot(L('Opening your cart…', 'Nafungua kikapu…'));
      setTimeout(() => location.href = 'cart.html', 500);
      return;
    }
    if (/account|oda zangu|my orders|track/.test(q)) {
      addBot(L('Opening your orders…', 'Nafungua oda zako…'));
      setTimeout(() => location.href = 'account.html', 500);
      return;
    }
    if (/login|ingia|register|jiandikishe/.test(q) && !/seller|muuzaji/.test(q)) {
      addBot(L('Opening login…', 'Nafungua ukurasa wa kuingia…'));
      setTimeout(() => location.href = 'auth.html', 500);
      return;
    }
    if (/seller|muuzaji|uza/.test(q) && /become|kuwa|open|fungua|register|how|jinsi/.test(q)) {
      addBot(FAQ.find(f => f.keys.includes('seller')).reply());
      return;
    }

    // FAQ
    for (const f of FAQ) {
      if (f.keys.some(k => q.includes(k))) {
        addBot(f.reply());
        return;
      }
    }

    // Categories
    for (const [cat, keys] of Object.entries(CATS)) {
      if (keys.some(k => q.includes(k))) {
        await showProducts(cat);
        return;
      }
    }

    // Product search
    if (/show|onyesha|find|tafuta|search|taka|nataka|bidhaa|product|buy|nunua|laptop|phone|simu|sofa/.test(q) || q.length > 2) {
      await showProducts(null, q);
      return;
    }

    addBot(L(
      'Sikuelewa vizuri. Jaribu: “onyesha simu”, “shipping”, “promo”, au “kuwa muuzaji”.',
      'Sikuelewa vizuri. Jaribu: “onyesha simu”, “shipping”, “promo”, au “kuwa muuzaji”.'
    ));
    showChips([L('Show products', 'Onyesha bidhaa'), L('Promo SOKO10', 'Promo SOKO10'), L('Help', 'Msaada')]);
  }

  async function showProducts(category, query) {
    let products = [];
    try {
      if (typeof getProducts === 'function') {
        const qs = category ? `?category=${category}` : '';
        products = await getProducts(qs);
      }
    } catch (_) {}

    if (!products.length && typeof FALLBACK !== 'undefined') {
      products = FALLBACK.filter(p => {
        if (category && p.category !== category) return false;
        if (!query) return true;
        const t = (p.name + ' ' + (p.description || '')).toLowerCase();
        return query.toLowerCase().split(/\s+/).some(w => t.includes(w));
      });
    }

    if (!products.length) {
      addBot(L('No products found. Try another keyword.', 'Hakuna bidhaa. Jaribu neno lingine.'));
      return;
    }

    products = products.slice(0, 4);
    let html = L(`Found <b>${products.length}</b> item(s):`, `Nimepata bidhaa <b>${products.length}</b>:`);
    products.forEach(p => {
      const price = typeof fmt === 'function' ? fmt(+p.price) : ('TSh ' + Number(p.price).toLocaleString());
      html += `<div class="ai-card" onclick="location.href='product-detail.html?id=${p.id}'">
        <img src="${p.image || '/assets/images/img1.jpg'}" alt="">
        <div><b>${p.name}</b><span>${price}</span></div>
      </div>`;
    });
    addBot(html);
    showChips([L('Go to cart', 'Nenda kikapu'), L('More products', 'Bidhaa zaidi'), L('Promo SOKO10', 'Promo SOKO10')]);
  }

  function boot() {
    injectCSS();
    injectUI();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();