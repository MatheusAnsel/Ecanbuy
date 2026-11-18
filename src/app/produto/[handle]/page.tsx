import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import CartLink from "@/components/CartLink";
import { getProduct } from "@/lib/shopify";
import { summarize } from "@/lib/site";

type Params = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Produto não encontrado", robots: { index: false } };

  const description = summarize(product.description || `${product.name} na EcanBuy.`);
  const url = `/produto/${product.handle}`;
  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description,
      url,
      images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
    },
  };
}

export default async function ProdutoPage({ params }: Params) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  return <ProductDetail product={product} cartSlot={<CartLink />} />;
}
