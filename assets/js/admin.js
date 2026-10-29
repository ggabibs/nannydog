/* ============================================================
   Nanny Dog — Área do administrador
   A senha NÃO fica escrita no código: guardamos apenas o hash
   SHA-256 (com "sal") de "sal|e-mail|senha" definida pela dona.
   Atenção: num app sem servidor, isto é uma trava de acesso à
   tela — não substitui um login de verdade com backend.
   Depende das funções globais de app.js (store, esc, brl, …).
   ============================================================ */
'use strict';

const ADMIN_EMAIL = 'maria.barbosa.sales@escola.pr.gov.br';
// Aceita as duas grafias informadas para a mesma senha (com e sem espaço).
const ADMIN_HASHES = new Set([
  '00274ab21355ee998642b1afc4e328ce04ddad6ac5326acff83d0cb68b994f7e',
  'b0f59f55b558d4b16567d09aedcb0c8bc16a64934e484a21787adfbc54de472f',
]);
const ADMIN_SALT = 'nannydog-admin-v1';
const ADMIN_SESSION_MS = 8 * 60 * 60 * 1000; // 8 horas
const ADMIN_SESSION_KEY = 'nd_admin_until';
let adminUntilMemory = 0;

const normalizeAdminEmail = (email) => String(email || '').trim().toLowerCase();
const isAdminEmail = (email) => normalizeAdminEmail(email) === ADMIN_EMAIL;

function getBrowserStorage(name) {
  try { return globalThis[name] || null; } catch { return null; }
}

function readAdminUntil() {
  let until = adminUntilMemory || 0;
  ['localStorage', 'sessionStorage'].forEach((name) => {
    try {
      const value = Number(getBrowserStorage(name)?.getItem(ADMIN_SESSION_KEY) || 0);
      if (Number.isFinite(value)) until = Math.max(until, value);
    } catch { /* armazenamento indisponível neste navegador */ }
  });
  return until;
}

function startAdminSession() {
  const until = Date.now() + ADMIN_SESSION_MS;
  adminUntilMemory = until;
  // localStorage mantém o acesso se o app for fechado e aberto dentro das 8h.
  ['localStorage', 'sessionStorage'].forEach((name) => {
    try { getBrowserStorage(name)?.setItem(ADMIN_SESSION_KEY, String(until)); } catch { /* sem persistência */ }
  });
  return until;
}

function logoutAdmin() {
  adminUntilMemory = 0;
  ['localStorage', 'sessionStorage'].forEach((name) => {
    try { getBrowserStorage(name)?.removeItem(ADMIN_SESSION_KEY); } catch { /* sem persistência */ }
  });
}

const isAdmin = () => readAdminUntil() > Date.now();

async function sha256Hex(text) {
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    const buf = await subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Alguns WebViews/navegadores não expõem crypto.subtle fora de HTTPS.
  // O fallback abaixo mantém o mesmo login funcionando nesses casos.
  return sha256HexFallback(text);
}

function sha256HexFallback(message) {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const bytes = Array.from(new TextEncoder().encode(String(message)));
  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const hi = Math.floor(bitLength / 0x100000000);
  const lo = bitLength >>> 0;
  [hi, lo].forEach((word) => {
    bytes.push((word >>> 24) & 0xff, (word >>> 16) & 0xff, (word >>> 8) & 0xff, word & 0xff);
  });

  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  const w = new Array(64);
  for (let block = 0; block < bytes.length; block += 64) {
    for (let i = 0; i < 16; i++) {
      const j = block + i * 4;
      w[i] = ((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3]) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e;
      e = (d + temp1) >>> 0;
      d = c; c = b; b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  return H.map((x) => x.toString(16).padStart(8, '0')).join('');
}

async function verifyAdminCredentials(email, password) {
  if (!isAdminEmail(email)) return false;
  const hash = await sha256Hex(`${ADMIN_SALT}|${ADMIN_EMAIL}|${String(password ?? '')}`);
  return ADMIN_HASHES.has(hash);
}

async function loginAsAdmin(email, password) {
  const ok = await verifyAdminCredentials(email, password);
  if (ok) startAdminSession();
  return { ok, email: ADMIN_EMAIL };
}

// Interface usada pelo login comum ("Já tenho conta") em app.js.
window.NannyAdmin = {
  email: ADMIN_EMAIL,
  isEmail: isAdminEmail,
  isLoggedIn: isAdmin,
  verifyCredentials: verifyAdminCredentials,
  login: loginAsAdmin,
  logout: logoutAdmin,
  startSession: startAdminSession,
};

/* Reduz a foto enviada para caber no armazenamento do aparelho */
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const max = 900;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function renderAdmin() {
  const box = document.querySelector('#admin-box');
  if (!box) return;

  /* ---------- Login unificado ---------- */
  // Não existe mais um formulário separado para ADM. Quem ainda não entrou
  // é levado à aba normal "Já tenho conta"; ao usar o e-mail/senha ADM,
  // o app reconhece e volta automaticamente para este painel.
  if (!isAdmin()) {
    box.innerHTML = `
      <header class="page-head">
        <h1>Área do <em>administrador</em></h1>
        <p>Abrindo o login… Use a aba <strong>“Já tenho conta”</strong> com o e-mail e a senha da administradora.</p>
      </header>
      <a class="btn btn-primary btn-big btn-block" href="#/entrar">Ir para “Já tenho conta”</a>`;
    if (location.hash !== '#/entrar') location.hash = '#/entrar';
    return;
  }

  /* ---------- Painel ---------- */
  const all = getSitters(true);
  const bookings = store.get('bookings', []);
  const receita = bookings.filter((b) => b.status !== 'cancelada').reduce((a, b) => a + (b.total || 0), 0);
  const priceInput = (k, val) => `<label>${SERVICES[k].label} (R$/${SERVICES[k].unit})
    <input type="number" min="0" step="1" inputmode="numeric" name="price-${k}" value="${val ?? ''}" placeholder="não oferece"></label>`;

  box.innerHTML = `
    <header class="page-head">
      <h1>Painel da <em>Nanny Dog</em></h1>
      <p>Você está logada como administradora (${esc(ADMIN_EMAIL)}).</p>
    </header>

    <div class="admin-stats">
      <div class="stat"><strong>${all.filter((s) => s.active !== false).length}</strong><span>babás ativas</span></div>
      <div class="stat"><strong>${bookings.length}</strong><span>reservas</span></div>
      <div class="stat"><strong>${brl(receita)}</strong><span>em reservas</span></div>
      <div class="stat"><strong>${getFavs().length}</strong><span>favoritos 💛</span></div>
    </div>
    <p class="micro" style="text-align:left;margin:10px 2px 0">Versão demonstrativa: as alterações ficam salvas <strong>neste aparelho/navegador</strong>. Para valer para todos os visitantes, seria preciso um servidor (posso configurar depois).</p>

    <section class="admin-block">
      <h2>🐶 Babás</h2>
      ${all.map((s) => `
      <details class="admin-sitter" ${s.active === false ? 'data-off="1"' : ''}>
        <summary>
          <img src="${esc(s.photo)}" alt="">
          <span class="admin-sitter-name">${esc(s.name)} ${s.active === false ? '<small class="off-tag">oculta</small>' : ''}<small>${esc(s.neighborhood)} · ⭐ ${String(s.rating).replace('.', ',')}</small></span>
        </summary>
        <form class="sitter-edit" data-sitter="${s.id}">
          <label>Nome<input name="name" value="${esc(s.name)}" required></label>
          <label>Bairro<input name="neighborhood" value="${esc(s.neighborhood)}" required></label>
          <label>Frase de apresentação<input name="tagline" value="${esc(s.tagline)}"></label>
          <label>Etiquetas (separadas por vírgula)<input name="tags" value="${esc((s.tags || []).join(', '))}"></label>
          ${Object.keys(SERVICES).map((k) => priceInput(k, s.prices[k])).join('')}
          <label class="check"><input type="checkbox" name="active" ${s.active !== false ? 'checked' : ''}> Aparecer na loja (busca e destaques)</label>
          <div class="field-row">
            <button class="btn btn-primary" type="submit">Salvar</button>
            <button class="btn btn-ghost" type="button" data-delete-sitter="${s.id}">Excluir</button>
          </div>
        </form>
      </details>`).join('')}
    </section>

    <section class="admin-block">
      <h2>➕ Nova babá</h2>
      <details class="admin-sitter">
        <summary><span class="admin-sitter-name">Cadastrar uma babá<small>toque para abrir o formulário</small></span></summary>
        <form id="sitter-new">
          <label>Nome<input name="name" placeholder="Ex.: Patricia L." required></label>
          <label>Bairro<input name="neighborhood" placeholder="Ex.: Santa Felicidade" required></label>
          <label>Frase de apresentação<input name="tagline" placeholder="Ex.: Casa calma, ideal para cães idosos."></label>
          <label>Etiquetas (separadas por vírgula)<input name="tags" placeholder="Quintal, Porte pequeno"></label>
          <label>Foto (do celular)<input type="file" name="photo" accept="image/*"></label>
          <label>…ou use uma foto do app
            <select name="photoPreset">
              <option value="">— escolher —</option>
              <option value="assets/img/hero.jpg">Sala aconchegante</option>
              <option value="assets/img/passeio.jpg">Passeio</option>
              <option value="assets/img/descanso.jpg">Descanso</option>
              <option value="assets/img/baba-mariana.jpg">Babá 1</option>
              <option value="assets/img/baba-camila.jpg">Babá 2</option>
              <option value="assets/img/baba-beatriz.jpg">Babá 3</option>
            </select>
          </label>
          ${Object.keys(SERVICES).map((k) => priceInput(k, '')).join('')}
          <p class="form-error" id="sitter-new-error" role="alert"></p>
          <button class="btn btn-primary btn-block" type="submit">Cadastrar babá</button>
        </form>
      </details>
    </section>

    <section class="admin-block">
      <h2>📅 Reservas</h2>
      ${bookings.length ? bookings.map((b) => {
        const s = byId(b.sitterId);
        return `<div class="admin-booking">
          <div><strong>${esc(b.pet)}</strong> com ${esc(s ? s.name : '—')}<br>
          <small>${(SERVICES[b.service] || {}).label || esc(b.service)} · ${fmtDate(b.start)} → ${fmtDate(b.end)} · ${brl(b.total || 0)} · tutor(a): ${esc(b.tutor || '—')}</small></div>
          <select data-booking-status="${b.id}" aria-label="Status da reserva">
            <option value="pendente" ${b.status !== 'confirmada' && b.status !== 'cancelada' ? 'selected' : ''}>Aguardando</option>
            <option value="confirmada" ${b.status === 'confirmada' ? 'selected' : ''}>Confirmada</option>
            <option value="cancelada" ${b.status === 'cancelada' ? 'selected' : ''}>Cancelada</option>
          </select>
        </div>`;
      }).join('') : '<p style="color:var(--muted)">Nenhuma reserva neste aparelho ainda.</p>'}
    </section>

    <section class="admin-block">
      <h2>⚙️ Dados do app</h2>
      <div class="menu-list">
        <button class="menu-item" id="admin-export"><svg class="ic"><use href="#i-cal"/></svg> Baixar cópia dos dados (JSON)</button>
        <button class="menu-item" id="admin-reset-sitters"><svg class="ic"><use href="#i-paw"/></svg> Restaurar babás originais</button>
        <button class="menu-item danger" id="admin-clear"><svg class="ic"><use href="#i-x"/></svg> Apagar reservas deste aparelho</button>
        <a class="menu-item" href="#/buscar"><svg class="ic"><use href="#i-search"/></svg> Ver a loja como cliente</a>
        <button class="menu-item danger" id="admin-logout"><svg class="ic"><use href="#i-user"/></svg> Sair do painel</button>
      </div>
    </section>`;

  /* --- editar babá --- */
  box.querySelectorAll('.sitter-edit').forEach((form) => form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = form.dataset.sitter;
    const list = getSitters(true).map((s) => ({ ...s }));
    const s = list.find((x) => x.id === id);
    if (!s) return;
    const fd = new FormData(form);
    s.name = String(fd.get('name')).trim();
    s.neighborhood = String(fd.get('neighborhood')).trim();
    s.tagline = String(fd.get('tagline')).trim();
    s.tags = String(fd.get('tags')).split(',').map((t) => t.trim()).filter(Boolean).slice(0, 4);
    s.active = fd.get('active') === 'on';
    s.prices = {};
    Object.keys(SERVICES).forEach((k) => {
      const v = Number(fd.get('price-' + k));
      if (v > 0) s.prices[k] = v;
    });
    if (!Object.keys(s.prices).length) { toast('Informe pelo menos um preço 🐾'); return; }
    saveSitters(list);
    renderFeatured();
    toast(`${s.name} atualizada! 💛`);
    renderAdmin();
  }));

  /* --- excluir babá --- */
  box.querySelectorAll('[data-delete-sitter]').forEach((btn) => btn.addEventListener('click', () => {
    const s = byId(btn.dataset.deleteSitter);
    if (!window.confirm(`Excluir ${s ? s.name : 'esta babá'} do app neste aparelho?`)) return;
    saveSitters(getSitters(true).filter((x) => x.id !== btn.dataset.deleteSitter));
    renderAdmin();
    toast('Babá excluída');
  }));

  /* --- nova babá --- */
  box.querySelector('#sitter-new').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = box.querySelector('#sitter-new-error');
    const fd = new FormData(e.target);
    const prices = {};
    Object.keys(SERVICES).forEach((k) => { const v = Number(fd.get('price-' + k)); if (v > 0) prices[k] = v; });
    if (!Object.keys(prices).length) { err.textContent = 'Informe o preço de pelo menos um serviço.'; return; }
    let photo = String(fd.get('photoPreset') || '');
    const file = fd.get('photo');
    if (file && file.size) {
      try { photo = await fileToDataURL(file); } catch { err.textContent = 'Não consegui ler essa foto. Tente outra.'; return; }
    }
    if (!photo) { err.textContent = 'Escolha uma foto (do celular ou uma foto do app).'; return; }
    const name = String(fd.get('name')).trim();
    const tagline = String(fd.get('tagline')).trim();
    saveSitters([...getSitters(true), {
      id: 'baba-' + Date.now(), name, photo,
      neighborhood: String(fd.get('neighborhood')).trim(),
      distance: 1.0, rating: 5.0, reviews: 0, tagline,
      tags: String(fd.get('tags')).split(',').map((t) => t.trim()).filter(Boolean).slice(0, 4),
      prices, active: true,
      bio: tagline || 'Nova babá da Nanny Dog, pronta para cuidar com carinho e manter a rotina do seu cachorro.',
      perks: ['Fotos e recados ao longo do dia', 'Rotina combinada com o tutor', 'Ambiente seguro e acolhedor'],
      reviewsList: [],
    }]);
    toast(`${name} cadastrada! 🐶`);
    renderAdmin();
  });

  /* --- status das reservas --- */
  box.querySelectorAll('[data-booking-status]').forEach((sel) => sel.addEventListener('change', () => {
    store.set('bookings', store.get('bookings', []).map((b) => (b.id === sel.dataset.bookingStatus ? { ...b, status: sel.value } : b)));
    toast('Status da reserva atualizado');
    renderAdmin();
  }));

  /* --- dados --- */
  box.querySelector('#admin-export').addEventListener('click', () => {
    const data = { exportadoEm: new Date().toISOString(), babas: getSitters(true), reservas: store.get('bookings', []), favoritos: getFavs() };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = 'nannydog-dados.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  box.querySelector('#admin-reset-sitters').addEventListener('click', () => {
    if (!window.confirm('Restaurar as 5 babás originais? Suas edições neste aparelho serão desfeitas.')) return;
    store.del('sitters'); renderFeatured(); renderAdmin(); toast('Babás originais restauradas');
  });
  box.querySelector('#admin-clear').addEventListener('click', () => {
    if (!window.confirm('Apagar TODAS as reservas deste aparelho?')) return;
    store.set('bookings', []); updateNavBadge(); renderAdmin(); toast('Reservas apagadas');
  });
  box.querySelector('#admin-logout').addEventListener('click', () => {
    logoutAdmin();
    // O login ADM agora usa a mesma conta da tela Entrar; limpa também esse registro.
    const currentUser = typeof store !== 'undefined' ? store.get('user', null) : null;
    if (currentUser?.role === 'admin' || isAdminEmail(currentUser?.email)) store.del('user');
    if (typeof syncUserUI === 'function') syncUserUI();
    toast('Saiu do painel. Até logo! 👋');
    location.hash = '#/entrar';
  });
}
