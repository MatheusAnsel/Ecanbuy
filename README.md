<div align="center">

# EcanBuy

**Loja de dropshipping headless** construída com Next.js (App Router) e Shopify Storefront API, com tema escuro e carrinho, cupom e checkout integrados à Shopify.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](#)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](#)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](#)
[![Shopify](https://img.shields.io/badge/Shopify_Storefront_API-7AB55C?style=flat-square&logo=shopify&logoColor=white)](#)
[![CI](https://github.com/MatheusAnsel/Ecanbuy/actions/workflows/ci.yml/badge.svg)](https://github.com/MatheusAnsel/Ecanbuy/actions/workflows/ci.yml)
[![Cobertura](https://img.shields.io/badge/cobertura-m%C3%ADnimo%2095%25%20exigido%20no%20CI-brightgreen?style=flat-square)](#testes-e-ci)

</div>

---

## Sobre o projeto

O EcanBuy é uma loja online de dropshipping. O front end é feito em Next.js e conversa com a Shopify pela Storefront API (modelo headless): catálogo, carrinho, cupons e checkout vêm da Shopify, e os produtos são importados de fornecedores pelo app DropshipBot, que também sincroniza e cumpre os pedidos.

```mermaid
flowchart LR
    C[Cliente] --> N[EcanBuy<br/>Next.js: Server Components<br/>e Server Actions]
    N -->|GraphQL, com o token só no servidor| S[Shopify Storefront API]
    S --> K[Checkout hospedado pela Shopify]
    D[DropshipBot] -.->|importa produtos e cumpre pedidos| S
    N -.->|cookie httpOnly com o id do carrinho| C
```

O token da Storefront API nunca chega ao navegador: toda chamada à Shopify acontece no servidor. O carrinho vive na Shopify; o EcanBuy guarda só o id dele em um cookie `httpOnly`. Não há contas de cliente: cadastro, pagamento e pedido ficam no checkout da Shopify.

### Adicionar ao carrinho

```mermaid
sequenceDiagram
    participant N as Navegador
    participant A as Server Action
    participant S as Shopify

    N->>A: addToCartAction(variantId, quantidade)
    A->>A: valida o formato do id e a quantidade (1 a 99)
    A->>A: lê o cookie do carrinho
    alt já existe carrinho na Shopify
        A->>S: cartLinesAdd
    else sem cookie, ou carrinho expirado
        A->>S: cartCreate
    end
    S-->>A: carrinho (ou userErrors)
    A->>N: grava o cookie e revalida a página
    Note over A,N: Erro interno vira uma mensagem genérica para o cliente, e o detalhe vai só para o log
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

A versão da API pode ser trocada com `SHOPIFY_API_VERSION` (padrão em `src/lib/shopify.ts`). Se a variável ficar em branco, como vem no `.env.example`, vale o padrão.

## Testes e CI

```bash
npm test                # 84 testes (Vitest)
npm run test:coverage   # com cobertura e piso mínimo
npm run lint
npm run typecheck
```

Os testes cobrem a lógica de negócio sem acessar a Shopify de verdade (a `fetch` é simulada):

- **Cliente da Shopify** (`src/lib/shopify.ts`): endpoint, token e versão da API; cache do catálogo (60 s) e carrinho sem cache; mapeamento de produtos (preço promocional só quando o preço de comparação é maior, opções de variante, produto novo nos últimos 30 dias, categoria padrão); mapeamento do carrinho; recusa de `checkoutUrl` que não seja `https`; e transformação de `userErrors` da Shopify em erro.
- **Server Actions** (`src/app/actions.ts`): validação do formato dos ids da Shopify, quantidade de 1 a 99, regras do cupom, cupom recusado removido do carrinho, cookie `httpOnly` e `secure` só em produção, carrinho expirado recriado, e erros internos que não vazam para o cliente.
- **Sessão do carrinho** (`src/lib/cart-session.ts`): leitura do cookie e falha da Shopify sem quebrar a página.
- **Modo demonstração**: sem as variáveis da Shopify, nenhuma requisição é feita.

| Cobertura (out/2026) | Medido | Mínimo exigido no CI |
| --- | --- | --- |
| Linhas e instruções | 100% | 95% |
| Branches | 100% | 90% |
| Funções | 100% | 95% |

A métrica considera `src/lib` e `src/app/actions.ts`, onde está a lógica. As páginas e os componentes são apresentação sobre essa lógica e ficam de fora, assim como `types.ts` e `store-config.ts` (só interfaces e textos). Se a cobertura cair abaixo do mínimo, o CI falha.

O workflow em `.github/workflows/ci.yml` roda a cada push e pull request: auditoria das dependências de produção, lint, verificação de tipos, testes com cobertura e build.

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
      ├── shopify.ts            # Cliente da Storefront API (com testes)
      ├── cart-session.ts       # Leitura do carrinho pelo cookie
      ├── mock-products.ts      # Catálogo do modo demonstração
      └── store-config.ts       # Textos de política da loja
```

## Autor

**Matheus Ansel**

- GitHub: [@MatheusAnsel](https://github.com/MatheusAnsel)
- LinkedIn: [linkedin.com/in/matheusansel](https://linkedin.com/in/matheusansel)
- Portfólio: [matheusansel-dev.vercel.app](https://matheusansel-dev.vercel.app)
