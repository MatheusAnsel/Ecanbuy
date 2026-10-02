export interface Variant {
  id: string;
  title: string;
  available: boolean;
}

export interface Product {
  id: string;
  handle: string;
  name: string;
  price: number;
  oldPrice: number | null;
  category: string;
  description: string;
  image: string | null;
  isNew: boolean;
  variants: Variant[];
  /** true quando o produto tem mais de uma opção (tamanho, cor...) para o cliente escolher */
  hasOptions: boolean;
}

export interface CartLine {
  id: string;
  quantity: number;
  total: number;
  variantTitle: string;
  name: string;
  handle: string;
  category: string;
  image: string | null;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: number;
  total: number;
  discountCodes: { code: string; applicable: boolean }[];
  lines: CartLine[];
}
