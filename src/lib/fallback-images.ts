// Imagens de exemplo (public/mock) usadas quando o produto não tem foto.
// Assim que a Shopify trouxer a foto real (featuredImage), ela substitui
// esta automaticamente: este arquivo só entra quando a imagem está vazia.
const IMAGES = [
  "tenis-urban-pro",
  "tenis-skate-classic",
  "mochila-slim-carbon",
  "camiseta-oversized",
  "relogio-minimal",
  "calca-cargo",
  "oculos-retro",
  "bone-snapback",
] as const;

// A ordem importa: a primeira regra que combinar vence ("skate" antes de "tênis").
const RULES: [RegExp, (typeof IMAGES)[number]][] = [
  [/skate/, "tenis-skate-classic"],
  [/tenis|sapat|calcad|sneaker|chinelo|bota\b|sandalia/, "tenis-urban-pro"],
  [/mochila|bolsa|mala\b|pochete/, "mochila-slim-carbon"],
  [/camiseta|camisa|blusa|moletom|jaqueta|casaco|regata|polo\b/, "camiseta-oversized"],
  [/relogio|watch/, "relogio-minimal"],
  [/calca|bermuda|short|jeans|saia/, "calca-cargo"],
  [/oculos|lente/, "oculos-retro"],
  [/bone\b|chapeu|gorro|touca|viseira/, "bone-snapback"],
];

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Escolhe uma imagem de exemplo pelo nome/categoria; sem pista, usa o handle de forma estável. */
export function fallbackImage(name: string, category: string, handle: string): string {
  const text = normalize(`${name} ${category}`);
  const rule = RULES.find(([pattern]) => pattern.test(text));
  if (rule) return `/mock/${rule[1]}.webp`;

  const sum = Array.from(handle).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return `/mock/${IMAGES[sum % IMAGES.length]}.webp`;
}
