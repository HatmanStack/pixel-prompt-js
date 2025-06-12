// Buttons.js
import React, { useContext, memo } from "react"; // Import memo
import AppContext from "../AppContext"; // Import AppContext
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Switch,
} from "react-native";

const Buttons = ({
  // Props that will remain direct
  longPrompt,
  setTextInference,
  switchPromptFunction,
  promptLengthValue
}) => {
  const {
    setPlaySound,
    setInferrenceButton,
    activity
  } = useContext(AppContext);
  
  const setThePromptValue = () => {
    // switchPromptFunction is a direct prop, no change here
    switchPromptFunction();
  }

  return (
    <>
      {activity ? ( // activity from context
        <ActivityIndicator
          size="large"
          color="#B58392"
          style={{ margin: 25 }}
        />
      ) : (
        <>
          {longPrompt ? ( // longPrompt is a direct prop
            <>
              <View style={[styles.rowContainer]}>
                <Pressable
                  onPress={() => {
                    setTextInference(true); // setTextInference is a direct prop
                    if (setPlaySound) setPlaySound("click"); // setPlaySound from context
                  }}
                  style={({ pressed }) => [
                    {
                      backgroundColor: pressed ? "#958DA5" : "#9DA58D", // Color logic remains
                      width: 40,       // Style remains
                      height: 40,      // Style remains
                      borderRadius: 20,  // Style remains
                      margin: 10,       // Style remains
                    },
                  ]}
                ></Pressable>
                <View style={styles.columnContainer}>
                  <View style={[styles.rowContainer]}>
                    <Text
                      style={[
                        {
                          color: promptLengthValue ? "#FFFFFF" : "#9FA8DA", // promptLengthValue is direct prop
                          marginRight: 15,
                        },
                        styles.sliderText,
                      ]}
                    >
                      Short
                    </Text>
                    <Text
                      style={[
                        {
                          color: promptLengthValue ? "#9FA8DA" : "#FFFFFF", // promptLengthValue is direct prop
                          marginRight: 15,
                        },
                        styles.sliderText,
                      ]}
                    >
                      Long
                    </Text>
                  </View>
                  <View style={[styles.rowContainer, { paddingBottom: 10, justifyContent: "space-between" }]}>
                  <Switch
                    style={{ marginRight: 40 }} 
                    trackColor={{ false: "#958DA5", true: "#767577" }}
                    thumbColor="#B58392"
                    activeThumbColor="#6750A4"
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={setThePromptValue} // Uses direct prop switchPromptFunction
                    value={promptLengthValue} // direct prop
                  />
                  </View>
                </View>
              </View>
            </>
          ) : (
            <Pressable
              onPress={() => {
                setTextInference(true); // direct prop
                if (setPlaySound) setPlaySound("click"); // from context
              }}
              style={({ pressed }) => [
                { backgroundColor: pressed ? "#958DA5" : "#9DA58D" },
                styles.button,
              ]}
            >
              {({ pressed }) => (
                <Text style={styles.promptText}>
                  {pressed ? "PROMPTED!" : "Prompt"}
                </Text>
              )}
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              if (setInferrenceButton) setInferrenceButton(true); // from context
              if (setPlaySound) setPlaySound("click"); // from context
            }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#9DA58D" : "#958DA5", // Color logic remains
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
});

export default memo(Buttons); // Wrap with memo
