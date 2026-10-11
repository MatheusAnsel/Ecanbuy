"use client";
import { useState } from "react";
import type { Product } from "@/lib/types";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";

interface ProdutosClientProps {
  products: Product[];
  categories: string[];
  initialCategory: string;
  initialOffers: boolean;
  initialNews: boolean;
  cartSlot: React.ReactNode;
}

export default function ProdutosClient({
  products,
  categories,
  initialCategory,
  initialOffers,
  initialNews,
  cartSlot,
}: ProdutosClientProps) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [onlyOffers, setOnlyOffers] = useState(initialOffers);
  const [onlyNews, setOnlyNews] = useState(initialNews);
  const [sortBy, setSortBy] = useState("relevancia");

  const filtered = products
    .filter((p) => activeCategory === "Todos" || p.category === activeCategory)
    .filter((p) => !onlyOffers || p.oldPrice)
    .filter((p) => !onlyNews || p.isNew)
    .sort((a, b) => {
      if (sortBy === "menor") return a.price - b.price;
      if (sortBy === "maior") return b.price - a.price;
      return 0;
    });

  return (
    <div className="page">
      <SiteHeader cartSlot={cartSlot} categories={categories} />

      <div className="wrap">
        <div className="list-head pad">
          <h1 className="display list-title">
            {activeCategory === "Todos" ? "Todos os produtos" : activeCategory} <span>({filtered.length})</span>
          </h1>
          <select className="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Ordenar por">
            <option value="relevancia">Ordenar: Relevância</option>
            <option value="menor">Menor preço</option>
            <option value="maior">Maior preço</option>
          </select>
        </div>

        <div className="list-layout pad">
          <aside className="filters" aria-label="Filtros">
            <div>
              <h3>Categorias</h3>
              <ul className="filter-list">
                {["Todos", ...categories].map((cat) => (
                  <li key={cat}>
                    <button className="filter-btn" aria-pressed={activeCategory === cat} onClick={() => setActiveCategory(cat)}>
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Filtrar por</h3>
              <label className="check" style={{ marginBottom: "10px" }}>
                <input type="checkbox" checked={onlyOffers} onChange={(e) => setOnlyOffers(e.target.checked)} />
                Ofertas
              </label>
              <label className="check">
                <input type="checkbox" checked={onlyNews} onChange={(e) => setOnlyNews(e.target.checked)} />
                Novidades
              </label>
            </div>
          </aside>

          <section>
            {filtered.length === 0 ? (
              <p className="empty">Nenhum produto encontrado com esses filtros.</p>
            ) : (
              <div className="cards cards-3">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} sizes="(max-width: 900px) 50vw, 33vw" />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <SiteFooter categories={categories} />
    </div>
  );
}
