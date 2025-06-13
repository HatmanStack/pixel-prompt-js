export const AI_MODELS = [
  "Stable Diffusion 3.5 Turbo",
  "Black Forest Pro", 
  "Stable Diffusion 3.5 Large", 
  "Recraft v3", 
  "Black Forest Dev", 
  "AWS Nova Canvas", 
  "Imagen 3.0", 
  "OpenAI Dalle3", 
  "Gemini 2.0",
];

export const MODEL_CONFIGS = {
  "Stable Diffusion 3.5 Turbo": {
    maxSteps: 50,
    defaultSteps: 28,
    supportsGuidance: true,
    supportsControl: true,
  },
  "Black Forest Pro": {
    maxSteps: 100,
    defaultSteps: 50,
    supportsGuidance: true,
    supportsControl: false,
  },
  // Add more model-specific configurations as needed
};

export default AI_MODELS;
