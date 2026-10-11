import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";

interface HomeClientProps {
  products: Product[];
  categories: { name: string; image: string | null }[];
  allCategories: string[];
  cartSlot: React.ReactNode;
}

export default function HomeClient({ products, categories, allCategories, cartSlot }: HomeClientProps) {
  const spotlight = products[0];
  const news = products.filter((p) => p.isNew);
  const offers = products.filter((p) => p.oldPrice);
  const rail = (news.length >= 3 ? news : products).slice(0, 8);
  const offerImage = offers.find((p) => p.image)?.image ?? null;
  const newImage = news.find((p) => p.image)?.image ?? null;

  return (
    <div className="page">
      <SiteHeader cartSlot={cartSlot} categories={allCategories} />

      <main id="conteudo">
      {/* Hero em tela cheia */}
      <section className="hero">
        {spotlight?.image ? (
          <Image src={spotlight.image} alt={spotlight.name} fill priority sizes="100vw" style={{ objectFit: "cover" }} />
        ) : (
          <span className="hero-ph display" aria-hidden>EB</span>
        )}
        <div className="hero-shade" />
        <div className="hero-content pad">
          <p className="hero-eyebrow">NOVA COLEÇÃO 2026</p>
          <h1 className="display hero-title">
            Vista<br />o seu ritmo.
          </h1>
          <p className="hero-copy">Produtos selecionados, com visual limpo e frete calculado no checkout.</p>
          <div className="row-btns">
            <Link href="/produtos" className="btn btn-light">Comprar agora <span aria-hidden>→</span></Link>
            {spotlight && (
              <Link href={`/produto/${spotlight.handle}`} className="btn" style={{ background: "transparent", color: "#fff", borderColor: "#fff" }}>
                Ver {spotlight.name}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Carrossel de novidades */}
      <section className="section pad">
        <div className="section-head">
          <h2 className="display section-title">{news.length >= 3 ? "Novidades" : "Em destaque"}</h2>
          <Link href={news.length >= 3 ? "/produtos?filtro=novidades" : "/produtos"} className="link-under">Ver tudo</Link>
        </div>
        <div className="rail">
          {rail.map((p) => (
            <ProductCard key={p.id} product={p} sizes="(max-width: 900px) 78vw, 380px" />
          ))}
        </div>
      </section>

      {/* Categorias */}
      {categories.length > 0 && (
        <section id="categorias" className="section pad">
          <div className="section-head">
            <h2 className="display section-title">Compre por categoria</h2>
          </div>
          <div className="tiles">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/produtos?categoria=${encodeURIComponent(cat.name)}`} className="tile">
                {cat.image && (
                  <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 900px) 50vw, 25vw" style={{ objectFit: "cover" }} />
                )}
                <span className="tile-label display">{cat.name} <span aria-hidden>→</span></span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Banners de campanha */}
      <section className="section pad">
        <div className="promos">
          <Link href="/produtos?filtro=ofertas" className="promo promo-dark">
            {offerImage && <Image src={offerImage} alt="" fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover" }} />}
            <div className="promo-shade" />
            <div className="promo-body">
              <h2 className="display promo-title">Ofertas<br />da estação</h2>
              <span className="btn btn-light">Comprar <span aria-hidden>→</span></span>
            </div>
          </Link>
          <Link href="/produtos?filtro=novidades" className="promo promo-dark">
            {newImage && <Image src={newImage} alt="" fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover" }} />}
            <div className="promo-shade" />
            <div className="promo-body">
              <h2 className="display promo-title">Acabou<br />de chegar</h2>
              <span className="btn btn-light">Comprar <span aria-hidden>→</span></span>
            </div>
          </Link>
        </div>
      </section>

      {/* Chamada */}
      <section className="band pad">
        <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 72px)", lineHeight: 0.95 }}>
          Crie sua conta.<br />Ganhe 10% off.
        </h2>
        <Link href="#" className="btn">Cadastrar <span aria-hidden>→</span></Link>
      </section>

      </main>

      <SiteFooter categories={allCategories} />
    </div>
  );
}
