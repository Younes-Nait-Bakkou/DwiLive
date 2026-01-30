import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 1. Global Ignores
  { ignores: ["dist"] },

  // 2. Base Configurations (JS + TS Recommended)
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. React & Custom Rules
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Load React Hooks rules manually since they don't have a flat config helper yet
      ...reactHooks.configs.recommended.rules,

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  // 4. Prettier Config (Must be last!)
  // This disables ESLint rules that conflict with Prettier (indentation, semicolons, etc.)
  eslintConfigPrettier,
]);
