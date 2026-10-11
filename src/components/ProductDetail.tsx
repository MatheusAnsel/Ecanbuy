"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { addToCartAction } from "@/app/actions";
import { storeConfig } from "@/lib/store-config";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { brl } from "@/components/ProductCard";

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

  const soldOut = product.variants.every((v) => !v.available);

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
    <div className="page">
      <SiteHeader cartSlot={cartSlot} />

      <main id="conteudo" className="wrap">
        <nav className="crumbs pad" aria-label="Você está em">
          <Link href="/">Início</Link>
          <span>/</span>
          <Link href="/produtos">Produtos</Link>
          <span>/</span>
          <Link href={`/produtos?categoria=${encodeURIComponent(product.category)}`}>{product.category}</Link>
        </nav>

        <div className="pdp pad">
          <div className="pdp-media">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 900px) 100vw, 58vw" style={{ objectFit: "cover" }} />
            ) : (
              <span className="card-ph display" aria-hidden style={{ fontSize: "220px" }}>EB</span>
            )}
          </div>

          <div className="pdp-info">
            <h1 className="display pdp-name">{product.name}</h1>
            <p className="pdp-cat">{product.category}</p>
            <p className="pdp-price">
              <span>{brl(product.price)}</span>
              {product.oldPrice && <s>{brl(product.oldPrice)}</s>}
              {discount ? <span className="pdp-off">{discount}% off</span> : null}
            </p>

            {product.hasOptions && (
              <>
                <div className="pdp-label"><span>Selecione a opção</span></div>
                <div className="opts">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      className="opt"
                      disabled={!v.available}
                      aria-pressed={selectedVariant === v.id}
                      onClick={() => setSelectedVariant(v.id)}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="pdp-label"><span>Quantidade</span></div>
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Aumentar">+</button>
            </div>

            <div className="pdp-actions">
              <button className="btn-pill" onClick={handleAdd} disabled={loading || soldOut}>
                {soldOut ? "Esgotado" : loading ? "Adicionando..." : added ? "Adicionado ✓" : "Adicionar ao carrinho"}
              </button>
              <button className="btn-pill btn-pill-outline" onClick={handleBuyNow} disabled={loading || soldOut}>
                Comprar agora
              </button>
              {error && <p role="alert" className="err">{error}</p>}
            </div>

            <div className="acc">
              <details open>
                <summary>Descrição</summary>
                <p>{product.description}</p>
              </details>
              <details>
                <summary>Envio e pagamento</summary>
                <ul>
                  {storeConfig.infoList.map((info) => (
                    <li key={info}>{info}</li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
