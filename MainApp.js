import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Dimensions
} from "react-native";

import { useFonts } from "expo-font";

import SliderComponent from "./components/Slider";
import PromptInputComponent from "./components/PromptInput";
import BreathingComponent from "./components/Breathing";
import SafteySwitch from "./components/SafteySwitch";
import ImageGrid from "./components/ImageGrid";
import Buttons from "./components/Buttons";
import Expand from "./components/Expand";
import PromptInference from "./components/Prompt";
import Inference from "./components/Inference";
import SoundPlayer from "./components/Sounds";
import NewImage from "./components/NewImage";

const assetImage = require('./assets/avocado.jpg');

export default function App() {
  useFonts({ Sigmar: require("./assets/Sigmar/Sigmar-Regular.ttf") });
  const [inferredImage, setInferredImage] = useState(Array(9).fill(assetImage));
  const [steps, setSteps] = useState(28);
  const [guidance, setGuidance] = useState(5);
  const [control, setControl] = useState(1.0);
  const [galleryLoaded, setGalleryLoaded] = useState(true);
  const [prompt, setPrompt] = useState("Avocado Armchair");
  const [inferredPrompt, setInferredPrompt] = useState(null);
  const [activity, setActivity] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [returnedPrompt, setReturnedPrompt] = useState(Array(9).fill("Avacado Armchair"))
  const [textInference, setTextInference] = useState(false);
  const [shortPrompt, setShortPrompt] = useState("");
  const [longPrompt, setLongPrompt] = useState(null);
  const [promptLengthValue, setPromptLengthValue] = useState(false);
  const [modelMessage, setModelMessage] = useState("");
  const [inferrenceButton, setInferrenceButton] = useState(null);
  const [isImagePickerVisible, setImagePickerVisible] = useState(false);
  const [imageSource, setImageSource] = useState([]);
  const [settingSwitch, setSettingSwitch] = useState(true);
  const [soundIncrement, setSoundIncrement] = useState(null);
  const [makeSound, setMakeSound] = useState([null,0]);
 
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [columnCount, setColumnCount] = useState(3);
  const [isGuidanceVisible, setIsGuidanceVisible] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(Array(9).fill(false));
  const isWindowBiggerThanContainer = Dimensions.get('window').width > 600 ? 500 : "100%"
  const [reactiveWindowHeight, setReactiveWindowHeight] = useState(Dimensions.get('window').height * 0.7); 
  

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
      setReactiveWindowHeight(Dimensions.get('window').height * 0.7); 
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
        setModelMessage={setModelMessage}
        settingSwitch={settingSwitch}
      />
      <Inference
      setGalleryLoaded={setGalleryLoaded}
        setImageSource={setImageSource}
        selectedImageIndex={selectedImageIndex}
        setInferrenceButton={setInferrenceButton}
        inferrenceButton={inferrenceButton}
        setModelMessage={setModelMessage}
        imageSource={imageSource}
        prompt={prompt}
        settingSwitch={settingSwitch}
        control={control}
        guidance={guidance}
  
        steps={steps}
        setActivity={setActivity}
        setModelError={setModelError}
        setReturnedPrompt={setReturnedPrompt}
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
                  
                </View>
                
              </View>
              {modelError ? (
                    <Text style={styles.promptText}>{modelMessage}</Text>
                  ) : (
                    <></>
                  )}
              <Expand
                  setPlaySound={setPlaySound}
                  isGuidance={true}
                  visible={isGuidanceVisible}
                  toggleVisibility={() => setIsGuidanceVisible(!isGuidanceVisible)}
                />
                {isGuidanceVisible && (
                  <Text style={[styles.promptText, { width: isWindowBiggerThanContainer, margin: 20, fontSize: 14 }]}>
                    The prompt button returns two different prompts; a seed prompt, descriptive prompt. If the user creates a prompt and then uses the prompt button, user input will be treated as the seed prompt. To generate fresh prompts clear the input window.
                  </Text>
                )}

                <Expand
                  setPlaySound={setPlaySound}
                  isGuidance={false}
                  visible={isImagePickerVisible}
                  toggleVisibility={() => setImagePickerVisible(!isImagePickerVisible)}
                />
                {isImagePickerVisible && (
  <View style={styles.imageGridContainer}>
    <ImageGrid
      imageSource={imageSource}
      columnCount={columnCount}
      galleryLoaded={galleryLoaded}
      setSelectedImageIndex={setSelectedImageIndex}
      selectedImageIndex={selectedImageIndex}
      setPlaySound={setPlaySound}
      
      containerWidth={isWindowBiggerThanContainer === "100%" ? 
        Dimensions.get('window').width - 40 : // Full width minus padding
        isWindowBiggerThanContainer} // Use your existing width variable
    />
  </View>
)}
                <SliderComponent
                  setSteps={setSteps}
                  setGuidance={setGuidance}
                  setControl={setControl}
                />
              
            </View>
            
            <View style={styles.rightColumnContainer}>
            <View style={[styles.imageCard, { height: reactiveWindowHeight }]}>
              <NewImage inferredImage={inferredImage} setPlaySound={setPlaySound} returnedPrompt={returnedPrompt} loadingStatus={loadingStatus} inferrenceButton={inferrenceButton} galleryLoaded={galleryLoaded}/>
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
                  isGuidance={true}
                  visible={isGuidanceVisible}
                  toggleVisibility={() => setIsGuidanceVisible(!isGuidanceVisible)}
                />
                {isGuidanceVisible && (
                  
                  <Text style={[styles.promptText, { width: isWindowBiggerThanContainer, margin: 20, fontSize: 14 }]}>
                    The prompt button returns two different prompts; a seed prompt, descriptive prompt. If the user creates a prompt and then uses the prompt button, user input will be treated as the seed prompt. To generate fresh prompts clear the input window.
                  </Text>
                  
                )}

                <Expand
                  setPlaySound={setPlaySound}
                  isGuidance={false}
                  visible={isImagePickerVisible}
                  toggleVisibility={() => setImagePickerVisible(!isImagePickerVisible)}
                />
                {isImagePickerVisible && (
  <View style={styles.imageGridContainer}>
    <ImageGrid
      imageSource={imageSource}
      columnCount={columnCount}
      galleryLoaded={galleryLoaded}
      setSelectedImageIndex={setSelectedImageIndex}
      selectedImageIndex={selectedImageIndex}
      setPlaySound={setPlaySound}
      
      containerWidth={isWindowBiggerThanContainer === "100%" ? 
        Dimensions.get('window').width - 40 : // Full width minus padding
        isWindowBiggerThanContainer} // Use your existing width variable
    />
  </View>
)}
            
            <SliderComponent setSteps={setSteps} setGuidance={setGuidance} setControl={setControl}/>
            <View style={[styles.imageCard, { height: reactiveWindowHeight }]}>
              <NewImage inferredImage={inferredImage} setPlaySound={setPlaySound} returnedPrompt={returnedPrompt} loadingStatus={loadingStatus} inferrenceButton={inferrenceButton} galleryLoaded={galleryLoaded}/>
            </View>
          </View>
        )}
      </ScrollView>
      
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
  smallScreenButtonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
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
  imageGridContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    minHeight: 200, // Give it a minimum height
  },
 
  imageCard:{
    width: "100%",
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
