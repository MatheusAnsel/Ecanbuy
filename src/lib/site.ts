// URL pública do site, usada em links canônicos, Open Graph, sitemap e robots.
export const DEFAULT_SITE_URL = "https://ecanbuy.vercel.app";

export function siteUrl(): string {
  const raw = process.env.SITE_URL?.trim() || DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, "");
}

/** Resumo de texto para meta description: sem quebras de linha e com no máximo `max` caracteres. */
export function summarize(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}
