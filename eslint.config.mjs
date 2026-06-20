import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // We intentionally call setState inside effects for external-system
      // synchronization (data fetching, WebSocket lifecycle, prop-driven form
      // resets). Keep this as a warning rather than a hard error.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
