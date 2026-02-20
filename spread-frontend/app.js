const state = {
  apiBase: localStorage.getItem('spread_api_base') || window.location.origin,
  token: localStorage.getItem('spread_token') || '',
  user: JSON.parse(localStorage.getItem('spread_user') || 'null'),
  tab: 'offers'
};

const el = (id) => document.getElementById(id);
const output = el('output');

function print(data) {
  output.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

function saveSession() {
  localStorage.setItem('spread_api_base', state.apiBase);
  if (state.token) {
    localStorage.setItem('spread_token', state.token);
  } else {
    localStorage.removeItem('spread_token');
  }
  if (state.user) {
    localStorage.setItem('spread_user', JSON.stringify(state.user));
  } else {
    localStorage.removeItem('spread_user');
  }
}

async function api(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && state.token) headers.Authorization = `Bearer ${state.token}`;

  const res = await fetch(`${state.apiBase}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(typeof data === 'object' && data?.error ? data.error : `HTTP ${res.status}`);
  }

  return data;
}

async function loadMe() {
  if (!state.token) return;

  const base64Payload = state.token.split('.')[1];
  if (!base64Payload) return;
  const jwt = JSON.parse(atob(base64Payload));
  const userId = jwt.sub;

  const me = await api(`/users/${userId}`, { auth: true });
  state.user = me;
  saveSession();
}

function sessionControls() {
  const root = el('session-actions');
  root.innerHTML = '';
  if (!state.user) return;

  const b = document.createElement('button');
  b.className = 'btn ghost';
  b.textContent = 'Logout';
  b.onclick = () => {
    state.token = '';
    state.user = null;
    saveSession();
    render();
    print('Logged out.');
  };
  root.appendChild(b);
}

function tabsForRole(role) {
  if (role === 'creator') return ['offers', 'claims', 'submit'];
  if (role === 'restaurant') return ['offers', 'create-offer', 'queue'];
  return ['offers', 'create-offer', 'claims', 'queue'];
}

function createTabButton(name) {
  const b = document.createElement('button');
  b.className = `btn tab ${state.tab === name ? 'active' : ''}`;
  b.textContent = name.replace('-', ' ');
  b.onclick = () => {
    state.tab = name;
    renderPanel();
    renderTabs();
  };
  return b;
}

function renderTabs() {
  const tabs = el('tabs');
  tabs.innerHTML = '';
  if (!state.user) return;
  tabsForRole(state.user.role).forEach((tabName) => tabs.appendChild(createTabButton(tabName)));
}

async function renderOffers(panel) {
  const offers = await api('/offers');

  const wrap = document.createElement('div');
  wrap.className = 'list';

  offers.forEach((offer) => {
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
      <h3>${offer.title}</h3>
      <p>${offer.description || ''}</p>
      <p><strong>Slots:</strong> ${offer.current_active_creators}/${offer.max_concurrent_creators}</p>
      <p><strong>Expires:</strong> ${new Date(offer.expiration_date).toLocaleString()}</p>
    `;

    if (state.user?.role === 'creator') {
      const claimBtn = document.createElement('button');
      claimBtn.className = 'btn secondary';
      claimBtn.textContent = 'Claim Offer';
      claimBtn.onclick = async () => {
        try {
          const result = await api('/claims', {
            method: 'POST',
            auth: true,
            body: { offer_id: offer.id }
          });
          print(result);
          await renderPanel();
        } catch (err) {
          print(err.message);
        }
      };
      item.appendChild(claimBtn);
    }

    wrap.appendChild(item);
  });

  panel.appendChild(wrap);
}

async function renderClaims(panel) {
  const claims = await api('/claims', { auth: true });
  const wrap = document.createElement('div');
  wrap.className = 'list';

  claims.forEach((claim) => {
    const item = document.createElement('div');
    item.className = 'item';
    const title = claim.offers?.title || claim.offer_id;
    item.innerHTML = `
      <h3>${title}</h3>
      <p><strong>Status:</strong> ${claim.status}</p>
      <p><strong>Expires:</strong> ${new Date(claim.expires_at).toLocaleString()}</p>
      <p><strong>Claim ID:</strong> ${claim.id}</p>
    `;
    wrap.appendChild(item);
  });

  panel.appendChild(wrap);
}

function renderCreateOffer(panel) {
  const box = document.createElement('div');
  box.className = 'grid two';
  box.innerHTML = `
    <div><label>Title</label><input id="offer-title" /></div>
    <div><label>Description</label><input id="offer-desc" /></div>
    <div><label>Latitude</label><input id="offer-lat" type="number" step="0.000001" value="34.052235" /></div>
    <div><label>Longitude</label><input id="offer-lng" type="number" step="0.000001" value="-118.243683" /></div>
    <div><label>Max Concurrent Creators</label><input id="offer-max" type="number" value="3" min="1" /></div>
    <div><label>Expiration</label><input id="offer-exp" type="datetime-local" /></div>
  `;
  panel.appendChild(box);

  const btn = document.createElement('button');
  btn.className = 'btn primary';
  btn.style.marginTop = '10px';
  btn.textContent = 'Create Offer';
  btn.onclick = async () => {
    try {
      const exp = el('offer-exp').value;
      const payload = {
        title: el('offer-title').value,
        description: el('offer-desc').value,
        location_lat: Number(el('offer-lat').value),
        location_lng: Number(el('offer-lng').value),
        max_concurrent_creators: Number(el('offer-max').value),
        expiration_date: exp ? new Date(exp).toISOString() : new Date(Date.now() + 86400000).toISOString()
      };

      const result = await api('/offers', { method: 'POST', auth: true, body: payload });
      print(result);
      state.tab = 'offers';
      await renderPanel();
      renderTabs();
    } catch (err) {
      print(err.message);
    }
  };

  panel.appendChild(btn);
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderSubmit(panel) {
  const box = document.createElement('div');
  box.className = 'grid';
  box.innerHTML = `
    <div><label>Claim ID</label><input id="sub-claim-id" /></div>
    <div><label>TikTok URL (optional)</label><input id="sub-tiktok" /></div>
    <div><label>Caption (optional)</label><textarea id="sub-caption"></textarea></div>
    <div><label>Proof Image</label><input id="sub-file" type="file" accept="image/png,image/jpeg,image/webp" /></div>
  `;
  panel.appendChild(box);

  const btn = document.createElement('button');
  btn.className = 'btn secondary';
  btn.style.marginTop = '10px';
  btn.textContent = 'Submit Proof';
  btn.onclick = async () => {
    try {
      const fileInput = el('sub-file');
      const file = fileInput.files?.[0];
      if (!file) throw new Error('Choose an image file first');

      const image_base64 = await toBase64(file);
      const result = await api('/submissions', {
        method: 'POST',
        auth: true,
        body: {
          claim_id: el('sub-claim-id').value.trim(),
          tiktok_url: el('sub-tiktok').value.trim() || undefined,
          caption_text: el('sub-caption').value.trim() || undefined,
          image_base64,
          image_mime_type: file.type
        }
      });
      print(result);
    } catch (err) {
      print(err.message);
    }
  };
  panel.appendChild(btn);
}

async function renderQueue(panel) {
  const items = await api('/submissions?status=pending', { auth: true });
  const wrap = document.createElement('div');
  wrap.className = 'list';

  items.forEach((entry) => {
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
      <h3>Submission ${entry.id}</h3>
      <p><strong>Claim:</strong> ${entry.claim_id}</p>
      <p><a href="${entry.proof_image_url}" target="_blank" rel="noreferrer">Open proof image</a></p>
    `;

    const row = document.createElement('div');
    row.className = 'row';

    const approve = document.createElement('button');
    approve.className = 'btn ok';
    approve.textContent = 'Approve';
    approve.onclick = async () => {
      try {
        const result = await api(`/submissions/${entry.id}/approve`, { method: 'PATCH', auth: true });
        print(result);
        await renderPanel();
      } catch (err) {
        print(err.message);
      }
    };

    const reject = document.createElement('button');
    reject.className = 'btn danger';
    reject.textContent = 'Reject';
    reject.onclick = async () => {
      try {
        const result = await api(`/submissions/${entry.id}/reject`, { method: 'PATCH', auth: true });
        print(result);
        await renderPanel();
      } catch (err) {
        print(err.message);
      }
    };

    row.appendChild(approve);
    row.appendChild(reject);
    item.appendChild(row);
    wrap.appendChild(item);
  });

  if (!items.length) {
    const none = document.createElement('p');
    none.className = 'muted';
    none.textContent = 'No pending submissions right now.';
    panel.appendChild(none);
    return;
  }

  panel.appendChild(wrap);
}

async function renderPanel() {
  const panel = el('panel');
  panel.innerHTML = '';

  if (!state.user) return;

  try {
    if (state.tab === 'offers') await renderOffers(panel);
    if (state.tab === 'claims') await renderClaims(panel);
    if (state.tab === 'create-offer') renderCreateOffer(panel);
    if (state.tab === 'submit') renderSubmit(panel);
    if (state.tab === 'queue') await renderQueue(panel);
  } catch (err) {
    print(err.message);
  }
}

function render() {
  el('api-base').value = state.apiBase;
  el('dashboard').classList.toggle('hidden', !state.user);
  el('auth-card').classList.toggle('hidden', Boolean(state.user));

  if (state.user) {
    el('user-meta').textContent = `${state.user.email} | role: ${state.user.role} | status: ${state.user.approval_status}`;
  }

  sessionControls();
  renderTabs();
  renderPanel();
}

el('signup-btn').onclick = async () => {
  try {
    state.apiBase = el('api-base').value.trim() || window.location.origin;
    const result = await api('/auth/signup', {
      method: 'POST',
      body: {
        email: el('email').value.trim(),
        password: el('password').value,
        role: el('role').value
      }
    });
    print(result);
  } catch (err) {
    print(err.message);
  }
};

el('login-btn').onclick = async () => {
  try {
    state.apiBase = el('api-base').value.trim() || window.location.origin;

    const result = await api('/auth/login', {
      method: 'POST',
      body: {
        email: el('email').value.trim(),
        password: el('password').value
      }
    });

    state.token = result?.session?.access_token || '';
    if (!state.token) throw new Error('Login succeeded but no access token returned');

    await loadMe();
    saveSession();
    render();
    print(result);
  } catch (err) {
    print(err.message);
  }
};

(async function init() {
  try {
    if (state.token) {
      await loadMe();
    }
  } catch (err) {
    state.token = '';
    state.user = null;
    print(`Session restore failed: ${err.message}`);
  }

  saveSession();
  render();
})();
