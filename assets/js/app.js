/* ============================================================
   Nanny Dog — cuidado que parece casa
   App mobile-first: rotas por hash, dados locais (demo),
   favoritos, reservas e conta salvos no aparelho (localStorage).
   ============================================================ */
'use strict';

/* ---------- Dados ---------- */
const SERVICES = {
  hospedagem: { label: 'Hospedagem', unit: 'noite',   desc: 'Dormida com jeitinho de casa' },
  passeio:    { label: 'Passeio',    unit: 'passeio', desc: '1h de passeio no ritmo dele' },
  visita:     { label: 'Visita em casa', unit: 'visita', desc: 'Companhia e cuidados no seu lar' },
};

const SITTERS = [
  {
    id: 'mariana', name: 'Mariana S.', photo: 'assets/img/baba-mariana.jpg',
    neighborhood: 'Água Verde', distance: 1.2, rating: 5.0, reviews: 128,
    tagline: 'Casa com quintal, sofá liberado e soneca sagrada depois do almoço.',
    tags: ['Quintal grande', 'Sofá liberado', 'filhotes'],
    prices: { hospedagem: 75, passeio: 35, visita: 45 },
    bio: 'Sou vizinha de todo mundo e mãe de dois vira-latas resgatados. Aqui em casa, cachorro hóspede tem nome, potinho próprio e lugar cativo no sofá. Mantenho os horários de comida, passeio e descanso exatamente como você me passar — e mando fotos ao longo do dia, sem você precisar pedir.',
    perks: ['Quintal murado para brincar à vontade', 'Fotos e vídeos 3x ao dia', 'Aceito administração de remédios', 'No máximo 3 hóspedes por vez'],
    reviewsList: [
      { stars: 5, text: 'A Mel voltou cheirosa, cansada de tanto brincar e claramente apaixonada pela Mariana. Já reservamos o próximo feriado!', author: 'Carla M., tutora da Mel' },
      { stars: 5, text: 'Manteve a rotina de remédios do Fred direitinho e mandava foto de cada dose. Confiança total.', author: 'Paulo H., tutor do Fred' },
    ],
  },
  {
    id: 'lucas', name: 'Lucas T.', photo: 'assets/img/baba-lucas.jpg',
    neighborhood: 'Batel', distance: 0.8, rating: 4.9, reviews: 214,
    tagline: 'Especialista em cães cheios de energia: parque, trilha e muita bolinha.',
    tags: ['Porte grande', 'Muita energia', 'Parque todo dia'],
    prices: { passeio: 30, visita: 40 },
    bio: 'Adestrador em formação e corredor nas horas vagas — ou seja: seu cachorro vai gastar energia de verdade. Faço passeios individuais no Parque Barigui e nas praças do Batel, sempre com guia curta, água fresca e relatório com foto e trajeto no fim.',
    perks: ['Passeios individuais (nunca em grupo grande)', 'Foto + trajeto do passeio no seu celular', 'Experiência com raças grandes e fortes', 'Reforço de comandos básicos, se você quiser'],
    reviewsList: [
      { stars: 5, text: 'O Thor é um border collie ligado no 220V. O Lucas é a única pessoa que devolve ele cansado. Milagre certificado.', author: 'Rodrigo Almeida, tutor do Thor' },
      { stars: 5, text: 'Pontual, cuidadoso e manda o mapinha do passeio. A Luna escuta o barulho da chave dele e já abana o rabo.', author: 'Fernanda L., tutora da Luna' },
    ],
  },
  {
    id: 'camila', name: 'Camila R.', photo: 'assets/img/baba-camila.jpg',
    neighborhood: 'Bigorrilho', distance: 1.6, rating: 5.0, reviews: 96,
    tagline: 'Apartamento calminho, perfeito para pequenininhos e tímidos.',
    tags: ['Porte pequeno', 'Ambiente calmo', 'filhotes'],
    prices: { hospedagem: 65, passeio: 32, visita: 42 },
    bio: 'Trabalho de casa, então companhia é o que não falta por aqui. Meu apê é silencioso, sem outros pets, ideal para cachorrinhos pequenos, filhotes em adaptação ou aqueles mais medrosinhos que precisam de um colo paciente. A rotina é você quem manda: eu só obedeço (e mimo um pouquinho).',
    perks: ['Sem outros animais na casa', 'Presente o dia todo (home office)', 'Especialista em filhotes e raças toy', 'Caminha, cobertor e brinquedos lavadinhos'],
    reviewsList: [
      { stars: 5, text: 'Minha yorkshire Nina tem pavor de outros cachorros. Na Camila ela ficou rainha absoluta do apartamento. Perfeito.', author: 'Juliana C., tutora da Nina' },
      { stars: 5, text: 'Cuidou do nosso filhote de 4 meses com mamadeira de madrugada e tudo. Nem sei como agradecer.', author: 'André e Pri, tutores do Bento' },
    ],
  },
  {
    id: 'beatriz', name: 'Beatriz M.', photo: 'assets/img/baba-beatriz.jpg',
    neighborhood: 'Jardim Botânico', distance: 2.4, rating: 4.9, reviews: 167,
    tagline: 'Veterinária aposentada: cuidado de vó com olhar de quem entende.',
    tags: ['Cães idosos', 'Remédios', 'Experiência vet'],
    prices: { hospedagem: 89, visita: 50 },
    bio: 'Foram 25 anos de clínica veterinária e uma vida inteira de amor por cachorros. Hoje recebo em casa principalmente senhorzinhos e senhorzinhas de quatro patas que precisam de remédio na hora certa, comidinha especial e um ritmo mais tranquilo. Aqui ninguém precisa ter pressa para nada.',
    perks: ['Administração de medicamentos (inclusive insulina)', 'Casa térrea, sem escadas', 'Dieta especial e comidinha caseira, se precisar', 'Relatório de saúde ao fim de cada dia'],
    reviewsList: [
      { stars: 5, text: 'Meu poodle de 15 anos é diabético. A Bia cuidou dele melhor do que eu — e ainda me ensinou truques novos.', author: 'Sônia R., tutora do Pipoca' },
      { stars: 5, text: 'A única pessoa com quem deixo minha idosinha sem pensar duas vezes. Carinho de vó com técnica de vet.', author: 'Marcos V., tutor da Frida' },
    ],
  },
  {
    id: 'rafael', name: 'Rafael A.', photo: 'assets/img/baba-rafael.jpg',
    neighborhood: 'Cabral', distance: 3.1, rating: 4.8, reviews: 73,
    tagline: 'Casa espaçosa, jardim e paciência infinita para os mais velhinhos.',
    tags: ['Cães idosos', 'Jardim', 'Ritmo tranquilo'],
    prices: { hospedagem: 70, passeio: 34, visita: 48 },
    bio: 'Professor aposentado, leitor de jardim e companheiro profissional de cochilo. Minha casa tem jardim gramado, sombra boa e nenhum degrau. Gosto de cachorros que apreciam a vida sem pressa: um passeio curto de manhã, outro no fim da tarde e muita companhia entre um e outro.',
    perks: ['Jardim gramado e casa térrea', 'Áudios diários contando como ele está', 'Passeios curtos e frequentes, sem esforço', 'Aceita cachorros com mobilidade reduzida'],
    reviewsList: [
      { stars: 5, text: 'O Rafael manda áudio todo dia contando o dia do Bidu. Meu velhinho voltou de lá achando que tem dois donos.', author: 'Dona Nice, tutora do Bidu' },
      { stars: 4, text: 'Casa calma, jardim lindo e um cuidado genuíno. O Max, que é super ansioso, dormiu a tarde toda no tapete.', author: 'Luciana P., tutora do Max' },
    ],
  },
];

/* ---------- Utilidades ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: v % 1 ? 2 : 0 });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get: (k, fallback) => { try { const v = localStorage.getItem('nd_' + k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set: (k, v) => { try { localStorage.setItem('nd_' + k, JSON.stringify(v)); } catch { /* aparelho sem espaço */ } },
  del: (k) => { try { localStorage.removeItem('nd_' + k); } catch { /* ignore */ } },
};
const minPrice = (s) => Math.min(...Object.values(s.prices));

/* As babás podem ser editadas no painel do administrador (admin.js).
   A lista editada fica salva no aparelho; sem ela, usa a padrão (SITTERS). */
function getSitters(includeInactive = false) {
  const saved = store.get('sitters', null);
  const base = Array.isArray(saved) && saved.length ? saved : SITTERS;
  return includeInactive ? base : base.filter((s) => s.active !== false);
}
function saveSitters(list) { store.set('sitters', list); }
const byId = (id) => getSitters(true).find((s) => s.id === id);

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---------- Favoritos ---------- */
const getFavs = () => store.get('favs', []);
function toggleFav(id, event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }
  const favs = getFavs();
  const i = favs.indexOf(id);
  const sitter = byId(id);
  if (i >= 0) { favs.splice(i, 1); toast(`${sitter.name} saiu dos favoritos`); }
  else { favs.push(id); toast(`💛 ${sitter.name} nos favoritos`); }
  store.set('favs', favs);
  renderFeatured(); renderSearch();
  if (current.route === 'baba') renderSitter(current.param);
  if (current.route === 'perfil') renderProfile();
}
const favIcon = (id) => getFavs().includes(id) ? '#i-heart-f' : '#i-heart';

/* ---------- Estado ---------- */
const current = { route: 'inicio', param: null };
const searchState = { q: '', service: 'todos', sort: 'rating' };
let bookingSitter = null;

/* ---------- Templates ---------- */
function ratingHTML(s, smallText) {
  return `<span class="rating"><svg class="ic"><use href="#i-star"/></svg>${s.rating.toFixed(1).replace('.', ',')} <small>${smallText ?? `(${s.reviews})`}</small></span>`;
}
function miniCardHTML(s) {
  return `
  <a class="mini-card" href="#/baba/${s.id}">
    <img src="${s.photo}" alt="Foto de ${esc(s.name)} com um cachorro" loading="lazy">
    <div class="mini-card-body">
      <strong>${esc(s.name)}</strong>
      <div class="mini-meta"><svg class="ic"><use href="#i-star"/></svg>${s.rating.toFixed(1).replace('.', ',')} · ${esc(s.neighborhood)} · ${String(s.distance).replace('.', ',')} km</div>
      <div class="mini-price">a partir de <strong>${brl(minPrice(s))}</strong></div>
    </div>
  </a>`;
}
function sitterCardHTML(s) {
  const service = searchState.service !== 'todos' && s.prices[searchState.service] ? searchState.service : null;
  const price = service ? s.prices[service] : minPrice(s);
  const unit = service ? SERVICES[service].unit : SERVICES[Object.keys(s.prices).find((k) => s.prices[k] === price)].unit;
  return `
  <a class="sitter-card" href="#/baba/${s.id}">
    <div class="sitter-photo">
      <img src="${s.photo}" alt="Foto de ${esc(s.name)} com um cachorro" loading="lazy">
      <button class="fav-btn" data-fav="${s.id}" aria-label="Favoritar ${esc(s.name)}"><svg class="ic"><use href="${favIcon(s.id)}"/></svg></button>
      <span class="verified"><svg class="ic"><use href="#i-check"/></svg> Verificada</span>
    </div>
    <div class="sitter-body">
      <div class="sitter-top"><h3>${esc(s.name)}</h3>${ratingHTML(s)}</div>
      <div class="where"><svg class="ic"><use href="#i-pin"/></svg>${esc(s.neighborhood)} · a ${String(s.distance).replace('.', ',')} km de você</div>
      <p class="tagline">${esc(s.tagline)}</p>
      <div class="tags">${s.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      <div class="sitter-foot">
        <span class="from">a partir de<br><strong>${brl(price)}</strong> /${unit}</span>
        <span class="btn btn-ghost btn-small">Ver perfil</span>
      </div>
    </div>
  </a>`;
}

/* ---------- Render: início ---------- */
function renderFeatured() {
  const featured = [...getSitters()].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 4);
  $('#featured-list').innerHTML = featured.map(miniCardHTML).join('');
}

/* ---------- Render: buscar ---------- */
function renderSearch() {
  let list = getSitters().filter((s) => {
    const matchesService = searchState.service === 'todos' || s.prices[searchState.service];
    const q = searchState.q.trim().toLowerCase();
    const matchesQ = !q || s.name.toLowerCase().includes(q) || s.neighborhood.toLowerCase().includes(q) || s.tags.join(' ').toLowerCase().includes(q);
    return matchesService && matchesQ;
  });
  const sorters = {
    rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    price: (a, b) => (a.prices[searchState.service] ?? minPrice(a)) - (b.prices[searchState.service] ?? minPrice(b)),
    distance: (a, b) => a.distance - b.distance,
  };
  list.sort(sorters[searchState.sort]);
  $('#sitter-list').innerHTML = list.map(sitterCardHTML).join('');
  $('#search-empty').hidden = list.length > 0;
  $('#sitter-list').hidden = list.length === 0;
  $('#results-count').textContent = list.length === 1 ? '1 babá encontrada' : `${list.length} babás encontradas`;
  bindFavButtons($('#sitter-list'));
}
function bindFavButtons(root) {
  $$('[data-fav]', root).forEach((b) => b.addEventListener('click', (e) => toggleFav(b.dataset.fav, e)));
}

/* ---------- Render: perfil da babá ---------- */
function renderSitter(id) {
  const s = byId(id);
  if (!s) { location.hash = '#/buscar'; return; }
  const prices = Object.entries(s.prices).map(([k, v]) => `
    <div class="price-row">
      <span><strong>${SERVICES[k].label}</strong><small>${SERVICES[k].desc}</small></span>
      <span class="val">${brl(v)}<small> /${SERVICES[k].unit}</small></span>
    </div>`).join('');
  $('#sitter-detail').innerHTML = `
    <div class="detail-hero">
      <img src="${s.photo}" alt="Foto de ${esc(s.name)} com um cachorro">
      <div class="detail-photo-buttons">
        <a class="round-btn" href="#/buscar" aria-label="Voltar para a busca"><svg class="ic"><use href="#i-back"/></svg></a>
        <button class="round-btn fav" data-fav="${s.id}" aria-label="Favoritar ${esc(s.name)}"><svg class="ic"><use href="${favIcon(s.id)}"/></svg></button>
      </div>
    </div>
    <div class="detail-card">
      <div class="sitter-top"><h1>${esc(s.name)}</h1>${ratingHTML(s, `· ${s.reviews} avaliações`)}</div>
      <div class="where"><svg class="ic"><use href="#i-pin"/></svg>${esc(s.neighborhood)}, Curitiba · a ${String(s.distance).replace('.', ',')} km</div>
      <div class="tags">${s.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    </div>
    <section class="detail-section"><h2>Sobre</h2><p>${esc(s.bio)}</p></section>
    <section class="detail-section"><h2>Na casa dela(e)</h2>
      <ul class="perks">${s.perks.map((p) => `<li><svg class="ic"><use href="#i-check"/></svg>${esc(p)}</li>`).join('')}</ul>
    </section>
    <section class="detail-section"><h2>Serviços e preços</h2><div class="price-list">${prices}</div></section>
    <section class="detail-section"><h2>O que dizem os tutores</h2>
      ${s.reviewsList && s.reviewsList.length
        ? s.reviewsList.map((r) => `<div class="review"><span class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span><p>“${esc(r.text)}”</p><footer>${esc(r.author)}</footer></div>`).join('')
        : '<p>Ainda sem avaliações — seja o primeiro tutor a avaliar! 💛</p>'}
    </section>`;
  bindFavButtons($('#sitter-detail'));
  const bar = $('#book-bar');
  bar.innerHTML = `
    <span class="from">a partir de<br><strong>${brl(minPrice(s))}</strong></span>
    <a class="btn btn-primary btn-big" href="#/reservar/${s.id}">Reservar com ${esc(s.name.split(' ')[0])}</a>`;
  bar.hidden = false;
  document.body.classList.add('has-bookbar');
}

/* ---------- Render: reservar ---------- */
function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
function daysBetween(a, b) {
  const ms = new Date(b + 'T12:00') - new Date(a + 'T12:00');
  return Math.round(ms / 86400000);
}
function renderBooking(id, presetService) {
  const s = byId(id);
  if (!s) { location.hash = '#/buscar'; return; }
  bookingSitter = s;
  $('#booking-sitter').innerHTML = `
    <div class="booking-sitter-mini">
      <img src="${s.photo}" alt="Foto de ${esc(s.name)}">
      <div><strong>${esc(s.name)}</strong><span>${esc(s.neighborhood)} · ⭐ ${s.rating.toFixed(1).replace('.', ',')} (${s.reviews} avaliações)</span></div>
    </div>`;
  $('#booking-back').onclick = () => { location.hash = `#/baba/${s.id}`; };
  const sel = $('#bk-service');
  sel.innerHTML = Object.entries(s.prices).map(([k, v]) =>
    `<option value="${k}">${SERVICES[k].label} — ${brl(v)}/${SERVICES[k].unit}</option>`).join('');
  if (presetService && s.prices[presetService]) sel.value = presetService;
  const today = new Date().toISOString().slice(0, 10);
  const start = $('#bk-start'); const end = $('#bk-end');
  start.min = today; end.min = today;
  if (!start.value) start.value = today;
  if (!end.value || end.value < start.value) {
    const d = new Date(start.value + 'T12:00'); d.setDate(d.getDate() + 3);
    end.value = d.toISOString().slice(0, 10);
  }
  const user = store.get('user', null);
  if (user && !$('#bk-name').value) $('#bk-name').value = user.name;
  updatePriceBox();
}
function calcBooking() {
  if (!bookingSitter) return null;
  const service = $('#bk-service').value;
  const price = bookingSitter.prices[service];
  const start = $('#bk-start').value; const end = $('#bk-end').value;
  if (!start || !end) return null;
  let units = daysBetween(start, end);
  if (service !== 'hospedagem') units += 1; // passeio/visita contam o primeiro e o último dia
  if (units <= 0) return { service, price, start, end, units: 0, subtotal: 0, fee: 0, total: 0 };
  const subtotal = price * units;
  const fee = Math.round(subtotal * 0.10);
  return { service, price, start, end, units, subtotal, fee, total: subtotal + fee };
}
function updatePriceBox() {
  const c = calcBooking();
  const box = $('#price-box');
  if (!c) { box.innerHTML = '<span class="hint">Escolha as datas para ver o valor.</span>'; return; }
  if (c.units <= 0) { box.innerHTML = '<span class="hint">A data de término precisa ser depois da data de início.</span>'; return; }
  const unitLabel = c.units === 1 ? SERVICES[c.service].unit : SERVICES[c.service].unit + 's';
  box.innerHTML = `
    <div class="row"><span>${brl(c.price)} × ${c.units} ${unitLabel}</span><span>${brl(c.subtotal)}</span></div>
    <div class="row"><span>Taxa de cuidado Nanny Dog</span><span>${brl(c.fee)}</span></div>
    <div class="row total"><span>Total estimado</span><span>${brl(c.total)}</span></div>
    <span class="hint">${fmtDate(c.start)} → ${fmtDate(c.end)} · pagamento combinado direto com a babá</span>`;
}
function handleBookingSubmit(e) {
  e.preventDefault();
  const err = $('#booking-error');
  const c = calcBooking();
  const pet = $('#bk-pet').value.trim();
  const breed = $('#bk-breed').value.trim();
  const name = $('#bk-name').value.trim();
  const phone = $('#bk-phone').value.trim();
  if (!c || c.units <= 0) { err.textContent = 'Confira as datas: o término precisa ser depois do início.'; return; }
  if (!pet || !breed || !name || !phone) { err.textContent = 'Faltou preencher algum campo — confere rapidinho? 🐾'; return; }
  err.textContent = '';
  const bookings = store.get('bookings', []);
  bookings.unshift({
    id: 'r' + Date.now(), sitterId: bookingSitter.id, service: c.service,
    start: c.start, end: c.end, units: c.units, total: c.total,
    pet, breed, size: $('#bk-size').value, notes: $('#bk-notes').value.trim(),
    tutor: name, phone, status: 'pendente', createdAt: Date.now(),
  });
  store.set('bookings', bookings);
  store.set('lastBooking', { sitter: bookingSitter.name, pet, start: c.start, service: c.service });
  updateNavBadge();
  location.hash = '#/sucesso';
}

/* ---------- Render: sucesso / reservas ---------- */
function renderSuccess() {
  const last = store.get('lastBooking', null);
  $('#success-text').textContent = last
    ? `Pedimos para ${last.sitter} confirmar o cuidado da(o) ${last.pet} a partir de ${fmtDate(last.start)}. Você recebe a resposta pelo WhatsApp — e já pode ir arrumando a mala sem culpa. 🧳`
    : 'Sua reserva foi enviada! A babá vai confirmar a disponibilidade com você pelo WhatsApp.';
}
function renderBookings() {
  const bookings = store.get('bookings', []);
  $('#bookings-empty').hidden = bookings.length > 0;
  $('#booking-list').innerHTML = bookings.map((b) => {
    const s = byId(b.sitterId);
    if (!s) return '';
    return `
    <article class="booking-card">
      <div class="booking-card-head">
        <img src="${s.photo}" alt="Foto de ${esc(s.name)}">
        <div><strong>${esc(s.name)}</strong><span>${SERVICES[b.service].label} · ${esc(s.neighborhood)}</span></div>
        <span class="status status-${esc(b.status || 'pendente')}">${({ pendente: 'Aguardando confirmação', confirmada: '✅ Confirmada', cancelada: 'Cancelada' })[b.status || 'pendente'] || 'Aguardando confirmação'}</span>
      </div>
      <dl class="booking-meta">
        <div><dt>Cachorro</dt><dd>${esc(b.pet)} (${esc(b.breed)})</dd></div>
        <div><dt>Período</dt><dd>${fmtDate(b.start)} → ${fmtDate(b.end)}</dd></div>
        <div><dt>Duração</dt><dd>${b.units} × ${SERVICES[b.service].unit}</dd></div>
        <div><dt>Total estimado</dt><dd>${brl(b.total)}</dd></div>
      </dl>
      <div class="booking-actions">
        <a class="btn btn-ghost btn-small" href="#/baba/${s.id}">Ver a babá</a>
        <button class="btn-cancel" data-cancel="${b.id}">Cancelar reserva</button>
      </div>
    </article>`;
  }).join('');
  $$('[data-cancel]').forEach((btn) => btn.addEventListener('click', () => {
    const bookings2 = store.get('bookings', []).filter((x) => x.id !== btn.dataset.cancel);
    store.set('bookings', bookings2);
    renderBookings(); updateNavBadge();
    toast('Reserva cancelada');
  }));
}
function updateNavBadge() {
  const n = store.get('bookings', []).length;
  const badge = $('#nav-badge');
  badge.hidden = n === 0;
  badge.textContent = n;
}

/* ---------- Conta (demo) ---------- */
const getStoredUser = () => store.get('user', null);
const ADMIN_LOGIN_EMAIL = 'maria.barbosa.sales@escola.pr.gov.br';
const getAdminApi = () => window.NannyAdmin || null;
const hasActiveAdminSession = () => !!getAdminApi()?.isLoggedIn?.();
const isAdminAccount = (user) => !!user && (
  user.role === 'admin'
  || String(user.email || '').trim().toLowerCase() === String(getAdminApi()?.email || ADMIN_LOGIN_EMAIL).toLowerCase()
);
let authMode = 'login';
function setAuthMode(mode) {
  authMode = mode;
  const login = mode === 'login';
  $('#tab-login').classList.toggle('is-active', login);
  $('#tab-signup').classList.toggle('is-active', !login);
  $('#tab-login').setAttribute('aria-selected', String(login));
  $('#tab-signup').setAttribute('aria-selected', String(!login));
  $('#field-name').hidden = login;
  $('#auth-title').innerHTML = login ? 'Que bom te ver <em>de volta</em>' : 'Vamos criar sua <em>conta</em>';
  $('#auth-sub').textContent = login
    ? 'Entre para acompanhar suas reservas e babás favoritas. A administradora usa esta mesma tela e vai direto ao painel ADM.'
    : 'Em menos de um minuto você já pode encontrar a primeira babá.';
  $('#auth-submit').textContent = login ? 'Entrar' : 'Criar minha conta';
  $('#auth-error').textContent = '';
}
async function handleAuth(e) {
  e.preventDefault();
  const err = $('#auth-error');
  const submit = $('#auth-submit');
  const email = $('#auth-email').value.trim().toLowerCase();
  const pass = $('#auth-pass').value;
  const name = $('#auth-name').value.trim();
  err.textContent = '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = 'Esse e-mail parece incompleto — confere pra gente?'; return; }
  if (pass.length < 6) { err.textContent = 'A senha precisa ter pelo menos 6 caracteres.'; return; }

  // Login unificado: o e-mail da administradora, usado na aba
  // "Já tenho conta", abre o painel ADM em vez do perfil comum.
  const adminApi = getAdminApi();
  if (email === ADMIN_LOGIN_EMAIL || adminApi?.isEmail(email)) {
    if (authMode !== 'login') {
      setAuthMode('login');
      err.textContent = 'Este é o e-mail da administradora. Entre pela aba “Já tenho conta”.';
      return;
    }
    if (typeof adminApi?.login !== 'function') {
      err.textContent = 'Não foi possível carregar o acesso ADM. Recarregue a página e tente outra vez.';
      return;
    }

    const originalLabel = submit.textContent;
    submit.disabled = true;
    submit.textContent = 'Entrando no ADM…';
    try {
      const result = await adminApi.login(email, pass);
      if (!result?.ok) {
        err.textContent = 'E-mail ou senha da administradora não conferem.';
        return;
      }
      store.set('user', { name: 'Maria (ADM)', email: adminApi.email, role: 'admin' });
      $('#auth-pass').value = '';
      syncUserUI();
      toast('Bem-vinda ao painel ADM! 💛');
      location.hash = '#/admin';
      return;
    } catch {
      err.textContent = 'Não consegui validar o acesso ADM agora. Tente novamente.';
      return;
    } finally {
      submit.disabled = false;
      submit.textContent = originalLabel;
    }
  }

  if (authMode === 'signup' && !name) { err.textContent = 'Como podemos te chamar? Falta seu nome. 😊'; return; }
  const previousUser = getStoredUser();
  const displayName = authMode === 'signup'
    ? name
    : (String(previousUser?.email || '').toLowerCase() === email && previousUser?.name ? previousUser.name : email.split('@')[0]);
  store.set('user', { name: displayName || 'Tutor(a)', email, role: 'user' });
  syncUserUI();
  toast(authMode === 'signup' ? `Conta criada. Bem-vindo(a), ${displayName.split(' ')[0]}! 🐾` : `Olá de novo, ${displayName.split(' ')[0]}! 💛`);
  location.hash = '#/perfil';
}
function syncUserUI() {
  const user = getStoredUser();
  const adminActive = hasActiveAdminSession();
  const adminAccount = isAdminAccount(user);
  const regularUser = !!user && !adminAccount;
  const first = regularUser ? user.name.split(' ')[0] : null;
  const href = adminActive ? '#/admin' : (regularUser ? '#/perfil' : '#/entrar');
  const nav = adminActive ? 'admin' : (regularUser ? 'perfil' : 'entrar');

  $('#bottomnav-user').href = href;
  $('#bottomnav-user').dataset.nav = nav;
  $('#bottomnav-user-label').textContent = adminActive ? 'ADM' : (regularUser ? first : 'Entrar');

  const cta = $('#topbar-cta');
  cta.href = href;
  cta.dataset.nav = nav;
  cta.textContent = adminActive ? 'Painel ADM' : (regularUser ? `Olá, ${first}` : 'Entrar');
}
function renderProfile() {
  if (hasActiveAdminSession()) { location.hash = '#/admin'; return; }
  const user = getStoredUser();
  if (!user || isAdminAccount(user)) { location.hash = '#/entrar'; return; }
  const favs = getFavs().map(byId).filter(Boolean);
  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  $('#profile-box').innerHTML = `
    <div class="profile-head">
      <span class="avatar">${esc(initials)}</span>
      <div><strong>${esc(user.name)}</strong><span>${esc(user.email)}</span></div>
    </div>
    <div class="profile-block">
      <h2>Babás favoritas 💛</h2>
      ${favs.length
        ? `<div class="hscroll" style="margin-top:0">${favs.map(miniCardHTML).join('')}</div>`
        : '<p style="color:var(--muted)">Você ainda não favoritou nenhuma babá. Toque no coraçãozinho de uma babá para guardá-la aqui.</p>'}
    </div>
    <nav class="menu-list">
      <a class="menu-item" href="#/reservas"><svg class="ic"><use href="#i-cal"/></svg> Minhas reservas</a>
      <a class="menu-item" href="#/buscar"><svg class="ic"><use href="#i-search"/></svg> Encontrar uma babá</a>
      <button class="menu-item danger" id="logout"><svg class="ic"><use href="#i-x"/></svg> Sair da conta</button>
    </nav>`;
  $('#logout').addEventListener('click', () => {
    getAdminApi()?.logout?.();
    store.del('user');
    syncUserUI();
    toast('Até logo! 👋');
    location.hash = '#/inicio';
  });
}

/* ---------- Roteador ---------- */
const ROUTES = ['inicio', 'buscar', 'baba', 'reservar', 'sucesso', 'reservas', 'entrar', 'perfil', 'admin'];
function parseHash() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const route = ROUTES.includes(parts[0]) ? parts[0] : 'inicio';
  return { route, param: parts[1] || null };
}
function router() {
  const { route, param } = parseHash();
  // Com sessão ADM ativa, qualquer tentativa de abrir o login vai ao painel.
  // Sem sessão ADM, a tela Entrar fica disponível mesmo se houver uma conta comum
  // salva — assim a administradora consegue usar a mesma aba "Já tenho conta".
  if (route === 'entrar' && hasActiveAdminSession()) { location.hash = '#/admin'; return; }
  current.route = route; current.param = param;

  $$('.screen').forEach((s) => { s.hidden = s.dataset.screen !== route; });
  const showBookBar = route === 'baba';
  $('#book-bar').hidden = !showBookBar;
  document.body.classList.toggle('has-bookbar', showBookBar);

  const navKey = { baba: 'buscar', reservar: 'buscar', sucesso: 'reservas', perfil: 'perfil' }[route] || route;
  $$('[data-nav]').forEach((a) => a.classList.toggle('is-active', a.dataset.nav === navKey));

  if (route === 'inicio') renderFeatured();
  if (route === 'buscar') renderSearch();
  if (route === 'baba') renderSitter(param);
  if (route === 'reservar') renderBooking(param, sessionStorage.getItem('nd_preset_service') || undefined);
  if (route === 'sucesso') renderSuccess();
  if (route === 'reservas') renderBookings();
  if (route === 'entrar') setAuthMode('login');
  if (route === 'perfil') renderProfile();
  if (route === 'admin' && typeof renderAdmin === 'function') renderAdmin();

  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

/* ---------- Eventos ---------- */
function init() {
  renderFeatured();
  syncUserUI();
  updateNavBadge();

  // Serviços na home → busca já filtrada
  $$('[data-go-service]').forEach((btn) => btn.addEventListener('click', () => {
    searchState.service = btn.dataset.goService;
    sessionStorage.setItem('nd_preset_service', btn.dataset.goService);
    $$('#service-chips .chip').forEach((c) => c.classList.toggle('is-active', c.dataset.service === searchState.service));
    location.hash = '#/buscar';
    if (current.route === 'buscar') renderSearch();
  }));

  // Busca
  $('#q').addEventListener('input', (e) => { searchState.q = e.target.value; renderSearch(); });
  $('#sort').addEventListener('change', (e) => { searchState.sort = e.target.value; renderSearch(); });
  $$('#service-chips .chip').forEach((chip) => chip.addEventListener('click', () => {
    searchState.service = chip.dataset.service;
    sessionStorage.setItem('nd_preset_service', chip.dataset.service);
    $$('#service-chips .chip').forEach((c) => c.classList.toggle('is-active', c === chip));
    renderSearch();
  }));
  $('#clear-filters').addEventListener('click', () => {
    searchState.q = ''; searchState.service = 'todos';
    $('#q').value = '';
    $$('#service-chips .chip').forEach((c) => c.classList.toggle('is-active', c.dataset.service === 'todos'));
    renderSearch();
  });

  // Reserva
  ['bk-service', 'bk-start', 'bk-end'].forEach((id) => $('#' + id).addEventListener('change', updatePriceBox));
  $('#booking-form').addEventListener('submit', handleBookingSubmit);

  // Conta
  $('#tab-login').addEventListener('click', () => setAuthMode('login'));
  $('#tab-signup').addEventListener('click', () => setAuthMode('signup'));
  $('#auth-form').addEventListener('submit', handleAuth);

  window.addEventListener('hashchange', router);
  router();

  // PWA (funciona no GitHub Pages; ignorado se não houver suporte)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* ambiente sem SW */ });
  }

  maybeShowIOSInstallBanner();
}

/* iPhone/iPad: a Safari não mostra o convite de instalar sozinha,
   então ensinamos o caminho num bannerzinho (uma vez, dispensável). */
function maybeShowIOSInstallBanner() {
  const ua = navigator.userAgent || '';
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
  const isStandalone = window.navigator.standalone === true
    || window.matchMedia('(display-mode: standalone)').matches;
  if (!isIOS || isStandalone || store.get('ios_install_dismissed', false)) return;
  const banner = document.createElement('div');
  banner.className = 'ios-banner';
  banner.setAttribute('role', 'note');
  banner.innerHTML = `
    <strong>🐾 Instale o Nanny Dog no iPhone</strong>
    Toque em <b>Compartilhar</b> (↑) e depois em <b>“Adicionar à Tela de Início”</b>.
    <button type="button" aria-label="Fechar aviso">✕</button>`;
  banner.querySelector('button').addEventListener('click', () => {
    store.set('ios_install_dismissed', true);
    banner.remove();
  });
  document.body.appendChild(banner);
}

init();
