const tailwindcss = require('tailwindcss');

module.exports = {
  plugins: [
    tailwindcss('./tailwind.js'),
    require('cssnano')({
      preset: [
        'default',
        { discardComments: { removeAll: true } }
      ]
    })
  ]
};
