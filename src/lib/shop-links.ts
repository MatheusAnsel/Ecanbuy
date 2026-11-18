// Links da conta do cliente. A Shopify hospeda login, cadastro e acompanhamento
// de pedidos; se a loja não estiver configurada, cai para a página de ajuda.
//
// O cabeçalho é renderizado dentro de componentes client, onde SHOPIFY_STORE_DOMAIN
// não existe. Por isso o next.config.ts copia o domínio (que não é segredo) para
// SHOPIFY_ACCOUNT_DOMAIN, que o Next.js embute também no bundle do navegador.
/** true quando a loja roda sem Shopify (catálogo, carrinho e checkout simulados). */
export function isDemoStore(): boolean {
  return !(process.env.SHOPIFY_ACCOUNT_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN)?.trim();
}

export function accountLink(path: "" | "/login" | "/register"): string {
  const domain = (process.env.SHOPIFY_ACCOUNT_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN)?.trim();
  return domain ? `https://${domain}/account${path}` : "/ajuda";
}
