import React, { useEffect } from "react";
import { StyleSheet, TextInput, useWindowDimensions } from "react-native";

export default function PromptInputComponent({ setPrompt, inferredPrompt }) {
  const [text, setText] = React.useState("");
  const { width } = useWindowDimensions();

  const textInputStyle = {
    ...styles.input,
    width: width > 500 ? 500 : width - 80,
  };

  useEffect(() => {
    setText(inferredPrompt);
    setPrompt(inferredPrompt);
  }, [inferredPrompt]);

  const handleTextChange = (x) => {
    setText(x);
    setPrompt(x);
  };

  return (
    <TextInput
      style={textInputStyle}
      placeholder="Avocado Armchair"
      multiline
      textAlign="center"
      onChangeText={handleTextChange}
      value={text}
      maxLength={20000}
    />
  );
}

const colors = {
  backgroundColor: "#FFFFFF",
  borderColor: "#B58392",
  color: "#000000",
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
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
    color: colors.color,
    fontFamily: "Sigmar",
  },
});
