import type { Product } from "./types";

function mk(
  handle: string,
  name: string,
  price: number,
  oldPrice: number | null,
  category: string,
  isNew: boolean,
  description: string,
  sizes: string[],
): Product {
  return {
    id: `mock:${handle}`,
    handle,
    name,
    price,
    oldPrice,
    category,
    description,
    image: null,
    isNew,
    hasOptions: sizes.length > 1,
    variants: sizes.map((s) => ({ id: `mock:${handle}:${s}`, title: s, available: true })),
  };
}

// Catálogo de demonstração, usado apenas quando a Shopify não está configurada.
export const mockProducts: Product[] = [
  mk("tenis-urban-pro", "Tênis Urban Pro", 299.9, 399.9, "Calçados", false, "Design urbano com conforto extremo. Solado de borracha antiderrapante e palmilha anatômica.", ["38", "39", "40", "41", "42", "43"]),
  mk("mochila-slim-carbon", "Mochila Slim Carbon", 189.9, null, "Acessórios", true, "Mochila minimalista com compartimento acolchoado para notebook e alças ergonômicas.", ["Único"]),
  mk("camiseta-oversized", "Camiseta Oversized", 89.9, 129.9, "Vestuário", false, "Algodão premium, corte oversized moderno e costura dupla nas mangas.", ["P", "M", "G", "GG", "XGG"]),
  mk("relogio-minimal", "Relógio Minimal", 459.9, null, "Acessórios", false, "Mostrador minimalista com pulseira de aço inoxidável.", ["Único"]),
  mk("calca-cargo", "Calça Cargo", 199.9, 249.9, "Vestuário", false, "Calça cargo com bolsos laterais e cintura ajustável.", ["38", "40", "42", "44"]),
  mk("oculos-retro", "Óculos Retrô", 149.9, null, "Acessórios", true, "Armação retrô com lentes com proteção UV.", ["Único"]),
  mk("tenis-skate-classic", "Tênis Skate Classic", 259.9, 319.9, "Calçados", false, "Tênis de skate com reforço no cabedal e solado vulcanizado.", ["38", "39", "40", "41", "42", "43"]),
  mk("bone-snapback", "Boné Snapback", 79.9, null, "Acessórios", false, "Boné snapback com aba reta e regulagem traseira.", ["Único"]),
];
