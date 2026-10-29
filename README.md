# 🐾 Nanny Dog — cuidado que parece casa

> **Quando você sai, ele fica em casa.**
> Encontre pessoas cuidadoras de confiança que respeitam a rotina, o jeitinho e as necessidades do seu cachorro.

Site **mobile-first** (desenhado primeiro para o celular, com navegação inferior estilo app e suporte a "instalar" como PWA). Recriado a partir do protótipo em [nannydog-ic66ggx5.manus.space](https://nannydog-ic66ggx5.manus.space) e expandido para uma experiência completa e navegável.

## ✨ O que tem no site

| Tela | O que faz |
|---|---|
| **Início** | Hero original ("Quando você sai, ele fica em casa."), serviços, babás em destaque, como funciona e depoimentos |
| **Buscar** | Lista de babás de Curitiba com busca por nome/bairro, filtros por serviço (Hospedagem, Passeio, Visita) e ordenação (avaliação, preço, distância) |
| **Perfil da babá** | Bio, o que a casa oferece, tabela de preços, avaliações e botão de reserva fixo |
| **Reservar** | Formulário de datas/serviço/dados do pet com **cálculo de preço ao vivo** |
| **Minhas reservas** | Reservas feitas, com opção de cancelar |
| **Entrar / Perfil** | Criar conta, entrar, ver favoritos e sair |

Favoritos ❤️, reservas e a conta ficam salvos no próprio aparelho (`localStorage`) — esta é uma **versão demonstrativa**, sem servidor: nenhuma informação sai do celular do visitante.

## 🔐 Área do administrador

Entre pela tela normal **Entrar → aba “Já tenho conta”** (`#/entrar`) com o e-mail da administradora, `maria.barbosa.sales@escola.pr.gov.br`, e a senha definida por ela. O app reconhece a conta ADM e abre o painel automaticamente; o atalho antigo `#/admin` também redireciona para esse mesmo login. A senha **não** está escrita no código — apenas o hash SHA-256 dela, em `assets/js/admin.js`.

No painel dá para:

- Ver um resumo (babás ativas, reservas, valores)
- **Editar** babás (nome, bairro, etiquetas, preços, mostrar/ocultar na loja) e **cadastrar novas babás** (com foto do celular)
- **Gerenciar reservas** (marcar como confirmada/cancelada)
- Baixar uma cópia dos dados (JSON), restaurar as babás originais ou limpar as reservas

> ⚠️ Como o app não tem servidor, o login do admin é uma **trava de tela demonstrativa** e as edições valem **só no aparelho/navegador onde foram feitas**. Para um painel de verdade (valendo para todos os visitantes), o próximo passo é ligar um backend (ex.: Supabase/Firebase).

## 📱 App Android (APK)

O mesmo site vira app Android com [Capacitor](https://capacitorjs.com/) (pasta `android/`, pacote `com.nannydog.app`).

**Baixar o APK pronto (sem instalar nada):**

1. Aba **Releases** deste repositório → baixe o `NannyDog.apk` da versão mais recente; **ou**
2. Aba **Actions** → última execução de *"📱 Gerar APK Android"* → **Artifacts → NannyDog-APK**

**Instalar no celular:** abra o arquivo `NannyDog.apk` baixado e, se o Android pedir, permita "instalar apps de fontes desconhecidas" para o navegador/gerenciador de arquivos. É um APK de depuração (debug), ótimo para testar; para publicar na Play Store um dia, será preciso gerar a versão *release* assinada (AAB).

**Gerar um APK novo:** qualquer push na `main` dispara a compilação automática (GitHub Actions, `.github/workflows/android.yml`). Também dá para rodar manualmente em **Actions → 📱 Gerar APK Android → Run workflow**. Localmente (com Node 22 + JDK 21 + Android SDK): `npm install && npm run android:apk`.

## 🍎 E no iPhone (iOS)?

APK não funciona no iOS (é só Android), mas o Nanny Dog instala no iPhone como **web app (PWA)**, com ícone na tela inicial e abertura em tela cheia:

1. Abra **https://ggabibs.github.io/nannydog/** no **Safari**
2. Toque em **Compartilhar** (quadradinho com seta ↑)
3. Toque em **"Adicionar à Tela de Início"** → **Adicionar**

Pronto: o ícone "Nanny Dog" aparece junto dos apps e abre sem a barra do navegador (inclusive a área do administrador funciona). No iPhone, o próprio site mostra um lembrete com esse passo a passo na primeira visita.

> Um app iOS "nativo" (arquivo `.ipa` / App Store) também seria possível com o Capacitor, mas a Apple exige um **Mac com Xcode** e a assinatura **Apple Developer (US$ 99/ano)** para distribuir via TestFlight/App Store. Sem isso, só instalações temporárias de desenvolvedor. Para o público geral, o caminho gratuito e recomendado no iOS é o PWA acima.

## 📱 Pensado para mobile

- Layout mobile-first, botões grandes (mín. 48px) e navegação inferior fixa com `safe-area` (iPhone com notch)
- Instalável como app (PWA: `manifest.webmanifest` + `sw.js`) — no Android/Chrome: menu ⋮ → "Instalar app"; no iPhone/Safari: Compartilhar → "Adicionar à Tela de Início"
- Funciona também no desktop (a navegação inferior vira menu no topo)

## 🚀 Como publicar no GitHub Pages (grátis)

1. Neste repositório, vá em **Settings → Pages**
2. Em *Build and deployment → Source*, escolha **Deploy from a branch**
3. Escolha a branch **`main`** e a pasta **`/ (root)`**, clique em **Save**
4. Em ~1 minuto o site fica no ar em:
   `https://ggabibs.github.io/nannydog/`

Não precisa instalar nada nem rodar build: é HTML, CSS e JavaScript puro.

## 🛠️ Rodar localmente

```bash
# qualquer servidor estático serve, por exemplo:
python3 -m http.server 8000
# abra http://localhost:8000 no navegador
```

## 📂 Estrutura

```
├── index.html              # todas as telas (SPA por hash: #/buscar, #/baba/mariana, #/admin …)
├── manifest.webmanifest    # PWA (nome, cores, ícone)
├── sw.js                   # cache offline básico
├── assets/
│   ├── css/style.css       # design mobile-first (creme, terracota, mostarda)
│   ├── js/app.js           # loja: rotas, busca, reservas, conta
│   ├── js/admin.js         # área do administrador (login por hash + painel)
│   └── img/                # fotos e ícone
├── android/                # projeto Android (Capacitor) → gera o APK
├── capacitor.config.json   # nome/pacote do app (com.nannydog.app)
├── scripts/build-www.mjs   # copia o site para www/ (o que vai dentro do APK)
└── .github/workflows/android.yml  # compila o APK automaticamente no GitHub
```

Para editar as babás (nomes, bairros, preços, fotos), altere a lista `SITTERS` no início de `assets/js/app.js`.

## 📄 Licença

MIT — veja [LICENSE](LICENSE).
