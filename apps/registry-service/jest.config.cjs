const baseConfig = require('@packages/jest-config-preset');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,
  rootDir: './src',
  moduleDirectories: ['<rootDir>'],
};

