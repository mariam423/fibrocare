import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // "forks" over "threads": on Windows the threads pool intermittently
    // fails to spawn workers ("Timeout waiting for worker to respond"),
    // which aborts the whole run before any test executes. Forks is the
    // upstream Vitest default since v2 for exactly this reason and runs
    // this suite reliably on win32, macOS, and Linux alike.
    pool: "forks",
    testTimeout: 30_000,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["node_modules", ".next", "e2e"],
    coverage: {
      provider: "v8",
      // The AI response logic must stay fully covered: `npm run test --
      // --coverage` fails if any branch in the mock generators regresses.
      include: ["src/lib/ai/mock.ts"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
