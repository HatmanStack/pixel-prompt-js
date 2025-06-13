import { create } from 'zustand';
import { DEFAULT_VALUES } from '../data/constants';

const assetImage = require('../assets/avocado.jpg');

export const useAppStore = create((set, get) => ({
  // Activity and Loading States
  activity: false,
  modelError: false,
  modelMessage: "",
  galleryLoaded: true,
  textInference: false,
  
  // Image States
  inferredImage: Array(DEFAULT_VALUES.GRID_SIZE).fill(assetImage),
  imageSource: [],
  loadingStatus: Array(DEFAULT_VALUES.GRID_SIZE).fill(false),
  selectedImageIndex: null,
  
  // Prompt States
  prompt: DEFAULT_VALUES.DEFAULT_PROMPT,
  inferredPrompt: null,
  returnedPrompt: Array(DEFAULT_VALUES.GRID_SIZE).fill(DEFAULT_VALUES.DEFAULT_PROMPT),
  shortPrompt: "",
  longPrompt: null,
  promptLengthValue: false,
  
  // Model Parameters
  steps: DEFAULT_VALUES.STEPS,
  guidance: DEFAULT_VALUES.GUIDANCE,
  control: DEFAULT_VALUES.CONTROL,
  
  // UI States
  inferrenceButton: null,
  soundIncrement: null,
  makeSound: [null, 0],
  
  // Actions - Activity Management
  setActivity: (activity) => set({ activity }),
  
  setModelError: (error, message = "") => set({ 
    modelError: error, 
    modelMessage: message,
    activity: false // Stop activity when error occurs
  }),
  
  setTextInference: (textInference) => set({ textInference }),
  
  setGalleryLoaded: (loaded) => set({ galleryLoaded: loaded }),
  
  // Actions - Image Management
  setInferredImage: (images) => set({ inferredImage: images }),
  
  updateImageAtIndex: (index, image) => set((state) => ({
    inferredImage: state.inferredImage.map((img, i) => 
      i === index ? image : img
    )
  })),
  
  batchUpdateImages: (updates) => set((state) => {
    const newImages = [...state.inferredImage];
    updates.forEach(({ index, image }) => {
      if (index >= 0 && index < newImages.length) {
        newImages[index] = image;
      }
    });
    return { inferredImage: newImages };
  }),
  
  setImageSource: (imageSource) => set({ imageSource }),
  
  setLoadingStatus: (loadingStatus) => set({ loadingStatus }),
  
  updateLoadingStatusAtIndex: (index, status) => set((state) => ({
    loadingStatus: state.loadingStatus.map((s, i) => 
      i === index ? status : s
    )
  })),
  
  setSelectedImageIndex: (index) => set({ selectedImageIndex: index }),
  
  // Actions - Prompt Management
  setPrompt: (prompt) => set({ prompt }),
  
  setInferredPrompt: (inferredPrompt) => set({ inferredPrompt }),
  
  setReturnedPrompt: (returnedPrompt) => set({ returnedPrompt }),
  
  setShortPrompt: (shortPrompt) => set({ shortPrompt }),
  
  setLongPrompt: (longPrompt) => set({ longPrompt }),
  
  setPromptLengthValue: (value) => set({ promptLengthValue: value }),
  
  // Actions - Model Parameters
  setSteps: (steps) => set({ steps }),
  
  setGuidance: (guidance) => set({ guidance }),
  
  setControl: (control) => set({ control }),
  
  // Actions - UI Management
  setInferrenceButton: (button) => set({ inferrenceButton: button }),
  
  setSoundIncrement: (increment) => set({ soundIncrement: increment }),
  
  setMakeSound: (sound) => {
    const state = get();
    const newIncrement = (state.soundIncrement || 0) + 1;
    set({ 
      soundIncrement: newIncrement,
      makeSound: [sound, newIncrement]
    });
  },
  
  // Complex Actions
  switchPromptFunction: () => {
    const state = get();
    const newValue = !state.promptLengthValue;
    
    set({ promptLengthValue: newValue });
    
    if (newValue) {
      set({ inferredPrompt: state.longPrompt });
    } else {
      set({ inferredPrompt: state.shortPrompt });
    }
    
    // Play sound
    get().setMakeSound("switch");
  },
  
  resetToDefaults: () => set({
    activity: false,
    modelError: false,
    modelMessage: "",
    prompt: DEFAULT_VALUES.DEFAULT_PROMPT,
    inferredPrompt: null,
    steps: DEFAULT_VALUES.STEPS,
    guidance: DEFAULT_VALUES.GUIDANCE,
    control: DEFAULT_VALUES.CONTROL,
    selectedImageIndex: null,
    promptLengthValue: false,
  }),
  
  // Batch state updates for performance
  batchUpdate: (updates) => set((state) => ({
    ...state,
    ...updates
  })),
}));

export default useAppStore;
