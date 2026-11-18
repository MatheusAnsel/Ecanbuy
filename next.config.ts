import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  // O domínio da loja não é segredo (aparece em todo link de checkout). Ele é copiado para
  // uma variável embutida no bundle para que os links de conta funcionem em componentes client.
  env: { SHOPIFY_ACCOUNT_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN?.trim() ?? "" },
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com", pathname: "/s/files/**" }],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
