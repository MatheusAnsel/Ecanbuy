import type { Cart, CartLine, Product } from "./types";
import { mockProducts } from "./mock-products";

// Estas variáveis são lidas só no servidor (sem prefixo NEXT_PUBLIC_).
// Use APENAS o token da Storefront API. Nunca use o token Admin (shpat_...).
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
// `||` e não `??`: o .env.example traz SHOPIFY_API_VERSION em branco, e variável vazia
// chega como "" (não undefined). Com `??` a URL ficaria /api//graphql.json e a loja quebraria.
const apiVersion = process.env.SHOPIFY_API_VERSION?.trim() || "2026-07";

export const isShopifyConfigured = Boolean(domain && token);

interface FetchOptions {
  cache?: RequestCache;
  revalidate?: number;
}

async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  { cache, revalidate = 60 }: FetchOptions = {},
): Promise<T> {
  if (!domain || !token) {
    throw new Error("Shopify não configurada (defina SHOPIFY_STORE_DOMAIN e SHOPIFY_STOREFRONT_TOKEN).");
  }

  const res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    ...(cache ? { cache } : { next: { revalidate } }),
  });

  if (!res.ok) {
    throw new Error(`Shopify respondeu ${res.status}`);
  }

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data as T;
}

/* ---------------------------------- Produtos --------------------------------- */

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    productType
    description
    createdAt
    featuredImage { url }
    variants(first: 50) {
      nodes {
        id
        title
        availableForSale
        price { amount }
        compareAtPrice { amount }
      }
    }
  }
`;

interface ProductNode {
  id: string;
  handle: string;
  title: string;
  productType: string;
  description: string;
  createdAt: string;
  featuredImage: { url: string } | null;
  variants: {
    nodes: {
      id: string;
      title: string;
      availableForSale: boolean;
      price: { amount: string };
      compareAtPrice: { amount: string } | null;
    }[];
  };
}

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

function mapProduct(node: ProductNode): Product {
  const variants = node.variants.nodes;
  const first = variants[0];
  const price = first ? parseFloat(first.price.amount) : 0;
  const compare = first?.compareAtPrice ? parseFloat(first.compareAtPrice.amount) : null;
  const hasOptions = variants.length > 1 || (variants.length === 1 && first.title !== "Default Title");

  return {
    id: node.id,
    handle: node.handle,
    name: node.title,
    price,
    oldPrice: compare !== null && compare > price ? compare : null,
    category: node.productType || "Geral",
    description: node.description,
    image: node.featuredImage?.url ?? null,
    isNew: Date.now() - new Date(node.createdAt).getTime() < THIRTY_DAYS,
    hasOptions,
    variants: variants.map((v) => ({ id: v.id, title: v.title, available: v.availableForSale })),
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!isShopifyConfigured) return mockProducts;

  const data = await shopifyFetch<{ products: { nodes: ProductNode[] } }>(
    `${PRODUCT_FRAGMENT}
     query Products {
       products(first: 100, sortKey: CREATED_AT, reverse: true) {
         nodes { ...ProductFields }
       }
     }`,
  );
  return data.products.nodes.map(mapProduct);
}

export async function getProduct(handle: string): Promise<Product | null> {
  if (!isShopifyConfigured) return mockProducts.find((p) => p.handle === handle) ?? null;

  const data = await shopifyFetch<{ product: ProductNode | null }>(
    `${PRODUCT_FRAGMENT}
     query Product($handle: String!) {
       product(handle: $handle) { ...ProductFields }
     }`,
    { handle },
  );
  return data.product ? mapProduct(data.product) : null;
}

/* ----------------------------------- Carrinho -------------------------------- */

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount }
      totalAmount { amount }
    }
    discountCodes { code applicable }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost { totalAmount { amount } }
        merchandise {
          ... on ProductVariant {
            title
            product {
              title
              handle
              productType
              featuredImage { url }
            }
          }
        }
      }
    }
  }
`;

interface CartNode {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: { amount: string }; totalAmount: { amount: string } };
  discountCodes: { code: string; applicable: boolean }[];
  lines: {
    nodes: {
      id: string;
      quantity: number;
      cost: { totalAmount: { amount: string } };
      merchandise: {
        title: string;
        product: {
          title: string;
          handle: string;
          productType: string;
          featuredImage: { url: string } | null;
        };
      };
    }[];
  };
}

// O checkout é hospedado pela Shopify. Só aceitamos https, para o botão
// "Finalizar compra" nunca apontar para um esquema ou destino inesperado.
function safeCheckoutUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
}

function mapCart(node: CartNode): Cart {
  const lines: CartLine[] = node.lines.nodes.map((l) => ({
    id: l.id,
    quantity: l.quantity,
    total: parseFloat(l.cost.totalAmount.amount),
    variantTitle: l.merchandise.title,
    name: l.merchandise.product.title,
    handle: l.merchandise.product.handle,
    category: l.merchandise.product.productType || "Geral",
    image: l.merchandise.product.featuredImage?.url ?? null,
  }));

  return {
    id: node.id,
    checkoutUrl: safeCheckoutUrl(node.checkoutUrl),
    totalQuantity: node.totalQuantity,
    subtotal: parseFloat(node.cost.subtotalAmount.amount),
    total: parseFloat(node.cost.totalAmount.amount),
    discountCodes: node.discountCodes,
    lines,
  };
}

interface UserError {
  message: string;
}

function assertNoUserErrors(errors: UserError[] | undefined) {
  if (errors?.length) throw new Error(errors.map((e) => e.message).join("; "));
}

const noStore: FetchOptions = { cache: "no-store" };

export async function getCart(cartId: string): Promise<Cart | null> {
  if (!isShopifyConfigured) return null;
  const data = await shopifyFetch<{ cart: CartNode | null }>(
    `${CART_FRAGMENT}
     query Cart($id: ID!) { cart(id: $id) { ...CartFields } }`,
    { id: cartId },
    noStore,
  );
  return data.cart ? mapCart(data.cart) : null;
}

export async function createCart(variantId: string, quantity: number): Promise<Cart> {
  const data = await shopifyFetch<{ cartCreate: { cart: CartNode; userErrors: UserError[] } }>(
    `${CART_FRAGMENT}
     mutation CartCreate($lines: [CartLineInput!]!) {
       cartCreate(input: { lines: $lines }) {
         cart { ...CartFields }
         userErrors { message }
       }
     }`,
    { lines: [{ merchandiseId: variantId, quantity }] },
    noStore,
  );
  assertNoUserErrors(data.cartCreate.userErrors);
  return mapCart(data.cartCreate.cart);
}

export async function addCartLine(cartId: string, variantId: string, quantity: number): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesAdd: { cart: CartNode; userErrors: UserError[] } }>(
    `${CART_FRAGMENT}
     mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
       cartLinesAdd(cartId: $cartId, lines: $lines) {
         cart { ...CartFields }
         userErrors { message }
       }
     }`,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] },
    noStore,
  );
  assertNoUserErrors(data.cartLinesAdd.userErrors);
  return mapCart(data.cartLinesAdd.cart);
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesUpdate: { cart: CartNode; userErrors: UserError[] } }>(
    `${CART_FRAGMENT}
     mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
       cartLinesUpdate(cartId: $cartId, lines: $lines) {
         cart { ...CartFields }
         userErrors { message }
       }
     }`,
    { cartId, lines: [{ id: lineId, quantity }] },
    noStore,
  );
  assertNoUserErrors(data.cartLinesUpdate.userErrors);
  return mapCart(data.cartLinesUpdate.cart);
}

export async function removeCartLine(cartId: string, lineId: string): Promise<Cart> {
  const data = await shopifyFetch<{ cartLinesRemove: { cart: CartNode; userErrors: UserError[] } }>(
    `${CART_FRAGMENT}
     mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
       cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
         cart { ...CartFields }
         userErrors { message }
       }
     }`,
    { cartId, lineIds: [lineId] },
    noStore,
  );
  assertNoUserErrors(data.cartLinesRemove.userErrors);
  return mapCart(data.cartLinesRemove.cart);
}

export async function setCartDiscountCodes(cartId: string, codes: string[]): Promise<Cart> {
  const data = await shopifyFetch<{ cartDiscountCodesUpdate: { cart: CartNode; userErrors: UserError[] } }>(
    `${CART_FRAGMENT}
     mutation CartDiscountCodesUpdate($cartId: ID!, $codes: [String!]!) {
       cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $codes) {
         cart { ...CartFields }
         userErrors { message }
       }
     }`,
    { cartId, codes },
    noStore,
  );
  assertNoUserErrors(data.cartDiscountCodesUpdate.userErrors);
  return mapCart(data.cartDiscountCodesUpdate.cart);
}
