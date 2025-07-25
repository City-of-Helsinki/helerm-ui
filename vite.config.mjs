/* eslint-disable import/no-unresolved */
import react from '@vitejs/plugin-react-swc';
import eslint from 'vite-plugin-eslint';
import macros from 'vite-plugin-babel-macros';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  envPrefix: 'REACT_APP_',
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-macros'],
      },
    }),
    {
      ...eslint(),
      apply: 'serve',
    },
    macros(),
  ],
  build: {
    outDir: './build',
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  define: {
    global: 'globalThis',
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        quietDeps: true,
      },
    },
  },
});
