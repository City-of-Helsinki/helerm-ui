import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import-x';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import vitestGlobals from "eslint-config-vitest-globals/flat";
import eslintReact from "@eslint-react/eslint-plugin";

export default defineConfig([
  {
    files: ['**/*.{js,jsx,mjs}'],
    ignores: [
      '**/*.scss',
      '**/*.css',
      '**/*.module.css',
      'blueprints/**/files/**',
      'coverage/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'index.html'
    ],
    extends: [
      js.configs.recommended,
      eslintReact.configs.recommended,
      importPlugin.flatConfigs.recommended,
      jsxA11y.flatConfigs.recommended,
      eslintConfigPrettier,
      sonarjs.configs.recommended,
      vitestGlobals()
    ],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        JSX: true,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react': eslintReact
    },
    settings: {
      react: {
        version: '18',
      },
      "import-x/resolver": {
        node: {
          extensions: [
            ".js",
            ".jsx",
            ".ts",
            ".tsx",
            ".json"
          ]
        }
      },
      "import-x/ignore": [
        "node_modules"
      ]
    },
    rules: {
      '@eslint-react/set-state-in-effect': 0,
      '@eslint-react/no-access-state-in-setstate': 1,
      '@eslint-react/display-name': 0,
      '@eslint-react/jsx-filename-extension': 0,
      '@eslint-react/jsx-no-constructed-context-values': 0,
      '@eslint-react/jsx-props-no-spreading': 0,
      '@eslint-react/destructuring-assignment': 0,
      '@eslint-react/default-props-match-prop-types': 0,
      '@eslint-react/function-component-definition': 0,
      '@eslint-react/forbid-prop-types': 0,
      '@eslint-react/exhaustive-deps': 0,
      'jsx-a11y/no-autofocus': 0,
      'jsx-a11y/control-has-associated-label': 1,
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          components: ['Label'],
          required: {
            some: ['nesting', 'id'],
          },
          allowChildren: false,
        },
      ],
      '@eslint-react/no-unstable-nested-components': 0,
      '@eslint-react/require-default-props': 0,
      'import-x/extensions': 0,
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
        },
      ],
      'import-x/no-named-as-default': 0,
      'import-x/no-named-as-default-member': 0,
      'import-x/prefer-default-export': 1,
      'import-x/no-unresolved': ['error', { ignore: ['.css$', '.scss$', 'raw.macro'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'vitest/expect-expect': 0,
      'vitest/valid-title': 0,
      'camelcase': 0,
      'operator-assignment': 1,
      'no-param-reassign': 1,
      'no-underscore-dangle': 1,
      'no-console': 1,
      'no-alert': 1,
      'consistent-return': 1,
    },
  },
]);
