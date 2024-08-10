module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
  ],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': ['error', 'always'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'indent': ['error', 2],
    'space-infix-ops': ['error'],
  },
}
