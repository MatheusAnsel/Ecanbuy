import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/shopify";
import { policies } from "@/lib/policies";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getProducts().catch(() => []);

  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/produtos`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((p) => ({
      url: `${base}/produto/${p.handle}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${base}/ajuda`, changeFrequency: "monthly", priority: 0.3 },
    ...policies.map((p) => ({
      url: `${base}/politicas/${p.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}

// Com a Shopify, a lista de produtos muda: o sitemap é refeito a cada hora.
export const revalidate = 3600;
