import { defineConfig } from 'eslint/config';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import vitestGlobals from "eslint-config-vitest-globals/flat";

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
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      importPlugin.flatConfigs.recommended,
      jsxA11y.flatConfigs.recommended,
      eslintConfigPrettier,
      reactHooks.configs['recommended-latest'],
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
    settings: {
      react: {
        version: 'detect',
      },
      "import/resolver": {
        node: {
          extensions: [
            ".js",
            ".jsx"
          ]
        }
      }
    },
    rules: {
      'react/jsx-uses-react': 1,
      'react/forbid-prop-types': 0,
      'react/prop-types': 1,
      'react/function-component-definition': 0,
      'react/default-props-match-prop-types': 0,
      'react/destructuring-assignment': 0,
      'react/jsx-props-no-spreading': 0,
      'react/jsx-no-constructed-context-values': 0,
      'react/jsx-filename-extension': 0,
      'react/display-name': 0,
      'react/no-access-state-in-setstate': 1,
      'react/no-danger': 1,
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
      'react/no-unstable-nested-components': 0,
      'react/require-default-props': 0,
      'import/extensions': 0,
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
        },
      ],
      'import/no-named-as-default': 0,
      'import/no-named-as-default-member': 0,
      'import/prefer-default-export': 1,
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
