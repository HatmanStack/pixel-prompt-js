import React, { useCallback } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { useAppStore } from '../stores/useAppStore';
import { colors, spacing, typography } from '../theme';

const Expand = ({ isGuidance, visible, toggleVisibility }) => {
  const { setMakeSound } = useAppStore();

  const handlePress = useCallback(() => {
    setMakeSound("click");
    toggleVisibility();
  }, [setMakeSound, toggleVisibility]);

  const buttonText = isGuidance ? "?" : "📁";
  const accessibilityLabel = isGuidance ? "Toggle guidance" : "Toggle image picker";
  const accessibilityHint = isGuidance 
    ? "Show or hide usage guidance" 
    : "Show or hide image gallery";

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          visible && styles.buttonActive
        ]}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ expanded: visible }}
      >
        <Text style={[
          styles.buttonText,
          visible && styles.buttonTextActive
        ]}>
          {buttonText}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },

  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.buttonBackground,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },

  buttonPressed: {
    backgroundColor: colors.button,
    transform: [{ scale: 0.95 }],
  },

  buttonActive: {
    backgroundColor: colors.success,
  },

  buttonText: {
    fontSize: typography.fontSize.large,
    color: colors.text,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },

  buttonTextActive: {
    color: colors.primary,
  },
});

export default Expand;
