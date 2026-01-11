// @ts-check
import serviceConfig from '@packages/eslint-config-service';

export default [
    ...serviceConfig,
    {
        ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**'],
    },
    {
        files: ['src/orm/migration/**/*.ts'],
        rules: {
            'no-relative-import-paths/no-relative-import-paths': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
        },
    },
];
