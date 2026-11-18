# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.3.0] - 2026-11-18

### Adicionado

- Modo demonstração completo: carrinho em cookie `httpOnly` validado contra o catálogo, cupom de teste `DEMO10`, checkout simulado e confirmação de pedido fictício, com faixa avisando que nenhum pagamento é real
- Páginas de política: trocas e devoluções, frete e entrega, privacidade (LGPD) e termos de uso, com links no rodapé
- SEO: título com modelo por página, descrição, Open Graph com a foto do produto, URL canônica, `sitemap.xml` e `robots.txt` (`SITE_URL` configurável)
- Página 404 própria, tela de erro quando a loja não carrega e aviso quando não há produtos
- Bloco de identificação do vendedor no rodapé (Decreto 7.962/2013), exibido quando preenchido em `store-config.ts`
- 33 testes novos (128 no total)

### Corrigido

- Links "Entrar", "Junte-se a nós" e "Acompanhe seu pedido" iam para a página de ajuda mesmo com a Shopify configurada, porque o cabeçalho roda no navegador, onde o domínio da loja não existia
- Botão "Cadastrar" da home apontava para `#`; agora abre o cadastro de cliente da Shopify
- Removida a promessa de "10% off" no cadastro, que não correspondia a nenhum desconto configurado
- Coluna de categorias vazia no rodapé do carrinho

## [1.2.2] - 2026-11-18

### Segurança

- Next.js atualizado para 16.4.6, corrigindo vulnerabilidade crítica de execução remota de código (GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr) e outras do 16.3.x
- Dependências de desenvolvimento atualizadas (zod, minimatch); `npm audit` sem vulnerabilidades

### Corrigido

- CI: o passo de testes agora falha de verdade quando um teste ou o piso de cobertura falha (antes o `tee` mascarava o código de saída)
- CI: o resumo de cobertura não gera erro extra quando um passo anterior já falhou

## [1.2.1] - 2026-10-21

### Documentação

- Contagem de testes e cobertura corrigida e capturas de tela reais
- Licença MIT
- CHANGELOG com o histórico de versões

## [1.2.0] - 2026-10-11

### Adicionado

- Novo visual em tema claro na home, listagem, produto e carrinho
- Barra utilitária (acessibilidade, pedido, ajuda, conta), menu de ofertas e lançamentos e página de ajuda
- Produtos de exemplo com imagens locais e imagem automática para produtos sem foto
- Favicon com monograma EB

## [1.1.0] - 2026-10-08

### Adicionado

- 84 testes da lógica da loja, com cobertura
- CI com audit, lint, tipos, cobertura e build
- Diagramas no README

### Corrigido

- SHOPIFY_API_VERSION vazia

## [1.0.0] - 2026-10-02

### Adicionado

- Loja headless integrada à Shopify Storefront API: catálogo, carrinho, cupom e checkout
- Tema escuro em todo o site com variáveis CSS

### Segurança

- Next.js 16.3.8, validação das entradas das server actions e cabeçalhos de segurança

## [0.1.0] - 2026-04-27

### Adicionado

- Primeira versão da loja e README com instalação e tecnologias

[1.2.1]: https://github.com/MatheusAnsel/Ecanbuy/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/MatheusAnsel/Ecanbuy/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/MatheusAnsel/Ecanbuy/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/MatheusAnsel/Ecanbuy/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/MatheusAnsel/Ecanbuy/releases/tag/v0.1.0
