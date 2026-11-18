import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CartLink from "@/components/CartLink";

export const metadata: Metadata = { title: "Página não encontrada", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="page">
      <SiteHeader cartSlot={<CartLink />} />

      <main id="conteudo" className="wrap">
        <div className="pad notfound">
          <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 80px)", lineHeight: 0.95 }}>
            Página não encontrada
          </h1>
          <p>O endereço pode ter mudado ou o produto não está mais disponível.</p>
          <div className="row-btns">
            <Link href="/produtos" className="btn">Ver produtos <span aria-hidden>→</span></Link>
            <Link href="/" className="link-under">Voltar para o início</Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
