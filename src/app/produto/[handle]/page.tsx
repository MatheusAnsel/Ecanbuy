import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import CartLink from "@/components/CartLink";
import { getProduct } from "@/lib/shopify";

type Params = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  return { title: product ? `${product.name} | EcanBuy` : "Produto | EcanBuy" };
}

export default async function ProdutoPage({ params }: Params) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  return <ProductDetail product={product} cartSlot={<CartLink />} />;
}
