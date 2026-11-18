// Textos das políticas da loja. Revise antes de publicar: eles precisam refletir
// o que está configurado na Shopify (frete, prazos e forma de reembolso).
import { CART_COOKIE } from "./cart-session-name";

export interface PolicySection {
  title: string;
  paragraphs: string[];
}

export interface Policy {
  slug: string;
  title: string;
  description: string;
  sections: PolicySection[];
}

export const policies: Policy[] = [
  {
    slug: "trocas-e-devolucoes",
    title: "Trocas e devoluções",
    description: "Como desistir de uma compra, devolver ou trocar um produto com defeito.",
    sections: [
      {
        title: "Direito de arrependimento",
        paragraphs: [
          "Em compras feitas pela internet, você pode desistir da compra em até 7 dias corridos a partir do recebimento do produto, sem precisar justificar (art. 49 do Código de Defesa do Consumidor).",
          "Para desistir, entre em contato pelo e-mail informado no rodapé com o número do pedido. O valor pago, incluindo o frete, é devolvido pela mesma forma de pagamento usada na compra.",
        ],
      },
      {
        title: "Produto com defeito",
        paragraphs: [
          "Se o produto chegar com defeito ou diferente do anunciado, entre em contato pelo e-mail informado no rodapé, com fotos do produto e da embalagem. Os prazos para reclamar de defeitos seguem o art. 26 do Código de Defesa do Consumidor.",
          "Depois da análise, você pode escolher entre a troca por outro item igual, o abatimento no preço ou a devolução do valor pago.",
        ],
      },
      {
        title: "Como devolver",
        paragraphs: [
          "Envie o produto sem sinais de uso e, se possível, na embalagem original. As instruções de envio são passadas por e-mail depois que o pedido de devolução é registrado.",
        ],
      },
    ],
  },
  {
    slug: "frete-e-entrega",
    title: "Frete e entrega",
    description: "Como são calculados o frete e o prazo de entrega dos produtos importados.",
    sections: [
      {
        title: "Valor e prazo",
        paragraphs: [
          "Os produtos são importados e enviados por fornecedores parceiros. O valor do frete e o prazo estimado de entrega são calculados no checkout, antes do pagamento, de acordo com o endereço informado.",
        ],
      },
      {
        title: "Tributos de importação",
        paragraphs: [
          "Encomendas internacionais podem estar sujeitas a tributos de importação. Confira as condições mostradas no checkout antes de concluir a compra.",
        ],
      },
      {
        title: "Acompanhamento",
        paragraphs: [
          "Depois do envio, o código de rastreio é enviado para o e-mail usado na compra. Se você tiver conta, também pode acompanhar o pedido na área do cliente.",
        ],
      },
    ],
  },
  {
    slug: "privacidade",
    title: "Política de privacidade",
    description: "Quais dados a loja usa, para quê e como exercer os seus direitos pela LGPD.",
    sections: [
      {
        title: "Dados que este site guarda",
        paragraphs: [
          `Este site não tem banco de dados próprio de clientes. Ele guarda apenas um cookie (${CART_COOKIE}) com o identificador do seu carrinho, para que os itens não se percam entre uma página e outra. Esse cookie não é acessível por scripts e não é usado para publicidade.`,
        ],
      },
      {
        title: "Compra, pagamento e conta",
        paragraphs: [
          "Carrinho, checkout, pagamento e conta de cliente são processados pela Shopify. Nome, endereço, e-mail e dados de pagamento informados no checkout são tratados para entregar o pedido, emitir a cobrança e cumprir obrigações legais, seguindo também a política de privacidade da Shopify.",
          "Os dados de entrega são compartilhados com o fornecedor e a transportadora apenas na medida necessária para enviar o pedido.",
        ],
      },
      {
        title: "Seus direitos",
        paragraphs: [
          "Pela Lei Geral de Proteção de Dados (Lei 13.709/2018, art. 18), você pode pedir a confirmação de que tratamos seus dados, o acesso, a correção, a anonimização ou a exclusão deles, além de informações sobre com quem foram compartilhados. Para isso, use o e-mail informado no rodapé.",
        ],
      },
    ],
  },
  {
    slug: "termos-de-uso",
    title: "Termos de uso",
    description: "Condições de uso do site e de compra na loja.",
    sections: [
      {
        title: "Preços e disponibilidade",
        paragraphs: [
          "Preços, estoque e promoções podem mudar sem aviso. O valor que vale é o mostrado no checkout no momento da compra.",
        ],
      },
      {
        title: "Pagamento",
        paragraphs: [
          "O pagamento é feito no checkout seguro da Shopify. O pedido só é confirmado depois da aprovação do pagamento.",
        ],
      },
      {
        title: "Imagens e descrições",
        paragraphs: [
          "As fotos são ilustrativas e podem ter pequenas variações de cor por causa da tela de cada aparelho. Medidas e materiais estão na descrição de cada produto.",
        ],
      },
      {
        title: "Dúvidas",
        paragraphs: [
          "Dúvidas sobre pedidos, trocas ou estes termos podem ser enviadas para o e-mail informado no rodapé. Também valem as políticas de trocas, de frete e de privacidade desta loja.",
        ],
      },
    ],
  },
];

export function getPolicy(slug: string): Policy | null {
  return policies.find((p) => p.slug === slug) ?? null;
}
