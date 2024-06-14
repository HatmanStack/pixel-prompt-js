import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Pressable,
  useWindowDimensions,
  Image,
  LogBox,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import { HfInference } from "@huggingface/inference";
import { registerRootComponent } from "expo";

import SliderComponent from "./components/Slider";
import PromptInputComponent from "./components/PromptInput";
import BreathingComponent from "./components/Breathing";
import DropDownComponent from "./components/DropDown";
import MyImagePicker from "./components/ImagePicker";
import Buttons from "./components/Buttons";
import Expand from "./components/Expand";
import PromptInference from "./components/Prompt";
import Inference from "./components/Inference";

const HF_TOKEN = Constants.expoConfig.extra.HF_TOKEN_VAR;
const inference = new HfInference(HF_TOKEN);
const assetImage = require("./assets/avocado.jpg");
LogBox.ignoreLogs([/StyleSheet\.compose/]);

const App = () => {
  useFonts({ Sigmar: require("./assets/Sigmar/Sigmar-Regular.ttf") });
  const [inferredImage, setInferredImage] = useState(assetImage);
  const [steps, setSteps] = useState(30);
  const [guidance, setGuidance] = useState(7);
  const [modelID, setModelID] = useState(
    "stabilityai/stable-diffusion-xl-base-1.0"
  );
  const [prompt, setPrompt] = useState("Avocado Armchair");
  const [inferredPrompt, setInferredPrompt] = useState("");
  const [parameters, setParameters] = useState(null);
  const [activity, setActivity] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [returnedPrompt, setReturnedPrompt] = useState("Avocado Armchair");
  const [textInference, setTextInference] = useState(null);
  const window = useWindowDimensions();
  const [promptLengthValue, setPromptLengthValue] = useState(false);
  const [shortPrompt, setShortPrompt] = useState("");
  const [longPrompt, setLongPrompt] = useState(null);
  const [modelMessage, setModelMessage] = useState("");
  const [inferrenceButton, setInferrenceButton] = useState(null);
  const [isImagePickerVisible, setImagePickerVisible] = useState(false);
  const [imageSource, setImageSource] = useState([assetImage]);
  const [settingSwitch, setSettingSwitch] = useState(false);
  const [styleSwitch, setStyleSwitch] = useState(false);
  const [flanPrompt, setFlanPrompt] = useState(null);
  const [comboButtonPressed, setComboButtonPressed] = useState(false);
  const circleImage = require("./assets/circle.png");

  const passModelIDWrapper = (x) => {
    setModelError(false);
    setModelID(x);
  };

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          // Notify user or automatically reload
          await Updates.reloadAsync();
        }
      } catch (e) {
        console.log(e);
      }
    };

    checkForUpdates();
  }, []);

  const swapImage = () => {
    setInferredImage(imageSource);
    setImageSource(inferredImage);
  };

  const switchToFlan = () => {
    setInferredPrompt(flanPrompt);
  };

  const setParametersWrapper = () => {
    setInferrenceButton(true);
    setParameters(`${prompt}-${steps}-${guidance}-${modelID}`);
  };

  const switchPromptFunction = () => {
    setPromptLengthValue(!promptLengthValue);
    if (promptLengthValue) {
      setInferredPrompt(shortPrompt);
    } else {
      setInferredPrompt(longPrompt);
    }
    setComboButtonPressed(false);
  };

  return (
    // Main container
    <View style={styles.titlecontainer}>
      <PromptInference
        setFlanPrompt={setFlanPrompt}
        prompt={prompt}
        textInference={textInference}
        setTextInference={setTextInference}
        setLongPrompt={setLongPrompt}
        setShortPrompt={setShortPrompt}
        setInferredPrompt={setInferredPrompt}
        promptLengthValue={promptLengthValue}
        setActivity={setActivity}
        setModelError={setModelError}
      />
      <Inference
        setInferrenceButton={setInferrenceButton}
        inferrenceButton={inferrenceButton}
        setModelMessage={setModelMessage}
        parameters={parameters}
        modelID={modelID}
        prompt={prompt}
        isImagePickerVisible={isImagePickerVisible}
        styleSwitch={styleSwitch}
        settingSwitch={settingSwitch}
        guidance={guidance}
        steps={steps}
        setActivity={setActivity}
        setModelError={setModelError}
        setReturnedPrompt={setReturnedPrompt}
        setInferredImage={setInferredImage}
      />
      <BreathingComponent />
      <ScrollView
        scrollY={true}
        style={styles.ScrollView}
        showsVerticalScrollIndicator={false}
      >
        {window.width > 1000 ? (
          <View style={styles.rowContainer}>
            {/* Left column */}
            {isImagePickerVisible && (
              <Pressable
                onPress={() => {
                  swapImage();
                }}
                style={[
                  styles.swapButton,
                  {
                    top: window.height / 2 - 15,
                    left: window.width / 2 - 15,
                  },
                ]}
              >
                <Image
                  source={circleImage}
                  style={styles.changeButton}
                />
              </Pressable>
            )}

            <View style={styles.leftColumnContainer}>
              <View>
                <PromptInputComponent
                  setPrompt={setPrompt}
                  inferredPrompt={inferredPrompt}
                />
              </View>
              <View style={[styles.rowContainer, { padding: 0 }]}>
                <DropDownComponent
                  passModelID={passModelIDWrapper}
                  
                />
                <View style={styles.columnContainer}>
                  <Buttons
                    comboButtonPressed={comboButtonPressed}
                    setComboButtonPressed={setComboButtonPressed}
                    switchToFlan={switchToFlan}
                    activity={activity}
                    longPrompt={longPrompt}
                    setTextInference={setTextInference}
                    switchPromptFunction={switchPromptFunction}
                    promptLengthValue={promptLengthValue}
                    setParametersWrapper={setParametersWrapper}
                  />
                  {modelError ? (
                    <Text style={styles.promptText}>{modelMessage}</Text>
                  ) : (
                    <></>
                  )}
                </View>
              </View>

              <View>
                <Expand
                  isImagePickerVisible={isImagePickerVisible}
                  setImagePickerVisible={setImagePickerVisible}
                  window={window}
                />
                {isImagePickerVisible && (
                  <MyImagePicker
                    imageSource={imageSource}
                    setImageSource={setImageSource}
                    styleSwitch={styleSwitch}
                    setStyleSwitch={setStyleSwitch}
                    settingSwitch={settingSwitch}
                    setSettingSwitch={setSettingSwitch}
                  />
                )}
                <SliderComponent
                  setSteps={setSteps}
                  setGuidance={setGuidance}
                />
              </View>
            </View>
            <View style={styles.rightColumnContainer}>
              {inferredImage && (
                <Image
                  source={
                    typeof inferredImage === "number"
                      ? inferredImage
                      : { uri: inferredImage }
                  }
                  style={styles.imageStyle}
                />
              )}
              <Text style={styles.promptText}>{returnedPrompt}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.columnContainer}>
            <PromptInputComponent
              setPrompt={setPrompt}
              inferredPrompt={inferredPrompt}
            />
            <DropDownComponent
              passModelID={passModelIDWrapper}
              
            />
            <Buttons
              comboButtonPressed={comboButtonPressed}
              setComboButtonPressed={setComboButtonPressed}
              switchToFlan={switchToFlan}
              activity={activity}
              longPrompt={longPrompt}
              setTextInference={setTextInference}
              switchPromptFunction={switchPromptFunction}
              promptLengthValue={promptLengthValue}
              setParametersWrapper={setParametersWrapper}
            />
            {modelError ? (
              <Text style={styles.promptText}>{modelMessage}</Text>
            ) : (
              <></>
            )}
            <Expand
              isImagePickerVisible={isImagePickerVisible}
              setImagePickerVisible={setImagePickerVisible}
              window={window}
            />
            {isImagePickerVisible && (
              <>
                <MyImagePicker
                  imageSource={imageSource}
                  setImageSource={setImageSource}
                  styleSwitch={styleSwitch}
                  setStyleSwitch={setStyleSwitch}
                  settingSwitch={settingSwitch}
                  setSettingSwitch={setSettingSwitch}
                />
                <Pressable
                  onPress={() => {
                    swapImage();
                  }}
                  style={styles.swapButtonColumn}
                >
                  <Image
                    source={circleImage}
                    style={styles.changeButton}
                  />
                </Pressable>
              </>
            )}
            <SliderComponent setSteps={setSteps} setGuidance={setGuidance} />
            {inferredImage && (
              <Image
                source={
                  typeof inferredImage === "number"
                    ? inferredImage
                    : { uri: inferredImage }
                }
                style={styles.imageStyle}
              />
            )}
            <Text style={styles.promptText}>{returnedPrompt}</Text>
          </View>
        )}
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
};

const colors = {
  backgroundColor: "#25292e",
  buttonBackground: "#3a3c3f",
  color: "#FFFFFF",
  button: "#958DA5",
};

const styles = StyleSheet.create({
  titlecontainer: {
    backgroundColor: colors.backgroundColor,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  rowContainer: {
    backgroundColor: colors.backgroundColor,
    display: "flex",
    flexDirection: "row",
    marginTop: 10,
    overflow: "visible",
    padding: 20,
  },
  leftColumnContainer: {
    flex: 1,
    alignItems: "center", // Center items horizontally
    justifyContent: "flex-start",
    flexDirection: "column",
    marginRight: 10,
  },
  rightColumnContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    marginLeft: 10,
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
  swapButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: "absolute",
    left: window.width / 2 - 15,
    top: window.height / 2 - 15,
    zIndex: 1,
    elevation: 3,
    backgroundColor: colors.buttonBackground,
  },
  changeButton: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center", // change as needed
    elevation: 3, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOffset: { width: 0, height: 2 }, // for iOS shadow
    shadowOpacity: 0.25, // for iOS shadow
    shadowRadius: 3.84, // for iOS shadow
  },
  swapButtonColumn: {
    width: 60, // adjust size as needed
    height: 60, // adjust size as needed
    borderRadius: 30,
    elevation: 3,
    margin: 20,
    backgroundColor: colors.buttonBackground,
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
  ScrollView: {
    backgroundColor: colors.backgroundColor,
    marginTop: 50,
    padding: 5,
  },
  imageStyle: {
    width: 320,
    height: 440,
    borderRadius: 18,
    marginTop: 20,
    marginBottom: 20,
    alignSelf: "center",
  },
});

export default registerRootComponent(App);
