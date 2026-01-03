import { CodegenConfig } from '@graphql-codegen/cli';

/**
 * Universal GraphQL Code Generator configuration for React applications
 * This config uses near-operation-file preset to generate types next to GraphQL files
 *
 * Usage in any React app:
 * 1. Add to package.json scripts:
 *    "codegen": "graphql-codegen --config node_modules/@packages/graphql-generated/codegen.config.ts"
 * 2. Run: pnpm codegen
 *
 * Features:
 * - Generates a base types file with all GraphQL schema types
 * - Generates operation-specific types next to each .graphql file
 * - Includes precompiled queries with TypedDocumentNode for better performance
 * - No need to use gql`` template literal - import precompiled queries directly
 * - Automatically runs ESLint and Prettier on generated files for consistent formatting
 */

// Use relative path from node_modules - this works because graphql-codegen resolves paths
// relative to where it's executed from (the app directory)
const schemaPath = './node_modules/@packages/graphql-generated/schema.gql';

const config: CodegenConfig = {
  overwrite: true,
  schema: schemaPath,
  // Look for GraphQL files in the app's src directory
  documents: ['src/**/*.{gql,graphql}'],
  ignoreNoDocuments: true,
  // Run Prettier after code generation to format the output
  hooks: {
    afterAllFileWrite: ['eslint --fix', 'prettier --write'],
  },
  generates: {
    // First, generate base types file with all GraphQL schema types
    './src/__generated__/graphql-shared.type.ts': {
      plugins: ['typescript'],
      config: {
        // Use `unknown` instead of `any` for unconfigured scalars
        defaultScalarType: 'unknown',
        // Apollo Client always includes `__typename` fields
        nonOptionalTypename: true,
        // Apollo Client doesn't add the `__typename` field to root types
        skipTypeNameForRoot: true,
      },
    },
    // Then, generate operation types next to each GraphQL file
    './src/': {
      preset: 'near-operation-file',
      presetConfig: {
        // Reference the base types file generated above
        baseTypesPath: '__generated__/graphql-shared.type.ts',
        // Extension for generated files (will be .generated.ts)
        extension: '.graphql.generated.ts',
        // Folder where generated files will be placed (same as GraphQL file)
        folder: '',
        // Import types when actually used
        dedupeFragments: true,
      },
      plugins: ['typescript-operations', 'typed-document-node'],
      config: {
        avoidOptionals: {
          // Use `null` for nullable fields instead of optionals
          field: true,
          // Allow nullable input fields to remain unspecified
          inputValue: false,
        },
        // Use `unknown` instead of `any` for unconfigured scalars
        defaultScalarType: 'unknown',
        // Apollo Client always includes `__typename` fields
        nonOptionalTypename: true,
        // Apollo Client doesn't add the `__typename` field to root types
        skipTypeNameForRoot: true,
        // Use typed document nodes for precompiled queries
        documentMode: 'documentNode',
        // Add __typename to all selections (Apollo Client v4 requirement)
        addTypename: true,
        // Only import types that are actually used
        onlyOperationTypes: true,
      },
    },
  },
};

export default config;
