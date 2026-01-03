// @ts-check
import uiConfig from '@packages/eslint-config-ui';

export default [
  ...uiConfig,
  {
    // Ignore generated files from linting
    ignores: ['src/__generated__/**'],
  },
];
