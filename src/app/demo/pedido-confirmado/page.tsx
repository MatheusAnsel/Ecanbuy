import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CartLink from "@/components/CartLink";
import { isShopifyConfigured } from "@/lib/shopify";

export const metadata: Metadata = { title: "Pedido de demonstração concluído", robots: { index: false } };

type Props = { searchParams: Promise<{ pedido?: string }> };

export default async function PedidoConfirmadoPage({ searchParams }: Props) {
  if (isShopifyConfigured) notFound();
  const { pedido } = await searchParams;
  const numero = pedido && /^DEMO-\d{6}$/.test(pedido) ? pedido : null;

  return (
    <div className="page">
      <SiteHeader cartSlot={<CartLink />} />

      <main id="conteudo" className="wrap">
        <div className="pad notfound">
          <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 80px)", lineHeight: 0.95 }}>
            Pedido concluído
          </h1>
          <p>
            {numero ? <>Pedido fictício <strong>{numero}</strong>. </> : null}
            Este foi um pedido de demonstração: nenhum pagamento foi feito e nada será enviado. Na loja
            conectada à Shopify, a confirmação e o rastreio chegam por e-mail.
          </p>
          <div className="row-btns">
            <Link href="/produtos" className="btn">Continuar comprando <span aria-hidden>→</span></Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
