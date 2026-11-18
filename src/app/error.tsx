"use client";
import Link from "next/link";

// Mostrado quando uma página falha ao carregar (por exemplo, se a Shopify estiver fora do ar).
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="conteudo" className="wrap">
      <div className="pad notfound">
        <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 80px)", lineHeight: 0.95 }}>
          Não foi possível carregar a loja
        </h1>
        <p>Pode ser uma instabilidade momentânea. Tente de novo em alguns segundos.</p>
        <div className="row-btns">
          <button type="button" className="btn" onClick={reset}>Tentar de novo</button>
          <Link href="/ajuda" className="link-under">Central de ajuda</Link>
        </div>
      </div>
    </main>
  );
}
