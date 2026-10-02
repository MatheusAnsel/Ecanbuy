"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { addToCartAction } from "@/app/actions";
import { storeConfig } from "@/lib/store-config";

interface ProductDetailProps {
  product: Product;
  cartSlot: React.ReactNode;
}

export default function ProductDetail({ product, cartSlot }: ProductDetailProps) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const soldOut = product.variants.every(v => !v.available);

  const addItem = async (): Promise<boolean> => {
    setError("");
    const variantId = product.hasOptions ? selectedVariant : product.variants[0]?.id;
    if (!variantId) {
      setError("Selecione uma opção antes de continuar.");
      return false;
    }
    setLoading(true);
    const result = await addToCartAction(variantId, qty);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Não foi possível adicionar ao carrinho.");
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (await addItem()) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (await addItem()) router.push("/carrinho");
  };

  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .size-btn { cursor: pointer; border: none; transition: all 0.15s; }
        .qty-btn { cursor: pointer; border: none; background: transparent; transition: opacity 0.2s; }
        .qty-btn:hover { opacity: 0.5; }
        .btn-add { cursor: pointer; border: none; transition: opacity 0.2s; }
        .btn-add:hover { opacity: 0.85; }
        .btn-outline { transition: all 0.2s; }
        .btn-outline:hover { background: var(--fg) !important; color: var(--bg) !important; }
        .breadcrumb-link:hover { color: var(--fg) !important; }
      `}</style>

      <div style={{ background: "var(--bg)", minHeight: "100vh", fontFamily: "'Cormorant Garamond', serif", color: "var(--fg)" }}>

        {/* Header */}
        <header style={{ borderBottom: "1px solid var(--border)", padding: "0 60px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px", background: "var(--bg)" }}>
          <Link href="/" style={{ fontSize: "18px", fontWeight: "600", letterSpacing: "6px", color: "var(--fg)", textDecoration: "none" }}>ECANBUY</Link>
          {cartSlot}
        </header>

        {/* Breadcrumb */}
        <div style={{ padding: "16px 60px", borderBottom: "1px solid var(--border)", display: "flex", gap: "8px", fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--m3)", letterSpacing: "1px" }}>
          <Link href="/" className="breadcrumb-link" style={{ color: "var(--m3)", textDecoration: "none" }}>HOME</Link>
          <span>/</span>
          <Link href="/produtos" className="breadcrumb-link" style={{ color: "var(--m3)", textDecoration: "none" }}>PRODUTOS</Link>
          <span>/</span>
          <span style={{ color: "var(--fg)" }}>{product.name.toUpperCase()}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 97px)" }}>

          {/* Imagem */}
          <div style={{ background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: "600px" }}>
            {product.image ? (
              <Image src={product.image} alt={product.name} fill priority sizes="50vw" style={{ objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "180px", opacity: 0.08, fontFamily: "'Cormorant Garamond', serif" }}>◈</span>
            )}
            {discount && (
              <div style={{ position: "absolute", top: "40px", left: "40px", background: "var(--fg)", color: "var(--bg)", padding: "8px 16px", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "1px" }}>
                −{discount}%
              </div>
            )}
            <div style={{ position: "absolute", bottom: "40px", right: "40px", fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "2px", color: "var(--m3)", writingMode: "vertical-rl" }}>
              {product.category.toUpperCase()}
            </div>
          </div>

          {/* Detalhes */}
          <div style={{ padding: "60px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "4px", color: "var(--m2)", marginBottom: "12px" }}>{product.category.toUpperCase()}</p>
            <h1 style={{ fontSize: "44px", fontWeight: "300", letterSpacing: "-1px", lineHeight: "1.1", marginBottom: "28px" }}>{product.name}</h1>

            {/* Preço */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: "36px", paddingBottom: "36px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "28px", color: "var(--fg)" }}>
                R$ {product.price.toFixed(2).replace(".", ",")}
              </span>
              {product.oldPrice && (
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "18px", color: "var(--m4)", textDecoration: "line-through" }}>
                  R$ {product.oldPrice.toFixed(2).replace(".", ",")}
                </span>
              )}
            </div>

            <p style={{ color: "var(--m1)", fontSize: "16px", lineHeight: "1.75", marginBottom: "36px", fontWeight: "300" }}>
              {product.description}
            </p>

            <div style={{ height: "1px", background: "var(--border)", marginBottom: "36px" }} />

            {/* Opções (tamanho, cor...) */}
            {product.hasOptions && (
              <div style={{ marginBottom: "32px" }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "2px", color: "var(--m2)", marginBottom: "14px" }}>OPÇÃO</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {product.variants.map(v => (
                    <button key={v.id} onClick={() => setSelectedVariant(v.id)} className="size-btn" disabled={!v.available}
                      style={{
                        background: selectedVariant === v.id ? "var(--fg)" : "transparent",
                        color: selectedVariant === v.id ? "var(--bg)" : "var(--m1)",
                        border: `1px solid ${selectedVariant === v.id ? "var(--fg)" : "var(--border)"}`,
                        padding: "10px 18px",
                        fontFamily: "'DM Mono', monospace", fontSize: "12px",
                        opacity: v.available ? 1 : 0.35,
                        cursor: v.available ? "pointer" : "not-allowed",
                        textDecoration: v.available ? "none" : "line-through",
                      }}>
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantidade */}
            <div style={{ marginBottom: "32px" }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "2px", color: "var(--m2)", marginBottom: "14px" }}>QUANTIDADE</p>
              <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--border)" }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="qty-btn"
                  style={{ padding: "10px 20px", fontFamily: "'DM Mono', monospace", fontSize: "18px", color: "var(--m1)" }}>−</button>
                <span style={{ padding: "10px 24px", fontFamily: "'DM Mono', monospace", fontSize: "14px", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="qty-btn"
                  style={{ padding: "10px 20px", fontFamily: "'DM Mono', monospace", fontSize: "18px", color: "var(--m1)" }}>+</button>
              </div>
            </div>

            {/* Botões */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={handleAdd} className="btn-add" disabled={loading || soldOut}
                style={{ background: added ? "var(--badge)" : "var(--fg)", color: "var(--bg)", padding: "16px", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "2px", opacity: loading || soldOut ? 0.6 : 1 }}>
                {soldOut ? "ESGOTADO" : loading ? "ADICIONANDO..." : added ? "✓  ADICIONADO" : "ADICIONAR AO CARRINHO"}
              </button>
              <button onClick={handleBuyNow} className="btn-outline" disabled={loading || soldOut}
                style={{ border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--fg)", padding: "16px", textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "2px" }}>
                COMPRAR AGORA
              </button>
              {error && (
                <p role="alert" style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--danger)", letterSpacing: "1px" }}>{error}</p>
              )}
            </div>

            {/* Info */}
            <div style={{ marginTop: "36px", paddingTop: "24px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "8px" }}>
              {storeConfig.infoList.map(info => (
                <p key={info} style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--m3)", letterSpacing: "1px" }}>— {info}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}