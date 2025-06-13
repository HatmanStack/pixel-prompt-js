import React, { useCallback } from "react";
import { StyleSheet, View, Text } from "react-native";
import Slider from "@react-native-community/slider";
import { useAppStore } from '../stores/useAppStore';
import { colors, spacing, typography } from '../theme';

export default function SliderComponent() {
  const {
    steps,
    guidance,
    control,
    setSteps,
    setGuidance,
    setControl,
  } = useAppStore();

  const handleStepsChange = useCallback((value) => {
    setSteps(Math.round(value));
  }, [setSteps]);

  const handleGuidanceChange = useCallback((value) => {
    setGuidance(Math.round(value * 10) / 10); // Round to 1 decimal place
  }, [setGuidance]);

  const handleControlChange = useCallback((value) => {
    setControl(Math.round(value * 10) / 10); // Round to 1 decimal place
  }, [setControl]);

  return (
    <View style={styles.container}>
      <View style={styles.sliderGroup}>
        <Text style={styles.label}>Steps: {steps}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={100}
          value={steps}
          onValueChange={handleStepsChange}
          minimumTrackTintColor={colors.success}
          maximumTrackTintColor={colors.buttonBackground}
          thumbStyle={styles.thumb}
          trackStyle={styles.track}
          step={1}
          accessibilityLabel="Steps slider"
          accessibilityHint={`Current value: ${steps}. Adjust the number of generation steps.`}
        />
      </View>

      <View style={styles.sliderGroup}>
        <Text style={styles.label}>Guidance: {guidance}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={20}
          value={guidance}
          onValueChange={handleGuidanceChange}
          minimumTrackTintColor={colors.success}
          maximumTrackTintColor={colors.buttonBackground}
          thumbStyle={styles.thumb}
          trackStyle={styles.track}
          step={0.1}
          accessibilityLabel="Guidance slider"
          accessibilityHint={`Current value: ${guidance}. Adjust the guidance scale.`}
        />
      </View>

      <View style={styles.sliderGroup}>
        <Text style={styles.label}>Control: {control}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={2}
          value={control}
          onValueChange={handleControlChange}
          minimumTrackTintColor={colors.success}
          maximumTrackTintColor={colors.buttonBackground}
          thumbStyle={styles.thumb}
          trackStyle={styles.track}
          step={0.1}
          accessibilityLabel="Control slider"
          accessibilityHint={`Current value: ${control}. Adjust the control strength.`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.secondary,
    borderRadius: spacing.borderRadius.large,
    marginVertical: spacing.md,
  },

  sliderGroup: {
    marginBottom: spacing.md,
  },

  label: {
    color: colors.text,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.primary,
  },

  slider: {
    width: '100%',
    height: 40,
  },

  thumb: {
    backgroundColor: colors.accent,
    width: 20,
    height: 20,
  },

  track: {
    height: 4,
    borderRadius: 2,
  },
});
