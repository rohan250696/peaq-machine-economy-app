const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Debug logging
  console.log('🔧 Webpack Config - Environment Variables:');
  console.log('  KBW_APP_WALLET_KEY:', process.env.KBW_APP_WALLET_KEY ? 'SET' : 'NOT SET');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  
  // Ensure plugins array exists
  config.plugins = config.plugins || [];
  
  // Add environment variables using DefinePlugin
  const envVars = {
    'process.env.KBW_APP_WALLET_KEY': JSON.stringify(process.env.KBW_APP_WALLET_KEY || ''),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  };
  
  // Find existing DefinePlugin
  const definePluginIndex = config.plugins.findIndex(plugin => 
    plugin.constructor.name === 'DefinePlugin'
  );
  
  if (definePluginIndex !== -1) {
    // Merge with existing DefinePlugin
    const existingPlugin = config.plugins[definePluginIndex];
    config.plugins[definePluginIndex] = new webpack.DefinePlugin({
      ...existingPlugin.definitions,
      ...envVars
    });
  } else {
    // Add new DefinePlugin
    config.plugins.push(new webpack.DefinePlugin(envVars));
  }
  
  // Customize the HTML template
  const htmlPlugin = config.plugins.find(plugin => 
    plugin.constructor.name === 'HtmlWebpackPlugin'
  );
  
  if (htmlPlugin) {
    htmlPlugin.options.template = './web/index.html';
  }
  
  // Debug: Log final plugin count
  console.log(`📦 Webpack plugins count: ${config.plugins.length}`);
  
  return config;
};
