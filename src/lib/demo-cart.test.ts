import { describe, expect, it } from "vitest";
import {
  DEMO_CHECKOUT_PATH,
  DEMO_COUPON,
  DemoCartError,
  MAX_LINES,
  MAX_QTY,
  addDemoLine,
  applyDemoCoupon,
  demoOrderNumber,
  demoStateToCart,
  isDemoVariantId,
  parseDemoState,
  removeDemoLine,
  serializeDemoState,
  updateDemoLine,
} from "./demo-cart";

const TENIS = "mock:tenis-urban-pro:40"; // R$ 299,90, com opções
const BONE = "mock:bone-snapback:Único"; // R$ 79,90, sem opções

describe("isDemoVariantId", () => {
  it("aceita ids do catálogo de demonstração e recusa o resto", () => {
    expect(isDemoVariantId(TENIS)).toBe(true);
    expect(isDemoVariantId(BONE)).toBe(true);
    expect(isDemoVariantId("gid://shopify/ProductVariant/1")).toBe(false);
    expect(isDemoVariantId("mock:<script>:1")).toBe(false);
    expect(isDemoVariantId(42)).toBe(false);
    expect(isDemoVariantId(`mock:a:${"x".repeat(200)}`)).toBe(false);
  });
});

describe("parseDemoState", () => {
  it("devolve carrinho vazio para cookie ausente, JSON inválido ou formato errado", () => {
    expect(parseDemoState(undefined)).toEqual({ lines: [] });
    expect(parseDemoState("{quebrado")).toEqual({ lines: [] });
    expect(parseDemoState("null")).toEqual({ lines: [] });
    expect(parseDemoState('{"lines":"x"}')).toEqual({ lines: [] });
  });

  it("descarta linhas inválidas, duplicadas, inexistentes ou com quantidade fora do limite", () => {
    const raw = JSON.stringify({
      lines: [
        { v: TENIS, q: 2 },
        { v: TENIS, q: 5 },
        { v: "mock:nao-existe:1", q: 1 },
        { v: BONE, q: 0 },
        { v: BONE, q: 1.5 },
        { v: BONE, q: MAX_QTY + 1 },
        null,
      ],
    });
    expect(parseDemoState(raw)).toEqual({ lines: [{ v: TENIS, q: 2 }] });
  });

  it("mantém o cupom só se for o de demonstração e o carrinho não estiver vazio", () => {
    expect(parseDemoState(JSON.stringify({ lines: [{ v: BONE, q: 1 }], c: DEMO_COUPON })).c).toBe(DEMO_COUPON);
    expect(parseDemoState(JSON.stringify({ lines: [{ v: BONE, q: 1 }], c: "OUTRO" })).c).toBeUndefined();
    expect(parseDemoState(JSON.stringify({ lines: [], c: DEMO_COUPON }))).toEqual({ lines: [] });
  });

  it("serializeDemoState e parseDemoState fazem ida e volta", () => {
    const state = { lines: [{ v: BONE, q: 3 }], c: DEMO_COUPON };
    expect(parseDemoState(serializeDemoState(state))).toEqual(state);
  });
});

describe("operações do carrinho", () => {
  it("adiciona, soma a quantidade do mesmo item e respeita o máximo", () => {
    let s = addDemoLine({ lines: [] }, TENIS, 1);
    s = addDemoLine(s, TENIS, 2);
    expect(s.lines).toEqual([{ v: TENIS, q: 3 }]);
    s = addDemoLine(s, TENIS, 500);
    expect(s.lines[0].q).toBe(MAX_QTY);
    expect(addDemoLine({ lines: [] }, BONE, 500).lines[0].q).toBe(MAX_QTY);
  });

  it("recusa item inexistente e carrinho cheio", () => {
    expect(() => addDemoLine({ lines: [] }, "mock:nao-existe:1", 1)).toThrow(DemoCartError);
    expect(() => addDemoLine({ lines: [] }, "gid://x", 1)).toThrow(DemoCartError);
    const cheio = { lines: Array.from({ length: MAX_LINES }, (_, i) => ({ v: `mock:x:${i}`, q: 1 })) };
    expect(() => addDemoLine(cheio, BONE, 1)).toThrow("Carrinho cheio.");
  });

  it("atualiza a quantidade, remove com zero e recusa item fora do carrinho", () => {
    const s = { lines: [{ v: TENIS, q: 1 }, { v: BONE, q: 1 }] };
    expect(updateDemoLine(s, BONE, 4).lines).toEqual([{ v: TENIS, q: 1 }, { v: BONE, q: 4 }]);
    expect(updateDemoLine(s, BONE, 300).lines[1].q).toBe(MAX_QTY);
    expect(updateDemoLine(s, BONE, 0).lines).toEqual([{ v: TENIS, q: 1 }]);
    expect(() => updateDemoLine(s, "mock:outro:1", 2)).toThrow(DemoCartError);
  });

  it("remover o último item limpa também o cupom", () => {
    const s = { lines: [{ v: BONE, q: 1 }], c: DEMO_COUPON };
    expect(removeDemoLine(s, BONE)).toEqual({ lines: [] });
    expect(removeDemoLine({ lines: [{ v: BONE, q: 1 }, { v: TENIS, q: 1 }], c: DEMO_COUPON }, BONE)).toEqual({
      lines: [{ v: TENIS, q: 1 }],
      c: DEMO_COUPON,
    });
  });

  it("aplica só o cupom de demonstração, sem diferenciar maiúsculas", () => {
    expect(applyDemoCoupon({ lines: [] }, " demo10 ")?.c).toBe(DEMO_COUPON);
    expect(applyDemoCoupon({ lines: [] }, "PROMO50")).toBeNull();
  });
});

describe("demoStateToCart", () => {
  it("devolve null para carrinho vazio", () => {
    expect(demoStateToCart({ lines: [] })).toBeNull();
    expect(demoStateToCart({ lines: [{ v: "mock:nao-existe:1", q: 1 }] })).toBeNull();
  });

  it("monta o carrinho com preços do catálogo, no formato da Shopify", () => {
    const cart = demoStateToCart({ lines: [{ v: TENIS, q: 2 }, { v: BONE, q: 1 }] })!;
    expect(cart.checkoutUrl).toBe(DEMO_CHECKOUT_PATH);
    expect(cart.totalQuantity).toBe(3);
    expect(cart.subtotal).toBe(679.7);
    expect(cart.total).toBe(679.7);
    expect(cart.discountCodes).toEqual([]);
    expect(cart.lines[0]).toMatchObject({ id: TENIS, name: "Tênis Urban Pro", variantTitle: "40", total: 599.8 });
    expect(cart.lines[1].variantTitle).toBe("Default Title");
  });

  it("aplica 10% de desconto com o cupom de demonstração", () => {
    const cart = demoStateToCart({ lines: [{ v: BONE, q: 1 }], c: DEMO_COUPON })!;
    expect(cart.subtotal).toBe(79.9);
    expect(cart.total).toBe(71.91);
    expect(cart.discountCodes).toEqual([{ code: DEMO_COUPON, applicable: true }]);
  });
});

describe("demoOrderNumber", () => {
  it("gera um número no formato DEMO-000000", () => {
    expect(demoOrderNumber(() => 0)).toBe("DEMO-100000");
    expect(demoOrderNumber(() => 0.999999)).toMatch(/^DEMO-\d{6}$/);
    expect(demoOrderNumber()).toMatch(/^DEMO-\d{6}$/);
  });
});
