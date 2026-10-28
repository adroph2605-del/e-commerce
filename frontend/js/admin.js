let editing = null;
const STATUS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Refunded'];
async function loadAdmin() {
  const u = user(); if (!u || u.role !== 'admin') { toast(t('denied'), 'err'); return setTimeout(() => location.href = 'auth.html?next=admin.html', 900); }
  try {
    const s = await api('/orders/admin/stats');
    document.getElementById('stats').innerHTML = [['gmv', fmt(+s.gmv)], ['fees', fmt(+s.fees)], ['orders', s.orders], ['products', s.products], ['users', s.users], ['pendingSellers', s.pending]].map(([k, v]) => `<div class="stat glass"><small>${t(k)}</small><b>${v}</b></div>`).join('');
    const o = await api('/orders/admin/all');
    document.getElementById('otb').innerHTML = o.map(r => `<tr><td>#${r.id}</td><td>${r.customer || '-'}</td><td>${fmt(+r.total)}</td>
     <td><select data-oid="${r.id}">${STATUS.map(x => `<option ${x === r.status ? 'selected' : ''}>${x}</option>`).join('')}</select></td></tr>`).join('');
    document.querySelectorAll('[data-oid]').forEach(s => s.onchange = async () => { try { await api(`/orders/${s.dataset.oid}/status`, { method: 'PATCH', body: { status: s.value } }); toast(t('updated')); } catch (e) { toast(e.message, 'err'); } });
  } catch (e) { toast(e.message, 'err'); }
  loadProducts();
}
async function loadProducts() {
  const l = await rawProducts();
  document.getElementById('ptb').innerHTML = l.map(p => `<tr><td>${esc(p.name)}</td><td>${fmt(+p.price)}</td><td>${p.stock}</td><td><button class="btn sm ghost" data-ed="${p.id}">${t('edit')}</button> <button class="btn sm ghost" data-del="${p.id}">${t('del')}</button></td></tr>`).join('');
  document.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => { const p = l.find(x => x.id == b.dataset.ed); editing = p.id; ['name', 'price', 'stock', 'image', 'category_id', 'description'].forEach(k => document.getElementById('f_' + k).value = p[k] ?? ''); scrollTo(0, 0); });
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { if (!confirm('?')) return; try { await api('/products/' + b.dataset.del, { method: 'DELETE' }); toast(t('deleted')); loadProducts(); } catch (e) { toast(e.message, 'err'); } });
}
document.addEventListener('DOMContentLoaded', () => {
  loadAdmin();
  document.getElementById('pf').onsubmit = async e => {
    e.preventDefault(); const body = {}; ['name', 'price', 'stock', 'image', 'category_id', 'description'].forEach(k => body[k] = document.getElementById('f_' + k).value);
    try { await api(editing ? '/products/' + editing : '/products', { method: editing ? 'PUT' : 'POST', body }); toast(t('saved')); editing = null; e.target.reset(); loadProducts(); } catch (err) { toast(err.message, 'err'); }
  };
});

async function loadSellers() {
  const u = user(); if (!u || u.role !== 'admin') return;
  try {
    const d = await api('/admin/sellers'); document.getElementById('comm').value = d.commission;
    document.getElementById('stb').innerHTML = d.sellers.map(s => `<tr><td>${esc(s.name)}</td><td>${esc(s.email)}</td><td>${s.status}</td><td>${[['Active', 'approve'], ['Rejected', 'reject'], ['Suspended', 'suspend']].map(([x, k]) => `<button class="btn sm ghost" data-st="${s.id}|${x}">${t(k)}</button>`).join(' ')}</td></tr>`).join('');
    document.querySelectorAll('[data-st]').forEach(b => b.onclick = async () => { const [id, status] = b.dataset.st.split('|'); try { await api(`/admin/sellers/${id}/status`, { method: 'PATCH', body: { status } }); toast(t('updated')); loadSellers(); } catch (e) { toast(e.message, 'err'); } });
  } catch (e) { toast(e.message, 'err'); }
}
document.addEventListener('DOMContentLoaded', () => {
  loadSellers();
  document.getElementById('cf').onsubmit = async e => { e.preventDefault(); try { await api('/admin/commission', { method: 'PUT', body: { commission: document.getElementById('comm').value } }); toast(t('saved')); } catch (er) { toast(er.message, 'err'); } };
});
