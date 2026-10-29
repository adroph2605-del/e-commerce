/* SOKO NEXT – Auth client
   - Typewriter on brand headline
   - Customer = simple register (name/email/password) → shop/checkout
   - Seller = 3-step (identity → store → payout) → Pending until admin approves
   - ?next=cart.html returns buyer to cart after login
*/
(function () {
  const params = new URLSearchParams(location.search);
  const nextUrl = params.get('next') || '';
  const wantSeller = params.get('role') === 'seller';
  let panel = 'login';
  let sellerStep = 1;
  let pendingAdminUser = null;

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const isSw = () => (localStorage.sn_lang || 'en') === 'sw';

  function showPanel(name) {
    panel = name;
    ['login', 'register', 'forgot', 'mfa', 'status'].forEach(p => {
      const el = document.getElementById('panel-' + p);
      if (el) el.hidden = p !== name;
    });
  }

  function setErr(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    if (msg) { el.hidden = false; el.textContent = msg; }
    else { el.hidden = true; el.textContent = ''; }
  }

  function saveSession(token, user) {
    localStorage.sn_token = token;
    localStorage.sn_user = JSON.stringify(user);
  }

  function redirectAfterLogin(user, storeStatus) {
    // Came from cart/checkout → go back
    if (nextUrl && /^[a-z0-9_./?-]+$/i.test(nextUrl) && !nextUrl.includes('://')) {
      location.href = nextUrl;
      return;
    }
    if (user.role === 'admin') {
      location.href = 'admin.html';
      return;
    }
    if (user.role === 'seller') {
      const st = (storeStatus || 'Pending');
      if (String(st).toLowerCase() === 'active') {
        location.href = 'seller.html';
        return;
      }
      showSellerStatus(st);
      return;
    }
    // Customer → account (or next already handled)
    location.href = 'account.html';
  }

  function showSellerStatus(status) {
    const map = {
      Pending: {
        ico: '⏳',
        title: isSw() ? 'Ombi linaangaliwa' : 'Application under review',
        msg: isSw()
          ? 'Duka lako lipo Pending. Admin atakagua. Unaweza bado kununua kama mteja.'
          : 'Your seller store is Pending. An admin will review it. You can still shop as a customer.'
      },
      Suspended: {
        ico: '🚫',
        title: isSw() ? 'Duka limesimamishwa' : 'Store suspended',
        msg: isSw() ? 'Wasiliana na support kuomba rufaa.' : 'Contact support to appeal.'
      },
      Rejected: {
        ico: '❌',
        title: isSw() ? 'Ombi limekataliwa' : 'Application rejected',
        msg: isSw() ? 'Wasiliana na support.' : 'Contact support for details.'
      },
      Active: {
        ico: '✅',
        title: isSw() ? 'Duka limeidhinishwa' : 'Store active',
        msg: isSw() ? 'Inafungua dashboard…' : 'Opening dashboard…'
      }
    };
    const m = map[status] || map.Pending;
    if ($('#statusIco')) $('#statusIco').textContent = m.ico;
    if ($('#statusTitle')) $('#statusTitle').textContent = m.title;
    if ($('#statusMsg')) $('#statusMsg').textContent = m.msg;
    showPanel('status');
    if (status === 'Active') setTimeout(() => (location.href = 'seller.html'), 800);
  }

  async function apiAuth(path, body) {
    const r = await fetch('/api/auth' + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'Request failed');
    return d;
  }

  /* ---------- Typewriter ---------- */
  function typewriter(el, lines) {
    if (!el || !lines.length) return;
    let li = 0, ci = 0, del = false;
    function tick() {
      const line = lines[li];
      if (!del) {
        el.textContent = line.slice(0, ++ci);
        if (ci === line.length) {
          del = true;
          return setTimeout(tick, 2000);
        }
      } else {
        el.textContent = line.slice(0, --ci);
        if (ci === 0) {
          del = false;
          li = (li + 1) % lines.length;
        }
      }
      setTimeout(tick, del ? 30 : 58);
    }
    tick();
  }

  /* ---------- Password show/hide + strength ---------- */
  function bindEyes() {
    $$('[data-eye]').forEach(btn => {
      btn.onclick = () => {
        const inp = document.getElementById(btn.getAttribute('data-eye'));
        if (!inp) return;
        inp.type = inp.type === 'password' ? 'text' : 'password';
        btn.textContent = inp.type === 'password' ? '👁' : '🙈';
      };
    });
  }

  function strength(pw) {
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    if (s <= 1) return { cls: 'weak', label: isSw() ? 'Dhaifu' : 'Weak', pct: 33 };
    if (s <= 3) return { cls: 'medium', label: isSw() ? 'Wastani' : 'Medium', pct: 66 };
    return { cls: 'strong', label: isSw() ? 'Imara' : 'Strong', pct: 100 };
  }

  function bindStrength(id, barId, labId) {
    const inp = document.getElementById(id);
    const bar = document.getElementById(barId);
    const lab = document.getElementById(labId);
    if (!inp || !bar) return;
    const fill = bar.querySelector('i') || bar;
    inp.addEventListener('input', () => {
      const st = strength(inp.value);
      bar.className = 'strength ' + st.cls;
      if (fill.tagName === 'I') fill.style.width = st.pct + '%';
      if (lab) lab.textContent = inp.value ? st.label : (isSw() ? 'Nguvu ya nenosiri' : 'Password strength');
    });
  }

  /* ---------- Role: customer vs seller ---------- */
  function role() {
    return document.querySelector('input[name=role]:checked')?.value || 'customer';
  }

  function syncSellerUI() {
    const isSeller = role() === 'seller';
    const steps = $('#sellerSteps') || $('#seller-steps');
    if (steps) steps.hidden = !isSeller;

    const title = $('#regTitle');
    const sub = $('#regSub');
    if (title) {
      title.textContent = isSeller
        ? (isSw() ? 'Fungua duka lako' : 'Open your seller store')
        : (isSw() ? 'Fungua akaunti ya mteja' : 'Create customer account');
    }
    if (sub) {
      sub.textContent = isSeller
        ? (isSw()
          ? 'Hatua 3: utambulisho → duka → malipo. Admin ataidhinisha kabla ya kuuza.'
          : '3 steps: identity → store → payout. Admin approves before you can sell.')
        : (isSw()
          ? 'Jina, email na nenosiri tu — kisha unaweza kununua na kulipa.'
          : 'Only name, email & password — then you can buy and pay.');
    }

    sellerStep = 1;
    updateSteps();
  }

  function updateSteps() {
    const isSeller = role() === 'seller';
    $$('.seller-steps span, #sellerSteps span').forEach((s, i) => {
      const n = +(s.dataset.s || i + 1);
      s.classList.toggle('on', isSeller && n <= sellerStep);
    });
    $$('.step-panel').forEach(p => {
      const n = +p.dataset.step;
      if (!isSeller) {
        // Customer: ONLY identity fields (step 1). Hide store/payout.
        p.hidden = n !== 1;
      } else {
        p.hidden = n !== sellerStep;
      }
    });
    const prev = $('#btn-prev');
    const sub = $('#btn-reg');
    if (!sub) return;
    if (!isSeller) {
      if (prev) prev.hidden = true;
      sub.textContent = isSw() ? 'Fungua akaunti' : 'Create account';
      sub.type = 'submit';
    } else {
      if (prev) prev.hidden = sellerStep === 1;
      if (sellerStep < 3) {
        sub.textContent = isSw() ? 'Endelea →' : 'Continue →';
        sub.type = 'button';
      } else {
        sub.textContent = isSw() ? 'Wasilisha ombi' : 'Submit application';
        sub.type = 'submit';
      }
    }
  }

  function validateRegStep1() {
    const name = $('#reg-name')?.value.trim();
    const email = $('#reg-email')?.value.trim();
    const pass = $('#reg-pass')?.value || '';
    if (!name || name.length < 2) {
      setErr('regErr', isSw() ? 'Jina linahitajika' : 'Full name required');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email || '')) {
      setErr('regErr', isSw() ? 'Email si sahihi' : 'Valid email required');
      return false;
    }
    if (pass.length < 6) {
      setErr('regErr', isSw() ? 'Nenosiri angalau herufi 6' : 'Password min 6 characters');
      return false;
    }
    setErr('regErr', '');
    return true;
  }

  function validateStore() {
    const store = $('#reg-store')?.value.trim();
    if (!store) {
      setErr('regErr', isSw() ? 'Jina la duka linahitajika' : 'Store name required');
      return false;
    }
    setErr('regErr', '');
    return true;
  }

  /* ---------- LOGIN ---------- */
  $('#form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setErr('loginErr', '');
    const email = ($('#login-email')?.value || '').trim();
    const password = $('#login-pass')?.value || '';
    const remember = $('#remember')?.checked !== false;

    if (!email || !password) {
      setErr('loginErr', isSw() ? 'Weka email na nenosiri' : 'Enter email and password');
      return;
    }
    if ($('#login-cap') && !$('#login-cap').checked) {
      setErr('loginErr', isSw() ? 'Thibitisha si robot' : 'Please confirm you are not a robot');
      return;
    }

    const btn = $('#btn-login');
    if (btn) { btn.disabled = true; btn.textContent = isSw() ? 'Inaingia…' : 'Signing in…'; }
    try {
      const data = await apiAuth('/login', { email, password, remember });

      // Super Admin / admin → MFA
      if (data.requiresMfa || data.user?.role === 'admin') {
        pendingAdminUser = data;
        showPanel('mfa');
        $$('#mfa-inputs input')[0]?.focus();
        return;
      }

      saveSession(data.token, data.user);
      redirectAfterLogin(data.user, data.storeStatus);
    } catch (err) {
      setErr('loginErr', err.message || 'Login failed');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = isSw() ? 'Ingia' : 'Sign in'; }
    }
  });

  /* ---------- MFA (demo OTP 123456) ---------- */
  const mfaInputs = $$('#mfa-inputs input');
  mfaInputs.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
      if (inp.value && mfaInputs[i + 1]) mfaInputs[i + 1].focus();
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !inp.value && mfaInputs[i - 1]) mfaInputs[i - 1].focus();
    });
  });

  $('#btn-mfa')?.addEventListener('click', () => {
    setErr('mfaErr', '');
    const code = mfaInputs.map(i => i.value).join('');
    if (code !== '123456') {
      setErr('mfaErr', isSw() ? 'Code si sahihi. Demo: 123456' : 'Invalid code. Demo: 123456');
      return;
    }
    if (!pendingAdminUser) { showPanel('login'); return; }
    saveSession(pendingAdminUser.token, pendingAdminUser.user);
    location.href = 'admin.html';
  });

  /* ---------- REGISTER ---------- */
  $$('input[name=role]').forEach(r => r.addEventListener('change', syncSellerUI));

  $('#btn-prev')?.addEventListener('click', () => {
    if (sellerStep > 1) { sellerStep--; updateSteps(); }
  });

  $('#btn-reg')?.addEventListener('click', (e) => {
    // Seller multi-step: Continue buttons
    if (role() === 'seller' && sellerStep < 3) {
      e.preventDefault();
      if (sellerStep === 1 && !validateRegStep1()) return;
      if (sellerStep === 2 && !validateStore()) return;
      sellerStep++;
      updateSteps();
    }
  });

  $('#form-register')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setErr('regErr', '');
    if ($('#regOk')) $('#regOk').hidden = true;

    if (!validateRegStep1()) return;

    const isSeller = role() === 'seller';
    if (isSeller) {
      if (sellerStep < 3) {
        // should have been handled by btn-reg click
        return;
      }
      if (!validateStore()) return;
    }

    if ($('#terms') && !$('#terms').checked) {
      setErr('regErr', isSw() ? 'Kubali Terms' : 'Please accept Terms & Privacy');
      return;
    }
    if ($('#reg-cap') && !$('#reg-cap').checked) {
      setErr('regErr', isSw() ? 'Thibitisha si robot' : 'Please confirm you are not a robot');
      return;
    }

    const body = {
      name: $('#reg-name').value.trim(),
      email: $('#reg-email').value.trim(),
      password: $('#reg-pass').value,
      role: isSeller ? 'seller' : 'customer'
    };
    // ONLY attach seller fields for sellers
    if (isSeller) {
      body.store_name = $('#reg-store')?.value.trim() || '';
      body.tin = $('#reg-tin')?.value.trim() || '';
      body.category = $('#reg-cat')?.value || '';
      body.payout = $('#reg-pay')?.value || '';
      body.payout_account = $('#reg-phone')?.value.trim() || '';
    }

    const btn = $('#btn-reg');
    if (btn) btn.disabled = true;
    try {
      const data = await apiAuth('/register', body);
      saveSession(data.token, data.user);
      if (data.user.role === 'seller') {
        showSellerStatus(data.storeStatus || 'Pending');
      } else {
        if ($('#regOk')) {
          $('#regOk').hidden = false;
          $('#regOk').textContent = isSw()
            ? 'Akaunti imeundwa! Unaweza kununua sasa…'
            : 'Account created! You can shop now…';
        }
        setTimeout(() => redirectAfterLogin(data.user), 700);
      }
    } catch (err) {
      setErr('regErr', err.message || 'Registration failed');
    } finally {
      if (btn) btn.disabled = false;
      updateSteps();
    }
  });

  /* ---------- FORGOT ---------- */
  $('#form-forgot')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setErr('forgotErr', '');
    const email = ($('#forgot-email')?.value || '').trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErr('forgotErr', isSw() ? 'Email si sahihi' : 'Enter a valid email');
      return;
    }
    try { await apiAuth('/forgot', { email }); } catch (_) {}
    if ($('#forgotOk')) {
      $('#forgotOk').hidden = false;
      $('#forgotOk').textContent = isSw()
        ? 'Ikiwa email ipo, link ya reset imetumwa (demo).'
        : 'If that email exists, a reset link was sent (demo).';
    }
  });

  /* ---------- Nav ---------- */
  $$('[data-go]').forEach(b => b.addEventListener('click', () => showPanel(b.dataset.go)));
  $$('[data-social]').forEach(b => {
    b.onclick = () => alert((b.dataset.social || 'Social') + ' is demo — use email login.');
  });
  $('#btn-guest')?.addEventListener('click', () => {
    location.href = nextUrl || 'index.html';
  });

  /* ---------- Lang / currency ---------- */
  $('#authLang, #auth-lang')?.addEventListener?.('click', () => {
    localStorage.sn_lang = isSw() ? 'en' : 'sw';
    location.reload();
  });
  const langSel = $('#authLang');
  if (langSel && langSel.tagName === 'SELECT') {
    langSel.value = localStorage.sn_lang || 'en';
    langSel.onchange = () => { localStorage.sn_lang = langSel.value; location.reload(); };
  }
  const curSel = $('#authCur') || $('#auth-cur');
  if (curSel) {
    if (localStorage.sn_cur) curSel.value = localStorage.sn_cur;
    curSel.onchange = () => { localStorage.sn_cur = curSel.value; };
  }

  /* ---------- Boot ---------- */
  document.body.classList.add('auth-page');
  bindEyes();
  bindStrength('reg-pass', 'pw-str', 'pw-str-l');

  typewriter(document.getElementById('auth-tw'), isSw()
    ? ['Nunua na uza Afrika nzima', 'Akaunti moja — wateja na wauzaji', 'Salama, haraka, ya kimataifa']
    : ['Shop & sell across Africa', 'Buy in seconds — pay securely', 'Sell with admin-approved stores']
  );

  if (wantSeller) {
    showPanel('register');
    const sr = document.querySelector('input[name=role][value=seller]');
    if (sr) { sr.checked = true; }
  } else {
    showPanel('login');
  }
  syncSellerUI();
})();
