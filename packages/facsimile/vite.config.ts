import {resolve} from 'path';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({tsconfigPath: 'tsconfig.lib.json'}),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        /^react/,
        /^@knaw-huc\//,
        /^@globalise\//,
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
  esbuild: {
    minifyIdentifiers: false,
  },
});