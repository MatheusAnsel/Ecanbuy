"use client";
import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
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
    <div className="page">
      <SiteHeader cartSlot={<span />} />

      <main id="conteudo" className="wrap">
        <div className="bag pad">
          <section>
            <h1 className="display bag-title">
              Carrinho {items.length > 0 && <span style={{ color: "var(--m2)" }}>({cart?.totalQuantity ?? 0})</span>}
            </h1>

            {!configured && (
              <p className="err" style={{ marginTop: "12px" }}>
                Modo demonstração: a loja ainda não está conectada à Shopify.
              </p>
            )}

            {items.length === 0 ? (
              <div style={{ padding: "64px 0" }}>
                <p style={{ fontSize: "18px", marginBottom: "24px" }}>Seu carrinho está vazio.</p>
                <Link href="/produtos" className="btn">Ver produtos <span aria-hidden>→</span></Link>
              </div>
            ) : (
              <div style={{ marginTop: "16px", borderTop: "1px solid var(--border)" }}>
                {items.map((item) => (
                  <div key={item.id} className="bag-line">
                    <div className="bag-thumb">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="150px" style={{ objectFit: "cover" }} />
                      ) : (
                        <span className="card-ph display" aria-hidden style={{ fontSize: "48px" }}>EB</span>
                      )}
                    </div>
                    <div>
                      <p className="bag-name">{item.name}</p>
                      <p className="bag-meta">{item.category}</p>
                      {item.variantTitle !== "Default Title" && <p className="bag-meta">Opção: {item.variantTitle}</p>}
                      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "16px" }}>
                        <div className="qty">
                          <button onClick={() => updateQty(item.id, item.quantity - 1)} disabled={busy} aria-label="Diminuir">−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1)} disabled={busy} aria-label="Aumentar">+</button>
                        </div>
                        <button className="text-btn" onClick={() => removeItem(item.id)} disabled={busy}>Remover</button>
                      </div>
                    </div>
                    <p style={{ fontWeight: 600 }}>R$ {brl(item.total)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {items.length > 0 && (
            <aside className="summary">
              <h2 className="display">Resumo</h2>

              <div>
                <div className="coupon">
                  <input
                    type="text"
                    placeholder="Cupom de desconto"
                    aria-label="Cupom de desconto"
                    value={coupon}
                    onChange={(e) => { setCoupon(e.target.value); setCouponError(""); }}
                  />
                  <button onClick={applyCoupon} disabled={busy}>Aplicar</button>
                </div>
                {appliedCode && <p className="note" style={{ marginTop: "8px" }}>Cupom {appliedCode} aplicado</p>}
                {couponError && <p role="alert" className="err" style={{ marginTop: "8px" }}>{couponError}</p>}
              </div>

              <div className="sum-row"><span>Subtotal</span><span>R$ {brl(subtotal)}</span></div>
              {discount > 0 && <div className="sum-row"><span>Desconto</span><span>− R$ {brl(discount)}</span></div>}
              <div className="sum-row"><span>Frete</span><span>Calculado no checkout</span></div>
              <div className="sum-total"><span>Total</span><span>R$ {brl(total)}</span></div>

              <a href={cart?.checkoutUrl || "#"} aria-disabled={!cart?.checkoutUrl} className="btn-pill">
                Finalizar compra
              </a>
              <p className="note" style={{ textAlign: "center" }}>Pagamento no checkout seguro da Shopify</p>
            </aside>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
