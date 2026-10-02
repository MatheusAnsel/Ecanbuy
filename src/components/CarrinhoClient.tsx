"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Cart } from "@/lib/types";
import { applyDiscountAction, removeLineAction, updateLineAction } from "@/app/actions";

interface CarrinhoClientProps {
  cart: Cart | null;
  configured: boolean;
}

const brl = (n: number) => n.toFixed(2).replace(".", ",");

export default function CarrinhoClient({ cart, configured }: CarrinhoClientProps) {
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [busy, setBusy] = useState(false);

  const items = cart?.lines ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const total = cart?.total ?? 0;
  const discount = Math.max(0, subtotal - total);
  const appliedCode = cart?.discountCodes.find(d => d.applicable)?.code;

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusy(true);
    const result = await fn();
    setBusy(false);
    return result;
  };

  const updateQty = (lineId: string, qty: number) => run(() => updateLineAction(lineId, qty));
  const removeItem = (lineId: string) => run(() => removeLineAction(lineId));

  const applyCoupon = async () => {
    setCouponError("");
    const result = await run(() => applyDiscountAction(coupon));
    if (result.ok) setCoupon("");
    else setCouponError(result.error ?? "Cupom inválido.");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .remove-btn { cursor: pointer; border: none; background: transparent; transition: color 0.2s; }
        .remove-btn:hover { color: #111 !important; }
        .qty-btn { cursor: pointer; border: none; background: transparent; transition: opacity 0.2s; }
        .qty-btn:hover { opacity: 0.4; }
        .checkout-btn { cursor: pointer; border: none; transition: opacity 0.2s; }
        .checkout-btn:hover { opacity: 0.8; }
        .continue-link:hover { color: #111 !important; }
        .coupon-btn { cursor: pointer; border: none; transition: all 0.2s; }
        .coupon-btn:hover { background: #111 !important; color: #f5f5f3 !important; }
      `}</style>

      <div style={{ background: "#f5f5f3", minHeight: "100vh", fontFamily: "'Cormorant Garamond', serif", color: "#111" }}>

        {/* Header */}
        <header style={{ borderBottom: "1px solid #ddd", padding: "0 60px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px", background: "#f5f5f3" }}>
          <Link href="/" style={{ fontSize: "18px", fontWeight: "600", letterSpacing: "6px", color: "#111", textDecoration: "none" }}>ECANBUY</Link>
          <Link href="/produtos" className="continue-link"
            style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#aaa", textDecoration: "none", letterSpacing: "1px" }}>
            ← CONTINUAR COMPRANDO
          </Link>
        </header>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px" }}>

          {/* Título */}
          <div style={{ marginBottom: "56px", borderBottom: "1px solid #ddd", paddingBottom: "24px" }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "4px", color: "#aaa", marginBottom: "10px" }}>RESUMO</p>
            <h1 style={{ fontSize: "56px", fontWeight: "300", letterSpacing: "-2px" }}>
              Carrinho {items.length > 0 && <span style={{ color: "#ccc", fontSize: "40px" }}>({cart?.totalQuantity ?? 0})</span>}
            </h1>
          </div>

          {!configured && (
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#a33", letterSpacing: "1px", marginBottom: "32px" }}>
              Modo demonstração: a loja ainda não está conectada à Shopify.
            </p>
          )}

          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
              <p style={{ fontSize: "64px", opacity: 0.15, marginBottom: "32px" }}>◈</p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#bbb", letterSpacing: "2px", marginBottom: "36px" }}>SEU CARRINHO ESTÁ VAZIO</p>
              <Link href="/produtos"
                style={{ background: "#111", color: "#f5f5f3", padding: "14px 40px", textDecoration: "none", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "2px" }}>
                VER PRODUTOS
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "80px", alignItems: "start" }}>

              {/* Itens */}
              <div>
                {/* Cabeçalho da lista */}
                <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 80px", gap: "20px", paddingBottom: "16px", borderBottom: "1px solid #ddd", fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "2px", color: "#bbb" }}>
                  <span></span>
                  <span>PRODUTO</span>
                  <span style={{ textAlign: "center" }}>QTD.</span>
                  <span style={{ textAlign: "right" }}>TOTAL</span>
                </div>

                {items.map(item => (
                  <div key={item.id} style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px 80px", gap: "20px", alignItems: "center", padding: "28px 0", borderBottom: "1px solid #ddd" }}>

                    {/* Thumb */}
                    <div style={{ background: "#eaeae8", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="80px" style={{ objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "28px", opacity: 0.15 }}>◈</span>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "3px", color: "#bbb", marginBottom: "4px" }}>{item.category.toUpperCase()}</p>
                      <p style={{ fontSize: "19px", fontWeight: "400", marginBottom: "4px" }}>{item.name}</p>
                      {item.variantTitle !== "Default Title" && (
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#bbb", marginBottom: "12px" }}>OPÇÃO: {item.variantTitle}</p>
                      )}
                      <button onClick={() => removeItem(item.id)} disabled={busy} className="remove-btn"
                        style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", color: "#ccc", letterSpacing: "1px", padding: 0, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                        REMOVER
                      </button>
                    </div>

                    {/* Qty */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ddd" }}>
                      <button onClick={() => updateQty(item.id, item.quantity - 1)} disabled={busy} className="qty-btn"
                        style={{ padding: "6px 12px", fontFamily: "'DM Mono', monospace", fontSize: "16px", color: "#888" }}>−</button>
                      <span style={{ padding: "6px 12px", fontFamily: "'DM Mono', monospace", fontSize: "13px", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} disabled={busy} className="qty-btn"
                        style={{ padding: "6px 12px", fontFamily: "'DM Mono', monospace", fontSize: "16px", color: "#888" }}>+</button>
                    </div>

                    {/* Preço */}
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", color: "#111" }}>
                        R$ {brl(item.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumo */}
              <div style={{ position: "sticky", top: "80px" }}>
                <div style={{ border: "1px solid #ddd", padding: "36px" }}>
                  <h2 style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "3px", color: "#aaa", marginBottom: "28px" }}>RESUMO DO PEDIDO</h2>

                  {/* Cupom */}
                  <div style={{ marginBottom: "28px" }}>
                    <div style={{ display: "flex", gap: "0" }}>
                      <input type="text" placeholder="CUPOM DE DESCONTO"
                        value={coupon}
                        onChange={e => { setCoupon(e.target.value); setCouponError(""); }}
                        style={{ flex: 1, background: "transparent", border: "1px solid #ddd", borderRight: "none", color: "#111", padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontSize: "10px", outline: "none", letterSpacing: "1px" }}
                      />
                      <button onClick={applyCoupon} disabled={busy} className="coupon-btn"
                        style={{ background: "#f0f0ee", color: "#888", border: "1px solid #ddd", padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "1px" }}>
                        OK
                      </button>
                    </div>
                    {appliedCode && <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#555", marginTop: "8px", letterSpacing: "1px" }}>✓ Cupom {appliedCode} aplicado</p>}
                    {couponError && <p role="alert" style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#a33", marginTop: "8px", letterSpacing: "1px" }}>{couponError}</p>}
                  </div>

                  {/* Valores */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "24px", borderBottom: "1px solid #ddd", marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>
                      <span style={{ color: "#aaa" }}>SUBTOTAL</span>
                      <span>R$ {brl(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>
                        <span style={{ color: "#aaa" }}>DESCONTO</span>
                        <span>− R$ {brl(discount)}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>
                      <span style={{ color: "#aaa" }}>FRETE</span>
                      <span>NO CHECKOUT</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "28px" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "2px", color: "#aaa" }}>TOTAL</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "26px", color: "#111" }}>
                      R$ {brl(total)}
                    </span>
                  </div>

                  <a href={cart?.checkoutUrl || "#"} aria-disabled={!cart?.checkoutUrl} className="checkout-btn"
                    style={{ display: "block", textAlign: "center", textDecoration: "none", width: "100%", background: "#111", color: "#f5f5f3", padding: "16px", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "2px", marginBottom: "12px" }}>
                    FINALIZAR COMPRA
                  </a>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", color: "#bbb", textAlign: "center", letterSpacing: "1px" }}>
                    PAGAMENTO NO CHECKOUT SEGURO DA SHOPIFY
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}