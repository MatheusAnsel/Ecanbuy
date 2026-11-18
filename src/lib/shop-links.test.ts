import { afterEach, describe, expect, it, vi } from "vitest";
import { accountLink, isDemoStore } from "./shop-links";

afterEach(() => vi.unstubAllEnvs());

describe("accountLink", () => {
  it("cai para a página de ajuda sem loja configurada", () => {
    vi.stubEnv("SHOPIFY_ACCOUNT_DOMAIN", "");
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "");
    expect(accountLink("/login")).toBe("/ajuda");
  });

  it("usa o domínio embutido para o navegador (SHOPIFY_ACCOUNT_DOMAIN)", () => {
    vi.stubEnv("SHOPIFY_ACCOUNT_DOMAIN", "loja.myshopify.com");
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "");
    expect(accountLink("/register")).toBe("https://loja.myshopify.com/account/register");
  });

  it("no servidor, usa SHOPIFY_STORE_DOMAIN quando a variável embutida não existe", () => {
    vi.stubEnv("SHOPIFY_ACCOUNT_DOMAIN", "");
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", " loja.myshopify.com ");
    expect(accountLink("")).toBe("https://loja.myshopify.com/account");
  });
});

describe("isDemoStore", () => {
  it("é demonstração sem domínio da loja e deixa de ser quando há domínio", () => {
    vi.stubEnv("SHOPIFY_ACCOUNT_DOMAIN", "");
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", " ");
    expect(isDemoStore()).toBe(true);
    vi.stubEnv("SHOPIFY_ACCOUNT_DOMAIN", "loja.myshopify.com");
    expect(isDemoStore()).toBe(false);
  });
});
