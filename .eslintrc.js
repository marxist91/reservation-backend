// .eslintrc.js
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script', // CommonJS (require) instead of ES modules (import)
  },
  extends: [
    'eslint:recommended',
  ],
  rules: {
    'no-console': 'off', // Allow console in Node.js backend
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
ignorePatterns: [
  'node_modules/',
  'dist/',
  'coverage/',
  '*.config.js',
  'data/',
  '**/*.sock'
],
};