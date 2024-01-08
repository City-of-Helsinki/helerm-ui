/* eslint-disable import/no-unresolved */
import path from 'path';

import react from '@vitejs/plugin-react-swc';
import eslint from 'vite-plugin-eslint';
import macros from "vite-plugin-babel-macros"
import { defineConfig, coverageConfigDefaults } from "vitest/config";
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  base: '/',
  envPrefix: 'REACT_APP_',
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-macros']
      }
    }),
    nodePolyfills(),
    eslint(),
    macros()
  ],
  resolve: {
    alias: {
      '~bootstrap-sass': path.resolve(__dirname, 'node_modules/bootstrap-sass'),
      '~@fortawesome': path.resolve(__dirname, 'node_modules/@fortawesome'),
      '~react-datepicker': path.resolve(__dirname, 'node_modules/react-datepicker'),
      '~react-redux-toastr': path.resolve(__dirname, 'node_modules/react-redux-toastr')
    }
  },
  build: {
    outDir: './build',
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 3000
  },
  preview: {
    port: 3000
  },
  define: {
    global: 'globalThis'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['clover', 'json', 'lcov', 'text'],
      include: ['src/**/*'],
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/__snapshots__/**',
        '**/constants.js'
      ],
      provider: 'istanbul'
    },
    testTimeout: 1000000
  }
})
