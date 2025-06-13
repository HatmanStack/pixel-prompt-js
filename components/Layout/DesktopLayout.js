import React from 'react';
import { View } from 'react-native';
import { useUIStore } from '../../stores/useUIStore';
import { commonStyles } from '../../styles/commonStyles';

const DesktopLayout = ({ 
  leftColumn, 
  rightColumn, 
  leftColumnProps = {}, 
  rightColumnProps = {} 
}) => {
  return (
    <View style={commonStyles.rowContainer}>
      {/* Left column */}
      <View style={[commonStyles.leftColumnContainer, leftColumnProps.style]}>
        {leftColumn}
      </View>
      
      {/* Right column */}
      <View style={[commonStyles.rightColumnContainer, rightColumnProps.style]}>
        {rightColumn}
      </View>
    </View>
  );
};

export default DesktopLayout;
