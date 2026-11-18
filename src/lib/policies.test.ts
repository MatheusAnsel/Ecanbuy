import { describe, expect, it } from "vitest";
import { getPolicy, policies } from "./policies";
import { CART_COOKIE } from "./cart-session-name";

describe("policies", () => {
  it("tem as quatro políticas com slugs únicos e conteúdo", () => {
    const slugs = policies.map((p) => p.slug);
    expect(slugs).toEqual(["trocas-e-devolucoes", "frete-e-entrega", "privacidade", "termos-de-uso"]);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const p of policies) {
      expect(p.sections.length).toBeGreaterThan(0);
      expect(p.sections.every((s) => s.paragraphs.length > 0)).toBe(true);
    }
  });

  it("a política de privacidade cita o cookie real do carrinho", () => {
    const texto = getPolicy("privacidade")!.sections.flatMap((s) => s.paragraphs).join(" ");
    expect(texto).toContain(CART_COOKIE);
  });

  it("devolve null para slug inexistente", () => {
    expect(getPolicy("nao-existe")).toBeNull();
  });
});
