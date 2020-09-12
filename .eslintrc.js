module.exports = {
  env: { browser: true, es6: true },
  extends: 'airbnb-base',
  parserOptions: { ecmaVersion: 6 },
  rules: {
    // windows linebreaks when not in production environment
    'linebreak-style': [
      'error',
      process.env.NODE_ENV === 'prod' ? 'unix' : 'windows',
    ],
  },
};
