import { cookies } from "next/headers";
import { getCart } from "./shopify";
import type { Cart } from "./types";

export const CART_COOKIE = "ecanbuy_cart";

export async function getCartId(): Promise<string | undefined> {
  return (await cookies()).get(CART_COOKIE)?.value;
}

export async function getCurrentCart(): Promise<Cart | null> {
  const id = await getCartId();
  if (!id) return null;
  try {
    return await getCart(id);
  } catch {
    return null;
  }
}
