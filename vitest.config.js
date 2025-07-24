import { defineConfig, coverageConfigDefaults } from 'vitest/config';
import macros from 'vite-plugin-babel-macros';

export default defineConfig({
  plugins: [macros()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['clover', 'json', 'lcov', 'text'],
      include: ['src/**/*'],
      exclude: [...coverageConfigDefaults.exclude, '**/__snapshots__/**', '**/constants.js'],
      provider: 'istanbul',
    },
    testTimeout: 1000000,
  },
});
