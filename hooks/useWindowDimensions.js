import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import { useUIStore } from '../stores/useUIStore';

export const useWindowDimensions = () => {
  const updateWindowDimensions = useUIStore(state => state.updateWindowDimensions);
  const windowWidth = useUIStore(state => state.windowWidth);
  const windowHeight = useUIStore(state => state.windowHeight);
  const isDesktopLayout = useUIStore(state => state.isDesktopLayout);
  const getCurrentBreakpoint = useUIStore(state => state.getCurrentBreakpoint);
  
  useEffect(() => {
    const handleResize = ({ window }) => {
      updateWindowDimensions(window.width, window.height);
    };
    
    // Initial setup
    const { width, height } = Dimensions.get('window');
    updateWindowDimensions(width, height);
    
    // Listen for dimension changes
    const subscription = Dimensions.addEventListener('change', handleResize);
    
    return () => subscription?.remove();
  }, [updateWindowDimensions]);
  
  return {
    windowWidth,
    windowHeight,
    isDesktopLayout: isDesktopLayout(),
    currentBreakpoint: getCurrentBreakpoint(),
  };
};

export default useWindowDimensions;
