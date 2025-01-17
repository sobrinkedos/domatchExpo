// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Add this to ensure proper MIME types for web bundles
config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  compress: {
    ...config.transformer.minifierConfig?.compress,
    reduce_funcs: false,
  },
};

config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Configuração específica para web
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url.endsWith('.bundle')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
