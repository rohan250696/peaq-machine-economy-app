const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(
  'otf',
  'ttf',
  'woff',
  'woff2'
);

// Add Node.js polyfills for crypto libraries
config.resolver.alias = {
  crypto: 'crypto-browserify',
  stream: 'stream-browserify',
  buffer: '@craftzdog/react-native-buffer',
  util: 'util',
  assert: 'assert',
  http: '@expo/metro-runtime/src/empty-module',
  https: '@expo/metro-runtime/src/empty-module',
  os: '@expo/metro-runtime/src/empty-module',
  url: 'url',
  zlib: 'browserify-zlib',
  path: 'path-browserify',
  fs: '@expo/metro-runtime/src/empty-module',
  net: '@expo/metro-runtime/src/empty-module',
  tls: '@expo/metro-runtime/src/empty-module',
  child_process: '@expo/metro-runtime/src/empty-module',
};

// Add Node.js modules to resolver
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add Node.js globals
config.resolver.nodeModulesPaths = [
  require('path').resolve(__dirname, 'node_modules'),
];

// Configure transformer to handle Node.js modules
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer.minifierConfig,
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Add resolver configuration for better module resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
