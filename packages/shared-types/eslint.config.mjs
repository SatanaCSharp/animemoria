// @ts-check
import baseConfig from '@packages/eslint-config-base';

export default [
    ...baseConfig,
    {
        ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**'],
    },
];
