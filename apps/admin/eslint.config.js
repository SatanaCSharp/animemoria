// @ts-check
import uiConfig from '@packages/eslint-config-ui';

export default [
  ...uiConfig,
  {
    // Ignore generated files, coverage output, and config files outside tsconfig
    ignores: [
      'src/__generated__/**',
      'coverage/**',
      'jest.config.cjs',
      'jest.setup.cjs',
    ],
  },
  {
    files: ['src/guards/**'],
    rules: {
      '@typescript-eslint/only-throw-error': 'off',
    },
  },
];
