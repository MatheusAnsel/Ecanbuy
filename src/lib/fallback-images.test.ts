import { describe, expect, it } from "vitest";
import { fallbackImage } from "./fallback-images";

describe("fallbackImage", () => {
  it.each([
    ["Tênis Runner", "Calçados", "tenis-urban-pro"],
    ["Tênis Skate Old School", "Calçados", "tenis-skate-classic"],
    ["Mochila Térmica", "Acessórios", "mochila-slim-carbon"],
    ["Camiseta Básica", "Vestuário", "camiseta-oversized"],
    ["Relógio Digital", "Acessórios", "relogio-minimal"],
    ["Calça Jogger", "Vestuário", "calca-cargo"],
    ["Óculos de Sol", "Acessórios", "oculos-retro"],
    ["Boné Trucker", "Acessórios", "bone-snapback"],
  ])("escolhe a imagem certa para %s (%s)", (name, category, esperado) => {
    expect(fallbackImage(name, category, "qualquer")).toBe(`/mock/${esperado}.webp`);
  });

  it("usa a categoria quando o nome não ajuda", () => {
    expect(fallbackImage("Modelo X", "Calçados", "modelo-x")).toBe("/mock/tenis-urban-pro.webp");
  });

  it("sem pista, escolhe uma imagem estável pelo handle", () => {
    const a = fallbackImage("Item", "Geral", "item-123");
    const b = fallbackImage("Outro nome", "Geral", "item-123");
    expect(a).toBe(b);
    expect(a).toMatch(/^\/mock\/[a-z-]+\.webp$/);
  });

  it("handles diferentes podem cair em imagens diferentes", () => {
    const imagens = new Set(
      ["a", "b", "c", "d", "e", "f", "g", "h", "i"].map((h) => fallbackImage("Item", "Geral", h)),
    );
    expect(imagens.size).toBeGreaterThan(1);
  });
});
