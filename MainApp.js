import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Dimensions
} from "react-native";

import { useFonts } from "expo-font";
import useAppStore from './store/appStore'; // Import the store

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
import { colors as themeColors } from '../styles/theme'; // Import theme colors
import { commonStyles } from '../styles/commonStyles'; // Import common styles

export default function App() {
  useFonts({ Sigmar: require("./assets/Sigmar/Sigmar-Regular.ttf") });

  // Access state and actions from the store
  const {
    inferredImage,
    steps,
    guidance,
    control,
    galleryLoaded,
    prompt,
    inferredPrompt,
    activity,
    modelError,
    returnedPrompt,
    textInference,
    shortPrompt,
    longPrompt,
    promptLengthValue,
    modelMessage,
    inferrenceButton,
    isImagePickerVisible,
    imageSource,
    makeSound,
    selectedImageIndex,
    columnCount,
    isGuidanceVisible,
    loadingStatus,
    setInferredImage,
    setSteps,
    setGuidance,
    setControl,
    setGalleryLoaded,
    setPrompt,
    setInferredPrompt,
    setActivity,
    setModelError,
    setReturnedPrompt,
    setTextInference,
    setShortPrompt,
    setLongPrompt,
    setPromptLengthValue,
    setModelMessage,
    setInferrenceButton,
    setIsImagePickerVisible,
    setImageSource,
    setMakeSound,
    setSelectedImageIndex,
    setColumnCount,
    setIsGuidanceVisible,
    setLoadingStatus,
    setPlaySound,
    switchPromptFunction,
    updateColumnCount,
  } = useAppStore();

  const isWindowBiggerThanContainer = Dimensions.get('window').width > 600 ? 500 : "100%"
  const [reactiveWindowHeight, setReactiveWindowHeight] = useState(Dimensions.get('window').height * 0.7); 
  
  useEffect(() => {
    const handleResize = () => {
      updateColumnCount(Dimensions.get('window').width); // Update columnCount in the store
      setReactiveWindowHeight(Dimensions.get('window').height * 0.7); 
    };
    handleResize();
    Dimensions.addEventListener('change', handleResize);
    return () => Dimensions.removeEventListener('change', handleResize);
  }, [updateColumnCount]);

  return (
    // Main container
    <View style={styles.titlecontainer}>
      <SoundPlayer />
      <PromptInference />
      <Inference />
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
                <PromptInputComponent />
              </View>
              
                
                
                  <Buttons />
                  
                
              {modelError ? (
                    <Text style={commonStyles.promptText}>{modelMessage}</Text>
                  ) : (
                    <></>
                  )}
              <Expand
                  isGuidance={true}
                  visible={isGuidanceVisible}
                  toggleVisibility={() => setIsGuidanceVisible(!isGuidanceVisible)}
                />
                {isGuidanceVisible && (
                  <Text style={[commonStyles.promptText, { width: isWindowBiggerThanContainer, margin: 20, fontSize: 14 }]}>
                    The prompt button returns two different prompts; a seed prompt, descriptive prompt. If the user creates a prompt and then uses the prompt button, user input will be treated as the seed prompt. To generate fresh prompts clear the input window.
                  </Text>
                )}

                <Expand
                  isGuidance={false}
                  visible={isImagePickerVisible}
                  toggleVisibility={() => setIsImagePickerVisible(!isImagePickerVisible)}
                />
                {isImagePickerVisible && (
                    <View style={styles.imageGridContainer}>
                      <ImageGrid
                        containerWidth={isWindowBiggerThanContainer === "100%" ? 
                          Dimensions.get('window').width - 40 : // Full width minus padding
                          isWindowBiggerThanContainer} // Use your existing width variable
                      />
                    </View>
                  )}
                <SliderComponent />
              
            </View>
            
            <View style={styles.rightColumnContainer}>
            <View style={[styles.imageCard, { height: reactiveWindowHeight }]}>
              <NewImage />
            </View>
          </View>
          </View>
        ) : (
          <View style={styles.columnContainer}>
            <PromptInputComponent />
            
            <Buttons />
            
           
            {modelError ? (
              <Text style={commonStyles.promptText}>{modelMessage}</Text>
              
            ) : (
              <></>
            )}
            <Expand 
                  isGuidance={true}
                  visible={isGuidanceVisible}
                  toggleVisibility={() => setIsGuidanceVisible(!isGuidanceVisible)}
                />
                {isGuidanceVisible && (
                  
                  <Text style={[commonStyles.promptText, { width: isWindowBiggerThanContainer, margin: 20, fontSize: 14 }]}>
                    The prompt button returns two different prompts; a seed prompt, descriptive prompt. If the user creates a prompt and then uses the prompt button, user input will be treated as the seed prompt. To generate fresh prompts clear the input window.
                  </Text>
                  
                )}

                <Expand
                  isGuidance={false}
                  visible={isImagePickerVisible}
                  toggleVisibility={() => setIsImagePickerVisible(!isImagePickerVisible)}
                />
                {isImagePickerVisible && (
  <View style={styles.imageGridContainer}>
    <ImageGrid
      containerWidth={isWindowBiggerThanContainer === "100%" ? 
        Dimensions.get('window').width - 40 : // Full width minus padding
        isWindowBiggerThanContainer} // Use your existing width variable
    />
  </View>
)}
            
            <SliderComponent />
            <View style={[styles.imageCard, { height: reactiveWindowHeight }]}>
              <NewImage />
            </View>
          </View>
        )}
      </ScrollView>
      
    </View>
  );
}

// const colors = { // Remove local colors object
//   backgroundColor: "#25292e",
//   buttonBackground: "#3a3c3f",
//   color: "#FFFFFF",
//   button: "#958DA5",
// };

const styles = StyleSheet.create({
  titlecontainer: {
    backgroundColor: themeColors.background, // Use theme color
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  rowContainer: {
    backgroundColor: themeColors.background, // Use theme color
    display: "flex",
    flexDirection: "row",
    marginTop: 10,
    overflow: "visible",
    padding: 20,
  },
  leftColumnContainer: {
    ...commonStyles.centeredColumnFlex,
    justifyContent: "flex-start",
    marginRight: 10,
  },
  rightColumnContainer: {
    ...commonStyles.centeredColumnFlex,
    marginLeft: 10,
  },
  smallScreenButtonContainer: {
    // This style seems specific and not directly replaceable by centeredColumnFlex alone
    // It includes justifyContent: "center" which is different from centeredColumnFlex's default.
    // If it's meant to be a centered column, it should also spread commonStyles.centeredColumnFlex
    // For now, leaving as is unless it's confirmed to be a centered column like the others.
    // If it should be like the others: ...commonStyles.centeredColumnFlex, justifyContent: "center",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  columnContainer: {
    ...commonStyles.centeredColumnFlex,
  },
  // button: { // Removed as it's now in commonStyles.baseButton (and seemingly unused here)
  //   margin: 10,
  //   borderRadius: 4,
  //   paddingHorizontal: 32,
  //   elevation: 3,
  //   fontFamily: "Sigmar",
  // },
  // promptText: { // Removed to use commonStyles.promptText
  //   color: themeColors.text,
  //   fontSize: 18,
  //   fontWeight: "bold",
  //   textAlign: "center",
  //   letterSpacing: 2,
  //   lineHeight: 30,
  //   fontFamily: "System",
  // },
  ScrollView: {
    backgroundColor: themeColors.background, // Use theme color
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
    backgroundColor: themeColors.background, // Use theme color
    elevation: 3, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 3.84, 
  }
});
