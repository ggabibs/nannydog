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
├── index.html              # todas as telas (SPA por hash: #/buscar, #/baba/mariana …)
├── manifest.webmanifest    # PWA (nome, cores, ícone)
├── sw.js                   # cache offline básico
└── assets/
    ├── css/style.css       # design mobile-first (creme, terracota, mostarda)
    ├── js/app.js           # dados das babás, rotas, busca, reservas, conta
    └── img/                # fotos e ícone
```

Para editar as babás (nomes, bairros, preços, fotos), altere a lista `SITTERS` no início de `assets/js/app.js`.

## 📄 Licença

MIT — veja [LICENSE](LICENSE).
