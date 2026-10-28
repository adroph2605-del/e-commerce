const getCart = () => { try { return JSON.parse(localStorage.sn_cart) || []; } catch { return []; } };
const saveCart = c => { localStorage.sn_cart = JSON.stringify(c); updateCartBadge(); };
function updateCartBadge() { const e = document.getElementById('cc'); if (e) e.textContent = getCart().reduce((s, i) => s + i.qty, 0); }
function addToCart(p, qty = 1) {
  const c = getCart(), i = c.find(x => x.id === p.id);
  i ? i.qty += qty : c.push({ id: p.id, name: p.name, price: +p.price, image: p.image, qty }); saveCart(c); toast(t('added') + ': ' + p.name);
}
const VAT = 0.18, PROMOS = { SOKO10: 0.10 };
function totals(promo) {
  const sub = getCart().reduce((s, i) => s + i.price * i.qty, 0), disc = sub * (PROMOS[(promo || '').toUpperCase()] || 0),
    tax = (sub - disc) * VAT, ship = sub === 0 || sub > 200000 ? 0 : 5000; return { sub, disc, tax, ship, total: sub - disc + tax + ship };
}
function renderCart() {
  const c = getCart(), box = document.getElementById('items'); if (!box) return;
  box.innerHTML = c.length ? c.map(i => `<div class="row glass"><img src="${i.image}" alt=""><div><b>${i.name}</b><div>${fmt(i.price)}</div></div>
   <input type="number" min="1" value="${i.qty}" data-id="${i.id}" aria-label="Qty"><button class="btn sm ghost" data-rm="${i.id}">${t('remove')}</button></div>`).join('') : `<p>${t('empty')}</p>`;
  const x = totals(window.promo), L = [['sub', x.sub], ['disc', -x.disc], ['vat', x.tax], ['ship', x.ship], ['total', x.total]];
  document.getElementById('sum').innerHTML = L.map(([k, v]) => `<div class="${k === 'total' ? 'tot' : ''}"><span>${t(k)}</span><span>${fmt(v)}</span></div>`).join('');
  box.querySelectorAll('input').forEach(e => e.onchange = () => { const cc = getCart(); cc.find(i => i.id == e.dataset.id).qty = Math.max(1, +e.value || 1); saveCart(cc); renderCart(); });
  box.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { saveCart(getCart().filter(i => i.id != b.dataset.rm)); renderCart(); });
}
async function checkout() {
  if (!getCart().length) return toast(t('empty'), 'err');
  if (!localStorage.sn_token) { toast(t('loginFirst'), 'err'); return setTimeout(() => location.href = 'auth.html?next=cart.html', 900); }
  try {
    const o = await api('/orders', { method: 'POST', body: { items: getCart().map(i => ({ id: i.id, qty: i.qty })), promo: window.promo, address: document.getElementById('addr').value, payment_method: document.getElementById('pay').value, currency: CUR() } });
    saveCart([]); renderCart(); toast(t('ordered') + ' #' + o.id);
  } catch (e) { toast(e.message, 'err'); }
}
