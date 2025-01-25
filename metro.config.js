// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Configuração para corrigir MIME types e caching
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Força o Content-Type correto para bundles
      if (req.url.includes('.bundle')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
      // Desabilita cache
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return middleware(req, res, next);
    };
  },
};

// Configuração do transformer
config.transformer = {
  ...config.transformer,
  minifierPath: require.resolve('metro-minify-terser'),
  minifierConfig: {
    compress: {
      reduce_funcs: false,
    },
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;
