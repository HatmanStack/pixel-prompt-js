import React from 'react';
import { View } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';

const MobileLayout = ({ children, style = {} }) => {
  return (
    <View style={[commonStyles.columnContainer, style]}>
      {children}
    </View>
  );
};

export default MobileLayout;
