import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Dimensions
} from "react-native";
import AppContext from "./AppContext"; // Import AppContext
import { useFonts } from "expo-font";

import SliderComponent from "./components/Slider";
import PromptInputComponent from "./components/PromptInput";
import BreathingComponent from "./components/Breathing";
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
  const [soundIncrement, setSoundIncrement] = useState(null);
  const [makeSound, setMakeSound] = useState([null,0]);
 
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [columnCount, setColumnCount] = useState(3);
  const [isGuidanceVisible, setIsGuidanceVisible] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(Array(9).fill(false));
  const isWindowBiggerThanContainer = Dimensions.get('window').width > 600 ? 500 : "100%"
  const [reactiveWindowHeight, setReactiveWindowHeight] = useState(Dimensions.get('window').height * 0.7);

  const setPlaySound = useCallback((sound) => {
    setSoundIncrement(prev => prev + 1); // Use functional update for soundIncrement
    setMakeSound([sound, soundIncrement]); // soundIncrement here might be stale, consider passing it or using functional update for makeSound
  }, [soundIncrement]); // Dependency on soundIncrement

  const switchPromptFunction = useCallback(() => {
    setPromptLengthValue(prev => !prev);
    if (promptLengthValue) { // This will use the value from the previous render
      setInferredPrompt(shortPrompt);
    } else {
      setInferredPrompt(longPrompt);
    }
    setPlaySound("switch");
  }, [promptLengthValue, shortPrompt, longPrompt, setPlaySound]);

  const updateColumnCount = useCallback((width) => {
    if (width < 600) setColumnCount(3);
    else if (width >= 600 && width < 1000) setColumnCount(4);
    else if (width >= 1000 && width < 1400) setColumnCount(5);
    else if (width >= 1400 && width < 1700) setColumnCount(6);
    else setColumnCount(7);
  }, []); // No dependencies, this function is stable

  useEffect(() => {
    const handleResize = () => {
      updateColumnCount(Dimensions.get('window').width);
      setReactiveWindowHeight(Dimensions.get('window').height * 0.7);
    };
    handleResize();
    const subscription = Dimensions.addEventListener('change', handleResize);
    return () => subscription?.remove();
  }, [updateColumnCount]);

  const toggleGuidanceVisibility = useCallback(() => {
    setIsGuidanceVisible(prev => !prev);
    setPlaySound("ui_lock");
  }, [setPlaySound]);

  const toggleImagePickerVisibility = useCallback(() => {
    setImagePickerVisible(prev => !prev);
    setPlaySound("ui_lock");
  }, [setPlaySound]);

  const appContextValue = useMemo(() => ({
    // States
    activity,
    modelError,
    modelMessage,
    loadingStatus,
    inferredImage,
    returnedPrompt,
    inferrenceButton,
    galleryLoaded,
    prompt,
    columnCount,
    // Setters & Functions
    setPlaySound,
    setActivity,
    setModelError,
    setModelMessage,
    setLoadingStatus,
    setInferredImage,
    setReturnedPrompt,
    setInferrenceButton,
    setGalleryLoaded,
    setPrompt,
    // setSelectedImageIndex, // Keep passing if only ImageGrid & Inference use it directly
    // imageSource, // Keep passing if only ImageGrid & Inference use it directly
  }), [
    activity, modelError, modelMessage, loadingStatus, inferredImage, returnedPrompt,
    inferrenceButton, galleryLoaded, prompt, columnCount, setPlaySound
    // Add setters to dependency array if they are not guaranteed to be stable (e.g. not from useState)
    // For useState setters, they are stable and don't need to be listed.
  ]);

  return (
    <AppContext.Provider value={appContextValue}>
      <View style={styles.titlecontainer}>
        <SoundPlayer makeSound={makeSound} />
        <PromptInference
          prompt={prompt} // Consumed by PromptInference
          textInference={textInference}
          setTextInference={setTextInference}
          setLongPrompt={setLongPrompt}
          setShortPrompt={setShortPrompt}
          setInferredPrompt={setInferredPrompt}
          promptLengthValue={promptLengthValue}
          // setActivity, setModelError, setModelMessage will come from context if PromptInference is refactored
          // For now, pass them if PromptInference is not yet refactored to use context for these setters
          setActivity={setActivity}
          setModelError={setModelError}
          setModelMessage={setModelMessage}
        />
        <Inference
          // Props that Inference sets or heavily relies on directly
          setImageSource={setImageSource} // Manages gallery images source
          selectedImageIndex={selectedImageIndex} // Uses this to fetch specific gallery
          // Props that will be from context for its children, but Inference itself needs to set them
          setGalleryLoaded={setGalleryLoaded}
          setInferrenceButton={setInferrenceButton}
          inferrenceButton={inferrenceButton} // Reads this prop
          setModelMessage={setModelMessage}
          // imageSource, prompt, control, guidance, steps are direct inputs for inference logic
          imageSource={imageSource}
          prompt={prompt} // Reads this prop
          control={control}
          guidance={guidance}
          steps={steps}
          // Setters for states managed by MainApp but modified by Inference
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
                  // setPlaySound and setPrompt will come from context
                  inferredPrompt={inferredPrompt} // Still passed as prop
                />
              </View>
              
                
                
                  <Buttons
                    // setPlaySound, activity, setInferrenceButton will come from context
                    longPrompt={longPrompt} // Still passed as prop
                    setTextInference={setTextInference} // Still passed as prop
                    switchPromptFunction={switchPromptFunction} // Memoized callback
                    promptLengthValue={promptLengthValue} // Still passed as prop
                  />
                  
                
              {modelError ? ( // modelError and modelMessage from context
                    <Text style={styles.promptText}>{modelMessage}</Text>
                  ) : (
                    <></>
                  )}
              <Expand
                  // setPlaySound will come from context
                  isGuidance={true}
                  visible={isGuidanceVisible}
                  toggleVisibility={toggleGuidanceVisibility} // Memoized callback
                />
                {isGuidanceVisible && (
                  <Text style={[styles.promptText, { width: isWindowBiggerThanContainer, margin: 20, fontSize: 14 }]}>
                    The prompt button returns two different prompts; a seed prompt, descriptive prompt. If the user creates a prompt and then uses the prompt button, user input will be treated as the seed prompt. To generate fresh prompts clear the input window.
                  </Text>
                )}

                <Expand
                  // setPlaySound will come from context
                  isGuidance={false}
                  visible={isImagePickerVisible}
                  toggleVisibility={toggleImagePickerVisibility} // Memoized callback
                />
                {isImagePickerVisible && (
                    <View style={styles.imageGridContainer}>
                      <ImageGrid
                        imageSource={imageSource} // Direct prop
                        // columnCount, galleryLoaded, setPlaySound from context
                        setSelectedImageIndex={setSelectedImageIndex} // Direct prop
                        selectedImageIndex={selectedImageIndex} // Direct prop
                        containerWidth={isWindowBiggerThanContainer === "100%" ?
                          Dimensions.get('window').width - 40 :
                          isWindowBiggerThanContainer}
                      />
                    </View>
                  )}
                <SliderComponent
                  setSteps={setSteps} // Direct prop
                  setGuidance={setGuidance} // Direct prop
                  setControl={setControl} // Direct prop
                />
              
            </View>
            
            <View style={styles.rightColumnContainer}>
            <View style={[styles.imageCard, { height: reactiveWindowHeight }]}>
              {/* NewImage will get all its needed props from context */}
              <NewImage />
            </View>
          </View>
          </View>
        ) : (
          // Small screen layout
          <View style={styles.columnContainer}>
            <PromptInputComponent
              // setPlaySound, setPrompt from context
              inferredPrompt={inferredPrompt}
            />
            <Buttons
              // setPlaySound, activity, setInferrenceButton from context
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
              // setPlaySound from context
              isGuidance={true}
              visible={isGuidanceVisible}
              toggleVisibility={toggleGuidanceVisibility}
            />
            {isGuidanceVisible && (
              <Text style={[styles.promptText, { width: isWindowBiggerThanContainer, margin: 20, fontSize: 14 }]}>
                The prompt button returns two different prompts; a seed prompt, descriptive prompt. If the user creates a prompt and then uses the prompt button, user input will be treated as the seed prompt. To generate fresh prompts clear the input window.
              </Text>
            )}
            <Expand
              // setPlaySound from context
              isGuidance={false}
              visible={isImagePickerVisible}
              toggleVisibility={toggleImagePickerVisibility}
            />
            {isImagePickerVisible && (
              <View style={styles.imageGridContainer}>
                <ImageGrid
                  imageSource={imageSource}
                  // columnCount, galleryLoaded, setPlaySound from context
                  setSelectedImageIndex={setSelectedImageIndex}
                  selectedImageIndex={selectedImageIndex}
                  containerWidth={isWindowBiggerThanContainer === "100%" ?
                    Dimensions.get('window').width - 40 :
                    isWindowBiggerThanContainer}
                />
              </View>
            )}
            <SliderComponent
              setSteps={setSteps}
              setGuidance={setGuidance}
              setControl={setControl}
            />
            <View style={[styles.imageCard, { height: reactiveWindowHeight }]}>
              {/* NewImage will get all its needed props from context */}
              <NewImage />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
    </AppContext.Provider>
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
