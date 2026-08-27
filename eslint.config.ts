import type { Linter } from "eslint";
import type { RuleOptions } from "@stylistic/eslint-plugin";

import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import ts from "typescript-eslint";
import react from "eslint-plugin-react";
import stylistic from "@stylistic/eslint-plugin";

type StylisticRules = Partial<{
    [K in keyof RuleOptions]: Linter.RuleSeverity | [Linter.RuleSeverity, ...RuleOptions[K]];
}>;

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        ignores: [],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    ts.configs.recommended,
    react.configs.flat.recommended,
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        ignores: [],
        plugins: { "@stylistic": stylistic },
        extends: ["@stylistic/recommended"],
        rules: {
            "@stylistic/indent": ["error", 4],
            "@stylistic/quotes": ["error", "double"],
            "@stylistic/semi": ["error", "always"],
            "@stylistic/arrow-parens": ["error", "always"],
            "@stylistic/brace-style": ["error", "1tbs"],
            "@stylistic/no-trailing-spaces": ["error"],
        } satisfies StylisticRules,
    },
]);
