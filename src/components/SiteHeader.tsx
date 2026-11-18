import Link from "next/link";
import { storeConfig } from "@/lib/store-config";
import { accountLink, isDemoStore } from "@/lib/shop-links";
import { DEMO_COUPON } from "@/lib/demo-config";

interface SiteHeaderProps {
  cartSlot: React.ReactNode;
  categories?: string[];
}

export default function SiteHeader({ cartSlot, categories = [] }: SiteHeaderProps) {
  return (
    <>
      <a href="#conteudo" className="skip">Pular para o conteúdo</a>
      {isDemoStore() ? (
        <div className="ticker ticker-demo" role="note">
          LOJA DE DEMONSTRAÇÃO · PRODUTOS DE EXEMPLO · NENHUM PAGAMENTO É REAL · CUPOM DE TESTE: {DEMO_COUPON}
        </div>
      ) : (
        <div className="ticker">{storeConfig.ticker.join("  ·  ")}</div>
      )}

      <div className="utility pad">
        <Link href="/ajuda#acessibilidade">Acessibilidade</Link>
        <nav aria-label="Atendimento e conta" className="utility-links">
          <a href={accountLink("")} className="u-hide">Acompanhe seu pedido</a>
          <Link href="/ajuda">Ajuda</Link>
          <a href={accountLink("/register")} className="u-hide">Junte-se a nós</a>
          <a href={accountLink("/login")}>Entrar</a>
        </nav>
      </div>

      <header className="site-header pad">
        <Link href="/" className="logo display">
          {storeConfig.name}
        </Link>
        <nav className="site-nav" aria-label="Principal">
          <Link href="/produtos?filtro=ofertas">Ofertas</Link>
          <Link href="/produtos?filtro=novidades">Lançamentos</Link>
          {categories.slice(0, 4).map((c) => (
            <Link key={c} href={`/produtos?categoria=${encodeURIComponent(c)}`}>
              {c}
            </Link>
          ))}
        </nav>
        <div className="header-actions">{cartSlot}</div>
      </header>
    </>
  );
}
