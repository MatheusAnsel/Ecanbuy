"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";

interface ProdutosClientProps {
  products: Product[];
  categories: string[];
  initialCategory: string;
  cartSlot: React.ReactNode;
}

export default function ProdutosClient({ products, categories, initialCategory, cartSlot }: ProdutosClientProps) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("relevancia");
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = products
    .filter(p => activeCategory === "Todos" || p.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === "menor") return a.price - b.price;
      if (sortBy === "maior") return b.price - a.price;
      return 0;
    });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card-hover { transition: transform 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); }
        .filter-btn { transition: all 0.2s; cursor: pointer; border: none; }
        .nav-link:hover { color: var(--fg) !important; }
      `}</style>

      <div style={{ background: "var(--bg)", minHeight: "100vh", fontFamily: "'Cormorant Garamond', serif", color: "var(--fg)" }}>

        {/* Header */}
        <header style={{ borderBottom: "1px solid var(--border)", padding: "0 60px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px", background: "var(--bg)" }}>
          <Link href="/" style={{ fontSize: "18px", fontWeight: "600", letterSpacing: "6px", color: "var(--fg)", textDecoration: "none" }}>ECANBUY</Link>
          {cartSlot}
        </header>

        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "60px" }}>

          {/* Título */}
          <div style={{ marginBottom: "56px", borderBottom: "1px solid var(--border)", paddingBottom: "24px" }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "4px", color: "var(--m2)", marginBottom: "10px" }}>CATÁLOGO</p>
            <h1 style={{ fontSize: "56px", fontWeight: "300", letterSpacing: "-2px" }}>Produtos</h1>
          </div>

          {/* Filtros */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", gap: "0", border: "1px solid var(--border)" }}>
              {categories.map((cat, i) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className="filter-btn"
                  style={{
                    background: activeCategory === cat ? "var(--fg)" : "transparent",
                    color: activeCategory === cat ? "var(--bg)" : "var(--m1)",
                    padding: "10px 22px",
                    fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "1px",
                    borderRight: i < categories.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ background: "transparent", color: "var(--m1)", border: "1px solid var(--border)", padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: "10px", cursor: "pointer", outline: "none", letterSpacing: "1px" }}>
              <option value="relevancia">RELEVÂNCIA</option>
              <option value="menor">MENOR PREÇO</option>
              <option value="maior">MAIOR PREÇO</option>
            </select>
          </div>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1px", background: "var(--border)", border: "1px solid var(--border)", marginBottom: "48px" }}>
            {filtered.map(p => (
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
                    {p.isNew && (
                      <span style={{ position: "absolute", top: p.oldPrice ? "44px" : "16px", left: "16px", background: "var(--badge)", color: "var(--bg)", padding: "4px 10px", fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "1px" }}>
                        NOVO
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

          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "var(--m3)", textAlign: "center", letterSpacing: "2px" }}>
            {filtered.length} PRODUTO{filtered.length !== 1 ? "S" : ""} ENCONTRADO{filtered.length !== 1 ? "S" : ""}
          </p>
        </div>
      </div>
    </>
  );
}