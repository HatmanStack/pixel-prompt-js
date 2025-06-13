import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export const commonStyles = StyleSheet.create({
  // Container styles
  container: {
    backgroundColor: colors.primary,
    padding: spacing.containerPadding,
  },
  
  titleContainer: {
    backgroundColor: colors.backgroundColor,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.containerPadding,
  },
  
  rowContainer: {
    backgroundColor: colors.backgroundColor,
    display: "flex",
    flexDirection: "row",
    marginTop: spacing.marginSmall,
    overflow: "visible",
    padding: spacing.containerPadding,
  },
  
  columnContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
  },
  
  leftColumnContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
    marginRight: spacing.marginSmall,
  },
  
  rightColumnContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    marginLeft: spacing.marginSmall,
  },
  
  // Button styles
  button: {
    margin: spacing.marginSmall,
    borderRadius: spacing.borderRadius.small,
    paddingHorizontal: spacing.xl,
    elevation: 3,
    fontFamily: typography.fontFamily.primary,
  },
  
  buttonPressed: {
    backgroundColor: colors.buttonPressed,
  },
  
  // Text styles
  text: {
    color: colors.text,
    fontFamily: typography.fontFamily.system,
  },
  
  promptText: {
    color: colors.text,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold,
    textAlign: "center",
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: typography.lineHeight.relaxed,
    fontFamily: typography.fontFamily.system,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.borderColor,
    borderBottomLeftRadius: spacing.borderRadius.small,
    borderWidth: 4,
    borderBottomRightRadius: spacing.borderRadius.small,
    borderStartWidth: 10,
    borderEndWidth: 10,
    borderRadius: spacing.borderRadius.medium,
    height: 200,
    paddingLeft: spacing.marginSmall,
    paddingRight: spacing.marginSmall,
    fontSize: typography.fontSize.large,
    color: colors.textDark,
    fontFamily: typography.fontFamily.primary,
    marginRight: spacing.marginSmall,
  },
  
  // ScrollView styles
  scrollView: {
    backgroundColor: colors.backgroundColor,
    marginTop: 50,
    padding: 5,
  },
  
  // Image styles
  imageCard: {
    width: "100%",
    borderRadius: spacing.borderRadius.large,
    marginTop: spacing.containerPadding,
    marginBottom: spacing.containerPadding,
    alignSelf: "center", 
    backgroundColor: colors.backgroundColor, 
    elevation: 3, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 3.84, 
  },
  
  imageGridContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.marginSmall,
    minHeight: 200,
  },
  
  // Loading styles
  loadingIndicator: {
    margin: spacing.marginLarge,
  },
});

export default commonStyles;
