<div align="center">

# EcanBuy

**Loja de dropshipping headless** construída com Next.js (App Router) e Shopify Storefront API, com tema escuro e carrinho, cupom e checkout integrados à Shopify.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](#)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](#)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](#)
[![Shopify](https://img.shields.io/badge/Shopify_Storefront_API-7AB55C?style=flat-square&logo=shopify&logoColor=white)](#)

</div>

---

## Sobre o projeto

O EcanBuy é uma loja online de dropshipping. O front end é feito em Next.js e conversa com a Shopify pela Storefront API (modelo headless): catálogo, carrinho, cupons e checkout vêm da Shopify, e os produtos são importados de fornecedores pelo app DropshipBot, que também sincroniza e cumpre os pedidos.

```
Cliente  ->  EcanBuy (Next.js)  ->  Shopify Storefront API  ->  Checkout da Shopify
                                          ^
                              DropshipBot (importação de produtos e envio dos pedidos)
```

Sem as variáveis de ambiente da Shopify, o projeto roda em modo demonstração com um catálogo local, útil para desenvolver a interface.

## Tecnologias

- **Framework:** Next.js 16 (App Router, Server Components e Server Actions)
- **Linguagem:** TypeScript
- **UI:** React 19
- **Estilização:** Tailwind CSS 4, estilos inline e variáveis CSS (tema escuro em `src/app/globals.css`)
- **E-commerce:** Shopify Storefront API (GraphQL)
- **Importação e fulfillment:** DropshipBot (app da Shopify)
- **Package manager:** npm

## Funcionalidades

- [x] **Catálogo** com dados da Shopify (categoria, preço, preço promocional, imagem)
- [x] **Rota dinâmica** de produto por handle (`/produto/[handle]`), com escolha de variante
- [x] **Carrinho** persistido na Shopify (cookie com o id do carrinho), com alteração de quantidade e remoção
- [x] **Cupons de desconto** validados pela Shopify
- [x] **Checkout** hospedado pela Shopify
- [x] **Modo demonstração** com catálogo local quando a Shopify não está configurada
- [x] **Tema escuro** em todo o site, controlado por variáveis CSS
- [x] **Segurança:** validação das entradas das Server Actions, erros genéricos para o cliente, headers de segurança e dependências sem vulnerabilidades conhecidas (`npm audit`)
- [x] **Interface responsiva**

## Como rodar o projeto

```bash
git clone https://github.com/MatheusAnsel/Ecanbuy.git
cd Ecanbuy
npm install
cp .env.example .env.local
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Conectando à Shopify

1. Crie a loja na Shopify e instale o app DropshipBot para importar produtos.
2. Gere um token de acesso da Storefront API (app personalizado ou canal Headless).
3. Preencha o `.env.local`:

```
SHOPIFY_STORE_DOMAIN=minha-loja.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=seu-token-publico-da-storefront
```

A versão da API pode ser trocada com `SHOPIFY_API_VERSION` (padrão em `src/lib/shopify.ts`).

## Estrutura

```
src/
 ├── app/
 │    ├── page.tsx              # Home
 │    ├── produtos/             # Listagem
 │    ├── produto/[handle]/     # Detalhe do produto
 │    ├── carrinho/             # Carrinho
 │    └── actions.ts            # Server Actions do carrinho
 ├── components/                # Componentes de interface
 └── lib/
      ├── shopify.ts            # Cliente da Storefront API
      ├── cart-session.ts       # Leitura do carrinho pelo cookie
      ├── mock-products.ts      # Catálogo do modo demonstração
      └── store-config.ts       # Textos de política da loja
```

## Autor

**Matheus Ansel**

- GitHub: [@MatheusAnsel](https://github.com/MatheusAnsel)
- LinkedIn: [linkedin.com/in/matheusansel](https://linkedin.com/in/matheusansel)
- Portfólio: [matheusansel-dev.vercel.app](https://matheusansel-dev.vercel.app)
