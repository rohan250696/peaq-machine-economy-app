module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['@tamagui/core'],
          config: './tamagui.config.ts',
        },
      ],
    ],
  };
};
