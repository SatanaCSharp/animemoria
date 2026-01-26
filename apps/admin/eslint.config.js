// @ts-check
import uiConfig from '@packages/eslint-config-ui';

export default [
  ...uiConfig,
  {
    // Ignore generated files from linting
    ignores: ['src/__generated__/**'],
  },
  {
    files: ['src/guards/**'],
    rules: {
      '@typescript-eslint/only-throw-error': 'off',
    },
  },
];
