import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";

export default [
    // 1. Global Ignores (Don't lint generated files)
    {
        ignores: ["dist/**", "node_modules/**", "coverage/**"],
    },

    // 2. Configuration for all TS/JS files
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node, // Tells ESLint that 'process', '__dirname', etc. are valid
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            prettier: prettierPlugin,
        },
        rules: {
            // Load standard recommended rules
            ...pluginJs.configs.recommended.rules,
            ...tseslint.configs.recommended.rules,

            // Turn Prettier formatting issues into ESLint errors
            "prettier/prettier": "error",

            // --- Custom Rules for Express/Backend ---

            // Allow unused variables ONLY if they start with "_"
            // Useful for Express: app.use((err, req, res, _next) => { ... })
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],

            // Warn if you use 'any' (keeps you honest with your types)
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
];
