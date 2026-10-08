import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => ({ get: vi.fn() }));
const shopify = vi.hoisted(() => ({ getCart: vi.fn() }));

vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));
vi.mock("./shopify", () => shopify);

import { CART_COOKIE, getCartId, getCurrentCart } from "./cart-session";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("sessão do carrinho (cookie)", () => {
  it("o cookie tem um nome estável", () => {
    expect(CART_COOKIE).toBe("ecanbuy_cart");
  });

  it("getCartId lê o id do cookie, ou undefined quando não há", async () => {
    cookieStore.get.mockReturnValueOnce({ value: "gid://shopify/Cart/1" });
    expect(await getCartId()).toBe("gid://shopify/Cart/1");
    expect(cookieStore.get).toHaveBeenCalledWith("ecanbuy_cart");

    cookieStore.get.mockReturnValueOnce(undefined);
    expect(await getCartId()).toBeUndefined();
  });

  it("getCurrentCart devolve null sem cookie, sem consultar a Shopify", async () => {
    cookieStore.get.mockReturnValue(undefined);
    expect(await getCurrentCart()).toBeNull();
    expect(shopify.getCart).not.toHaveBeenCalled();
  });

  it("getCurrentCart devolve o carrinho da Shopify", async () => {
    cookieStore.get.mockReturnValue({ value: "C1" });
    shopify.getCart.mockResolvedValue({ id: "C1", totalQuantity: 2 });
    expect(await getCurrentCart()).toEqual({ id: "C1", totalQuantity: 2 });
    expect(shopify.getCart).toHaveBeenCalledWith("C1");
  });

  it("getCurrentCart devolve null (e não quebra a página) quando a Shopify falha", async () => {
    cookieStore.get.mockReturnValue({ value: "C1" });
    shopify.getCart.mockRejectedValue(new Error("Shopify respondeu 500"));
    expect(await getCurrentCart()).toBeNull();
  });
});
