import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => ({ get: vi.fn() }));
const shopify = vi.hoisted(() => ({ getCart: vi.fn(), isShopifyConfigured: false }));

vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));
vi.mock("./shopify", () => shopify);

import { getCurrentCart, getDemoState } from "./cart-session";
import { DEMO_CART_COOKIE } from "./demo-cart";

beforeEach(() => vi.clearAllMocks());

describe("sessão do carrinho no modo demonstração", () => {
  it("lê o carrinho de demonstração do cookie, sem consultar a Shopify", async () => {
    cookieStore.get.mockReturnValue({ value: JSON.stringify({ lines: [{ v: "mock:bone-snapback:Único", q: 2 }] }) });
    const cart = await getCurrentCart();
    expect(cookieStore.get).toHaveBeenCalledWith(DEMO_CART_COOKIE);
    expect(cart?.totalQuantity).toBe(2);
    expect(cart?.subtotal).toBe(159.8);
    expect(shopify.getCart).not.toHaveBeenCalled();
  });

  it("sem cookie, o carrinho de demonstração é vazio", async () => {
    cookieStore.get.mockReturnValue(undefined);
    expect(await getDemoState()).toEqual({ lines: [] });
    expect(await getCurrentCart()).toBeNull();
  });
});
