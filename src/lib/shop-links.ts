// Links da conta do cliente. A Shopify hospeda login, cadastro e acompanhamento
// de pedidos; se a loja não estiver configurada, cai para a página de ajuda.
export function accountLink(path: "" | "/login" | "/register"): string {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  return domain ? `https://${domain}/account${path}` : "/ajuda";
}
