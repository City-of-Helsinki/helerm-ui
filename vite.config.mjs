import react from '@vitejs/plugin-react';
import eslintPlugin from "@nabla/vite-plugin-eslint";
import { thirdPartyLicenses } from '@city-of-helsinki/license-notices';
import { coverageConfigDefaults, defineConfig } from "vitest/config";

import { thirdPartyLicensesConfig } from './scripts/thirdPartyLicenses.config.mjs';

export default defineConfig(({ mode }) => ({
  base: '/',
  envPrefix: 'REACT_APP_',
  plugins: [
    react(),
    ...(mode !== 'test' ? [eslintPlugin()] : []),
    thirdPartyLicenses(thirdPartyLicensesConfig),
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
    testTimeout: 30000
  }
}));
