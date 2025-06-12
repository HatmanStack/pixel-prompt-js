import React, { useEffect, useState } from "react"; // Added useState
import {
  Pressable,
  StyleSheet,
  TextInput,
  Image,
  View,
  Dimensions
} from "react-native";
import useAppStore from '../store/appStore'; // Import the store
import { colors as themeColors } from '../../styles/theme'; // Import theme colors

export default function PromptInputComponent() { // Remove props
  const setPlaySound = useAppStore((state) => state.setPlaySound);
  const setPrompt = useAppStore((state) => state.setPrompt);
  const inferredPrompt = useAppStore((state) => state.inferredPrompt);
  const setInferredPrompt = useAppStore((state) => state.setInferredPrompt); // For clearing

  const [text, setText] = useState(""); // Keep local state for TextInput

  const textInputStyle = {
    ...styles.input,
    width: Dimensions.get('window').width > 500 ? 500 : "100%",
  };

  useEffect(() => {
    // Update local text when inferredPrompt from store changes
    if (inferredPrompt !== null && inferredPrompt !== undefined) {
      setText(inferredPrompt);
      // No need to call setPrompt(inferredPrompt) here if it's already set by the source of inferredPrompt
    } else if (inferredPrompt === null) {
      // Explicitly clear text if inferredPrompt is cleared
      setText("");
    }
  }, [inferredPrompt]);

  const handleTextChange = (newText) => {
    setText(newText);
    setPrompt(newText); // Update global prompt state as user types
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
      <TextInput
        style={textInputStyle}
        placeholder="Type your prompt here..." // Added placeholder
        multiline
        textAlign="center"
        onChangeText={handleTextChange}
        value={text}
        maxLength={20000} // Consider if this is needed from store
      />
      <Pressable
        style={({ pressed }) => [
          {
            height: 30,
            width: 30,
            backgroundColor: pressed ? "#B58392" : "#3a3c3f",
            borderRadius: 6,
            padding: 10,
            marginTop: 10,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          },
        ]}
        onPress={() => {
          setText(""); // Clear local text
          setPrompt(""); // Clear global prompt state
          setInferredPrompt(null); // Clear inferred prompt in store
          setPlaySound("click");
        }}
      >
        <Image
          source={require("../assets/close.png")}
          style={{
            width: "100%",
            height: "100%",
            resizeMode: "contain",
          }}
        />
      </Pressable>
    </View>
  );
}

// const colors = { // Remove local colors object
//   backgroundColor: "#FFFFFF",
//   borderColor: "#B58392",
//   color: "#000000",
// };

const styles = StyleSheet.create({
  input: {
    backgroundColor: themeColors.text, // Assuming white background from theme's text color
    borderColor: themeColors.highlightBorder,
    borderBottomLeftRadius: 4,
    borderWidth: 4,
    borderBottomRightRadius: 4,
    borderStartWidth: 10,
    borderEndWidth: 10,
    borderRadius: 6,
    height: 200,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 20,
    color: themeColors.background, // Dark text on light background
    fontFamily: "Sigmar",
    marginRight: 10,
  },
});
