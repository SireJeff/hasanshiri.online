module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true, jest: true },
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', '.next', 'src/_legacy_pages'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react/no-unescaped-entities': 'off',
    // Allow console.log during development
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // Jest globals are now recognized via jest: true env
    'no-undef': 'off',
  },
}
