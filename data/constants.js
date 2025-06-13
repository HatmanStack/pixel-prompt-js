export const DEFAULT_VALUES = {
  STEPS: 28,
  GUIDANCE: 5,
  CONTROL: 1.0,
  DEFAULT_PROMPT: "Avocado Armchair",
  GRID_SIZE: 9,
  COLUMN_COUNT: 3,
  WINDOW_HEIGHT_RATIO: 0.7,
};

export const BREAKPOINTS = {
  SMALL: 600,
  MEDIUM: 1000,
  LARGE: 1400,
  XLARGE: 1700,
};

export const COLUMN_COUNTS = {
  SMALL: 3,
  MEDIUM: 4,
  LARGE: 5,
  XLARGE: 6,
  XXLARGE: 7,
};

export const API_ENDPOINTS = {
  S3_PREFIX: "group-images/",
  CLOUDFRONT_DOMAIN: process.env.EXPO_PUBLIC_CLOUDFRONT_DOMAIN,
};

export const ERROR_MESSAGES = {
  RATE_LIMIT: 'Rate limit exceeded. Please try again later.',
  NETWORK_ERROR: 'Connection issue. Please check your internet.',
  TIMEOUT: 'Request timed out. Please try again.',
  GENERIC: 'An unexpected error occurred. Please try again.',
};

export default DEFAULT_VALUES;
