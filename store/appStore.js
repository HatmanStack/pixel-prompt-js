import { create } from 'zustand';
import { Dimensions } from 'react-native';

const assetImage = require('../assets/avocado.jpg');

const useAppStore = create((set) => ({
  inferredImage: Array(9).fill(assetImage),
  steps: 28,
  guidance: 5,
  control: 1.0,
  galleryLoaded: true,
  prompt: "Avocado Armchair",
  inferredPrompt: null,
  activity: false,
  modelError: false,
  returnedPrompt: Array(9).fill("Avacado Armchair"),
  textInference: false,
  shortPrompt: "", // Should be populated by PromptInference component
  longPrompt: null,  // Should be populated by PromptInference component
  promptLengthValue: false, // false means shortPrompt, true means longPrompt
  modelMessage: "",
  inferrenceButton: null,
  isImagePickerVisible: false,
  imageSource: [],
  soundIncrement: null, // This seems unused if makeSound directly increments its counter
  makeSound: [null, 0], // [soundName, count]
  selectedImageIndex: null,
  columnCount: 3,
  isGuidanceVisible: false,
  loadingStatus: Array(9).fill(false),

  // Setters for individual state properties
  setInferredImage: (inferredImage) => set({ inferredImage }),
  setSteps: (steps) => set({ steps }),
  setGuidance: (guidance) => set({ guidance }),
  setControl: (control) => set({ control }),
  setGalleryLoaded: (galleryLoaded) => set({ galleryLoaded }),
  setPrompt: (prompt) => set({ prompt }),
  setInferredPrompt: (inferredPrompt) => set({ inferredPrompt }),
  setActivity: (activity) => set({ activity }),
  setModelError: (modelError) => set({ modelError }),
  setReturnedPrompt: (returnedPrompt) => set({ returnedPrompt }),
  setTextInference: (textInference) => set({ textInference }),
  setShortPrompt: (shortPrompt) => set({ shortPrompt }),
  setLongPrompt: (longPrompt) => set({ longPrompt }),
  setPromptLengthValue: (promptLengthValue) => set({ promptLengthValue }),
  setModelMessage: (modelMessage) => set({ modelMessage }),
  setInferrenceButton: (inferrenceButton) => set({ inferrenceButton }),
  setIsImagePickerVisible: (isImagePickerVisible) => set({ isImagePickerVisible }),
  setImageSource: (imageSource) => set({ imageSource }),
  // setSoundIncrement: (soundIncrement) => set({ soundIncrement }), // Likely can be removed
  setMakeSound: (makeSound) => set({ makeSound }), // Could be used for direct sound setting if needed
  setSelectedImageIndex: (selectedImageIndex) => set({ selectedImageIndex }),
  setColumnCount: (columnCount) => set({ columnCount }),
  setIsGuidanceVisible: (isGuidanceVisible) => set({ isGuidanceVisible }),
  setLoadingStatus: (loadingStatus) => set({ loadingStatus }),

  // Actions
  setPlaySound: (soundName) => {
    set((state) => ({
      makeSound: [soundName, state.makeSound[1] + 1],
    }));
  },

  switchPromptFunction: () => { // No 'value' argument needed for a toggle
    set((state) => {
      const newPromptLengthValue = !state.promptLengthValue;
      let newInferredPrompt;
      if (newPromptLengthValue) { // If true, use longPrompt
        newInferredPrompt = state.longPrompt;
      } else { // If false, use shortPrompt
        newInferredPrompt = state.shortPrompt;
      }
      return {
        promptLengthValue: newPromptLengthValue,
        inferredPrompt: newInferredPrompt,
        makeSound: ['switch', state.makeSound[1] + 1], // Integrate sound playing
      };
    });
  },

  updateColumnCount: (windowWidth) => {
    let numColumns;
    if (windowWidth < 600) {
      numColumns = 3; // Original logic from MainApp.js
    } else if (windowWidth >= 600 && windowWidth < 1000) {
      numColumns = 4;
    } else if (windowWidth >= 1000 && windowWidth < 1400) {
      numColumns = 5;
    } else if (windowWidth >= 1400 && windowWidth < 1700) {
      numColumns = 6;
    } else {
      numColumns = 7;
    }
    set({ columnCount: numColumns });
  },
}));

export default useAppStore;
