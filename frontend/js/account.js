const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];
document.addEventListener('DOMContentLoaded', async () => {
  if (!localStorage.sn_token) return location.href = 'auth.html?next=account.html';
  try {
    const o = await api('/orders/mine'), box = document.getElementById('ol');
    box.innerHTML = o.length ? o.map(r => { const i = STEPS.indexOf(r.status);
      return `<div class="oc"><b>#${r.id}</b> · ${new Date(r.created_at).toLocaleDateString()} · ${fmt(+r.total)} · <b>${r.status}</b>
      <div class="track">${r.status === 'Refunded' ? '' : STEPS.map((s, k) => `<i class="${k <= i ? 'on' : ''}" title="${s}"></i>`).join('')}</div>
      ${(r.items || []).map(x => `<div>${esc(x.name)} × ${x.qty}</div>`).join('')}</div>`; }).join('') : `<p>${t('noOrders')}</p>`;
  } catch (e) { toast(e.message, 'err'); }
});
