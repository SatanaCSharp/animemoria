const path = require('path');
const baseConfig = require('@packages/jest-config-preset');

/**
 * Jest config for admin app.
 * Uses real @packages/ui-shared (HeroUI) — no component mocks. Tests that use
 * HeroUI must render inside UIProvider (see test-utils.tsx). ESM from
 * node_modules (@heroui, @packages/ui-shared, framer-motion) is transformed
 * via transformIgnorePatterns so Jest can load them.
 *
 * @type {import('jest').Config}
 */
module.exports = {
  ...baseConfig,
  testEnvironment: 'jsdom',
  testRegex: '.*\\.spec\\.(ts|tsx)$',
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '**/*.(t|j)sx',
    '!**/i18n.ts', // top-level await + import.meta; not valid under Jest tsconfig
  ],
  setupFilesAfterEnv: ['<rootDir>/../jest.setup.cjs'],
  moduleDirectories: ['<rootDir>', 'node_modules'],
  moduleNameMapper: {
    '^react-i18next$': '<rootDir>/__tests__/utils/react-i18next.ts',
    // Use ui-shared source so ts-jest can compile it (no component mocks)
    '^@packages/ui-shared/hero-ui$': path.resolve(
      __dirname,
      '../../packages/ui-shared/src/hero-ui/index.ts',
    ),
  },
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      { tsconfig: path.resolve(__dirname, 'tsconfig.jest.json') },
    ],
  },
  // Transform ESM from @heroui and framer-motion so Jest can load them
  transformIgnorePatterns: [
    '/node_modules/(?!(@heroui|framer-motion)/)',
  ],
};
