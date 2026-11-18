import type { Metadata } from "next";
import ProdutosClient from "@/components/ProdutosClient";
import CartLink from "@/components/CartLink";
import { getProducts } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Todos os produtos da EcanBuy, com filtros por categoria, ofertas e lançamentos.",
  alternates: { canonical: "/produtos" },
};

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; filtro?: string }>;
}) {
  const { categoria, filtro } = await searchParams;
  const products = await getProducts();
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const initialCategory = categoria && categories.includes(categoria) ? categoria : "Todos";

  return (
    <ProdutosClient
      products={products}
      categories={categories}
      initialCategory={initialCategory}
      initialOffers={filtro === "ofertas"}
      initialNews={filtro === "novidades"}
      cartSlot={<CartLink />}
    />
  );
}
