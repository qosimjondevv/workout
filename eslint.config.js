import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    plugins: { react, "react-hooks": reactHooks },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Vite + React 18 avtomatik JSX transform ishlatadi
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // O'zbek matnida apostrof normal belgi ("mashg'ulot", "o'chirish").
      // Har birini &apos; qilib yozish kodni o'qib bo'lmas holga keltiradi.
      "react/no-unescaped-entities": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // Testlar Node'da ishlaydi, brauzerda emas — o'z globallariga ega.
    files: ["tests/**/*.mjs"],
    languageOptions: { globals: { ...globals.node } },
  },
];
