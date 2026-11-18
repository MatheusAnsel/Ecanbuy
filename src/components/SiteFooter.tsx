import Link from "next/link";
import { storeConfig } from "@/lib/store-config";
import { policies } from "@/lib/policies";

interface SiteFooterProps {
  categories?: string[];
}

export default function SiteFooter({ categories = [] }: SiteFooterProps) {
  const { seller } = storeConfig;
  return (
    <footer className="footer pad">
      <div className="footer-grid">
        <div>
          <p className="display" style={{ fontSize: "40px", lineHeight: 1 }}>{storeConfig.name}</p>
        </div>
        <div>
          <h3>Loja</h3>
          <ul>
            <li><Link href="/produtos">Todos os produtos</Link></li>
            <li><Link href="/produtos?filtro=novidades">Novidades</Link></li>
            <li><Link href="/produtos?filtro=ofertas">Ofertas</Link></li>
            <li><Link href="/carrinho">Carrinho</Link></li>
          </ul>
        </div>
        {categories.length > 0 && (
          <div>
            <h3>Categorias</h3>
            <ul>
              {categories.map((c) => (
                <li key={c}>
                  <Link href={`/produtos?categoria=${encodeURIComponent(c)}`}>{c}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h3>Ajuda e políticas</h3>
          <ul>
            <li><Link href="/ajuda">Central de ajuda</Link></li>
            {policies.map((p) => (
              <li key={p.slug}>
                <Link href={`/politicas/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {seller.name && (
        <address className="footer-seller">
          {seller.name}
          {seller.document && <> · {seller.document}</>}
          {seller.address && <> · {seller.address}</>}
          {seller.email && (
            <>
              {" · "}
              <a href={`mailto:${seller.email}`}>{seller.email}</a>
            </>
          )}
        </address>
      )}
      <p className="footer-legal">© 2026 {storeConfig.name}. Todos os direitos reservados.</p>
    </footer>
  );
}
