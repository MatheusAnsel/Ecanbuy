import Link from "next/link";
import { getCurrentCart } from "@/lib/cart-session";

export default async function CartLink() {
  const cart = await getCurrentCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <Link href="/carrinho" className="cart-link" aria-label={`Carrinho, ${count} ${count === 1 ? "item" : "itens"}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M5 8h14l-1 12H6L5 8Z" strokeLinejoin="round" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
      </svg>
      <span>{count}</span>
    </Link>
  );
}
