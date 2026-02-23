import tailwindcss from '@tailwindcss/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
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
    server: {
      proxy: {
        '/graphql': {
          target: env.GRAPHQL_API_GATEWAY_URL,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      commonjsOptions: {
        include: [/node_modules/, /packages/],
      },
    },
  };
});
