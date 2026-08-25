import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // .cjs files are CommonJS by definition — require() is the only import
    // mechanism, so the no-require-imports rule (aimed at ESM/TS modules)
    // is meaningless for them. This also covers scripts/*.cjs.
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Other generated/build output:
    ".next-live/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "node_modules/**",
    // Vendored third-party agent skills — installed tooling, not project
    // code that this repo lints or owns.
    ".agents/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
