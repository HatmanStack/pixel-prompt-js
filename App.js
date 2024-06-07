import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  ScrollView,
  Text,
  Pressable,
  useWindowDimensions,
  Image,
  LogBox,
  Switch,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import { HfInference } from "@huggingface/inference";
import { registerRootComponent } from 'expo';
import seeds from "./assets/seeds.json";

import SliderComponent from "./components/Slider";
import PromptInputComponent from "./components/PromptInput";
import BreathingComponent from "./components/Breathing";
import DropDownComponent from "./components/DropDown";
import MyImagePicker from "./components/ImagePicker";

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

  const [isImagePickerVisible, setImagePickerVisible] = useState(false);
  const [imageSource, setImageSource] = useState(assetImage);
  const [settingSwitch, setSettingSwitch] = useState(false);
  const [styleSwitch, setStyleSwitch] = useState(false);

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
    setImageSource(inferredImage);
  };

  const switchPromptFunction = () => {
    setPromptLengthValue(!promptLengthValue);
    if(promptLengthValue) {
      setInferredPrompt(shortPrompt);
    } else {
      setInferredPrompt(longPrompt);
    }
  };

  useEffect(() => {
    if (parameters) {
      setActivity(true);
      setModelError(false);
      let alteredPrompt = "";
      if (modelID.includes("dallinmackay")) {
        alteredPrompt = "lvngvncnt, " + prompt;
      } else if (modelID.includes("nousr")) {
        alteredPrompt = "nousr robot, " + prompt;
      } else if (modelID.includes("nitrosocke")) {
        alteredPrompt = "arcane, " + prompt;
      } else if (modelID.includes("dreamlike")) {
        alteredPrompt = "photo, " + prompt;
      } else if (modelID.includes("prompthero")) {
        alteredPrompt = "mdjrny-v4 style, " + prompt;
      } else {
        alteredPrompt = prompt;
      }
      console.log("Parameters:", parameters);
      let scale = {};
      if (isImagePickerVisible) {
        setModelID("stabilityai/stable-diffusion-xl-refiner-1.0");
        alteredPrompt = prompt;
        if (styleSwitch) {
          scale = {
            up: { block_0: [0.0, 1.0, 0.0] },
          };
        }
        if (settingSwitch) {
          scale = {
            down: { block_2: [0.0, 1.0] },
            up: { block_0: [0.0, 1.0, 0.0] },
          };
        }
      }
      inference
        .textToImage({
          model: modelID,
          inputs: alteredPrompt,
          parameters: {
            negative_prompt: "blurry",
            guidance: guidance,
            steps: steps,
          },
        })
        .then((response) => {
          console.log(response.status);
          setReturnedPrompt(prompt);
          if (response instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
              setActivity(false);
              if (typeof reader.result === "string") {
                console.log("Blob read successfully")
                setInferredImage(reader.result);
              } else {
                console.error(
                  "Expected reader.result to be a string, got",
                  typeof reader.result
                );
              }
            };
            reader.onerror = (error) => {
              console.log("Error reading Blob:", error);
            };
            reader.readAsDataURL(response);
          }
        })
        .catch(function (error) {
          setActivity(false);
          setModelError(true);
          console.log(error);
        });
    }
    
  }, [parameters]);

  useEffect(() => {
    if (textInference) {
      setActivity(true);
      setModelError(false);
      let alteredPrompt = "";

      if (prompt === "Avocado Armchair" || prompt === "") {
        const randomIndex = Math.floor(Math.random() * seeds.seeds.length);
        alteredPrompt = seeds.seeds[randomIndex];
      } else {
        alteredPrompt = prompt;
      }
      alteredPrompt = `I'm giving you a seed string for a stable diffusion model. Return two versions \
        in fewer than 500 tokens. A long version and a shortened version.  Make both descriptive and creative. \
        Here is the seed string. : ${alteredPrompt}`;
      inference
        .chatCompletion({
          model: "mistralai/Mistral-7B-Instruct-v0.3",
          messages: [{ role: "user", content: alteredPrompt }],
          max_tokens: 500,
        })
        .then((response) => {
          const generatedText = response.choices[0].message.content;
          const splitPrompt = generatedText.split(/Short(?:ened)? (?:Version:)?/i);
          const longPromptHolder = splitPrompt[0].substring(0,150).split(/\n\n/).slice(-1)[0];
          const lPrompt =  longPromptHolder + splitPrompt[0].substring(150)
          const holderShortPrompt = splitPrompt[1].substring(0,150).split(/\n\n/).slice(-1)[0];
          const sPrompt = holderShortPrompt + splitPrompt[1].substring(150).split(/\n\n/)[0];
          
          setLongPrompt(lPrompt);
          setShortPrompt(sPrompt);
          if(!promptLengthValue) {
            setInferredPrompt(sPrompt);
          }else {
            setInferredPrompt(lPrompt);
          }
          setActivity(false);
        })
        .catch((error) => console.error("Error:", error));
    }
    setTextInference(false);
  }, [textInference]);

  return (
    // Main container
    <View style={styles.titlecontainer}>
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
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  position: "absolute",
                  left: window.width / 2 - 15,
                  top: window.height / 2 - 15,
                  zIndex: 1,
                  elevation: 3,
                  backgroundColor: "#3a3c3f",
                }}
              >
                <Image
                  source={require("./assets/circle.png")}
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
              <View style={[styles.rowContainer, 
                          { padding:0 }]}>
                <DropDownComponent passModelID={passModelIDWrapper} />
                <View style={styles.columnContainer}>
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
                          setParameters(
                            `${prompt}-${steps}-${guidance}-${modelID}`
                          );
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
                  )}
                  {modelError ? (
                    <Text style={styles.promptText}>Model Error!</Text>
                  ) : (
                    <></>
                  )}
                </View>
              </View>
              <View>
                <Pressable
                  style={styles.expandButton}
                  onPress={() => setImagePickerVisible(!isImagePickerVisible)}
                >
                  {isImagePickerVisible ? (
                    <Image
                      source={require("./assets/right.png")}
                      style={styles.expandImage}
                    />
                  ) : (
                    <Image
                      source={require("./assets/down.png")}
                      style={styles.expandImage}
                    />
                  )}
                </Pressable>
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
            {/* Right column */}

            <View style={styles.rightColumnContainer}>
              {inferredImage && (
                <Image source={typeof inferredImage === 'number' ? inferredImage : { uri: inferredImage }} style={styles.imageStyle} />
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
            <DropDownComponent passModelID={passModelIDWrapper} />
            {activity ? (
              <ActivityIndicator size="large" color="#B58392" style={{ margin: 25 }}/>
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
                </> :<>
                <Pressable
                  onPress={() => {
                    setTextInference(true);
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
                </Pressable></>}
                <Pressable
                  onPress={() => {
                    setParameters(`${prompt}-${steps}-${guidance}-${modelID}`);
                  }}
                  style={({ pressed }) => [
                    { backgroundColor: pressed ? "#9DA58D" : "#958DA5" },
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
            {modelError ? (
              <Text style={styles.promptText}>Model Error!</Text>
            ) : (
              <></>
            )}
            <Pressable
              style={[styles.expandButton, { alignSelf: 'flex-start', marginLeft: '20%' }]}
              onPress={() => setImagePickerVisible(!isImagePickerVisible)}
            >
              {isImagePickerVisible ? (
                <Image
                  source={require("./assets/right.png")}
                  style={styles.expandImage}
                />
              ) : (
                <Image
                  source={require("./assets/down.png")}
                  style={styles.expandImage}
                />
              )}
            </Pressable>
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
                  style={styles.pressable}>
                  <Image
                    source={require("./assets/circle.png")}
                    style={styles.changeButton}
                  />
                </Pressable>
              </>
            )}
            <SliderComponent setSteps={setSteps} setGuidance={setGuidance} />
            {inferredImage && (
              <Image source={typeof inferredImage === 'number' ? inferredImage : { uri: inferredImage }} style={styles.imageStyle} />
            )}
            <Text style={styles.promptText}>{returnedPrompt}</Text>
          </View>
        )}
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

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
  columnButton: {
    margin: 20,
    borderRadius: 4,
    paddingHorizontal: 32,
    elevation: 3,
    fontFamily: "Sigmar",
    width: 200,
  },
  expandButton: {
    width: 30, // adjust size as needed
    height: 30, // adjust size as needed
    borderRadius: 15, // half of size to make it circular
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.buttonBackground, // change as needed
    elevation: 3, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOffset: { width: 0, height: 2 }, // for iOS shadow
    shadowOpacity: 0.25, // for iOS shadow
    shadowRadius: 3.84, // for iOS shadow
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
  expandImage: {
    width: 20,
    height: 20,
  },
  pressable: {
    width: 60, // adjust size as needed
    height: 60, // adjust size as needed
    borderRadius: 30,
    elevation: 3,
    margin: 20,
    backgroundColor: colors.buttonBackground,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
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
  sliderText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 2,
    lineHeight: 30,
    fontFamily: "Sigmar",
  },
});

export default registerRootComponent(App);