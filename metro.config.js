const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions if needed
config.resolver.assetExts.push(
  // Add any additional asset extensions here
  'bin'
);

// Ensure proper module resolution for our new structure
config.resolver.alias = {
  '@': __dirname,
  '@components': `${__dirname}/components`,
  '@stores': `${__dirname}/stores`,
  '@services': `${__dirname}/services`,
  '@hooks': `${__dirname}/hooks`,
  '@utils': `${__dirname}/utils`,
  '@theme': `${__dirname}/theme`,
  '@styles': `${__dirname}/styles`,
  '@data': `${__dirname}/data`,
};

// Optimize for better performance
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
