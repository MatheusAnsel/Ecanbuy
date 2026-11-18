// Carrinho do modo demonstração: usado quando a Shopify não está configurada, para
// que o fluxo inteiro (carrinho, cupom e checkout) possa ser testado sem loja real.
//
// O estado fica num cookie httpOnly com apenas ids de variante, quantidades e cupom.
// Preço, nome e imagem sempre vêm do catálogo de demonstração no servidor, então
// alterar o cookie não muda o valor cobrado (e nenhuma cobrança real acontece).
import { mockProducts } from "./mock-products";
import type { Cart, CartLine, Product, Variant } from "./types";
import { DEMO_CHECKOUT_PATH, DEMO_COUPON, DEMO_DISCOUNT } from "./demo-config";

export { DEMO_CHECKOUT_PATH, DEMO_COUPON, DEMO_DISCOUNT };

export const DEMO_CART_COOKIE = "ecanbuy_demo_cart";
export const MAX_LINES = 20;
export const MAX_QTY = 99;

export interface DemoState {
  lines: { v: string; q: number }[];
  c?: string;
}

const EMPTY: DemoState = { lines: [] };

export function isDemoVariantId(id: unknown): id is string {
  return typeof id === "string" && id.length <= 120 && /^mock:[a-z0-9-]+:[A-Za-z0-9À-ÿ-]+$/.test(id);
}

function findVariant(id: string): { product: Product; variant: Variant } | null {
  for (const product of mockProducts) {
    const variant = product.variants.find((v) => v.id === id);
    if (variant) return { product, variant };
  }
  return null;
}

/** Lê o cookie com segurança: qualquer coisa inválida é descartada. */
export function parseDemoState(raw: string | undefined): DemoState {
  if (!raw) return EMPTY;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return EMPTY;
  }
  if (!data || typeof data !== "object") return EMPTY;
  const { lines, c } = data as { lines?: unknown; c?: unknown };
  if (!Array.isArray(lines)) return EMPTY;

  const seen = new Set<string>();
  const clean: DemoState["lines"] = [];
  for (const line of lines.slice(0, MAX_LINES)) {
    const { v, q } = (line ?? {}) as { v?: unknown; q?: unknown };
    if (!isDemoVariantId(v) || seen.has(v) || !findVariant(v)) continue;
    if (typeof q !== "number" || !Number.isInteger(q) || q < 1 || q > MAX_QTY) continue;
    seen.add(v);
    clean.push({ v, q });
  }
  return c === DEMO_COUPON && clean.length > 0 ? { lines: clean, c } : { lines: clean };
}

export function serializeDemoState(state: DemoState): string {
  return JSON.stringify(state);
}

export class DemoCartError extends Error {}

export function addDemoLine(state: DemoState, variantId: string, quantity: number): DemoState {
  const found = isDemoVariantId(variantId) ? findVariant(variantId) : null;
  if (!found || !found.variant.available) throw new DemoCartError("Item inválido.");
  const existing = state.lines.find((l) => l.v === variantId);
  if (!existing && state.lines.length >= MAX_LINES) throw new DemoCartError("Carrinho cheio.");
  const lines = existing
    ? state.lines.map((l) => (l.v === variantId ? { v: l.v, q: Math.min(MAX_QTY, l.q + quantity) } : l))
    : [...state.lines, { v: variantId, q: Math.min(MAX_QTY, quantity) }];
  return { ...state, lines };
}

export function updateDemoLine(state: DemoState, lineId: string, quantity: number): DemoState {
  if (!state.lines.some((l) => l.v === lineId)) throw new DemoCartError("Item não encontrado no carrinho.");
  if (quantity < 1) return removeDemoLine(state, lineId);
  return { ...state, lines: state.lines.map((l) => (l.v === lineId ? { v: l.v, q: Math.min(MAX_QTY, quantity) } : l)) };
}

export function removeDemoLine(state: DemoState, lineId: string): DemoState {
  const lines = state.lines.filter((l) => l.v !== lineId);
  return lines.length ? { ...state, lines } : EMPTY;
}

/** Aplica o cupom de teste. Devolve null se o cupom não for o de demonstração. */
export function applyDemoCoupon(state: DemoState, code: string): DemoState | null {
  return code.trim().toUpperCase() === DEMO_COUPON ? { ...state, c: DEMO_COUPON } : null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Converte o estado no mesmo formato de carrinho usado com a Shopify. */
export function demoStateToCart(state: DemoState): Cart | null {
  const lines: CartLine[] = [];
  for (const { v, q } of state.lines) {
    const found = findVariant(v);
    if (!found) continue;
    const { product, variant } = found;
    lines.push({
      id: v,
      quantity: q,
      total: round2(product.price * q),
      variantTitle: product.hasOptions ? variant.title : "Default Title",
      name: product.name,
      handle: product.handle,
      category: product.category,
      image: product.image,
    });
  }
  if (!lines.length) return null;

  const subtotal = round2(lines.reduce((sum, l) => sum + l.total, 0));
  const total = state.c ? round2(subtotal * (1 - DEMO_DISCOUNT)) : subtotal;
  return {
    id: "demo",
    checkoutUrl: DEMO_CHECKOUT_PATH,
    totalQuantity: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotal,
    total,
    discountCodes: state.c ? [{ code: state.c, applicable: true }] : [],
    lines,
  };
}

/** Número de pedido fictício, só para a tela de confirmação da demonstração. */
export function demoOrderNumber(random: () => number = Math.random): string {
  return `DEMO-${Math.floor(100000 + random() * 900000)}`;
}
