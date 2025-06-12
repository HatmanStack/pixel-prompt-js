import * as React from "react";
import { StyleSheet, View, Text } from "react-native";
import Slider from "@react-native-community/slider";
import useAppStore from '../store/appStore';

export default function SliderComponent() {
  const {
    setSteps,
    setGuidance,
    setControl,
    steps,      // Current value from store for initialization
    guidance,   // Current value from store for initialization
    control     // Current value from store for initialization
  } = useAppStore(state => ({
    setSteps: state.setSteps,
    setGuidance: state.setGuidance,
    setControl: state.setControl,
    steps: state.steps,
    guidance: state.guidance,
    control: state.control,
  }));

  // Local state for sliders, initialized from the store
  const [samplingValue, setSamplingValue] = React.useState(steps);
  const [guidanceValue, setGuidanceValue] = React.useState(guidance);
  const [controlValue, setControlValue] = React.useState(control); // Local state for control slider

  // Handle sampling steps change
  const handleStepChange = (value) => {
    setSamplingValue(value);
    setSteps(value);
  };

  // Handle guidance change
  const handleGuidanceChange = (value) => {
    const floatValue = parseFloat(value.toFixed(2));
    setGuidanceValue(floatValue);
    setGuidance(floatValue);
  };

  // Handle control change
  const handleControlChange = (value) => {
    const floatValue = parseFloat(value.toFixed(1)); // Control might need different precision
    setControlValue(floatValue);
    setControl(floatValue);
  };

  // Update local state if store changes from elsewhere
  React.useEffect(() => {
    setSamplingValue(steps);
  }, [steps]);

  React.useEffect(() => {
    setGuidanceValue(guidance);
  }, [guidance]);

  React.useEffect(() => {
    setControlValue(control);
  }, [control]);

  return (
    <View style={styles.container}>
      <Text style={styles.captionText}>Sampling Steps</Text>
      <Slider
        style={styles.slider}
        minimumValue={3}
        maximumValue={50}
        step={1}
        value={samplingValue}
        minimumTrackTintColor="#958DA5"
        maximumTrackTintColor="#9DA58D"
        thumbTintColor="#6750A4"
        onValueChange={handleStepChange}
      />
      <Text style={styles.sliderValue}>{samplingValue}</Text>

      <Text style={styles.captionText}>Prompt Guidance</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={10}
        step={0.1}
        value={guidanceValue}
        minimumTrackTintColor="#958DA5"
        maximumTrackTintColor="#9DA58D"
        thumbTintColor="#6750A4"
        onValueChange={handleGuidanceChange}
      />
      <Text style={styles.sliderValue}>{guidanceValue.toFixed(1)}</Text>

      {/* Added Slider for Control */}
      <Text style={styles.captionText}>Control Strength</Text>
      <Slider
        style={styles.slider}
        minimumValue={0.1}
        maximumValue={2.0}
        step={0.1}
        value={controlValue}
        minimumTrackTintColor="#958DA5"
        maximumTrackTintColor="#9DA58D"
        thumbTintColor="#6750A4"
        onValueChange={handleControlChange}
      />
      <Text style={styles.sliderValue}>{controlValue.toFixed(1)}</Text>
    </View>
  );
}

const colors = {
  color: "#FFFFFF",
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 50,
  },
  slider: {
    width: 350,
    height: 40,
  },
  captionText: {
    color: colors.color,
    fontSize: 20,
    textAlign: "center",
    letterSpacing: 3,
    width: 350,
    fontFamily: "Sigmar",
  },
  sliderValue: {
    color: colors.color,
    fontSize: 18,
    letterSpacing: 3,
    textAlign: "center",
    paddingBottom: 30,
    width: 350,
    fontFamily: "Sigmar",
  },
});
