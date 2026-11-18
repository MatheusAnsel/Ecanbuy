import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SITE_URL, siteUrl, summarize } from "./site";

afterEach(() => vi.unstubAllEnvs());

describe("siteUrl", () => {
  it("usa a URL padrão quando SITE_URL não está definida", () => {
    vi.stubEnv("SITE_URL", "");
    expect(siteUrl()).toBe(DEFAULT_SITE_URL);
  });

  it("usa SITE_URL e remove barras no fim", () => {
    vi.stubEnv("SITE_URL", " https://loja.exemplo.com.br// ");
    expect(siteUrl()).toBe("https://loja.exemplo.com.br");
  });
});

describe("summarize", () => {
  it("mantém textos curtos e junta quebras de linha", () => {
    expect(summarize("Camiseta\n\n  de algodão")).toBe("Camiseta de algodão");
  });

  it("corta textos longos sem quebrar palavra e respeita o limite", () => {
    const longo = "palavra ".repeat(40);
    const resumo = summarize(longo, 50);
    expect(resumo.length).toBeLessThanOrEqual(50);
    expect(resumo.endsWith("palavra…")).toBe(true);
  });
});
