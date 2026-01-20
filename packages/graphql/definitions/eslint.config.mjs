// @ts-check
import serviceConfig from '@packages/eslint-config-service';

export default [
    ...serviceConfig,
    {
        ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**'],
    },
    {
        files: ['src/generate-gql-schema.ts'],
        rules: {
            '@typescript-eslint/no-unsafe-function-type': 'off',
        },
    },
    {
        files: ['src/**/*.ts'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
        },
    },
];
