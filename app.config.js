require('dotenv').config();

export default {
  expo: {
  owner: 'hatmanstack',
  name: 'Pixel Prompt',
  slug: 'pixel-prompt',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  assetBundlePatterns: [
    '**/*'
  ],
  splash: {
    backgroundColor: '#FFFFFF',
  },
  plugins: [
    [
      "expo-font",
      {
        "fonts": ["./assets/Sigmar/Sigmar-Regular.ttf"]
      }
    ]
  ],
  web: {
    favicon: './assets/icon.png',
    
      "output": "single",
      "bundler": "metro"
    
  },
  extra: {
    HF_TOKEN_VAR: process.env.HF_TOKEN,
    AWS_SECRET: process.env.AWS_SECRET,
    AWS_ID: process.env.AWS_ID,
    AWS_LAMBDA_FUNCTION: process.env.AWS_LAMBDA_FUNCTION,
    AWS_REGION: process.env.AWS_REGION,
    S3_BUCKET: process.env.S3_BUCKET,
    eas: {
      projectId: 'c6b10366-df30-4f21-b5a5-1d8266947529'
    }
  },
  runtimeVersion: {
    policy: 'sdkVersion'
  },
  updates: {
    url: 'https://u.expo.dev/c6b10366-df30-4f21-b5a5-1d8266947529'
  },
  android: {
    package: 'gemenielabs.pixel_prompt',
    versionCode: 10,
  },
  ios: {}
}
};
