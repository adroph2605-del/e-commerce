const I18N = {
 en: { search:'Search products, brands, categories…', all:'All', login:'Sign in', logout:'Sign out', admin:'Admin', cart:'Cart',
  type1:'Welcome to the Next-Gen Market…', type2:'Buy and sell across borders.', type3:'Pay with M-Pesa, Tigo Pesa, Airtel & cards.',
  heroSub:'SOKO NEXT connects trusted sellers and buyers in Africa and beyond.', shop:'Shop now', sell:'Start selling',
  c1:'Happy customers', c2:'Verified products', c3:'Delivery rate', featured:'Featured products', add:'Add to cart', added:'Added to cart',
  noRes:'No products found. Try another search.', qty:'Quantity', reviews:'Customer reviews', related:'Related products', specs:'Details',
  stock:'in stock', yourCart:'Your cart', empty:'Your cart is empty.', sub:'Subtotal', disc:'Discount', vat:'VAT (18%)', ship:'Shipping', total:'Total',
  promo:'Promo code', apply:'Apply', promoOk:'Promo applied', promoBad:'Invalid promo code', checkout:'Proceed to checkout', remove:'Remove',
  loginFirst:'Please sign in to complete checkout.', ordered:'Order placed! Thank you.', address:'Delivery address', pay:'Payment method',
  register:'Create account', name:'Full name', email:'Email', password:'Password (min 6)', google:'Continue with Google (demo)',
  loginOk:'Login successful', badInput:'Check your name, email and password.', googleDemo:'Google sign-in is a demo button.',
  newsletter:'Get deals in your inbox', subscribe:'Subscribe', subOk:'Subscribed. Karibu!', links:'Company', rights:'All rights reserved.',
  revenue:'Total revenue', orders:'Orders', products:'Products', users:'Active users', manage:'Manage products', status:'Status',
  save:'Save product', del:'Delete', saved:'Saved', deleted:'Deleted', updated:'Status updated', denied:'Admin access only.', pname:'Name', price:'Price (TZS)', stockL:'Stock', img:'Image URL', cat:'Category ID', edit:'Edit', customer:'Customer' },
 sw: { search:'Tafuta bidhaa, chapa, kundi…', all:'Zote', login:'Ingia', logout:'Toka', admin:'Msimamizi', cart:'Kikapu',
  type1:'Karibu kwenye Soko la Kizazi Kipya…', type2:'Nunua na uza kuvuka mipaka.', type3:'Lipa kwa M-Pesa, Tigo Pesa, Airtel na kadi.',
  heroSub:'SOKO NEXT inaunganisha wauzaji na wanunuzi wanaoaminika Afrika na duniani.', shop:'Nunua sasa', sell:'Anza kuuza',
  c1:'Wateja wenye furaha', c2:'Bidhaa zilizothibitishwa', c3:'Kiwango cha uwasilishaji', featured:'Bidhaa maalum', add:'Weka kikapuni', added:'Imewekwa kikapuni',
  noRes:'Hakuna bidhaa. Jaribu utafutaji mwingine.', qty:'Idadi', reviews:'Maoni ya wateja', related:'Bidhaa zinazofanana', specs:'Maelezo',
  stock:'zipo', yourCart:'Kikapu chako', empty:'Kikapu chako ni tupu.', sub:'Jumla ndogo', disc:'Punguzo', vat:'VAT (18%)', ship:'Usafirishaji', total:'Jumla',
  promo:'Msimbo wa punguzo', apply:'Tumia', promoOk:'Punguzo limetumika', promoBad:'Msimbo si sahihi', checkout:'Endelea kulipa', remove:'Ondoa',
  loginFirst:'Tafadhali ingia ili kukamilisha malipo.', ordered:'Oda imewekwa! Asante.', address:'Anwani ya kupelekewa', pay:'Njia ya malipo',
  register:'Fungua akaunti', name:'Jina kamili', email:'Barua pepe', password:'Nenosiri (angalau 6)', google:'Endelea na Google (onyesho)',
  loginOk:'Umeingia kikamilifu', badInput:'Angalia jina, barua pepe na nenosiri.', googleDemo:'Kitufe cha Google ni cha onyesho tu.',
  newsletter:'Pata ofa kwenye barua pepe', subscribe:'Jiunge', subOk:'Umejiunga. Karibu!', links:'Kampuni', rights:'Haki zote zimehifadhiwa.',
  revenue:'Mapato yote', orders:'Oda', products:'Bidhaa', users:'Watumiaji', manage:'Simamia bidhaa', status:'Hali',
  save:'Hifadhi bidhaa', del:'Futa', saved:'Imehifadhiwa', deleted:'Imefutwa', updated:'Hali imebadilishwa', denied:'Wasimamizi tu.', pname:'Jina', price:'Bei (TZS)', stockL:'Akiba', img:'Kiungo cha picha', cat:'Namba ya kundi', edit:'Hariri', customer:'Mteja' }
};
const t = k => (I18N[localStorage.sn_lang || 'en'] || I18N.en)[k] || k;
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(e => e.textContent = t(e.dataset.i18n));
  document.querySelectorAll('[data-ph]').forEach(e => e.placeholder = t(e.dataset.ph));
}

Object.assign(I18N.en, { seller:'Seller', becomeSeller:'Sell on SOKO NEXT', soldBy:'Sold by', myOrders:'My orders', storeName:'Store name', gmv:'GMV (total sales)', fees:'Commission earned', pendingSellers:'Sellers awaiting approval',
 sellers:'Sellers & commission', approve:'Approve', reject:'Reject', suspend:'Suspend', commissionRate:'Platform commission %', sales:'Sales', earnings:'Your earnings', units:'Units sold', storeStatus:'Store status',
 notActive:'Your store is awaiting approval. You can add products once it is Active.', fulfil:'Orders to fulfil', track:'Track your orders', noOrders:'No orders yet.', topCats:'Shop by category', sellBand:'Reach buyers across Africa and beyond. Open your store in minutes and pay only when you sell.', myProducts:'My products' });
Object.assign(I18N.sw, { seller:'Muuzaji', becomeSeller:'Uza kwenye SOKO NEXT', soldBy:'Inauzwa na', myOrders:'Oda zangu', storeName:'Jina la duka', gmv:'Mauzo yote (GMV)', fees:'Tume iliyopatikana', pendingSellers:'Wauzaji wanaosubiri idhini',
 sellers:'Wauzaji na tume', approve:'Idhinisha', reject:'Kataa', suspend:'Sitisha', commissionRate:'Tume ya jukwaa %', sales:'Mauzo', earnings:'Mapato yako', units:'Vipande vilivyouzwa', storeStatus:'Hali ya duka',
 notActive:'Duka lako linasubiri idhini. Utaweza kuongeza bidhaa likishakuwa Active.', fulfil:'Oda za kutimiza', track:'Fuatilia oda zako', noOrders:'Hakuna oda bado.', topCats:'Nunua kwa kundi', sellBand:'Fikia wanunuzi Afrika na kwingineko. Fungua duka kwa dakika chache na ulipe tume unapouza tu.', myProducts:'Bidhaa zangu' });
