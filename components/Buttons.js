// Buttons.js
import React, { useState } from "react";
import { Dimensions } from 'react-native';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Switch,
  Image,
} from "react-native";

const coloredJoin = require("../assets/join_colored.png");
const joinButton = require("../assets/join.png");

const Buttons = ({
  setPlaySound,
  switchToFlan,
  setInferrenceButton,
  activity,
  longPrompt,
  setTextInference,
  switchPromptFunction,
  promptLengthValue,
  setParametersWrapper,
}) => {
  
  const [comboButtonPressed, setComboButtonPressed] = useState(false);

  const setThePromptValue = () => {
    setComboButtonPressed(false);
    switchPromptFunction();
  }

  const screenWidth = Dimensions.get('window').width;
  const marginLeftPercentage = 0.2; 

  return (
    <>
      {activity ? (
        <ActivityIndicator
          size="large"
          color="#B58392"
          style={{ margin: 25 }}
        />
      ) : (
        <>
          
          <Pressable
            onPress={() => {
              setInferrenceButton(true);
              setParametersWrapper();
              setPlaySound("click");
            }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#9DA58D" : "#958DA5",
                marginBottom: 20,
              },
              styles.button,
            ]}
          >
            {({ pressed }) => (
              <Text style={styles.promptText}>
                {pressed ? "INFERRED!" : "Inference"}
              </Text>
            )}
          </Pressable>
        </>
      )}
    </>
  );
};

const colors = {
  backgroundColor: "#25292e",
  color: "#FFFFFF",
};

const styles = StyleSheet.create({
  rowContainer: {
    backgroundColor: colors.backgroundColor,
    display: "flex",
    flexDirection: "row",
    marginTop: 10,
    overflow: "visible",
    
  },
  columnContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
  },
  button: {
    margin: 10,
    borderRadius: 4,
    paddingHorizontal: 32,
    elevation: 3,
    fontFamily: "Sigmar",
  },
  activityIndicator: {
    marginLeft: 50,
  },
  promptText: {
    color: colors.color,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 2,
    lineHeight: 30,
    fontFamily: "Sigmar",
  },
  sliderText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 2,
    lineHeight: 30,
    fontFamily: "Sigmar",
  },
  changeButton: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center", // change as needed
    elevation: 3, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOffset: { width: 0, height: 2 }, // for iOS shadow
    shadowOpacity: 0.25, // for iOS shadow
    shadowRadius: 3.84, // for iOS shadow
  },
  promptButtonAfter: {
    width: 50, // adjust size as needed
    height: 50, // adjust size as needed
    borderRadius: 25, // half of size to make it circular
    justifyContent: "center",
    alignItems: "center",
    elevation: 3, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOffset: { width: 0, height: 2 }, // for iOS shadow
    shadowOpacity: 0.25, // for iOS shadow
    shadowRadius: 3.84, // for iOS shadow
  },
});

export default Buttons;
