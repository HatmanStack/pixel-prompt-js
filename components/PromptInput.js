import React, { useEffect, useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  Image,
  View,
} from "react-native";
import { useAppStore } from '../stores/useAppStore';
import { useUIStore } from '../stores/useUIStore';
import { commonStyles } from '../styles/commonStyles';
import { colors, spacing } from '../theme';

export default function PromptInputComponent() {
  const [text, setText] = React.useState("");
  
  // Zustand store hooks
  const { 
    prompt, 
    inferredPrompt, 
    setPrompt, 
    setMakeSound 
  } = useAppStore();
  
  const { 
    isWindowBiggerThanContainer 
  } = useUIStore();

  const textInputStyle = {
    ...commonStyles.input,
    width: isWindowBiggerThanContainer,
  };

  useEffect(() => {
    if (inferredPrompt) {
      setText(inferredPrompt);
      setPrompt(inferredPrompt);
    }
  }, [inferredPrompt, setPrompt]);

  const handleTextChange = useCallback((newText) => {
    setText(newText);
    setPrompt(newText);
  }, [setPrompt]);

  const handleClear = useCallback(() => {
    setText("");
    setPrompt("");
    setMakeSound("click");
  }, [setPrompt, setMakeSound]);

  return (
    <View style={styles.container}>
      <TextInput
        style={textInputStyle}
        placeholder=""
        multiline
        textAlign="center"
        onChangeText={handleTextChange}
        value={text}
        maxLength={20000}
        accessibilityLabel="Prompt input"
        accessibilityHint="Enter your image generation prompt here"
      />
      <Pressable
        style={({ pressed }) => [
          styles.clearButton,
          pressed && styles.clearButtonPressed
        ]}
        onPress={handleClear}
        accessibilityLabel="Clear prompt"
        accessibilityHint="Clear the current prompt text"
      >
        <Image
          source={require("../assets/close.png")}
          style={styles.clearIcon}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", 
    alignItems: "flex-end"
  },
  
  clearButton: {
    height: 30,
    width: 30,
    backgroundColor: colors.secondary,
    borderRadius: spacing.borderRadius.medium,
    padding: spacing.marginSmall,
    marginTop: spacing.marginSmall,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  
  clearButtonPressed: {
    backgroundColor: colors.accent,
  },
  
  clearIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
