import Link from "next/link";
import { storeConfig } from "@/lib/store-config";

interface SiteHeaderProps {
  cartSlot: React.ReactNode;
  categories?: string[];
}

export default function SiteHeader({ cartSlot, categories = [] }: SiteHeaderProps) {
  return (
    <>
      <div className="ticker">{storeConfig.ticker.join("  ·  ")}</div>
      <header className="site-header pad">
        <Link href="/" className="logo display">
          {storeConfig.name}
        </Link>
        <nav className="site-nav" aria-label="Principal">
          <Link href="/produtos">Novidades</Link>
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
