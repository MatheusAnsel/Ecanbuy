import type { Metadata } from "next";
import CarrinhoClient from "@/components/CarrinhoClient";
import { getCurrentCart } from "@/lib/cart-session";
import { isShopifyConfigured } from "@/lib/shopify";

export const metadata: Metadata = { title: "Carrinho", robots: { index: false } };

export default async function CarrinhoPage() {
  const cart = await getCurrentCart();
  return <CarrinhoClient cart={cart} configured={isShopifyConfigured} />;
}
