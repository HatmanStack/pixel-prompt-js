module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add module resolver for better imports
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@components': './components',
            '@stores': './stores',
            '@services': './services',
            '@hooks': './hooks',
            '@utils': './utils',
            '@theme': './theme',
            '@styles': './styles',
            '@data': './data',
          },
        },
      ],
    ],
  };
};
