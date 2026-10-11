import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CartLink from "@/components/CartLink";
import { getProducts } from "@/lib/shopify";
import { storeConfig } from "@/lib/store-config";
import { accountLink } from "@/lib/shop-links";

export const metadata: Metadata = { title: "Ajuda | EcanBuy" };

export default async function AjudaPage() {
  const products = await getProducts();
  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="page">
      <SiteHeader cartSlot={<CartLink />} categories={categories} />

      <main id="conteudo" className="wrap">
        <div className="pad legal" style={{ paddingTop: "40px", paddingBottom: "24px" }}>
          <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 0.95 }}>Ajuda</h1>

          <h2 id="envio" className="display legal-h">Envio, pagamento e trocas</h2>
          <ul>
            {storeConfig.infoList.map((info) => (
              <li key={info}>{info}</li>
            ))}
          </ul>

          <h2 id="pedido" className="display legal-h">Acompanhe seu pedido</h2>
          <p>
            Depois da compra, o acompanhamento é feito pelo e-mail de confirmação enviado pela Shopify. Se você
            tiver uma conta, também pode ver seus pedidos{" "}
            <a href={accountLink("")} className="link-under">na área do cliente</a>.
          </p>

          <h2 id="acessibilidade" className="display legal-h">Acessibilidade</h2>
          <p>O site foi pensado para ser usado também sem mouse e com leitores de tela:</p>
          <ul>
            <li>Link “Pular para o conteúdo” no início de cada página, acessível pela tecla Tab.</li>
            <li>Foco de teclado sempre visível em links, botões e campos.</li>
            <li>Imagens com texto alternativo e botões com rótulos para leitores de tela.</li>
            <li>Animações reduzidas automaticamente para quem ativa essa opção no sistema.</li>
            <li>Layout que se adapta ao celular e permite aumentar o zoom do navegador.</li>
          </ul>
        </div>
      </main>

      <SiteFooter categories={categories} />
    </div>
  );
}
