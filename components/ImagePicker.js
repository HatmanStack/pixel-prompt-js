import React, { useEffect, useState } from "react";
import {
  Pressable,
  Image,
  View,
  StyleSheet,
  Text,
  Switch,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const addImage = require("../assets/add_image.png");
const coloredDelete = require("../assets/delete_colored.png");
const deleteButton = require("../assets/delete.png");

const MyImagePicker = ({
  selectedImageIndex,
  setSelectedImageIndex,
  initialReturnedPrompt,
  setReturnedPrompt,
  promptList,
  setPromptList,
  window,
  setPlaySound,
  imageSource,
  setImageSource,
  styleSwitch,
  setStyleSwitch,
  settingSwitch,
  setSettingSwitch,
}) => {
  const [textHeight, setTextHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(160);

  useEffect(() => {
    if (window.width < 1000) {
      if (selectedImageIndex !== null) {
        setContainerHeight(440 + textHeight);
      } else {
        setContainerHeight(160);
      }
    }
  }, [selectedImageIndex, textHeight]);

  const selectImage = async (index) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need media library permissions to select an image.");
      return;
    }
    console.log("Selecting image");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageSource((prevImageSource) => {
        const newImageSource = [...prevImageSource];
        newImageSource[index] = result.assets[0].uri;
        newImageSource[index + 1] = addImage;
        return newImageSource;
      });
      setPromptList((prevPromptSource) => {
        const prevPrompt = [...prevPromptSource];
        prevPrompt[index] = "Uploaded Image";
        return prevPrompt;
      });
    }
  };

  useEffect(() => {
    if (selectedImageIndex !== null) {
      setReturnedPrompt(promptList[selectedImageIndex]);
    } else {
      setReturnedPrompt(initialReturnedPrompt);
    }
  }, [selectedImageIndex]);

  const styleSwitchFunction = () => {
    setStyleSwitch(!styleSwitch);
    setPlaySound("switch");
  };

  const settingSwitchFunction = () => {
    setSettingSwitch(!settingSwitch);
    setPlaySound("switch");
  };

  const deleteFromImageArray = (index) => {
    setImageSource((prevImageSource) => {
      setPlaySound("click");
      if (prevImageSource.length > 1) {
        return prevImageSource.filter((_, i) => i !== index);
      }
      return [addImage];
    });
    setReturnedPrompt(promptList[index + 1]);
    setPromptList((prevPromptSource) => {
      if (prevPromptSource.length > 1) {
        return prevPromptSource.filter((_, i) => i !== index);
      }
      return [""];
    });
  };

  return (
    <>
      <View style={styles.switchesRowContainer}>
        <View style={styles.columnContainer}>
          <Text
            style={[
              { color: styleSwitch ? "#9DA58D" : "#FFFFFF" },
              styles.sliderText,
            ]}
          >
            Style
          </Text>
          <Switch
            trackColor={{ false: "#9DA58D", true: "#767577" }}
            thumbColor="#B58392"
            activeThumbColor="#6750A4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={styleSwitchFunction}
            value={styleSwitch}
          />
        </View>
        <View style={styles.columnContainer}>
          <Text
            style={[
              { color: settingSwitch ? "#9FA8DA" : "#FFFFFF" },
              styles.sliderText,
            ]}
          >
            Layout
          </Text>
          <Switch
            trackColor={{ false: "#958DA5", true: "#767577" }}
            thumbColor="#B58392"
            activeThumbColor="#6750A4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={settingSwitchFunction}
            value={settingSwitch}
          />
        </View>
      </View>
      <View style={styles.flatListContainer}>
        <FlatList
          data={imageSource}
          numColumns={window.width < 1000 ? 2 : 3}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item: source, index }) => (
            <View
              style={[
                styles.imageColumnContainer,
                {
                  width: selectedImageIndex == index + 1 ? 0 : selectedImageIndex === index ? 330 : 160,
                  height:
                    window.width < 1000 && selectedImageIndex == index
                      ? containerHeight
                      : selectedImageIndex === index
                        ? 440
                        : 160,
                },
              ]}
            >
              <View style={[styles.columnContainer]}>
                <Pressable
                  onPress={() => {
                    setPlaySound("click");
                    if (selectedImageIndex === index) {
                      setSelectedImageIndex(null);
                      return;
                    }
                    setSelectedImageIndex(index);
                  }}
                  style={[
                    styles.imageCard,
                    {
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                      width: selectedImageIndex == index + 1 ? 0 : selectedImageIndex === index ? 320 : 100,
                      height: selectedImageIndex == index + 1 ? 0 : selectedImageIndex === index ? 400 : 110,
                      borderRadius: selectedImageIndex === index ? 30 : 0,
                    },
                  ]}
                >
                  <Image
                    source={
                      typeof source === "number" ? source : { uri: source }
                    }
                    style={[
                      {
                        width: selectedImageIndex == index + 1 ? 0 : selectedImageIndex === index ? 320 : 100,
                        height: selectedImageIndex == index + 1 ? 0 : selectedImageIndex === index ? 400 : 110,
                        borderRadius: selectedImageIndex === index ? 30 : 0,
                      },
                    ]}
                  />
                </Pressable>
              </View>
              {index !== imageSource.length - 1 && (
                <Pressable
                  onPress={() => {
                    deleteFromImageArray(index);
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: selectedImageIndex === index ? 0 : 15,
                  }}
                >
                  {({ pressed }) => (
                    <Image
                      source={pressed ? coloredDelete : deleteButton}
                      style={[styles.changeButton]}
                    />
                  )}
                </Pressable>
              )}
              {window.width < 1000 &&
                selectedImageIndex === index &&
                index !== imageSource.length - 1 && (
                  <Text
                    style={[styles.promptText, { flexShrink: 1 }]}
                    numberOfLines={1000}
                    onLayout={(event) => {
                      const { height } = event.nativeEvent.layout;
                      setTextHeight(height);
                    }}
                  >
                    {promptList[index]}
                  </Text>
                )}
              {index === imageSource.length - 1 && (
                <Pressable
                  style={[styles.selectButton]}
                  onPress={() => {
                    setPlaySound("click");
                    selectImage(index);
                  }}
                >
                  <Text style={styles.promptText}>Select</Text>
                </Pressable>
              )}
            </View>
          )}
        />
      </View>
    </>
  );
};

const colors = {
  backgroundColor: "#25292e",
  selectButtonBackground: "#3a3c3f",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  flatListContainer: {
    width: "auto",
    height: "auto",
  },
  switchesRowContainer: {
    backgroundColor: colors.backgroundColor,
    alignItems: "center",
    justifyContent: "center",
    width: 300,
    height: 50,
    marginBottom: 20,
    flexDirection: "row",
    overflow: "auto",
  },
  imageColumnContainer: {
    marginTop: 10,
    alignItems: "center",
    flexDirection: "column",
    overflow: "auto",
  },
  columnContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
  },
  selectButton: {
    marginTop: 10,
    borderRadius: 4,
    paddingHorizontal: 32,
    elevation: 3,
    fontFamily: "Sigmar",
    backgroundColor: colors.selectButtonBackground,
  },
  promptText: {
    color: colors.white,
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
  imageCard: {
    backgroundColor: colors.buttonBackground,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  changeButton: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MyImagePicker;
