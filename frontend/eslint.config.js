const eslint = require("@eslint/js");
const globals = require("globals");
const tseslint = require("typescript-eslint");
const prettierConfig = require("eslint-config-prettier");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const unusedImports = require("eslint-plugin-unused-imports");

const ignores = ["*.js"];

module.exports = tseslint.config(
  {
    ...eslint.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...eslint.configs.recommended.rules,
      "no-unused-vars": "off",
      eqeqeq: "error",
      "prefer-const": "error",
    },
    ignores,
  },
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    plugins: {
      ...config.plugins,
      "unused-imports": unusedImports,
    },
    rules: {
      ...config.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
    ignores,
  })),
  prettierConfig,
  eslintPluginPrettierRecommended,
);
