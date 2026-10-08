import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// shopify.ts lê as variáveis de ambiente quando o módulo é carregado, então cada cenário
// reinicia os módulos e importa de novo.
async function carregar(env: Record<string, string | undefined> = {}) {
  vi.resetModules();
  vi.stubEnv("SHOPIFY_STORE_DOMAIN", env.SHOPIFY_STORE_DOMAIN);
  vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", env.SHOPIFY_STOREFRONT_TOKEN);
  vi.stubEnv("SHOPIFY_API_VERSION", env.SHOPIFY_API_VERSION);
  return import("./shopify");
}

const CONFIGURADA = { SHOPIFY_STORE_DOMAIN: "loja-teste.myshopify.com", SHOPIFY_STOREFRONT_TOKEN: "token-publico-123" };

const resposta = (corpo: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => corpo }) as Response;

function noProduto(over: Record<string, unknown> = {}) {
  return {
    id: "gid://shopify/Product/1",
    handle: "tenis-urban",
    title: "Tênis Urban",
    productType: "Calçados",
    description: "Confortável",
    createdAt: "2020-01-01T00:00:00Z",
    featuredImage: { url: "https://cdn.shopify.com/s/files/1/a.jpg" },
    variants: {
      nodes: [
        { id: "gid://shopify/ProductVariant/10", title: "40", availableForSale: true, price: { amount: "299.90" }, compareAtPrice: { amount: "399.90" } },
        { id: "gid://shopify/ProductVariant/11", title: "41", availableForSale: false, price: { amount: "299.90" }, compareAtPrice: null },
      ],
    },
    ...over,
  };
}

function noCarrinho(over: Record<string, unknown> = {}) {
  return {
    id: "gid://shopify/Cart/abc",
    checkoutUrl: "https://loja-teste.myshopify.com/cart/c/abc",
    totalQuantity: 3,
    cost: { subtotalAmount: { amount: "600.00" }, totalAmount: { amount: "570.00" } },
    discountCodes: [{ code: "PROMO10", applicable: true }],
    lines: {
      nodes: [
        {
          id: "gid://shopify/CartLine/1",
          quantity: 2,
          cost: { totalAmount: { amount: "599.80" } },
          merchandise: {
            title: "40",
            product: { title: "Tênis Urban", handle: "tenis-urban", productType: "Calçados", featuredImage: { url: "https://cdn.shopify.com/s/files/1/a.jpg" } },
          },
        },
      ],
    },
    ...over,
  };
}

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("modo demonstração (Shopify não configurada)", () => {
  it("isShopifyConfigured é falso e nenhuma requisição é feita", async () => {
    const shop = await carregar();
    expect(shop.isShopifyConfigured).toBe(false);
    await shop.getProducts();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("getProducts devolve o catálogo de demonstração", async () => {
    const shop = await carregar();
    const { mockProducts } = await import("./mock-products");
    expect(await shop.getProducts()).toBe(mockProducts);
  });

  it("getProduct acha pelo handle e devolve null para handle desconhecido", async () => {
    const shop = await carregar();
    expect((await shop.getProduct("tenis-urban-pro"))?.name).toBe("Tênis Urban Pro");
    expect(await shop.getProduct("nao-existe")).toBeNull();
  });

  it("getCart devolve null", async () => {
    const shop = await carregar();
    expect(await shop.getCart("gid://shopify/Cart/x")).toBeNull();
  });

  it("só configurada com domínio E token (um sozinho não basta)", async () => {
    expect((await carregar({ SHOPIFY_STORE_DOMAIN: "a.myshopify.com" })).isShopifyConfigured).toBe(false);
    expect((await carregar({ SHOPIFY_STOREFRONT_TOKEN: "t" })).isShopifyConfigured).toBe(false);
    expect((await carregar(CONFIGURADA)).isShopifyConfigured).toBe(true);
  });

  it("as mutações do carrinho falham com mensagem clara em vez de chamar a rede", async () => {
    const shop = await carregar();
    await expect(shop.createCart("gid://shopify/ProductVariant/1", 1)).rejects.toThrow("Shopify não configurada");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("requisição à Storefront API", () => {
  it("chama o endpoint GraphQL com o token e a versão da API", async () => {
    const shop = await carregar({ ...CONFIGURADA, SHOPIFY_API_VERSION: "2025-10" });
    fetchMock.mockResolvedValue(resposta({ data: { products: { nodes: [] } } }));

    await shop.getProducts();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://loja-teste.myshopify.com/api/2025-10/graphql.json");
    expect(init.method).toBe("POST");
    expect(init.headers["X-Shopify-Storefront-Access-Token"]).toBe("token-publico-123");
    expect(JSON.parse(init.body).query).toContain("products(first: 100");
  });

  it.each([
    ["ausente", undefined],
    ["vazia (como no .env.example copiado sem preencher)", ""],
    ["só espaços", "   "],
  ])("usa a versão padrão da API quando SHOPIFY_API_VERSION está %s", async (_nome, valor) => {
    const shop = await carregar({ ...CONFIGURADA, SHOPIFY_API_VERSION: valor });
    fetchMock.mockResolvedValue(resposta({ data: { products: { nodes: [] } } }));

    await shop.getProducts();

    // antes da correção, a variável vazia gerava ".../api//graphql.json"
    expect(fetchMock.mock.calls[0][0]).toMatch(/^https:\/\/loja-teste\.myshopify\.com\/api\/\d{4}-\d{2}\/graphql\.json$/);
  });

  it("catálogo usa revalidação de 60s, e o carrinho nunca usa cache", async () => {
    const shop = await carregar(CONFIGURADA);
    fetchMock.mockResolvedValueOnce(resposta({ data: { products: { nodes: [] } } }));
    fetchMock.mockResolvedValueOnce(resposta({ data: { cart: null } }));

    await shop.getProducts();
    await shop.getCart("gid://shopify/Cart/x");

    expect(fetchMock.mock.calls[0][1].next).toEqual({ revalidate: 60 });
    expect(fetchMock.mock.calls[0][1].cache).toBeUndefined();
    expect(fetchMock.mock.calls[1][1].cache).toBe("no-store");
  });

  it("falha quando a Shopify responde com erro HTTP", async () => {
    const shop = await carregar(CONFIGURADA);
    fetchMock.mockResolvedValue(resposta({}, 503));
    await expect(shop.getProducts()).rejects.toThrow("Shopify respondeu 503");
  });

  it("junta as mensagens quando a resposta traz erros do GraphQL", async () => {
    const shop = await carregar(CONFIGURADA);
    fetchMock.mockResolvedValue(resposta({ errors: [{ message: "Throttled" }, { message: "Access denied" }] }));
    await expect(shop.getProducts()).rejects.toThrow("Throttled; Access denied");
  });
});

describe("mapeamento de produtos", () => {
  it("converte preço, categoria, imagem e variantes", async () => {
    const shop = await carregar(CONFIGURADA);
    fetchMock.mockResolvedValue(resposta({ data: { products: { nodes: [noProduto()] } } }));

    const [p] = await shop.getProducts();

    expect(p).toMatchObject({
      id: "gid://shopify/Product/1",
      handle: "tenis-urban",
      name: "Tênis Urban",
      price: 299.9,
      oldPrice: 399.9,
      category: "Calçados",
      image: "https://cdn.shopify.com/s/files/1/a.jpg",
      hasOptions: true,
    });
    expect(p.variants).toEqual([
      { id: "gid://shopify/ProductVariant/10", title: "40", available: true },
      { id: "gid://shopify/ProductVariant/11", title: "41", available: false },
    ]);
  });

  it("só mostra preço antigo quando o preço de comparação é MAIOR que o atual", async () => {
    const shop = await carregar(CONFIGURADA);
    const variante = (compare: string | null) => ({
      id: "v", title: "Default Title", availableForSale: true, price: { amount: "100.00" },
      compareAtPrice: compare ? { amount: compare } : null,
    });
    fetchMock.mockResolvedValue(
      resposta({
        data: {
          products: {
            nodes: [
              noProduto({ handle: "a", variants: { nodes: [variante("150.00")] } }),
              noProduto({ handle: "b", variants: { nodes: [variante("100.00")] } }),
              noProduto({ handle: "c", variants: { nodes: [variante("80.00")] } }),
              noProduto({ handle: "d", variants: { nodes: [variante(null)] } }),
            ],
          },
        },
      }),
    );

    const produtos = await shop.getProducts();

    expect(produtos.map((p) => p.oldPrice)).toEqual([150, null, null, null]);
  });

  it("hasOptions: falso para variante única 'Default Title', verdadeiro para variante única com nome ou várias", async () => {
    const shop = await carregar(CONFIGURADA);
    const v = (title: string) => ({ id: title, title, availableForSale: true, price: { amount: "1" }, compareAtPrice: null });
    fetchMock.mockResolvedValue(
      resposta({
        data: {
          products: {
            nodes: [
              noProduto({ handle: "a", variants: { nodes: [v("Default Title")] } }),
              noProduto({ handle: "b", variants: { nodes: [v("Único")] } }),
              noProduto({ handle: "c", variants: { nodes: [v("P"), v("M")] } }),
            ],
          },
        },
      }),
    );

    expect((await shop.getProducts()).map((p) => p.hasOptions)).toEqual([false, true, true]);
  });

  it("usa 'Geral' quando não há categoria, null quando não há imagem e preço 0 sem variantes", async () => {
    const shop = await carregar(CONFIGURADA);
    fetchMock.mockResolvedValue(
      resposta({
        data: { products: { nodes: [noProduto({ productType: "", featuredImage: null, variants: { nodes: [] } })] } },
      }),
    );

    const [p] = await shop.getProducts();

    expect(p.category).toBe("Geral");
    expect(p.image).toBeNull();
    expect(p.price).toBe(0);
    expect(p.oldPrice).toBeNull();
    expect(p.hasOptions).toBe(false);
  });

  it("marca como novo só o produto criado nos últimos 30 dias", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-08T12:00:00Z"));
    const shop = await carregar(CONFIGURADA);
    fetchMock.mockResolvedValue(
      resposta({
        data: {
          products: {
            nodes: [
              noProduto({ handle: "novo", createdAt: "2026-09-20T00:00:00Z" }),
              noProduto({ handle: "velho", createdAt: "2026-08-01T00:00:00Z" }),
            ],
          },
        },
      }),
    );

    expect((await shop.getProducts()).map((p) => p.isNew)).toEqual([true, false]);
  });

  it("getProduct busca por handle e devolve null quando a Shopify não encontra", async () => {
    const shop = await carregar(CONFIGURADA);
    fetchMock.mockResolvedValueOnce(resposta({ data: { product: noProduto() } }));
    fetchMock.mockResolvedValueOnce(resposta({ data: { product: null } }));

    expect((await shop.getProduct("tenis-urban"))?.name).toBe("Tênis Urban");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).variables).toEqual({ handle: "tenis-urban" });
    expect(await shop.getProduct("fantasma")).toBeNull();
  });
});

describe("mapeamento do carrinho", () => {
  it("converte totais, linhas e cupons", async () => {
    const shop = await carregar(CONFIGURADA);
    fetchMock.mockResolvedValue(resposta({ data: { cart: noCarrinho() } }));

    const cart = await shop.getCart("gid://shopify/Cart/abc");

    expect(cart).toMatchObject({
      id: "gid://shopify/Cart/abc",
      totalQuantity: 3,
      subtotal: 600,
      total: 570,
      checkoutUrl: "https://loja-teste.myshopify.com/cart/c/abc",
      discountCodes: [{ code: "PROMO10", applicable: true }],
    });
    expect(cart?.lines).toEqual([
      {
        id: "gid://shopify/CartLine/1",
        quantity: 2,
        total: 599.8,
        variantTitle: "40",
        name: "Tênis Urban",
        handle: "tenis-urban",
        category: "Calçados",
        image: "https://cdn.shopify.com/s/files/1/a.jpg",
      },
    ]);
  });

  it("devolve null quando o carrinho não existe mais na Shopify", async () => {
    const shop = await carregar(CONFIGURADA);
    fetchMock.mockResolvedValue(resposta({ data: { cart: null } }));
    expect(await shop.getCart("gid://shopify/Cart/expirado")).toBeNull();
  });

  it("usa 'Geral' e imagem nula nas linhas sem categoria ou foto", async () => {
    const shop = await carregar(CONFIGURADA);
    const linha = noCarrinho().lines.nodes[0];
    linha.merchandise.product = { ...linha.merchandise.product, productType: "", featuredImage: null as never };
    fetchMock.mockResolvedValue(resposta({ data: { cart: noCarrinho({ lines: { nodes: [linha] } }) } }));

    const cart = await shop.getCart("x");

    expect(cart?.lines[0].category).toBe("Geral");
    expect(cart?.lines[0].image).toBeNull();
  });

  it.each([
    ["http (sem TLS)", "http://loja-teste.myshopify.com/cart/c/abc"],
    ["esquema javascript", "javascript:alert(1)"],
    ["esquema data", "data:text/html,<script>alert(1)</script>"],
    ["texto que não é URL", "isto nao e uma url"],
    ["vazio", ""],
  ])("recusa checkoutUrl inseguro (%s), deixando o botão sem destino", async (_nome, url) => {
    const shop = await carregar(CONFIGURADA);
    fetchMock.mockResolvedValue(resposta({ data: { cart: noCarrinho({ checkoutUrl: url }) } }));
    expect((await shop.getCart("x"))?.checkoutUrl).toBe("");
  });
});

describe("mutações do carrinho", () => {
  const ID_VARIANTE = "gid://shopify/ProductVariant/10";

  it("createCart envia a variante e a quantidade e devolve o carrinho mapeado", async () => {
    const shop = await carregar(CONFIGURADA);
    fetchMock.mockResolvedValue(resposta({ data: { cartCreate: { cart: noCarrinho(), userErrors: [] } } }));

    const cart = await shop.createCart(ID_VARIANTE, 2);

    expect(cart.id).toBe("gid://shopify/Cart/abc");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).variables).toEqual({
      lines: [{ merchandiseId: ID_VARIANTE, quantity: 2 }],
    });
    expect(fetchMock.mock.calls[0][1].cache).toBe("no-store");
  });

  it("addCartLine, updateCartLine, removeCartLine e setCartDiscountCodes enviam as variáveis certas", async () => {
    const shop = await carregar(CONFIGURADA);
    const ok = (campo: string) => resposta({ data: { [campo]: { cart: noCarrinho(), userErrors: [] } } });
    fetchMock
      .mockResolvedValueOnce(ok("cartLinesAdd"))
      .mockResolvedValueOnce(ok("cartLinesUpdate"))
      .mockResolvedValueOnce(ok("cartLinesRemove"))
      .mockResolvedValueOnce(ok("cartDiscountCodesUpdate"));

    await shop.addCartLine("C1", ID_VARIANTE, 1);
    await shop.updateCartLine("C1", "L1", 5);
    await shop.removeCartLine("C1", "L1");
    await shop.setCartDiscountCodes("C1", ["PROMO10"]);

    const variaveis = fetchMock.mock.calls.map((c) => JSON.parse(c[1].body).variables);
    expect(variaveis).toEqual([
      { cartId: "C1", lines: [{ merchandiseId: ID_VARIANTE, quantity: 1 }] },
      { cartId: "C1", lines: [{ id: "L1", quantity: 5 }] },
      { cartId: "C1", lineIds: ["L1"] },
      { cartId: "C1", codes: ["PROMO10"] },
    ]);
  });

  it.each([
    ["createCart", (s: typeof import("./shopify")) => s.createCart("v", 1), "cartCreate"],
    ["addCartLine", (s: typeof import("./shopify")) => s.addCartLine("c", "v", 1), "cartLinesAdd"],
    ["updateCartLine", (s: typeof import("./shopify")) => s.updateCartLine("c", "l", 1), "cartLinesUpdate"],
    ["removeCartLine", (s: typeof import("./shopify")) => s.removeCartLine("c", "l"), "cartLinesRemove"],
    ["setCartDiscountCodes", (s: typeof import("./shopify")) => s.setCartDiscountCodes("c", ["X"]), "cartDiscountCodesUpdate"],
  ])("%s transforma userErrors da Shopify em erro", async (_nome, chamar, campo) => {
    const shop = await carregar(CONFIGURADA);
    fetchMock.mockResolvedValue(
      resposta({ data: { [campo]: { cart: null, userErrors: [{ message: "Sem estoque" }, { message: "Limite excedido" }] } } }),
    );

    await expect(chamar(shop)).rejects.toThrow("Sem estoque; Limite excedido");
  });
});
