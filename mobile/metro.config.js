const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web platform
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Handle React Native web compatibility
config.resolver.alias = {
  'react-native': 'react-native-web',
};

module.exports = config;