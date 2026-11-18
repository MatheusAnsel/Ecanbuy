import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { brl } from "@/components/ProductCard";
import { getCurrentCart } from "@/lib/cart-session";
import { isShopifyConfigured } from "@/lib/shopify";
import { finishDemoOrderAction } from "@/app/actions";

export const metadata: Metadata = { title: "Checkout de demonstração", robots: { index: false } };

// Simula o checkout da Shopify no modo demonstração. Não pede nem guarda dados pessoais
// ou de pagamento: só mostra o resumo e conclui um pedido fictício.
export default async function DemoCheckoutPage() {
  if (isShopifyConfigured) notFound();
  const cart = await getCurrentCart();
  if (!cart) redirect("/carrinho");

  const discount = Math.max(0, cart.subtotal - cart.total);

  return (
    <div className="page">
      <SiteHeader cartSlot={<span />} />

      <main id="conteudo" className="wrap">
        <div className="pad legal" style={{ paddingTop: "40px", paddingBottom: "24px" }}>
          <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 0.95 }}>
            Checkout de demonstração
          </h1>
          <p>
            Esta loja está em modo demonstração. Na versão conectada, este passo é o checkout seguro da
            Shopify, onde o cliente informa endereço, frete e pagamento. Aqui nenhum dado é pedido e nenhum
            valor é cobrado.
          </p>

          <h2 className="display legal-h">Resumo do pedido</h2>
          <ul>
            {cart.lines.map((l) => (
              <li key={l.id}>
                {l.quantity} × {l.name}
                {l.variantTitle !== "Default Title" && ` (${l.variantTitle})`}: {brl(l.total)}
              </li>
            ))}
          </ul>
          <p>Subtotal: {brl(cart.subtotal)}</p>
          {discount > 0 && <p>Desconto ({cart.discountCodes[0]?.code}): − {brl(discount)}</p>}
          <p><strong>Total: {brl(cart.total)}</strong> (frete não calculado na demonstração)</p>

          <form action={finishDemoOrderAction} className="row-btns" style={{ marginTop: "32px", alignItems: "center", gap: "24px" }}>
            <button type="submit" className="btn">Concluir pedido de demonstração</button>
            <Link href="/carrinho" className="link-under">Voltar ao carrinho</Link>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
