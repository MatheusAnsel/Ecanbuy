<div align="center">

# EcanBuy 🛒

**Marketplace** construído com Next.js (App Router) para praticar rotas dinâmicas, gerenciamento de estado e arquitetura de componentes.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](#)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](#)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](#)

</div>

---

## Sobre o projeto

O EcanBuy é um estudo prático de e-commerce: catálogo de produtos, página de detalhe por rota dinâmica (`/produto/[id]`) e carrinho com gerenciamento de estado — cupom de desconto incluso.

## Tecnologias

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **UI:** React 19
- **Estilização:** Tailwind CSS 4
- **Package manager:** npm

## Funcionalidades

- [x] **Listagem de produtos** — catálogo com visualização detalhada
- [x] **Rota dinâmica** — página de produto individual via `/produto/[id]`
- [x] **Carrinho de compras** — adição/remoção de itens, seleção de tamanho e quantidade
- [x] **Cupom de desconto** — aplicação e validação de cupom no carrinho
- [x] **Interface responsiva**

## Como rodar o projeto

```bash
git clone https://github.com/MatheusAnsel/Ecanbuy.git
cd Ecanbuy
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Estrutura

```
src/app/
 ├── page.tsx              # Home
 ├── produtos/             # Listagem de produtos
 ├── produto/[id]/         # Página de detalhe (rota dinâmica)
 └── carrinho/             # Carrinho de compras
```

## Autor

**Matheus Ansel**

- GitHub: [@MatheusAnsel](https://github.com/MatheusAnsel)
- LinkedIn: [linkedin.com/in/matheusansel](https://linkedin.com/in/matheusansel)
- Portfólio: [matheusansel-dev.vercel.app](https://matheusansel-dev.vercel.app)
