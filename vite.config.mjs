import react from '@vitejs/plugin-react';
import macros from "vite-plugin-babel-macros";
import eslintPlugin from "@nabla/vite-plugin-eslint";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  base: '/',
  envPrefix: 'REACT_APP_',
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-macros']
      }
    }),
    ...(mode !== 'test' ? [eslintPlugin()] : []),
    macros()
  ],
  build: {
    outDir: './build',
    emptyOutDir: true,
    sourcemap: true,
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
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        quietDeps: true
      },
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js', 'fake-indexeddb/auto'],
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['clover', 'json', 'lcov', 'text'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/__snapshots__/**',
        '**/constants.js'
      ],
      provider: 'istanbul'
    },
    testTimeout: 1000000
  }
}));
