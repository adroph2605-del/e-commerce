function typewriter(el, lines) {
  let l = 0, c = 0, del = false;
  (function tick() {
    const s = lines[l]; el.textContent = s.slice(0, c);
    if (!del && c === s.length) { del = true; return setTimeout(tick, 1600); }
    if (del && c === 0) { del = false; l = (l + 1) % lines.length; }
    c += del ? -1 : 1; setTimeout(tick, del ? 25 : 55);
  })();
}
function counters() {
  document.querySelectorAll('[data-count]').forEach(e => {
    const end = +e.dataset.count, dec = end % 1 ? 1 : 0; let n = 0;
    const id = setInterval(() => { n += end / 60; if (n >= end) { n = end; clearInterval(id); } e.textContent = n.toLocaleString(undefined, { maximumFractionDigits: dec, minimumFractionDigits: dec }); }, 25);
  });
}
function slider() {
  const s = document.querySelectorAll('.slide'); let i = 0;
  setInterval(() => { s[i].classList.remove('on'); i = (i + 1) % s.length; s[i].classList.add('on'); }, 5000);
}
function card(p) {
  return `<article class="card"><a href="product-detail.html?id=${p.id}" class="im"><img loading="lazy" src="${p.image}" alt="${p.name}">${p.badge ? `<span class="badge">${p.badge}</span>` : ''}</a>
  <div class="cb"><a href="product-detail.html?id=${p.id}"><h3>${p.name}</h3></a><div class="stars" aria-label="${p.rating}/5">${stars(p.rating)} <small>${p.rating}</small></div>
  <small class="sold">${t('soldBy')} ${p.store || 'SOKO NEXT'}</small><div class="pr">${fmt(p.price)}</div><button class="btn" data-add="${p.id}">${t('add')}</button></div></article>`;
}
async function loadCatalog() {
  const qs = location.search, p = new URLSearchParams(qs), grid = document.getElementById('grid');
  if (p.get('q')) document.getElementById('q').value = p.get('q');
  const list = await getProducts(qs); window._list = list;
  grid.innerHTML = list.length ? list.map(card).join('') : `<p>${t('noRes')}</p>`;
  grid.querySelectorAll('[data-add]').forEach(b => b.onclick = () => addToCart(list.find(x => x.id == b.dataset.add)));
}
document.addEventListener('DOMContentLoaded', () => {
  typewriter(document.getElementById('tw'), [t('type1'), t('type2'), t('type3')]); counters(); slider(); loadCatalog();
  if (location.search) document.getElementById('catalog').scrollIntoView();
});
