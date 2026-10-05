import js from '@eslint/js';
import globals from 'globals';

// The site loads plain <script> files that share one global scope (data.js -> auth.js -> cart.js -> app.js),
// so functions defined in one file are used from another and from inline handlers in the HTML.
export default [
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/'] },
  js.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.browser, bootstrap: 'readonly' },
    },
    rules: {
      'no-unused-vars': ['error', { vars: 'local', args: 'none' }],
      'no-undef': 'off', // cross-file globals; covered by the unit and end-to-end tests instead
      'no-redeclare': 'error',
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['tests/**/*.js', 'eslint.config.js', 'playwright.config.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node } },
  },
];
