import { tanstackConfig } from "@tanstack/eslint-config";
import { globalIgnores } from "eslint/config";

export default [
  ...tanstackConfig,
  {
    rules: {
      "no-shadow": "off",
      "@typescript-eslint/no-unnecessary-condition": "off"
    },
  },
  globalIgnores(["node_modules", ".output", ".bun"]),
];
