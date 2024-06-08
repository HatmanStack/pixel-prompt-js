// Buttons.js
import React from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator, Switch } from 'react-native';

const Buttons = ({ activity, longPrompt, setTextInference, switchPromptFunction, promptLengthValue, setParametersWrapper}) => {
  return (
    <>
                  {activity ? (
                    <ActivityIndicator
                      size="large"
                      color="#B58392"
                      style={{ margin: 25 }}
                    />
                  ) : (
                    <>{longPrompt ? 
                    <><View style={[styles.rowContainer, {padding:0}]}>
                    <Pressable
                        onPress={() => {
                          setTextInference(true);
                        }}
                        style={({ pressed }) => [
                          { backgroundColor: pressed ? "#958DA5" : "#9DA58D" ,
                           width: 40, height: 40, borderRadius: 20, margin:10}]}
                      >
                      </Pressable>
                      <View style={styles.columnContainer}>
                      <View style={[styles.rowContainer, {padding:0}]}>
                      <Text
                        style={[
                          { color: promptLengthValue ? "#FFFFFF" : "#9FA8DA", marginRight: 15},
                          styles.sliderText,
                        ]}
                      >
                        Short
                      </Text>
                      <Text
                        style={[
                          { color: promptLengthValue ? "#9FA8DA" : "#FFFFFF", marginRight: 15},
                          styles.sliderText,
                        ]}
                      >
                        Long
                      </Text>
                      </View>
                      <Switch
                        trackColor={{ false: "#958DA5", true: "#767577" }}
                        thumbColor="#B58392"
                        activeThumbColor="#6750A4"
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={switchPromptFunction}
                        value={promptLengthValue}
                      />
                    </View>
                    </View>
                    </> : 
                      <Pressable
                        onPress={() => {
                          setTextInference(true);
                        }}
                        style={({ pressed }) => [
                          { backgroundColor: pressed ? "#958DA5" : "#9DA58D"},
                          styles.button,
                        ]}
                      >
                        {({ pressed }) => (
                          <Text style={styles.promptText}>
                            {pressed ? "PROMPTED!" : "Prompt"}
                          </Text>
                        )}
                      </Pressable>}
                      <Pressable
                        onPress={() => {
                          setParametersWrapper();
                        }}
                        style={({ pressed }) => [
                          { backgroundColor: pressed ? "#9DA58D" : "#958DA5", marginBottom:20 },
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
                  )}</>
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
      padding: 20,
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
  });


export default Buttons;