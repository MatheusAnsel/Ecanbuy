import { cookies } from "next/headers";
import { getCart, isShopifyConfigured } from "./shopify";
import { CART_COOKIE } from "./cart-session-name";
import { DEMO_CART_COOKIE, demoStateToCart, parseDemoState, type DemoState } from "./demo-cart";
import type { Cart } from "./types";

export { CART_COOKIE };

export async function getCartId(): Promise<string | undefined> {
  return (await cookies()).get(CART_COOKIE)?.value;
}

/** Estado do carrinho do modo demonstração (sempre validado contra o catálogo). */
export async function getDemoState(): Promise<DemoState> {
  return parseDemoState((await cookies()).get(DEMO_CART_COOKIE)?.value);
}

export async function getCurrentCart(): Promise<Cart | null> {
  if (!isShopifyConfigured) return demoStateToCart(await getDemoState());

  const id = await getCartId();
  if (!id) return null;
  try {
    return await getCart(id);
  } catch {
    return null;
  }
}
