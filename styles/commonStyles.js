// styles/commonStyles.js
import { StyleSheet } from 'react-native';
import { colors as themeColors } from './theme';

export const commonStyles = StyleSheet.create({
  promptText: {
    color: themeColors.text,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    lineHeight: 30,
    fontFamily: 'System', // Or Sigmar if that was intended from theme
  },
  centeredColumnFlex: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
  },
  baseButton: {
    margin: 10,
    borderRadius: 4,
    paddingHorizontal: 32, // Assuming this was for text inside, might need adjustment if it was for the Pressable itself
    elevation: 3,
    fontFamily: 'Sigmar', // Note: fontFamily on a Pressable/View might not always work as expected, usually applied to Text
  },
  // Add more common styles here later
});
