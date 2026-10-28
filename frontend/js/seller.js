let editing = null; const F = ['name', 'price', 'stock', 'image', 'category_id', 'description'];
async function load() {
  const u = user(); if (!u || u.role !== 'seller') { toast(t('denied'), 'err'); return setTimeout(() => location.href = 'auth.html?next=seller.html', 900); }
  try {
    const m = await api('/seller/me'), ok = m.store && m.store.status === 'Active';
    document.getElementById('warn').innerHTML = ok ? '' : `<div class="warn">${t('notActive')} (${t('storeStatus')}: ${m.store ? m.store.status : '-'})</div>`;
    document.querySelectorAll('#pf input,#pf button').forEach(e => e.disabled = !ok);
    document.getElementById('stats').innerHTML = [['storeStatus', m.store ? esc(m.store.name) + ' · ' + m.store.status : '-'], ['sales', fmt(m.sales)], ['earnings', fmt(m.earnings)], ['units', m.units]].map(([k, v]) => `<div class="stat glass"><small>${t(k)}</small><b>${v}</b></div>`).join('');
    const p = await api('/seller/products');
    document.getElementById('ptb').innerHTML = p.map(x => `<tr><td>${esc(x.name)}</td><td>${fmt(+x.price)}</td><td>${x.stock}</td><td><button class="btn sm ghost" data-ed="${x.id}">${t('edit')}</button> <button class="btn sm ghost" data-del="${x.id}">${t('del')}</button></td></tr>`).join('');
    document.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => { const x = p.find(q => q.id == b.dataset.ed); editing = x.id; F.forEach(k => document.getElementById('f_' + k).value = x[k] ?? ''); scrollTo(0, 0); });
    document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { if (!confirm('?')) return; try { await api('/products/' + b.dataset.del, { method: 'DELETE' }); toast(t('deleted')); load(); } catch (e) { toast(e.message, 'err'); } });
    const o = await api('/seller/orders');
    document.getElementById('otb').innerHTML = o.map(r => `<tr><td>#${r.order_id}</td><td>${esc(r.name)}</td><td>${r.qty}</td><td><select data-oid="${r.order_id}">${['Pending', 'Processing', 'Shipped', 'Delivered'].map(s => `<option ${s === r.status ? 'selected' : ''} ${['Pending', 'Delivered'].includes(s) ? 'disabled' : ''}>${s}</option>`).join('')}</select></td></tr>`).join('');
    document.querySelectorAll('[data-oid]').forEach(s => s.onchange = async () => { try { await api(`/orders/${s.dataset.oid}/status`, { method: 'PATCH', body: { status: s.value } }); toast(t('updated')); } catch (e) { toast(e.message, 'err'); } });
  } catch (e) { toast(e.message, 'err'); }
}
document.addEventListener('DOMContentLoaded', () => {
  load();
  document.getElementById('pf').onsubmit = async e => {
    e.preventDefault(); const b = {}; F.forEach(k => b[k] = document.getElementById('f_' + k).value);
    try { await api(editing ? '/products/' + editing : '/products', { method: editing ? 'PUT' : 'POST', body: b }); toast(t('saved')); editing = null; e.target.reset(); load(); } catch (er) { toast(er.message, 'err'); }
  };
});
