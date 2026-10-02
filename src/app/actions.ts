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

async function run(fn: () => Promise<void>): Promise<ActionResult> {
  if (!isShopifyConfigured) return NOT_CONFIGURED;
  try {
    await fn();
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erro inesperado." };
  }
}

export async function addToCartAction(variantId: string, quantity: number): Promise<ActionResult> {
  return run(async () => {
    const qty = Math.max(1, Math.min(99, Math.floor(quantity)));
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
    const cartId = await getCartId();
    if (!cartId) throw new Error("Carrinho não encontrado.");
    if (quantity < 1) await removeCartLine(cartId, lineId);
    else await updateCartLine(cartId, lineId, Math.min(99, quantity));
  });
}

export async function removeLineAction(lineId: string): Promise<ActionResult> {
  return run(async () => {
    const cartId = await getCartId();
    if (!cartId) throw new Error("Carrinho não encontrado.");
    await removeCartLine(cartId, lineId);
  });
}

export async function applyDiscountAction(code: string): Promise<ActionResult> {
  if (!isShopifyConfigured) return NOT_CONFIGURED;
  const trimmed = code.trim();
  if (!trimmed) return { ok: false, error: "Digite um cupom." };

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
    return { ok: false, error: e instanceof Error ? e.message : "Erro inesperado." };
  }
}
