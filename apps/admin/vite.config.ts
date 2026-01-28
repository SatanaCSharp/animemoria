import tailwindcss from '@tailwindcss/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const config = defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    viteReact(),
  ],
  optimizeDeps: {
    include: [
      '@packages/shared-types/errors',
      '@packages/shared-types/enums',
      '@packages/shared-types/utils',
      '@packages/utils/asserts',
      '@packages/utils/predicates',
      '@packages/utils/type-guards',
      '@packages/utils/async',
    ],
  },
  build: {
    outDir: 'dist',
    commonjsOptions: {
      include: [/node_modules/, /packages/],
    },
  },
});

export default config;
