import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => ({ set: vi.fn() }));
const revalidar = vi.hoisted(() => vi.fn());
const sessao = vi.hoisted(() => ({ CART_COOKIE: "ecanbuy_cart", getCartId: vi.fn() }));
// isShopifyConfigured é um valor, não função: o objeto é mutável para alternar entre os cenários.
const shop = vi.hoisted(() => ({
  isShopifyConfigured: true,
  addCartLine: vi.fn(),
  createCart: vi.fn(),
  getCart: vi.fn(),
  removeCartLine: vi.fn(),
  setCartDiscountCodes: vi.fn(),
  updateCartLine: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));
vi.mock("next/cache", () => ({ revalidatePath: revalidar }));
vi.mock("@/lib/cart-session", () => sessao);
vi.mock("@/lib/shopify", () => shop);

import { addToCartAction, applyDiscountAction, removeLineAction, updateLineAction } from "./actions";

const VARIANTE = "gid://shopify/ProductVariant/44556677";
const LINHA = "gid://shopify/CartLine/a1b2-c3?cart=xyz";
const GENERICO = "Não foi possível concluir a operação. Tente novamente em instantes.";

beforeEach(() => {
  vi.clearAllMocks();
  shop.isShopifyConfigured = true;
  sessao.getCartId.mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("modo demonstração", () => {
  it("todas as ações recusam com a mensagem de demonstração e não chamam a Shopify", async () => {
    shop.isShopifyConfigured = false;
    const esperado = { ok: false, error: "A loja ainda não está conectada à Shopify (modo demonstração)." };

    expect(await addToCartAction(VARIANTE, 1)).toEqual(esperado);
    expect(await updateLineAction(LINHA, 2)).toEqual(esperado);
    expect(await removeLineAction(LINHA)).toEqual(esperado);
    expect(await applyDiscountAction("PROMO10")).toEqual(esperado);

    expect(shop.createCart).not.toHaveBeenCalled();
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});

describe("addToCartAction", () => {
  it("sem carrinho, cria um novo e guarda o id em um cookie seguro", async () => {
    shop.createCart.mockResolvedValue({ id: "gid://shopify/Cart/novo" });

    const r = await addToCartAction(VARIANTE, 2);

    expect(r).toEqual({ ok: true });
    expect(shop.createCart).toHaveBeenCalledWith(VARIANTE, 2);
    expect(shop.addCartLine).not.toHaveBeenCalled();
    expect(cookieStore.set).toHaveBeenCalledWith("ecanbuy_cart", "gid://shopify/Cart/novo", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 10,
    });
    expect(revalidar).toHaveBeenCalledWith("/", "layout");
  });

  it("o cookie só é 'secure' em produção", async () => {
    vi.stubEnv("NODE_ENV", "production");
    shop.createCart.mockResolvedValue({ id: "C" });

    await addToCartAction(VARIANTE, 1);

    expect(cookieStore.set.mock.calls[0][2].secure).toBe(true);
  });

  it("com carrinho existente, adiciona a linha nele", async () => {
    sessao.getCartId.mockResolvedValue("gid://shopify/Cart/atual");
    shop.getCart.mockResolvedValue({ id: "gid://shopify/Cart/atual" });
    shop.addCartLine.mockResolvedValue({ id: "gid://shopify/Cart/atual" });

    const r = await addToCartAction(VARIANTE, 3);

    expect(r).toEqual({ ok: true });
    expect(shop.addCartLine).toHaveBeenCalledWith("gid://shopify/Cart/atual", VARIANTE, 3);
    expect(shop.createCart).not.toHaveBeenCalled();
  });

  it("cookie de um carrinho que expirou na Shopify: cria um novo em vez de falhar", async () => {
    sessao.getCartId.mockResolvedValue("gid://shopify/Cart/expirado");
    shop.getCart.mockResolvedValue(null);
    shop.createCart.mockResolvedValue({ id: "gid://shopify/Cart/novo" });

    const r = await addToCartAction(VARIANTE, 1);

    expect(r).toEqual({ ok: true });
    expect(shop.createCart).toHaveBeenCalled();
    expect(cookieStore.set.mock.calls[0][1]).toBe("gid://shopify/Cart/novo");
  });

  it.each([
    ["texto qualquer", "abc"],
    ["id de linha no lugar de variante", LINHA],
    ["tipo de recurso errado", "gid://shopify/Product/123"],
    ["tentativa de injeção", "gid://shopify/ProductVariant/1; DROP TABLE"],
    ["id com mais de 200 caracteres", `gid://shopify/ProductVariant/${"a".repeat(200)}`],
    ["vazio", ""],
    ["número", 123],
    ["null", null],
  ])("recusa variante inválida (%s) com mensagem segura e sem chamar a Shopify", async (_nome, id) => {
    const r = await addToCartAction(id as string, 1);
    expect(r).toEqual({ ok: false, error: "Item inválido." });
    expect(shop.createCart).not.toHaveBeenCalled();
  });

  it.each([
    ["zero", 0],
    ["negativa", -1],
    ["acima do limite (100)", 100],
    ["decimal", 1.5],
    ["texto", "2"],
    ["NaN", Number.NaN],
    ["Infinity", Number.POSITIVE_INFINITY],
  ])("recusa quantidade inválida (%s)", async (_nome, qtd) => {
    const r = await addToCartAction(VARIANTE, qtd as number);
    expect(r).toEqual({ ok: false, error: "Quantidade inválida." });
    expect(shop.createCart).not.toHaveBeenCalled();
  });

  it("aceita os limites 1 e 99", async () => {
    shop.createCart.mockResolvedValue({ id: "C" });
    expect((await addToCartAction(VARIANTE, 1)).ok).toBe(true);
    expect((await addToCartAction(VARIANTE, 99)).ok).toBe(true);
  });

  it("erro interno vira mensagem genérica: o detalhe vai só para o log do servidor", async () => {
    shop.createCart.mockRejectedValue(new Error("Shopify respondeu 500 em loja-secreta.myshopify.com"));

    const r = await addToCartAction(VARIANTE, 1);

    expect(r).toEqual({ ok: false, error: GENERICO });
    expect(JSON.stringify(r)).not.toContain("loja-secreta");
    expect(console.error).toHaveBeenCalledWith("[actions]", "Shopify respondeu 500 em loja-secreta.myshopify.com");
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("erro que não é Error também vira mensagem genérica", async () => {
    shop.createCart.mockRejectedValue("falha estranha");
    expect(await addToCartAction(VARIANTE, 1)).toEqual({ ok: false, error: GENERICO });
  });
});

describe("updateLineAction", () => {
  beforeEach(() => sessao.getCartId.mockResolvedValue("gid://shopify/Cart/atual"));

  it("atualiza a quantidade da linha", async () => {
    shop.updateCartLine.mockResolvedValue({});
    expect(await updateLineAction(LINHA, 5)).toEqual({ ok: true });
    expect(shop.updateCartLine).toHaveBeenCalledWith("gid://shopify/Cart/atual", LINHA, 5);
    expect(revalidar).toHaveBeenCalled();
  });

  it("quantidade 0 remove a linha em vez de atualizar", async () => {
    shop.removeCartLine.mockResolvedValue({});
    expect(await updateLineAction(LINHA, 0)).toEqual({ ok: true });
    expect(shop.removeCartLine).toHaveBeenCalledWith("gid://shopify/Cart/atual", LINHA);
    expect(shop.updateCartLine).not.toHaveBeenCalled();
  });

  it("aceita até 99 e recusa 100", async () => {
    shop.updateCartLine.mockResolvedValue({});
    expect((await updateLineAction(LINHA, 99)).ok).toBe(true);
    expect(await updateLineAction(LINHA, 100)).toEqual({ ok: false, error: "Quantidade inválida." });
  });

  it("recusa linha inválida (inclusive um id de variante no lugar de linha)", async () => {
    expect(await updateLineAction("abc", 1)).toEqual({ ok: false, error: "Item inválido." });
    expect(await updateLineAction(VARIANTE, 1)).toEqual({ ok: false, error: "Item inválido." });
  });

  it("sem cookie de carrinho, responde que o carrinho não foi encontrado", async () => {
    sessao.getCartId.mockResolvedValue(undefined);
    expect(await updateLineAction(LINHA, 1)).toEqual({ ok: false, error: "Carrinho não encontrado." });
    expect(shop.updateCartLine).not.toHaveBeenCalled();
  });

  it("erro da Shopify vira mensagem genérica", async () => {
    shop.updateCartLine.mockRejectedValue(new Error("Limite excedido"));
    expect(await updateLineAction(LINHA, 2)).toEqual({ ok: false, error: GENERICO });
  });
});

describe("removeLineAction", () => {
  it("remove a linha do carrinho atual", async () => {
    sessao.getCartId.mockResolvedValue("gid://shopify/Cart/atual");
    shop.removeCartLine.mockResolvedValue({});
    expect(await removeLineAction(LINHA)).toEqual({ ok: true });
    expect(shop.removeCartLine).toHaveBeenCalledWith("gid://shopify/Cart/atual", LINHA);
  });

  it("recusa linha inválida e carrinho ausente", async () => {
    expect(await removeLineAction("xyz")).toEqual({ ok: false, error: "Item inválido." });
    expect(await removeLineAction(LINHA)).toEqual({ ok: false, error: "Carrinho não encontrado." });
    expect(shop.removeCartLine).not.toHaveBeenCalled();
  });
});

describe("applyDiscountAction", () => {
  beforeEach(() => sessao.getCartId.mockResolvedValue("gid://shopify/Cart/atual"));

  it("aplica um cupom válido, ignorando espaços nas pontas", async () => {
    shop.setCartDiscountCodes.mockResolvedValue({ discountCodes: [{ code: "PROMO10", applicable: true }] });

    const r = await applyDiscountAction("  PROMO10  ");

    expect(r).toEqual({ ok: true });
    expect(shop.setCartDiscountCodes).toHaveBeenCalledWith("gid://shopify/Cart/atual", ["PROMO10"]);
    expect(revalidar).toHaveBeenCalledWith("/", "layout");
  });

  it("compara o cupom sem diferenciar maiúsculas de minúsculas", async () => {
    shop.setCartDiscountCodes.mockResolvedValue({ discountCodes: [{ code: "promo10", applicable: true }] });
    expect(await applyDiscountAction("PROMO10")).toEqual({ ok: true });
  });

  it("cupom que a Shopify não aceita é removido do carrinho e o cliente recebe o erro", async () => {
    shop.setCartDiscountCodes
      .mockResolvedValueOnce({ discountCodes: [{ code: "VENCIDO", applicable: false }] })
      .mockResolvedValueOnce({ discountCodes: [] });

    const r = await applyDiscountAction("VENCIDO");

    expect(r).toEqual({ ok: false, error: "Cupom inválido ou não aplicável a este carrinho." });
    // segunda chamada limpa os cupons: o carrinho não fica com um código inválido pendurado
    expect(shop.setCartDiscountCodes).toHaveBeenLastCalledWith("gid://shopify/Cart/atual", []);
    expect(revalidar).toHaveBeenCalled();
  });

  it("cupom 'aplicável' de outro código não conta como aplicado", async () => {
    shop.setCartDiscountCodes
      .mockResolvedValueOnce({ discountCodes: [{ code: "OUTRO", applicable: true }] })
      .mockResolvedValueOnce({ discountCodes: [] });
    expect((await applyDiscountAction("PROMO10")).ok).toBe(false);
  });

  it.each([
    ["não é texto", 42 as unknown as string, "Cupom inválido."],
    ["vazio", "", "Digite um cupom."],
    ["só espaços", "    ", "Digite um cupom."],
  ])("recusa cupom que %s", async (_nome, codigo, erro) => {
    expect(await applyDiscountAction(codigo)).toEqual({ ok: false, error: erro });
    expect(shop.setCartDiscountCodes).not.toHaveBeenCalled();
  });

  it.each([
    ["com espaço no meio", "PROMO 10"],
    ["com caractere especial", "PROMO;10"],
    ["com emoji", "PROMO🎉"],
    ["com 41 caracteres", "A".repeat(41)],
  ])("recusa cupom %s sem consultar a Shopify", async (_nome, codigo) => {
    expect(await applyDiscountAction(codigo)).toEqual({
      ok: false,
      error: "Cupom inválido ou não aplicável a este carrinho.",
    });
    expect(shop.setCartDiscountCodes).not.toHaveBeenCalled();
  });

  it("aceita cupom de exatamente 40 caracteres, hífen e sublinhado", async () => {
    const codigo = `${"A".repeat(36)}-_ab`.slice(0, 40);
    shop.setCartDiscountCodes.mockResolvedValue({ discountCodes: [{ code: codigo, applicable: true }] });
    expect(codigo).toHaveLength(40);
    expect((await applyDiscountAction(codigo)).ok).toBe(true);
  });

  it("sem carrinho, avisa em vez de chamar a Shopify", async () => {
    sessao.getCartId.mockResolvedValue(undefined);
    expect(await applyDiscountAction("PROMO10")).toEqual({ ok: false, error: "Carrinho não encontrado." });
    expect(shop.setCartDiscountCodes).not.toHaveBeenCalled();
  });

  it("erro da Shopify vira mensagem genérica", async () => {
    shop.setCartDiscountCodes.mockRejectedValue(new Error("Throttled"));
    expect(await applyDiscountAction("PROMO10")).toEqual({ ok: false, error: GENERICO });
  });
});
