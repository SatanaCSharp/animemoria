import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/buttons/index.ts',
    'src/inputs/index.ts',
    'src/dropdowns/index.ts',
    'src/icons/index.ts',
    'src/hero-ui/index.ts',
  ],
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react'],
  dts: true,
  format: ['esm'],
});
