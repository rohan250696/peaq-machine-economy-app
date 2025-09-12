const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(
  'otf',
  'ttf',
  'woff',
  'woff2'
);

// Node.js polyfills for crypto libraries
config.resolver.alias = {
  crypto: 'crypto-browserify',
  stream: 'stream-browserify',
  buffer: '@craftzdog/react-native-buffer',
  util: 'util',
  assert: 'assert',
  url: 'url',
  path: 'path-browserify',
  zlib: './src/jose-runtime-polyfill.js',
  // Empty modules for Node.js-only modules
  http: './src/empty-module.js',
  https: './src/empty-module.js',
  os: './src/empty-module.js',
  fs: './src/empty-module.js',
  net: './src/empty-module.js',
  tls: './src/empty-module.js',
  child_process: './src/empty-module.js',
};

// Add extraNodeModules for better module resolution
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('@craftzdog/react-native-buffer'),
  util: require.resolve('util'),
  assert: require.resolve('assert'),
  url: require.resolve('url'),
  path: require.resolve('path-browserify'),
  zlib: require.resolve('./src/jose-runtime-polyfill.js'),
  // Empty modules for Node.js-only modules
  http: require.resolve('./src/empty-module.js'),
  https: require.resolve('./src/empty-module.js'),
  os: require.resolve('./src/empty-module.js'),
  fs: require.resolve('./src/empty-module.js'),
  net: require.resolve('./src/empty-module.js'),
  tls: require.resolve('./src/empty-module.js'),
  child_process: require.resolve('./src/empty-module.js'),
};

// Add Node.js modules to resolver
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add resolver configuration for better module resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Configure transformer to handle Node.js modules better
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

// Add unstable_enablePackageExports to handle package.json exports
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
