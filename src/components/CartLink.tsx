import Link from "next/link";
import { getCurrentCart } from "@/lib/cart-session";

export default async function CartLink() {
  const cart = await getCurrentCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <Link href="/carrinho" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "var(--fg)", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "1px" }}>
      CARRINHO
      <span style={{ background: "var(--fg)", color: "var(--bg)", borderRadius: "50%", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px" }}>{count}</span>
    </Link>
  );
}
