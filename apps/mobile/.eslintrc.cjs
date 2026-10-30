// Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
/** Boundary: agent code must never import wallet (agent ↛ wallet). */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
  ignorePatterns: ['node_modules/', 'android/', '.expo/'],
  overrides: [
    {
      files: ['src/agent/**/*'],
      rules: {
        'no-restricted-imports': [
          'error',
          { patterns: [{ group: ['**/wallet', '**/wallet/**'], message: 'agent ↛ wallet: wallet/MWA is host-only.' }] },
        ],
      },
    },
  ],
};
