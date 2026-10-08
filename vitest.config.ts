import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    // mesmo alias do tsconfig ("@/*" -> "src/*")
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // A lógica de negócio vive em src/lib e nas server actions. As páginas e os componentes
      // são apresentação sobre essa lógica e ficam de fora da métrica.
      include: ["src/lib/**/*.ts", "src/app/actions.ts"],
      // types.ts são só interfaces e store-config.ts são só textos da loja: não há lógica a cobrir.
      exclude: ["**/*.test.ts", "src/lib/types.ts", "src/lib/store-config.ts"],
      reporter: ["text", "text-summary", "lcov"],
      // Piso exigido no CI: a build falha se a cobertura cair abaixo disto.
      thresholds: { lines: 95, statements: 95, functions: 95, branches: 90 },
    },
  },
});
