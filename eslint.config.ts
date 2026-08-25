import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import { Linter } from "eslint";
import stylistic, { type RuleOptions } from "@stylistic/eslint-plugin";

type StylisticRules = Partial<{
    [K in keyof RuleOptions]: Linter.RuleSeverity | [Linter.RuleSeverity, ...RuleOptions[K]];
}>;

export default defineConfig([
    {
        files: ["eslint.config.ts","packages/*/src/**/*.{js,mjs,cjs,ts,mts,cts}", "packages/*/src/tsdown.config.ts"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node }
    },
    tseslint.configs.recommended,
    {
        files: ["eslint.config.ts","packages/*/src/**/*.{js,mjs,cjs,ts,mts,cts}", "packages/*/src/tsdown.config.ts"],
        plugins: { "@stylistic": stylistic },
        rules: {
            "@stylistic/indent": ["error", 4],
            "@stylistic/quotes": ["error", "double"],
            "@stylistic/semi": ["error", "always"],
            "@stylistic/arrow-parens": ["error", "always"],
            "@stylistic/brace-style": ["error", "1tbs"],
            "@stylistic/no-trailing-spaces": ["error"],
            "@stylistic/object-curly-spacing": ["error", "always"],
            "@stylistic/keyword-spacing": ["error", { after:true, before:true }],
        } satisfies StylisticRules
    },
]);
