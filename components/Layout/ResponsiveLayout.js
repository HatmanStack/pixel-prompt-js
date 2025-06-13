import React from 'react';
import { View } from 'react-native';
import { useUIStore } from '../../stores/useUIStore';
import { useWindowDimensions } from '../../hooks/useWindowDimensions';
import DesktopLayout from './DesktopLayout';
import MobileLayout from './MobileLayout';
import { commonStyles } from '../../styles/commonStyles';

const ResponsiveLayout = ({ children }) => {
  const { isDesktopLayout } = useWindowDimensions();
  const isLargeScreen = useUIStore(state => state.isLargeScreen);
  
  // Use desktop layout for screens wider than 1000px
  if (isDesktopLayout && isLargeScreen) {
    return <DesktopLayout>{children}</DesktopLayout>;
  }
  
  return <MobileLayout>{children}</MobileLayout>;
};

export default ResponsiveLayout;
