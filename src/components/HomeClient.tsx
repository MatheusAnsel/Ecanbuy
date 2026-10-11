import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { storeConfig } from "@/lib/store-config";

interface HomeClientProps {
  featured: Product[];
  categories: { name: string; image: string | null }[];
  cartSlot: React.ReactNode;
}

const DISPLAY = "var(--font-display), 'Arial Narrow', Arial, sans-serif";
const BODY = "var(--font-body), Helvetica, Arial, sans-serif";

function brl(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export default function HomeClient({ featured, categories, cartSlot }: HomeClientProps) {
  const spotlight = featured[0];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .home { background: var(--bg); color: var(--fg); font-family: ${BODY}; min-height: 100vh; }
        .display { font-family: ${DISPLAY}; font-weight: 800; text-transform: uppercase; }
        .pad { padding-left: 48px; padding-right: 48px; }
        .nav-link { color: var(--fg); text-decoration: none; font-size: 15px; font-weight: 600; padding: 4px 0; border-bottom: 2px solid transparent; transition: border-color .15s; }
        .nav-link:hover { border-bottom-color: var(--fg); }
        .btn { display: inline-flex; align-items: center; gap: 12px; background: var(--fg); color: var(--bg); padding: 16px 28px; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: .5px; text-transform: uppercase; border: 1px solid var(--fg); transition: background .15s, color .15s; }
        .btn:hover { background: var(--bg); color: var(--fg); }
        .btn-light { background: var(--bg); color: var(--fg); border-color: var(--bg); }
        .btn-light:hover { background: transparent; color: var(--bg); }
        .btn-outline { background: transparent; color: var(--fg); }
        .btn-outline:hover { background: var(--fg); color: var(--bg); }
        .hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 78vh; background: var(--surface); }
        .hero-text { display: flex; flex-direction: column; justify-content: flex-end; padding: 64px 48px; gap: 24px; }
        .hero-title { font-size: clamp(64px, 9vw, 150px); line-height: .88; letter-spacing: -1px; }
        .hero-media { position: relative; background: var(--surface-hover); min-height: 360px; overflow: hidden; }
        .hero-tag { position: absolute; left: 24px; bottom: 24px; background: var(--bg); color: var(--fg); padding: 14px 18px; text-decoration: none; display: block; }
        .section-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
        .section-title { font-size: clamp(32px, 4vw, 52px); line-height: 1; letter-spacing: -.5px; }
        .link-under { color: var(--fg); font-weight: 600; font-size: 14px; text-decoration: underline; text-underline-offset: 4px; }
        .tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .tile { position: relative; aspect-ratio: 4/5; background: var(--surface); overflow: hidden; display: flex; align-items: flex-end; text-decoration: none; color: var(--fg); }
        .tile-label { position: relative; z-index: 1; margin: 16px; background: var(--bg); padding: 10px 16px; font-size: 22px; line-height: 1; display: flex; gap: 10px; align-items: center; }
        .tile img { transition: transform .4s ease; }
        .tile:hover img { transform: scale(1.04); }
        .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .card { text-decoration: none; color: var(--fg); display: block; }
        .card-img { position: relative; aspect-ratio: 1/1; background: var(--surface); overflow: hidden; }
        .card-img img { transition: transform .4s ease; }
        .card:hover .card-img img { transform: scale(1.04); }
        .badge { position: absolute; top: 12px; left: 12px; background: var(--bg); color: var(--fg); font-size: 12px; font-weight: 700; padding: 4px 8px; text-transform: uppercase; z-index: 1; }
        .band { background: var(--fg); color: var(--bg); display: flex; justify-content: space-between; align-items: center; gap: 32px; padding: 64px 48px; }
        .footer { background: var(--fg); color: var(--bg); padding: 40px 48px 32px; border-top: 1px solid #2a2a2a; }
        @media (max-width: 900px) {
          .pad { padding-left: 20px; padding-right: 20px; }
          .hero { grid-template-columns: 1fr; min-height: 0; }
          .hero-text { padding: 40px 20px; }
          .hero-media { min-height: 320px; order: -1; }
          .tiles, .cards { grid-template-columns: repeat(2, 1fr); }
          .nav-center { display: none !important; }
          .band { flex-direction: column; align-items: flex-start; padding: 40px 20px; }
          .footer { padding: 32px 20px; }
        }
      `}</style>

      <div className="home">
        {/* Barra de avisos */}
        <div style={{ background: "var(--fg)", color: "var(--bg)", textAlign: "center", padding: "10px 16px", fontSize: "12px", fontWeight: 600, letterSpacing: "1px" }}>
          {storeConfig.ticker.join("  ·  ")}
        </div>

        {/* Cabeçalho */}
        <header className="pad" style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--bg)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>
          <Link href="/" className="display" style={{ fontSize: "32px", color: "var(--fg)", textDecoration: "none", letterSpacing: "0px" }}>
            EcanBuy
          </Link>
          <nav className="nav-center" style={{ display: "flex", gap: "32px" }}>
            <Link href="/produtos" className="nav-link">Produtos</Link>
            <a href="#categorias" className="nav-link">Categorias</a>
            <a href="#destaques" className="nav-link">Destaques</a>
          </nav>
          {cartSlot}
        </header>

        {/* Hero */}
        <section className="hero">
          <div className="hero-text">
            <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "1px" }}>NOVA COLEÇÃO 2026</p>
            <h1 className="display hero-title">
              Vista<br />o seu<br />ritmo.
            </h1>
            <p style={{ maxWidth: "420px", fontSize: "17px", lineHeight: 1.5, color: "var(--m1)" }}>
              Produtos selecionados, com visual limpo e envio calculado no checkout.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/produtos" className="btn">Comprar agora <span aria-hidden>→</span></Link>
              <a href="#destaques" className="btn btn-outline">Ver destaques</a>
            </div>
          </div>
          <div className="hero-media">
            {spotlight?.image ? (
              <Image src={spotlight.image} alt={spotlight.name} fill priority sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover" }} />
            ) : (
              <div className="display" aria-hidden style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(160px, 24vw, 380px)", color: "var(--bg)", lineHeight: 1 }}>
                EB
              </div>
            )}
            {spotlight && (
              <Link href={`/produto/${spotlight.handle}`} className="hero-tag">
                <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--m2)", letterSpacing: "1px", marginBottom: "4px" }}>EM DESTAQUE</p>
                <p className="display" style={{ fontSize: "24px", lineHeight: 1.05 }}>{spotlight.name}</p>
                <p style={{ fontSize: "14px", fontWeight: 600, marginTop: "6px" }}>{brl(spotlight.price)}</p>
              </Link>
            )}
          </div>
        </section>

        {/* Categorias */}
        {categories.length > 0 && (
          <section id="categorias" className="pad" style={{ paddingTop: "72px", paddingBottom: "24px" }}>
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

        {/* Destaques */}
        <section id="destaques" className="pad" style={{ paddingTop: "56px", paddingBottom: "72px" }}>
          <div className="section-head">
            <h2 className="display section-title">Em destaque</h2>
            <Link href="/produtos" className="link-under">Ver todos</Link>
          </div>
          <div className="cards">
            {featured.map((p) => (
              <Link key={p.id} href={`/produto/${p.handle}`} className="card">
                <div className="card-img">
                  {p.image ? (
                    <Image src={p.image} alt={p.name} fill sizes="(max-width: 900px) 50vw, 25vw" style={{ objectFit: "cover" }} />
                  ) : (
                    <span className="display" aria-hidden style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "96px", color: "var(--border-strong)" }}>EB</span>
                  )}
                  {p.oldPrice ? <span className="badge">Oferta</span> : p.isNew ? <span className="badge">Novo</span> : null}
                </div>
                <div style={{ paddingTop: "14px" }}>
                  <p style={{ fontSize: "15px", fontWeight: 700 }}>{p.name}</p>
                  <p style={{ fontSize: "14px", color: "var(--m2)", marginTop: "2px" }}>{p.category}</p>
                  <p style={{ fontSize: "15px", fontWeight: 600, marginTop: "10px" }}>
                    {brl(p.price)}
                    {p.oldPrice && (
                      <span style={{ marginLeft: "10px", color: "var(--m3)", textDecoration: "line-through", fontWeight: 400 }}>{brl(p.oldPrice)}</span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Chamada */}
        <section className="band">
          <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 72px)", lineHeight: 0.95 }}>
            Crie sua conta.<br />Ganhe 10% off.
          </h2>
          <Link href="#" className="btn btn-light">Cadastrar <span aria-hidden>→</span></Link>
        </section>

        {/* Rodapé */}
        <footer className="footer">
          <div style={{ display: "flex", justifyContent: "space-between", gap: "32px", flexWrap: "wrap", marginBottom: "28px" }}>
            <span className="display" style={{ fontSize: "32px" }}>EcanBuy</span>
            <ul style={{ listStyle: "none", display: "grid", gap: "8px", fontSize: "13px", color: "#bdbdbf", maxWidth: "420px" }}>
              {storeConfig.infoList.map((info) => (
                <li key={info}>{info}</li>
              ))}
            </ul>
          </div>
          <p style={{ fontSize: "12px", color: "#8a8a8c" }}>© 2026 EcanBuy. Todos os direitos reservados.</p>
        </footer>
      </div>
    </>
  );
}
