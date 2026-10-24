import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      // The pi CLI scaffolds runtime state (.pi/gsd hooks etc.) into its cwd
      // when the fulfillment daemon runs concierge passes from the repo root.
      // That state is machine-generated and must not fail the lint gate.
      ".pi/**",
      "coverage/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**"
    ]
  }
]);
