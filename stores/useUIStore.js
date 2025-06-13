import { create } from 'zustand';
import { Dimensions } from 'react-native';
import { DEFAULT_VALUES, BREAKPOINTS, COLUMN_COUNTS } from '../data/constants';

export const useUIStore = create((set, get) => ({
  // UI Visibility States
  isGuidanceVisible: false,
  isImagePickerVisible: false,
  
  // Layout States
  columnCount: DEFAULT_VALUES.COLUMN_COUNT,
  reactiveWindowHeight: Dimensions.get('window').height * DEFAULT_VALUES.WINDOW_HEIGHT_RATIO,
  windowWidth: Dimensions.get('window').width,
  windowHeight: Dimensions.get('window').height,
  
  // Responsive States
  isSmallScreen: Dimensions.get('window').width < BREAKPOINTS.MEDIUM,
  isMediumScreen: Dimensions.get('window').width >= BREAKPOINTS.MEDIUM && Dimensions.get('window').width < BREAKPOINTS.LARGE,
  isLargeScreen: Dimensions.get('window').width >= BREAKPOINTS.LARGE,
  
  // Container Width
  isWindowBiggerThanContainer: Dimensions.get('window').width > 600 ? 500 : "100%",
  
  // Actions - Visibility Management
  toggleGuidance: () => set((state) => ({ 
    isGuidanceVisible: !state.isGuidanceVisible 
  })),
  
  setGuidanceVisible: (visible) => set({ isGuidanceVisible: visible }),
  
  toggleImagePicker: () => set((state) => ({ 
    isImagePickerVisible: !state.isImagePickerVisible 
  })),
  
  setImagePickerVisible: (visible) => set({ isImagePickerVisible: visible }),
  
  // Actions - Layout Management
  setColumnCount: (count) => set({ columnCount: count }),
  
  setWindowHeight: (height) => set({ 
    reactiveWindowHeight: height * DEFAULT_VALUES.WINDOW_HEIGHT_RATIO 
  }),
  
  updateWindowDimensions: (width, height) => {
    const columnCount = get().calculateColumnCount(width);
    const isWindowBiggerThanContainer = width > 600 ? 500 : "100%";
    
    set({
      windowWidth: width,
      windowHeight: height,
      reactiveWindowHeight: height * DEFAULT_VALUES.WINDOW_HEIGHT_RATIO,
      columnCount,
      isSmallScreen: width < BREAKPOINTS.MEDIUM,
      isMediumScreen: width >= BREAKPOINTS.MEDIUM && width < BREAKPOINTS.LARGE,
      isLargeScreen: width >= BREAKPOINTS.LARGE,
      isWindowBiggerThanContainer,
    });
  },
  
  // Helper Functions
  calculateColumnCount: (width) => {
    if (width < BREAKPOINTS.SMALL) return COLUMN_COUNTS.SMALL;
    if (width >= BREAKPOINTS.SMALL && width < BREAKPOINTS.MEDIUM) return COLUMN_COUNTS.MEDIUM;
    if (width >= BREAKPOINTS.MEDIUM && width < BREAKPOINTS.LARGE) return COLUMN_COUNTS.LARGE;
    if (width >= BREAKPOINTS.LARGE && width < BREAKPOINTS.XLARGE) return COLUMN_COUNTS.XLARGE;
    return COLUMN_COUNTS.XXLARGE;
  },
  
  // Get responsive container width
  getContainerWidth: () => {
    const state = get();
    return state.isWindowBiggerThanContainer === "100%" 
      ? state.windowWidth - 40 // Full width minus padding
      : state.isWindowBiggerThanContainer;
  },
  
  // Check if current layout should be desktop
  isDesktopLayout: () => {
    const state = get();
    return state.windowWidth > BREAKPOINTS.MEDIUM;
  },
  
  // Get current breakpoint
  getCurrentBreakpoint: () => {
    const { windowWidth } = get();
    if (windowWidth < BREAKPOINTS.SMALL) return 'xs';
    if (windowWidth < BREAKPOINTS.MEDIUM) return 'sm';
    if (windowWidth < BREAKPOINTS.LARGE) return 'md';
    if (windowWidth < BREAKPOINTS.XLARGE) return 'lg';
    return 'xl';
  },
}));

export default useUIStore;
