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
const ADMIN_HASH = '00274ab21355ee998642b1afc4e328ce04ddad6ac5326acff83d0cb68b994f7e';
const ADMIN_SALT = 'nannydog-admin-v1';
const ADMIN_SESSION_MS = 8 * 60 * 60 * 1000; // 8 horas

async function sha256Hex(text) {
  if (!window.crypto || !crypto.subtle) throw new Error('no-subtle');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const isAdmin = () => Number(sessionStorage.getItem('nd_admin_until') || 0) > Date.now();

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

  /* ---------- Tela de login ---------- */
  if (!isAdmin()) {
    box.innerHTML = `
      <header class="page-head">
        <h1>Área do <em>administrador</em></h1>
        <p>Acesso restrito à equipe Nanny Dog. 🐾</p>
      </header>
      <form id="admin-login-form" novalidate>
        <label>E-mail do administrador
          <input id="admin-email" type="email" inputmode="email" autocomplete="username" placeholder="voce@escola.pr.gov.br" required>
        </label>
        <label>Senha
          <input id="admin-pass" type="password" autocomplete="current-password" placeholder="••••••••" required>
        </label>
        <p class="form-error" id="admin-error" role="alert"></p>
        <button class="btn btn-primary btn-big btn-block" type="submit">Entrar no painel</button>
        <a class="btn btn-ghost btn-block" href="#/inicio">Voltar à loja</a>
      </form>`;
    box.querySelector('#admin-login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = box.querySelector('#admin-error');
      const email = box.querySelector('#admin-email').value.trim().toLowerCase();
      const pass = box.querySelector('#admin-pass').value;
      try {
        const hash = await sha256Hex(`${ADMIN_SALT}|${email}|${pass}`);
        if (email === ADMIN_EMAIL && hash === ADMIN_HASH) {
          sessionStorage.setItem('nd_admin_until', String(Date.now() + ADMIN_SESSION_MS));
          toast('Bem-vinda ao painel, admin! 💛');
          renderAdmin();
        } else {
          err.textContent = 'E-mail ou senha não conferem. Tente de novo, com calma. 🐾';
        }
      } catch {
        err.textContent = 'Este navegador não suporta login seguro aqui. Abra pelo endereço oficial (https) ou pelo app e tente outra vez.';
      }
    });
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
    sessionStorage.removeItem('nd_admin_until');
    toast('Saiu do painel. Até logo! 👋');
    location.hash = '#/inicio';
  });
}
