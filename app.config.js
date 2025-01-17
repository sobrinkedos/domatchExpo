module.exports = {
  expo: {
    name: 'DomatchApp',
    slug: 'domatch',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.domatch.app'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.domatch.app'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      evolutionApiUrl: process.env.EXPO_PUBLIC_EVOLUTION_API_URL || 'http://localhost:8080',
      evolutionApiKey: process.env.EXPO_PUBLIC_EVOLUTION_API_KEY || 'default-key',
    },
    plugins: [
      'expo-router'
    ],
    scheme: 'domatch'
  }
};
