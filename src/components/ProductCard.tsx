import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";

export function brl(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export default function ProductCard({ product: p, sizes }: { product: Product; sizes: string }) {
  return (
    <Link href={`/produto/${p.handle}`} className="card">
      <div className="card-img">
        {p.image ? (
          <Image src={p.image} alt={p.name} fill sizes={sizes} style={{ objectFit: "cover" }} />
        ) : (
          <span className="card-ph display" aria-hidden>EB</span>
        )}
        {p.oldPrice ? <span className="badge">Oferta</span> : p.isNew ? <span className="badge">Novo</span> : null}
      </div>
      <div className="card-body">
        <p className="card-name">{p.name}</p>
        <p className="card-cat">{p.category}</p>
        <p className="card-price">
          {brl(p.price)}
          {p.oldPrice && <s>{brl(p.oldPrice)}</s>}
        </p>
      </div>
    </Link>
  );
}
