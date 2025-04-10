import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Pressable,
  Image,
  Dimensions
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

import SliderComponent from "./components/Slider";
import PromptInputComponent from "./components/PromptInput";
import BreathingComponent from "./components/Breathing";
import SafteySwitch from "./components/SafteySwitch";
import MyImagePicker from "./components/ImagePicker";
import Buttons from "./components/Buttons";
import Expand from "./components/Expand";
import PromptInference from "./components/Prompt";
import Inference from "./components/Inference";
import SoundPlayer from "./components/Sounds";
import NewImage from "./components/NewImage";

const assetImage = require("./assets/avocado.jpg");
const circleImage = require("./assets/circle.png");
//const addImage = require("./assets/add_image.png");
const rotatedCircle = require("./assets/rotated_circle.png");

export default function App() {
  useFonts({ Sigmar: require("./assets/Sigmar/Sigmar-Regular.ttf") });
  const [inferredImage, setInferredImage] = useState(Array(9).fill(assetImage));
  const [steps, setSteps] = useState(28);
  const [guidance, setGuidance] = useState(5);
  const [control, setControl] = useState(1.0);
  const [prompt, setPrompt] = useState("Avocado Armchair");
  const [inferredPrompt, setInferredPrompt] = useState(null);
  const [activity, setActivity] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [returnedPrompt, setReturnedPrompt] = useState(Array(9).fill("Avacado Armchair"))
  const [initialReturnedPrompt, setInitialReturnedPrompt] = useState(Array(9).fill("Avacado Armchair"))
  const [textInference, setTextInference] = useState(false);
  const [shortPrompt, setShortPrompt] = useState("");
  const [longPrompt, setLongPrompt] = useState(null);
  const [promptLengthValue, setPromptLengthValue] = useState(false);
  const [modelMessage, setModelMessage] = useState("");
  const [inferrenceButton, setInferrenceButton] = useState(null);
  const [isImagePickerVisible, setImagePickerVisible] = useState(false);
  const [imageSource, setImageSource] = useState([]);
  const [settingSwitch, setSettingSwitch] = useState(true);
  const [styleSwitch, setStyleSwitch] = useState(false);
  const [soundIncrement, setSoundIncrement] = useState(null);
  const [makeSound, setMakeSound] = useState([null,0]);
  const [promptList, setPromptList] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [columnCount, setColumnCount] = useState(3);
  const [isGuidanceVisible, setIsGuidanceVisible] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(Array(9).fill(false));
  const isWindowBiggerThanContainer = Dimensions.get('window').width > 600 ? 500 : "100%"
  

  const setPlaySound = (sound) => {
    setSoundIncrement(prevSoundIncrement => prevSoundIncrement + 1);
    setMakeSound([sound, soundIncrement]);
  };

  const switchPromptFunction = () => {
    setPromptLengthValue(!promptLengthValue);
    if (promptLengthValue) {
      setInferredPrompt(shortPrompt);
      setPlaySound("switch");
    } else {
      setInferredPrompt(longPrompt);
      setPlaySound("switch");
    }
  };

  const updateColumnCount = (width) => {
    if (width < 600) setColumnCount(3);
    else if (width >= 600 && width < 1000) setColumnCount(4);
    else if (width >= 1000 && width < 1400) setColumnCount(5);
    else if (width >= 1400 && width < 1700) setColumnCount(6);
    else setColumnCount(7);
  };

  useEffect(() => {
    const handleResize = () => {
      updateColumnCount(Dimensions.get('window').width);
    };
    handleResize();
    Dimensions.addEventListener('change', handleResize);
    return () => Dimensions.removeEventListener('change', handleResize);
  }, []);

  return (
    // Main container
    <View style={styles.titlecontainer}>
      <SoundPlayer makeSound={makeSound}/>
      <PromptInference
        prompt={prompt}
        textInference={textInference}
        setTextInference={setTextInference}
        setLongPrompt={setLongPrompt}
        setShortPrompt={setShortPrompt}
        setInferredPrompt={setInferredPrompt}
        promptLengthValue={promptLengthValue}
        setActivity={setActivity}
        setModelError={setModelError}
        settingSwitch={settingSwitch}
      />
      <Inference
        setImageSource={setImageSource}
        setPromptList={setPromptList}
        selectedImageIndex={selectedImageIndex}
        setInferrenceButton={setInferrenceButton}
        inferrenceButton={inferrenceButton}
        setModelMessage={setModelMessage}
        imageSource={imageSource}
        prompt={prompt}
        styleSwitch={styleSwitch}
        settingSwitch={settingSwitch}
        control={control}
        guidance={guidance}
        steps={steps}
        setActivity={setActivity}
        setModelError={setModelError}
        setReturnedPrompt={setReturnedPrompt}
        setInitialReturnedPrompt={setInitialReturnedPrompt}
        setInferredImage={setInferredImage}
        setLoadingStatus={setLoadingStatus}
      />
      <BreathingComponent />
      <ScrollView
        scrollY={true}
        style={styles.ScrollView}
        showsVerticalScrollIndicator={false}
      >
        {Dimensions.get('window').width > 1000 ? (
          <View style={styles.rowContainer}>
            {/* Left column */}
            

            <View style={styles.leftColumnContainer}>
              <View>
                <PromptInputComponent
                  setPlaySound={setPlaySound}
                  setPrompt={setPrompt}
                  inferredPrompt={inferredPrompt}
                />
              </View>
              
              <View style={[styles.rowContainer, { padding: 0 }]}>
                <SafteySwitch
                  settingSwitch={settingSwitch}
                  setPlaySound={setPlaySound}
                  setSettingSwitch={setSettingSwitch}
                  
                />
                <View style={styles.columnContainer}>
                  <Buttons
                    setPlaySound={setPlaySound}
                    setInferrenceButton={setInferrenceButton}
                    activity={activity}
                    longPrompt={longPrompt}
                    setTextInference={setTextInference}
                    switchPromptFunction={switchPromptFunction}
                    promptLengthValue={promptLengthValue}
                  />
                  {modelError ? (
                    <Text style={styles.promptText}>{modelMessage}</Text>
                  ) : (
                    <></>
                  )}
                </View>
              </View>

              <Expand
              setPlaySound={setPlaySound}
              isImagePickerVisible={isImagePickerVisible}
              setImagePickerVisible={setImagePickerVisible}
              isGuidanceVisible={isGuidanceVisible}
              setIsGuidanceVisible={setIsGuidanceVisible}
              isGuidance={true}
            />
            {isGuidanceVisible && <Text style={[styles.promptText,{ width: isWindowBiggerThanContainer, margin: 20, fontSize: 14}]}>
              Select a model from the drop down menu. 
              The prompt button returns two different prompts; a seed prompt, descriptive prompt.
              If the user creates a prompt and then uses the prompt button, user input will be treated as the seed prompt.
              To generate fresh prompts clear the input window. To save images to the app the Saftey Option must be enabled. </Text>}
                <Expand
                  setPlaySound={setPlaySound}
                  isImagePickerVisible={isImagePickerVisible}
                  setImagePickerVisible={setImagePickerVisible}
                  isGuidanceVisible={isGuidanceVisible}
                  setIsGuidanceVisible={setIsGuidanceVisible}
                  isGuidance={false}
                />
                {isImagePickerVisible && (
                  <MyImagePicker
                    columnCount={columnCount}
                    selectedImageIndex={selectedImageIndex}
                    setSelectedImageIndex={setSelectedImageIndex}
                    initialReturnedPrompt={initialReturnedPrompt}
                    setReturnedPrompt={setReturnedPrompt}
                    promptList={promptList}
                    setPromptList={setPromptList}
                    setPlaySound={setPlaySound}
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
                  setControl={setControl}
                />
              
            </View>
            
            <View style={styles.rightColumnContainer}>
            <View style={styles.imageCard}>
              <NewImage inferredImage={inferredImage} setPlaySound={setPlaySound} returnedPrompt={returnedPrompt} loadingStatus={loadingStatus} inferrenceButton={inferrenceButton} />
            </View>
          </View>
          </View>
        ) : (
          <View style={styles.columnContainer}>
            <PromptInputComponent
              setPlaySound={setPlaySound}
              setPrompt={setPrompt}
              inferredPrompt={inferredPrompt}
            />
            <SafteySwitch
                  settingSwitch={settingSwitch}
                  setPlaySound={setPlaySound}
                  setSettingSwitch={setSettingSwitch}
                  
                />
            <Buttons
              setPlaySound={setPlaySound}
              setInferrenceButton={setInferrenceButton}
              activity={activity}
              longPrompt={longPrompt}
              setTextInference={setTextInference}
              switchPromptFunction={switchPromptFunction}
              promptLengthValue={promptLengthValue}
            />
            {modelError ? (
              <Text style={styles.promptText}>{modelMessage}</Text>
            ) : (
              <></>
            )}
            <Expand
              setPlaySound={setPlaySound}
              isImagePickerVisible={isImagePickerVisible}
              setImagePickerVisible={setImagePickerVisible}
              isGuidanceVisible={isGuidanceVisible}
              setIsGuidanceVisible={setIsGuidanceVisible}
              isGuidance={true}
            />
            {isGuidanceVisible && <Text style={[styles.promptText,{ width: isWindowBiggerThanContainer, margin: 20, fontSize: 14}]}>
              Select a model from the drop down menu or by default receive a Random model. 
              The prompt button returns three different prompts; a seed prompt, descriptive prompt and magic prompt.
              If the user creates a prompt and then uses the prompt button, user input will be treated as the seed prompt.
              To generate fresh prompts clear the input window. The sliders dictate the strength of each attribute.</Text>}
            <Expand
              setPlaySound={setPlaySound}
              isImagePickerVisible={isImagePickerVisible}
              setImagePickerVisible={setImagePickerVisible}
              isGuidanceVisible={isGuidanceVisible}
              setIsGuidanceVisible={setIsGuidanceVisible}
              isGuidance={false}
            />
            
            {isImagePickerVisible && (
              <>
                <MyImagePicker
                  columnCount={columnCount}
                  selectedImageIndex={selectedImageIndex}
                  setSelectedImageIndex={setSelectedImageIndex}
                  initialReturnedPrompt={initialReturnedPrompt}
                  setReturnedPrompt={setReturnedPrompt}
                  promptList={promptList}
                  setPromptList={setPromptList}
                  setPlaySound={setPlaySound}
                  imageSource={imageSource}
                  setImageSource={setImageSource}
                  styleSwitch={styleSwitch}
                  setStyleSwitch={setStyleSwitch}
                  settingSwitch={settingSwitch}
                  setSettingSwitch={setSettingSwitch}
                />
                
              </>
            )}
            
            <SliderComponent setSteps={setSteps} setGuidance={setGuidance} setControl={setControl}/>
            <View style={styles.imageCard}>
              <NewImage inferredImage={inferredImage} setPlaySound={setPlaySound} returnedPrompt={returnedPrompt} loadingStatus={loadingStatus} inferrenceButton={inferrenceButton} />
            </View>
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
  promptText: {
    color: colors.color,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 2,
    lineHeight: 30,
    fontFamily: "System",
  },
  ScrollView: {
    backgroundColor: colors.backgroundColor,
    marginTop: 50,
    padding: 5,
    
  },
 
  imageCard:{
    width: "100%",
    height: "92%",
    borderRadius: 18,
    marginTop: 20,
    marginBottom: 20,
    alignSelf: "center", 
    backgroundColor: colors.backgroundColor, 
    elevation: 3, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 3.84, 
  }
});
