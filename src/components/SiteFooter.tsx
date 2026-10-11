import Link from "next/link";
import { storeConfig } from "@/lib/store-config";

interface SiteFooterProps {
  categories?: string[];
}

export default function SiteFooter({ categories = [] }: SiteFooterProps) {
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
        <div>
          <h3>Informações</h3>
          <ul>
            {storeConfig.infoList.map((info) => (
              <li key={info}>{info}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="footer-legal">© 2026 {storeConfig.name}. Todos os direitos reservados.</p>
    </footer>
  );
}
