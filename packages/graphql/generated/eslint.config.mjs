// @ts-check
import serviceConfig from '@packages/eslint-config-base';

export default [
    ...serviceConfig,
    {
        ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**'],
    },
];
