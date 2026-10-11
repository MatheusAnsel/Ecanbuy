import HomeClient from "@/components/HomeClient";
import CartLink from "@/components/CartLink";
import { getProducts } from "@/lib/shopify";

export default async function Home() {
  const products = await getProducts();
  const featured = products.slice(0, 4);
  const categories = Array.from(new Set(products.map((p) => p.category)))
    .slice(0, 4)
    .map((name) => ({
      name,
      image: products.find((p) => p.category === name && p.image)?.image ?? null,
    }));

  return <HomeClient featured={featured} categories={categories} cartSlot={<CartLink />} />;
}
