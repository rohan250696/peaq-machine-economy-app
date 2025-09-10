const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Customize the HTML template
  config.plugins = config.plugins || [];
  
  // Find and modify the HtmlWebpackPlugin
  const htmlPlugin = config.plugins.find(plugin => 
    plugin.constructor.name === 'HtmlWebpackPlugin'
  );
  
  if (htmlPlugin) {
    // Override the template with our custom one
    htmlPlugin.options.template = './web/index.html';
  }
  
  return config;
};
