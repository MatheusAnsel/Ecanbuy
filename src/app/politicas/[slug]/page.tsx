import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CartLink from "@/components/CartLink";
import { getProducts } from "@/lib/shopify";
import { getPolicy, policies } from "@/lib/policies";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return {};
  return {
    title: policy.title,
    description: policy.description,
    alternates: { canonical: `/politicas/${policy.slug}` },
  };
}

export default async function PoliticaPage({ params }: Params) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  const products = await getProducts().catch(() => []);
  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="page">
      <SiteHeader cartSlot={<CartLink />} categories={categories} />

      <main id="conteudo" className="wrap">
        <div className="pad legal" style={{ paddingTop: "40px", paddingBottom: "24px" }}>
          <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 0.95 }}>{policy.title}</h1>

          {policy.sections.map((section) => (
            <section key={section.title}>
              <h2 className="display legal-h">{section.title}</h2>
              {section.paragraphs.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </section>
          ))}

          <h2 className="display legal-h">Outras políticas</h2>
          <ul>
            {policies
              .filter((p) => p.slug !== policy.slug)
              .map((p) => (
                <li key={p.slug}>
                  <Link href={`/politicas/${p.slug}`} className="link-under">{p.title}</Link>
                </li>
              ))}
          </ul>
        </div>
      </main>

      <SiteFooter categories={categories} />
    </div>
  );
}
