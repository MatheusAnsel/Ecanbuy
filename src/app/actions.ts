"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { CART_COOKIE, getCartId } from "@/lib/cart-session";
import {
  addCartLine,
  createCart,
  getCart,
  isShopifyConfigured,
  removeCartLine,
  setCartDiscountCodes,
  updateCartLine,
} from "@/lib/shopify";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const NOT_CONFIGURED: ActionResult = {
  ok: false,
  error: "A loja ainda não está conectada à Shopify (modo demonstração).",
};

async function rememberCart(id: string) {
  (await cookies()).set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 10,
  });
}

// Erros de validação (mensagem segura para o cliente) x erros internos (só no log do servidor).
class ValidationError extends Error {}

const GENERIC_ERROR = "Não foi possível concluir a operação. Tente novamente em instantes.";
const SHOPIFY_ID = /^gid:\/\/shopify\/(ProductVariant|CartLine)\/[A-Za-z0-9_-]+(\?[A-Za-z0-9_=&-]+)?$/;

function assertId(id: unknown, kind: "variant" | "line"): asserts id is string {
  const ok =
    typeof id === "string" &&
    id.length <= 200 &&
    (kind === "variant" ? SHOPIFY_ID.test(id) && id.includes("/ProductVariant/") : SHOPIFY_ID.test(id) && id.includes("/CartLine/"));
  if (!ok) throw new ValidationError("Item inválido.");
}

function assertQty(q: unknown): asserts q is number {
  if (typeof q !== "number" || !Number.isInteger(q) || q < 0 || q > 99) {
    throw new ValidationError("Quantidade inválida.");
  }
}

function toResult(e: unknown): ActionResult {
  if (e instanceof ValidationError) return { ok: false, error: e.message };
  console.error("[actions]", e instanceof Error ? e.message : e);
  return { ok: false, error: GENERIC_ERROR };
}

async function run(fn: () => Promise<void>): Promise<ActionResult> {
  if (!isShopifyConfigured) return NOT_CONFIGURED;
  try {
    await fn();
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return toResult(e);
  }
}

export async function addToCartAction(variantId: string, quantity: number): Promise<ActionResult> {
  return run(async () => {
    assertId(variantId, "variant");
    assertQty(quantity);
    if (quantity < 1) throw new ValidationError("Quantidade inválida.");
    const qty = quantity;
    const existingId = await getCartId();
    const existing = existingId ? await getCart(existingId) : null;
    const cart = existing
      ? await addCartLine(existing.id, variantId, qty)
      : await createCart(variantId, qty);
    await rememberCart(cart.id);
  });
}

export async function updateLineAction(lineId: string, quantity: number): Promise<ActionResult> {
  return run(async () => {
    assertId(lineId, "line");
    assertQty(quantity);
    const cartId = await getCartId();
    if (!cartId) throw new ValidationError("Carrinho não encontrado.");
    if (quantity < 1) await removeCartLine(cartId, lineId);
    else await updateCartLine(cartId, lineId, Math.min(99, quantity));
  });
}

export async function removeLineAction(lineId: string): Promise<ActionResult> {
  return run(async () => {
    assertId(lineId, "line");
    const cartId = await getCartId();
    if (!cartId) throw new ValidationError("Carrinho não encontrado.");
    await removeCartLine(cartId, lineId);
  });
}

export async function applyDiscountAction(code: string): Promise<ActionResult> {
  if (!isShopifyConfigured) return NOT_CONFIGURED;
  if (typeof code !== "string") return { ok: false, error: "Cupom inválido." };
  const trimmed = code.trim();
  if (!trimmed) return { ok: false, error: "Digite um cupom." };
  if (trimmed.length > 40 || !/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return { ok: false, error: "Cupom inválido ou não aplicável a este carrinho." };
  }

  try {
    const cartId = await getCartId();
    if (!cartId) return { ok: false, error: "Carrinho não encontrado." };
    const cart = await setCartDiscountCodes(cartId, [trimmed]);
    const applied = cart.discountCodes.some(
      (d) => d.applicable && d.code.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!applied) {
      await setCartDiscountCodes(cartId, []);
      revalidatePath("/", "layout");
      return { ok: false, error: "Cupom inválido ou não aplicável a este carrinho." };
    }
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return toResult(e);
  }
}
