import React, { useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useAppStore } from '../stores/useAppStore';
import { commonStyles } from '../styles/commonStyles';
import { colors, spacing, typography } from '../theme';

const Buttons = () => {
  const {
    activity,
    longPrompt,
    promptLengthValue,
    setTextInference,
    switchPromptFunction,
    setMakeSound,
  } = useAppStore();

  const handlePromptGeneration = useCallback(() => {
    setTextInference(true);
    setMakeSound("click");
  }, [setTextInference, setMakeSound]);

  const handlePromptSwitch = useCallback(() => {
    switchPromptFunction();
  }, [switchPromptFunction]);

  if (activity) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.accent}
        style={commonStyles.loadingIndicator}
      />
    );
  }

  if (!longPrompt) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <Pressable
          onPress={handlePromptGeneration}
          style={({ pressed }) => [
            styles.promptButton,
            pressed && styles.promptButtonPressed
          ]}
          accessibilityLabel="Generate prompt"
          accessibilityHint="Generate a new AI prompt"
        >
          <Text style={styles.promptButtonText}>✨</Text>
        </Pressable>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>
            {promptLengthValue ? "Long" : "Short"}
          </Text>
          <Switch
            trackColor={{ 
              false: colors.buttonBackground, 
              true: colors.success 
            }}
            thumbColor={promptLengthValue ? colors.text : colors.textSecondary}
            ios_backgroundColor={colors.buttonBackground}
            onValueChange={handlePromptSwitch}
            value={promptLengthValue}
            style={styles.switch}
            accessibilityLabel="Toggle prompt length"
            accessibilityHint="Switch between short and long prompt versions"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },

  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },

  promptButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  promptButtonPressed: {
    backgroundColor: colors.button,
    transform: [{ scale: 0.95 }],
  },

  promptButtonText: {
    fontSize: typography.fontSize.large,
    textAlign: 'center',
  },

  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  switchLabel: {
    color: colors.text,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.system,
    minWidth: 50,
    textAlign: 'center',
  },

  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
});

export default Buttons;
