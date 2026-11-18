// Textos de política da loja. Revise antes de publicar: eles precisam
// refletir o que está configurado na Shopify (frete, trocas, prazos).
export const storeConfig = {
  name: "EcanBuy",
  // Identificação do vendedor, exigida pelo Decreto 7.962/2013 em lojas online.
  // Preencha antes de vender de verdade; enquanto estiver vazia, o rodapé não mostra o bloco.
  seller: {
    name: "",
    document: "", // CPF ou CNPJ
    address: "",
    email: "",
  },
  ticker: [
    "PRODUTOS IMPORTADOS",
    "PAGAMENTO PROCESSADO PELA SHOPIFY",
    "PRAZO E FRETE CALCULADOS NO CHECKOUT",
  ],
  infoList: [
    "Produto importado: prazo e frete calculados no checkout",
    "Pagamento processado pelo checkout seguro da Shopify",
    "Consulte a política de trocas e devoluções da loja",
  ],
};
