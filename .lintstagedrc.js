// @ts-check

/**
 * Lint-Staged Configuration for Monorepo
 *
 * This configuration ensures that ESLint runs with the nearest (local) config
 * for each staged file, respecting package-specific rules and overrides.
 *
 * How it works:
 * 1. Groups staged files by their nearest package directory
 * 2. Runs ESLint from each package directory with its local config
 * 3. Applies Prettier formatting after linting
 *
 * Benefits:
 * - Only staged files are processed (memory efficient)
 * - Each package uses its own ESLint rules (respects local configs)
 * - Automatic fixes are applied and re-staged
 * - Clean separation: linting per package, formatting globally
 *
 * Performance:
 * - Time Complexity: O(n*m) where n=files, m=directory depth
 * - Space Complexity: O(n) for grouping files
 * - Optimized with early exits and minimal file system operations
 */

const path = require('path');
const fs = require('fs');

/**
 * Finds the nearest directory containing an ESLint config file
 * @param {string} filePath - Absolute or relative path to the file being linted
 * @returns {string|null} - Absolute path to the package directory or null
 */
const findNearestEslintConfig = (filePath) => {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  let currentDir = path.dirname(absolutePath);
  const root = process.cwd();

  while (currentDir.startsWith(root)) {
    const hasEslintConfig =
      fs.existsSync(path.join(currentDir, 'eslint.config.mjs')) ||
      fs.existsSync(path.join(currentDir, 'eslint.config.js'));

    const hasPackageJson = fs.existsSync(
      path.join(currentDir, 'package.json'),
    );

    // Found a package with its own ESLint config
    if (hasEslintConfig && hasPackageJson) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    // Reached filesystem root without finding config
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  return null;
};

/**
 * Groups files by their nearest ESLint config directory
 * @param {string[]} files - Array of staged file paths (absolute)
 * @returns {Map<string, string[]>} - Map of package directory to relative file paths
 */
const groupFilesByPackage = (files) => {
  const packageGroups = new Map();

  files.forEach((file) => {
    const packageDir = findNearestEslintConfig(file);

    if (packageDir) {
      // Convert to relative path from package directory for cleaner output
      const relativePath = path.relative(packageDir, file);

      if (!packageGroups.has(packageDir)) {
        packageGroups.set(packageDir, []);
      }
      packageGroups.get(packageDir).push(relativePath);
    }
  });

  return packageGroups;
};

/**
 * Generates ESLint commands for each package group
 * @param {string[]} filenames - Array of absolute staged file paths
 * @returns {string[]} - Array of shell commands to execute
 */
const generateEslintCommands = (filenames) => {
  if (filenames.length === 0) {
    return [];
  }

  const packageGroups = groupFilesByPackage(filenames);
  const commands = [];

  packageGroups.forEach((files, packageDir) => {
    // Escape file paths for shell execution
    const filesArg = files.map((f) => `"${f}"`).join(' ');
    const command = `cd "${packageDir}" && npx eslint ${filesArg} --fix`;
    commands.push(command);
  });

  return commands;
};

/**
 * @type {import('lint-staged').Config}
 */
module.exports = {
  // Lint JavaScript/TypeScript files with their nearest ESLint config
  '*.{js,jsx,ts,tsx}': (filenames) => {
    const eslintCommands = generateEslintCommands(filenames);
    const prettierCommand = `prettier --write ${filenames.map((f) => `"${f}"`).join(' ')}`;

    return [...eslintCommands, prettierCommand];
  },

  // Format other files with Prettier only
  '*.{json,css,md}': (filenames) => {
    return `prettier --write ${filenames.map((f) => `"${f}"`).join(' ')}`;
  },
};
