import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Pressable,
  useWindowDimensions,
  Image,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { registerRootComponent } from "expo";
import * as FileSystem from 'expo-file-system';
import base64 from 'react-native-base64';
import SliderComponent from "./components/Slider";
import PromptInputComponent from "./components/PromptInput";
import BreathingComponent from "./components/Breathing";
import DropDownComponent from "./components/DropDown";
import MyImagePicker from "./components/ImagePicker";
import Buttons from "./components/Buttons";
import Expand from "./components/Expand";
import PromptInference from "./components/Prompt";
import Inference from "./components/Inference";
import SoundPlayer from "./components/Sounds";

const assetImage = require("./assets/avocado.jpg");
const circleImage = require("./assets/circle.png");
const addImage = require("./assets/add_image.png");
const rotatedCircle = require("./assets/rotated_circle.png");

const App = () => {
  useFonts({ Sigmar: require("./assets/Sigmar/Sigmar-Regular.ttf") });
  const [inferredImage, setInferredImage] = useState(assetImage);
  const [steps, setSteps] = useState(28);
  const [guidance, setGuidance] = useState(5);
  const [modelID, setModelID] = useState(
    "stabilityai/stable-diffusion-xl-base-1.0"
  );
  const [prompt, setPrompt] = useState("Avocado Armchair");
  const [inferredPrompt, setInferredPrompt] = useState(null);
  const [parameters, setParameters] = useState(null);
  const [activity, setActivity] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [returnedPrompt, setReturnedPrompt] = useState("Avacado Armchair");
  const [initialReturnedPrompt, setInitialReturnedPrompt] =
    useState("Avacado Armchair");
  const [textInference, setTextInference] = useState(false);
  const [shortPrompt, setShortPrompt] = useState("");
  const [longPrompt, setLongPrompt] = useState(null);
  const [promptLengthValue, setPromptLengthValue] = useState(false);
  const [modelMessage, setModelMessage] = useState("");
  const [inferrenceButton, setInferrenceButton] = useState(null);
  const [flanPrompt, setFlanPrompt] = useState(null);
  const [isImagePickerVisible, setImagePickerVisible] = useState(false);
  const [imageSource, setImageSource] = useState([]);
  const [settingSwitch, setSettingSwitch] = useState(false);
  const [styleSwitch, setStyleSwitch] = useState(false);
  const [soundIncrement, setSoundIncrement] = useState(null);
  const [makeSound, setMakeSound] = useState([null, 0]);
  const [promptList, setPromptList] = useState([]);
  const [swapImage, setSwapImage] = useState(false);
  const [URIList, setURIList] = useState([]);
  const [indexToDelete, setIndexToDelete] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [columnCount, setColumnCount] = useState(3);

  const window = useWindowDimensions();

  const passModelIDWrapper = (x) => {
    setModelError(false);
    setModelID(x);
  };

  const setPlaySound = (sound) => {
    setSoundIncrement((prevSoundIncrement) => prevSoundIncrement + 1);
    setMakeSound([sound, soundIncrement]);
  };

  useEffect(() => {
    async function deleteFile(uriToDelete) {
      if (uriToDelete) {
        try {
          await FileSystem.deleteAsync(uriToDelete);
          console.log("File deleted successfully");
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }
    }
  
    if (indexToDelete) {
      deleteFile(URIList[indexToDelete]);
      setURIList((prevURIList) => {
        if(prevURIList.length > 0){
        return prevURIList.filter((_, i) => i !== indexToDelete);
        }
     });
    }
  }, [indexToDelete]);


  useEffect(() => {
    if (swapImage) {
      if (inferredImage !== addImage) {
        setPromptList((prevPromptList) => [
          initialReturnedPrompt,
          ...prevPromptList,
        ]);
        setImageSource((prevImageSource) => [
          inferredImage,
          ...prevImageSource,
        ]);
        
        saveBase64ToFile(inferredImage, initialReturnedPrompt);
        setInferredImage(addImage);
        setInitialReturnedPrompt("");
        setReturnedPrompt("");
      }
      setSwapImage(false);
    }
  }),
    [swapImage];
    

    const saveBase64ToFile = async (base64Data, fileName) => {
      const timestamp = new Date().toISOString().replace(/[:.-]/g, '');
      const saveFileName = timestamp + 'pixel'
      const filePath = `${FileSystem.documentDirectory}${saveFileName}`;
      setURIList((prevURIList) => [filePath, ...prevURIList]);
      try {
        // Decode base64 string and write the data to a file
        const base64Body = base64Data.split(',')[1] || base64Data;
        const utf8StringBase64 = base64.encode(fileName)
        
        const fileContentToWrite = utf8StringBase64 + '|||' + base64Body;
        await FileSystem.writeAsStringAsync(filePath, fileContentToWrite);
        console.log('File saved to:', filePath);
      } catch (error) {
        console.error('Error saving file:', error);
      }
    };
    
    useEffect(() => {
      const readFiles = async () => {
        
        const directoryPath = FileSystem.documentDirectory;
        try {
          const directoryContents = await FileSystem.readDirectoryAsync(directoryPath); // Read directory 
          console.log(`Directory: ${directoryContents}`)
          if (directoryContents.length === 0) return;
          const fileInfoPromises = directoryContents.map(async fileName => {
            const filePath = `${directoryPath}${fileName}`;
            if (!filePath.includes('pixel')) {
              console.log(`Skipping file as it does not contain 'pixel': ${filePath}`);
              return null; // Skip this file
            }
            try {
              console.log(`FilePathImages: ${filePath}`);
              return await FileSystem.getInfoAsync(filePath); // Get info for each file
            } catch (error) {
              console.error(`Error accessing file ${filePath}: ${error}`);
              return null; 
            }
          });
          const filesInfo = await Promise.all(fileInfoPromises);

          async function readFileContents(filesInfo) {
            const contentPromises = filesInfo.filter(fileInfo => fileInfo !== null).map(async fileInfo => {
              
              const contents = await FileSystem.readAsStringAsync(fileInfo.uri);
              const splitContents = contents.split('|||');
              const image = 'data:application/octet-stream;base64,' + splitContents[1]; 
              
              const prompt = base64.decode(splitContents[0]).toString('utf-8');
              setImageSource((prevImageSource) => [
                image,
                ...prevImageSource,
              ]);
              setPromptList((prevPromptList) => [
                prompt,
                ...prevPromptList,
              ]);
              setURIList((prevURIList) => [
                fileInfo.uri,
                ...prevURIList,
              ]);
            });
            
          }
          
          readFileContents(filesInfo);
           
          //setPromptList(newPromptList); 
        } catch (error) {
          console.error('Error reading directory:', error);
        }
      };
    
      readFiles();
    }, []);

 
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

  const switchToFlan = () => {
    setInferredPrompt(flanPrompt);
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
      const screenWidth = Dimensions.get('window').width;
      updateColumnCount(screenWidth);
    };
    handleResize();
    Dimensions.addEventListener('change', handleResize);
    return () => Dimensions.removeEventListener('change', handleResize);
  }, []);


  const setParametersWrapper = () => {
    setParameters(`${prompt}-${steps}-${guidance}-${modelID}`);
  };

  return (
    // Main container
    <View style={styles.titlecontainer}>
      <SoundPlayer makeSound={makeSound} />
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
        longPrompt={longPrompt}
        selectedImageIndex={selectedImageIndex}
        setInferrenceButton={setInferrenceButton}
        inferrenceButton={inferrenceButton}
        setModelMessage={setModelMessage}
        imageSource={imageSource}
        parameters={parameters}
        modelID={modelID}
        prompt={prompt}
        styleSwitch={styleSwitch}
        settingSwitch={settingSwitch}
        guidance={guidance}
        steps={steps}
        setActivity={setActivity}
        setModelError={setModelError}
        setReturnedPrompt={setReturnedPrompt}
        setInitialReturnedPrompt={setInitialReturnedPrompt}
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
                  setSwapImage(true);
                  setPlaySound("swoosh");
                }}
                style={({ pressed }) => [
                  styles.swapButton,
                  {
                    top: pressed
                      ? window.height / 2 - 13
                      : window.height / 2 - 15,
                    left: pressed
                      ? window.width / 2 - 13
                      : window.width / 2 - 15,
                    width: pressed ? 52 : 60,
                    height: pressed ? 52 : 60,
                  },
                ]}
              >
                {({ pressed }) => (
                  <Image
                    source={pressed ? rotatedCircle : circleImage}
                    style={[
                      styles.changeButton,
                      pressed
                        ? { width: 52, height: 52 }
                        : { width: 60, height: 60 },
                    ]}
                  />
                )}
              </Pressable>
            )}

            <View style={styles.leftColumnContainer}>
              <View>
                <PromptInputComponent
                  setPlaySound={setPlaySound}
                  setPrompt={setPrompt}
                  inferredPrompt={inferredPrompt}
                />
              </View>
              <View style={[styles.rowContainer, { padding: 0 }]}>
                <DropDownComponent
                  setPlaySound={setPlaySound}
                  passModelID={passModelIDWrapper}
                />
                <View style={styles.columnContainer}>
                  <Buttons
                    setPlaySound={setPlaySound}
                    switchToFlan={switchToFlan}
                    setInferrenceButton={setInferrenceButton}
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

              <Expand
                setPlaySound={setPlaySound}
                isImagePickerVisible={isImagePickerVisible}
                setImagePickerVisible={setImagePickerVisible}
                window={window}
              />
              {isImagePickerVisible && (
                <MyImagePicker
                  setIndexToDelete={setIndexToDelete}
                  columnCount={columnCount}
                  selectedImageIndex={selectedImageIndex}
                  setSelectedImageIndex={setSelectedImageIndex}
                  initialReturnedPrompt={initialReturnedPrompt}
                  setReturnedPrompt={setReturnedPrompt}
                  promptList={promptList}
                  setPromptList={setPromptList}
                  window={window}
                  setPlaySound={setPlaySound}
                  imageSource={imageSource}
                  setImageSource={setImageSource}
                />
              )}
              <SliderComponent setSteps={setSteps} setGuidance={setGuidance} />
            </View>

            <View style={styles.rightColumnContainer}>
              <View style={styles.imageCard}>
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
              </View>
              <Text style={styles.promptText}>{returnedPrompt}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.columnContainer}>
            <PromptInputComponent
              setPlaySound={setPlaySound}
              setPrompt={setPrompt}
              inferredPrompt={inferredPrompt}
            />
            <DropDownComponent
              setPlaySound={setPlaySound}
              passModelID={passModelIDWrapper}
            />
            <Buttons
              setPlaySound={setPlaySound}
              switchToFlan={switchToFlan}
              setInferrenceButton={setInferrenceButton}
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
              setPlaySound={setPlaySound}
              isImagePickerVisible={isImagePickerVisible}
              setImagePickerVisible={setImagePickerVisible}
              window={window}
            />
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                imageTop: isImagePickerVisible ? 40 : 0,
              }}
            >
              {isImagePickerVisible && (
                
                  <MyImagePicker
                    setIndexToDelete={setIndexToDelete}
                    columnCount={columnCount}
                    selectedImageIndex={selectedImageIndex}
                    setSelectedImageIndex={setSelectedImageIndex}
                    initialReturnedPrompt={initialReturnedPrompt}
                    setReturnedPrompt={setReturnedPrompt}
                    promptList={promptList}
                    setPromptList={setPromptList}
                    window={window}
                    setPlaySound={setPlaySound}
                    imageSource={imageSource}
                    setImageSource={setImageSource}
                   
                  />
                  )}
                  <Pressable
                    onPress={() => {
                      setSwapImage(true);
                      setPlaySound("swoosh");
                    }}
                    style={({ pressed }) => [
                      {
                        width: 60, // adjust size as needed
                        height: 60, // adjust size as needed
                        borderRadius: 30,
                        elevation: 3,
                        backgroundColor: colors.buttonBackground,
                        width: pressed ? 52 : 60,
                        height: pressed ? 52 : 60,
                        marginTop: 0,
                      },
                    ]}
                  >
                    {({ pressed }) => (
                      <Image
                        source={pressed ? rotatedCircle : circleImage}
                        style={[
                          styles.changeButton,
                          pressed
                            ? { width: 52, height: 52 }
                            : { width: 60, height: 60 },
                        ]}
                      />
                    )}
                  </Pressable>              
            </View>
            <SliderComponent setSteps={setSteps} setGuidance={setGuidance} />
            <View style={styles.imageCard}>
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
            </View>
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
    justifyContent: "center",
    alignItems: "center", // change as needed
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
    
  },
  imageStyle: {
    width: 320,
    height: 440,
    borderRadius: 18,

    alignSelf: "center",
  },
  imageCard: {
    width: 320,
    height: 440,
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
  },
});

export default registerRootComponent(App);
