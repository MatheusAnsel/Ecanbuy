"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { Product } from "@/lib/types";
import { storeConfig } from "@/lib/store-config";

interface HomeClientProps {
  featured: Product[];
  categories: string[];
  cartSlot: React.ReactNode;
}

export default function HomeClient({ featured, categories, cartSlot }: HomeClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const spotlight = featured[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-link { transition: color 0.2s; }
        .nav-link:hover { color: var(--fg) !important; }
        .card-hover { transition: transform 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); }
        .cat-link { transition: all 0.2s; }
        .cat-link:hover { background: var(--fg) !important; color: var(--bg) !important; }
        .btn-dark { transition: opacity 0.2s; }
        .btn-dark:hover { opacity: 0.8; }
        .btn-ghost { transition: all 0.2s; }
        .btn-ghost:hover { background: var(--fg) !important; color: var(--bg) !important; }
        .cta-btn { transition: all 0.2s; }
        .cta-btn:hover { background: var(--fg) !important; color: var(--bg) !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .hero-text { animation: fadeUp 0.9s ease 0.1s forwards; opacity: 0; }
        .hero-sub { animation: fadeUp 0.9s ease 0.3s forwards; opacity: 0; }
        .hero-btns { animation: fadeUp 0.9s ease 0.5s forwards; opacity: 0; }
      `}</style>

      <div style={{ background: "var(--bg)", minHeight: "100vh", fontFamily: "'Cormorant Garamond', serif", color: "var(--fg)" }}>

        {/* Ticker */}
        <div style={{ background: "var(--surface)", color: "var(--fg)", borderBottom: "1px solid var(--border)", textAlign: "center", padding: "9px", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "2px" }}>
          {storeConfig.ticker.join("  ·  ")}
        </div>

        {/* Header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          background: scrolled ? "rgba(14,14,14,0.94)" : "var(--bg)",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: "1px solid var(--border)",
          padding: "0 60px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: "64px",
          transition: "all 0.3s ease"
        }}>
          <nav style={{ display: "flex", gap: "36px" }}>
            {[["Produtos", "/produtos"], ["Categorias", "#"], ["Ofertas", "#"]].map(([label, href]) => (
              <Link key={label} href={href} className="nav-link"
                style={{ color: "var(--m1)", textDecoration: "none", fontSize: "11px", letterSpacing: "2px", fontFamily: "'DM Mono', monospace" }}>
                {label.toUpperCase()}
              </Link>
            ))}
          </nav>

          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: "20px", fontWeight: "600", letterSpacing: "8px", color: "var(--fg)", fontFamily: "'Cormorant Garamond', serif" }}>
            ECANBUY
          </div>

          {cartSlot}
        </header>

        {/* Hero */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "88vh" }}>
          <div style={{ padding: "80px 60px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid var(--border)" }}>
            <p className="hero-text" style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "4px", color: "var(--m2)", marginBottom: "28px" }}>
              NOVA COLEÇÃO — 2026
            </p>
            <h1 className="hero-text" style={{ fontSize: "clamp(52px, 6vw, 88px)", fontWeight: "300", lineHeight: "0.95", letterSpacing: "-2px", marginBottom: "36px" }}>
              A ARTE<br />
              DE <em style={{ fontStyle: "italic" }}>vestir</em><br />
              BEM.
            </h1>
            <p className="hero-sub" style={{ color: "var(--m1)", fontSize: "17px", lineHeight: "1.75", maxWidth: "340px", marginBottom: "48px", fontWeight: "300" }}>
              Produtos selecionados com qualidade premium. Design atemporal para quem valoriza cada detalhe.
            </p>
            <div className="hero-btns" style={{ display: "flex", gap: "12px" }}>
              <Link href="/produtos" className="btn-dark"
                style={{ background: "var(--fg)", color: "var(--bg)", padding: "14px 36px", textDecoration: "none", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "2px" }}>
                EXPLORAR
              </Link>
              <Link href="/produtos" className="btn-ghost"
                style={{ border: "1px solid var(--m4)", color: "var(--fg)", padding: "14px 36px", textDecoration: "none", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "2px" }}>
                OFERTAS
              </Link>
            </div>
          </div>

          <div style={{ background: "var(--surface)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <div style={{ fontSize: "260px", opacity: 0.06, userSelect: "none", transform: "rotate(-12deg)", fontFamily: "'Cormorant Garamond', serif", color: "var(--fg)" }}>E</div>
            {spotlight && (
              <Link href={`/produto/${spotlight.handle}`} style={{ position: "absolute", bottom: "48px", left: "48px", background: "var(--bg)", padding: "20px 28px", borderTop: "2px solid var(--fg)", textDecoration: "none", color: "inherit" }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "3px", color: "var(--m2)", marginBottom: "6px" }}>EM DESTAQUE</p>
                <p style={{ fontSize: "20px", fontWeight: "400" }}>{spotlight.name}</p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "var(--m1)", marginTop: "6px" }}>R$ {spotlight.price.toFixed(2).replace(".", ",")}</p>
              </Link>
            )}
            <div style={{ position: "absolute", top: "48px", right: "48px", fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "2px", color: "var(--m3)", writingMode: "vertical-rl" }}>
              ECANBUY / 2026
            </div>
          </div>
        </section>

        {/* Categorias */}
        {categories.length > 0 && (
          <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", display: "flex" }}>
            {categories.map((cat, i) => (
              <Link key={cat} href={`/produtos?categoria=${encodeURIComponent(cat)}`} className="cat-link"
                style={{ flex: 1, padding: "22px", textAlign: "center", textDecoration: "none", color: "var(--m1)", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "2px", borderRight: i < categories.length - 1 ? "1px solid var(--border)" : "none" }}>
                {cat.toUpperCase()}
              </Link>
            ))}
          </section>
        )}

        {/* Produtos */}
        <section style={{ padding: "80px 60px", maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "48px", borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
            <h2 style={{ fontSize: "38px", fontWeight: "300", letterSpacing: "-1px" }}>Em Destaque</h2>
            <Link href="/produtos" style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "var(--m2)", textDecoration: "none" }}>
              VER TODOS →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "var(--border)", border: "1px solid var(--border)" }}>
            {featured.map(p => (
              <Link key={p.id} href={`/produto/${p.handle}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="card-hover" style={{ background: "var(--bg)" }}
                  onMouseEnter={() => setHovered(p.id)}
                  onMouseLeave={() => setHovered(null)}>
                  <div style={{ aspectRatio: "3/4", background: hovered === p.id ? "var(--surface-hover)" : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.3s", position: "relative" }}>
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "80px", opacity: 0.1, fontFamily: "'Cormorant Garamond', serif" }}>◈</span>
                    )}
                    {p.oldPrice && (
                      <span style={{ position: "absolute", top: "16px", left: "16px", background: "var(--fg)", color: "var(--bg)", padding: "4px 10px", fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "1px" }}>
                        OFERTA
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "20px 20px 24px" }}>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "3px", color: "var(--m3)", marginBottom: "6px" }}>{p.category.toUpperCase()}</p>
                    <p style={{ fontSize: "18px", fontWeight: "400", marginBottom: "10px" }}>{p.name}</p>
                    <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--fg)" }}>R$ {p.price.toFixed(2).replace(".", ",")}</span>
                      {p.oldPrice && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--m4)", textDecoration: "line-through" }}>R$ {p.oldPrice.toFixed(2).replace(".", ",")}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ margin: "0 60px 80px", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--fg)", padding: "72px 60px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "4px", color: "var(--m3)", marginBottom: "16px" }}>EXCLUSIVO</p>
            <h2 style={{ fontSize: "48px", fontWeight: "300", letterSpacing: "-1px", lineHeight: "1.1" }}>
              Crie sua conta.<br />
              <em style={{ fontStyle: "italic", color: "var(--m2)" }}>Ganhe 10% off.</em>
            </h2>
          </div>
          <Link href="#" className="cta-btn"
            style={{ border: "1px solid var(--border-strong)", color: "var(--fg)", padding: "16px 40px", textDecoration: "none", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "2px" }}>
            CADASTRAR
          </Link>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 60px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "16px", fontWeight: "600", letterSpacing: "6px" }}>ECANBUY</span>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "var(--m3)", letterSpacing: "1px" }}>© 2026 EcanBuy. Todos os direitos reservados.</p>
        </footer>
      </div>
    </>
  );
}