import React, { useEffect, useContext, memo } from "react"; // Added useContext and memo
import AppContext from "../AppContext"; // Import AppContext
import {
  Pressable,
  StyleSheet,
  TextInput,
  Image,
  View,
  Dimensions
} from "react-native";

const PromptInputComponent = ({ inferredPrompt }) => { // Changed to const arrow function
  const { setPlaySound, setPrompt } = useContext(AppContext); // Consuming from context
  const [text, setText] = React.useState("");

  const textInputStyle = {
    ...styles.input,
    width: Dimensions.get('window').width > 500 ? 500 : "100%",
  };

  useEffect(() => {
    if (inferredPrompt) {
      setText(inferredPrompt);
      if (setPrompt) { // Check if setPrompt from context is available
        setPrompt(inferredPrompt);
      }
    } else if (inferredPrompt === null || inferredPrompt === "") {
      // If inferredPrompt is explicitly cleared, clear local text.
      setText("");
      // if (setPrompt) setPrompt(""); // Optional: clear context prompt as well
    }
  }, [inferredPrompt, setPrompt]); // Added setPrompt to dependency array

  const handleTextChange = (x) => {
    setText(x);
    if (setPrompt) { // Check if setPrompt from context is available
      setPrompt(x);
    }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
      <TextInput
        style={textInputStyle}
        placeholder=""
        multiline
        textAlign="center"
        onChangeText={handleTextChange}
        value={text}
        maxLength={20000}
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
          setText("");
          if (setPrompt) { // Check if setPrompt from context is available
            setPrompt("");
          }
          if (setPlaySound) { // Check if setPlaySound from context is available
            setPlaySound("click");
          }
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
}; // Added semicolon for const arrow function style

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
    marginRight: 10,
  },
});

export default memo(PromptInputComponent); // Wrapped with memo
