/* SOKO NEXT – Auth client (role-based, Amazon/Alibaba-style flow) */
(function () {
  const params = new URLSearchParams(location.search);
  const nextUrl = params.get('next') || '';
  const wantSeller = params.get('role') === 'seller';
  let panel = 'login';
  let sellerStep = 1;
  let pendingAdminUser = null;

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

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

  function redirectAfterLogin(user, storeStatus) {
    if (nextUrl && /^[a-z0-9_./?-]+$/i.test(nextUrl) && !nextUrl.includes('://')) {
      location.href = nextUrl;
      return;
    }
    if (user.role === 'admin') {
      location.href = 'admin.html';
      return;
    }
    if (user.role === 'seller') {
      const st = (storeStatus || '').toLowerCase();
      if (st === 'active') {
        location.href = 'seller.html';
        return;
      }
      showSellerStatus(storeStatus || 'Pending');
      return;
    }
    location.href = nextUrl || 'account.html';
  }

  function showSellerStatus(status) {
    const map = {
      Pending: {
        ico: '⏳',
        title: 'Application under review',
        msg: 'Your seller store is Pending. An admin will review it soon. You can still shop as a customer on the marketplace.'
      },
      Suspended: {
        ico: '🚫',
        title: 'Store suspended',
        msg: 'Your store has been suspended. Contact support to appeal.'
      },
      Rejected: {
        ico: '❌',
        title: 'Application rejected',
        msg: 'Your seller application was not approved. Contact support for details.'
      },
      Active: {
        ico: '✅',
        title: 'Store active',
        msg: 'Your store is active. Opening dashboard…'
      }
    };
    const m = map[status] || map.Pending;
    $('#statusIco').textContent = m.ico;
    $('#statusTitle').textContent = m.title;
    $('#statusMsg').textContent = m.msg;
    showPanel('status');
    if (status === 'Active') setTimeout(() => (location.href = 'seller.html'), 900);
  }

  function saveSession(token, user) {
    localStorage.sn_token = token;
    localStorage.sn_user = JSON.stringify(user);
  }

  function strength(pw) {
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    if (s <= 1) return { label: 'Weak', cls: 'weak', pct: 28 };
    if (s <= 3) return { label: 'Medium', cls: 'med', pct: 62 };
    return { label: 'Strong', cls: 'strong', pct: 100 };
  }

  function bindPasswordToggles() {
    $$('[data-toggle-pw]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-toggle-pw');
        const inp = document.getElementById(id);
        if (!inp) return;
        inp.type = inp.type === 'password' ? 'text' : 'password';
        btn.textContent = inp.type === 'password' ? '👁' : '🙈';
      };
    });
  }

  function bindStrength(inputId, barId, labelId) {
    const inp = document.getElementById(inputId);
    const bar = document.getElementById(barId);
    const lab = document.getElementById(labelId);
    if (!inp || !bar) return;
    inp.addEventListener('input', () => {
      const st = strength(inp.value);
      bar.style.width = st.pct + '%';
      bar.className = 'pw-bar-fill ' + st.cls;
      if (lab) lab.textContent = inp.value ? st.label : '';
    });
  }

  function setRole(role) {
    $$('.role-pill').forEach(b => b.classList.toggle('on', b.dataset.role === role));
    const sellerFields = $('#seller-fields');
    if (sellerFields) sellerFields.hidden = role !== 'seller';
    if (role === 'seller') {
      sellerStep = 1;
      updateSellerSteps();
    }
  }

  function updateSellerSteps() {
    $$('.seller-step').forEach(el => {
      el.hidden = Number(el.dataset.step) !== sellerStep;
    });
    $$('.step-dot').forEach((d, i) => {
      d.classList.toggle('on', i + 1 === sellerStep);
      d.classList.toggle('done', i + 1 < sellerStep);
    });
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

  // Login
  $('#form-login')?.addEventListener('submit', async e => {
    e.preventDefault();
    setErr('loginErr', '');
    const email = $('#login-email').value.trim();
    const password = $('#login-password').value;
    const remember = $('#login-remember')?.checked !== false;
    if (!email || !password) return setErr('loginErr', 'Email and password required');
    try {
      const d = await apiAuth('/login', { email, password, remember });
      if (d.requiresMfa) {
        pendingAdminUser = d;
        showPanel('mfa');
        $('#mfa-inputs input')?.focus();
        return;
      }
      saveSession(d.token, d.user);
      redirectAfterLogin(d.user, d.storeStatus);
    } catch (err) {
      setErr('loginErr', err.message);
    }
  });

  // MFA (demo OTP 123456)
  $('#btn-mfa')?.addEventListener('click', () => {
    setErr('mfaErr', '');
    const code = $$('#mfa-inputs input').map(i => i.value).join('');
    if (code !== '123456') return setErr('mfaErr', 'Invalid code. Demo: 123456');
    if (!pendingAdminUser) return showPanel('login');
    saveSession(pendingAdminUser.token, pendingAdminUser.user);
    location.href = 'admin.html';
  });

  $$('#mfa-inputs input').forEach((inp, i, arr) => {
    inp.addEventListener('input', () => {
      if (inp.value && arr[i + 1]) arr[i + 1].focus();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && arr[i - 1]) arr[i - 1].focus();
    });
  });

  // Register
  $('#form-register')?.addEventListener('submit', async e => {
    e.preventDefault();
    setErr('regErr', '');
    const role = $('.role-pill.on')?.dataset.role || 'customer';
    const name = $('#reg-name').value.trim();
    const email = $('#reg-email').value.trim();
    const password = $('#reg-password').value;
    const store_name = $('#reg-store')?.value.trim() || '';
    const tin = $('#reg-tin')?.value.trim() || '';
    const payout = $('#reg-payout')?.value.trim() || '';
    const bot = $('#reg-bot')?.checked;

    if (!name || !email || password.length < 6) {
      return setErr('regErr', 'Name, valid email and password (min 6) required');
    }
    if (role === 'seller') {
      if (sellerStep < 3) {
        if (sellerStep === 1 && (!name || !email || password.length < 6)) {
          return setErr('regErr', 'Complete identity step');
        }
        if (sellerStep === 2 && !store_name) {
          return setErr('regErr', 'Store name required');
        }
        sellerStep++;
        updateSellerSteps();
        return;
      }
      if (!store_name) return setErr('regErr', 'Store name required');
    }
    if (!bot) return setErr('regErr', 'Please confirm you are not a robot');

    try {
      const d = await apiAuth('/register', {
        name, email, password, role, store_name, tin, payout
      });
      saveSession(d.token, d.user);
      redirectAfterLogin(d.user, d.storeStatus);
    } catch (err) {
      setErr('regErr', err.message);
    }
  });

  $('#btn-seller-back')?.addEventListener('click', () => {
    if (sellerStep > 1) {
      sellerStep--;
      updateSellerSteps();
    }
  });

  // Forgot
  $('#form-forgot')?.addEventListener('submit', async e => {
    e.preventDefault();
    setErr('forgotErr', '');
    const email = $('#forgot-email').value.trim();
    if (!email) return setErr('forgotErr', 'Email required');
    try {
      await apiAuth('/forgot', { email });
      setErr('forgotErr', '');
      alert('If that email exists, a reset link was sent.');
      showPanel('login');
    } catch (err) {
      setErr('forgotErr', err.message);
    }
  });

  // Panel switches
  $$('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => showPanel(btn.dataset.go));
  });

  $$('.role-pill').forEach(btn => {
    btn.addEventListener('click', () => setRole(btn.dataset.role));
  });

  // Social demo
  $$('[data-social]').forEach(btn => {
    btn.addEventListener('click', () => {
      alert(btn.dataset.social + ' sign-in is a demo button. Wire OAuth later.');
    });
  });

  // Guest
  $('#btn-guest')?.addEventListener('click', () => {
    location.href = nextUrl || 'index.html';
  });

  // Lang / currency (reuse site prefs)
  $('#auth-lang')?.addEventListener('click', () => {
    localStorage.sn_lang = (localStorage.sn_lang || 'en') === 'en' ? 'sw' : 'en';
    location.reload();
  });
  $('#auth-cur')?.addEventListener('change', e => {
    localStorage.sn_cur = e.target.value;
  });

  // Init
  document.body.classList.add('auth-page');
  bindPasswordToggles();
  bindStrength('reg-password', 'pw-bar', 'pw-label');
  bindStrength('login-password', 'login-pw-bar', 'login-pw-label');

  if (wantSeller) {
    showPanel('register');
    setRole('seller');
  } else {
    showPanel('login');
    setRole('customer');
  }

  if ($('#auth-cur') && localStorage.sn_cur) {
    $('#auth-cur').value = localStorage.sn_cur;
  }
  if ($('#auth-lang')) {
    $('#auth-lang').textContent = (localStorage.sn_lang || 'en') === 'en' ? 'SW' : 'EN';
  }
})();