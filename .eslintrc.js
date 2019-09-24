const path = require('path')

module.exports = {
  extends: ['vacuumlabs'],
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  globals: {
   workbox: "readonly"
  },
  plugins: ['react-hooks'],
  rules: {
    semi: [2, 'never'],
    'no-unexpected-multiline': 2,
    'no-duplicate-imports': 0,
    'import/no-duplicates': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
}
