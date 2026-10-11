import HomeClient from "@/components/HomeClient";
import CartLink from "@/components/CartLink";
import { getProducts } from "@/lib/shopify";

export default async function Home() {
  const products = await getProducts();
  const categoryNames = Array.from(new Set(products.map((p) => p.category)));
  const categories = categoryNames.slice(0, 4).map((name) => ({
    name,
    image: products.find((p) => p.category === name && p.image)?.image ?? null,
  }));

  return (
    <HomeClient
      products={products}
      categories={categories}
      allCategories={categoryNames}
      cartSlot={<CartLink />}
    />
  );
}
