// craco.config.js
const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@assets':     path.resolve(__dirname, 'src/assets'),
      '@store':      path.resolve(__dirname, 'src/store'),
      '@service':    path.resolve(__dirname, 'src/services'),     
      '@components': path.resolve(__dirname, 'src/components'),
    },
  },
};
