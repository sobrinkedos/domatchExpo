const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Configurar regras para arquivos JavaScript
  config.module.rules.push({
    test: /\.bundle$/,
    use: {
      loader: 'bundle-loader',
      options: {
        name: '[name]',
      },
    },
    type: 'javascript/auto'
  });

  // Configurar MIME types
  config.devServer = {
    ...config.devServer,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/javascript'
    }
  };

  return config;
};
