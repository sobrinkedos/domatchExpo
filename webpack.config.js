const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    // Configuração moderna para web
    pwa: false,
    isInterstitialPage: false,
    https: false
  }, argv);

  // Configuração atualizada de resolução de módulos
  config.resolve = {
    ...config.resolve,
    alias: {
      '@': path.resolve(__dirname, './'),
      'react-native$': 'react-native-web'
    },
    extensions: [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions
    ]
  };

  // Remover configurações obsoletas
  delete config.devServer.static.mimeTypes;
  delete config.module.rules[config.module.rules.length - 1];

  return config;
};
