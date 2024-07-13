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


const addImage = require("../assets/add_image.png");
const coloredDelete = require("../assets/delete_colored.png");
const deleteButton = require("../assets/delete.png");

const MyImagePicker = ({
  setIndexToDelete,
  columnCount,
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

 

  useEffect(() => {
    if (selectedImageIndex !== null) {
      setReturnedPrompt(promptList[selectedImageIndex]);
    } else {
      setReturnedPrompt(initialReturnedPrompt);
    }
  }, [selectedImageIndex]);

  

  const deleteFromImageArray = (index) => {
    setPlaySound("click");
    setSelectedImageIndex(null);
    setImageSource((prevImageSource) => {
      if (prevImageSource.length > 0) {
        return prevImageSource.filter((_, i) => i !== index);
      }
    });
    setIndexToDelete(index);
    setReturnedPrompt(promptList[index + 1]);
    setPromptList((prevPromptSource) => {
      if (prevPromptSource.length > 0) {
        return prevPromptSource.filter((_, i) => i !== index);
      }
    });
  };

  function isStartOrEndOfRow(index) {
    const isLastInRow = (selectedImageIndex + 1) % columnCount === 0 || selectedImageIndex === imageSource.length - 1;
    const isFirstInRow = selectedImageIndex % columnCount === 0;
    
    return selectedImageIndex === index + (isFirstInRow ? -1 : 1) || selectedImageIndex === index + (isFirstInRow ? -2 : isLastInRow ? 2 : -1);
  }

  return (
    <>
        <FlatList
          data={imageSource}
          key={columnCount}
          numColumns={columnCount}
          style={styles.flatListContainer}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item: source, index }) => (
            <View
              style={[
                styles.imageColumnContainer,
                {
                  width: isStartOrEndOfRow(index) ? 0 : selectedImageIndex === index ? 330 : 105,
                  height:
                    window.width < 1000 && selectedImageIndex == index
                      ? containerHeight
                      : selectedImageIndex === index
                        ? 440
                        :  105,
                        margin: 0,
                  marginTop: selectedImageIndex === index ? 20 : 0,
                  overflow: "visible"
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
                      width: isStartOrEndOfRow(index) ? 0 : selectedImageIndex === index ? 320 : 100,
                      height: isStartOrEndOfRow(index) ? 0 : selectedImageIndex === index ? 400 : 100,
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
                        width: isStartOrEndOfRow(index) ? 0 : selectedImageIndex === index ? 320 : 100,
                        height: isStartOrEndOfRow(index) ? 0 : selectedImageIndex === index ? 400 : 100,
                        borderRadius: selectedImageIndex === index ? 30 : 0,
                      },
                    ]}
                  />
                </Pressable>
              </View>
              { selectedImageIndex === null  && (
                <Pressable
                  onPress={() => {
                    deleteFromImageArray(index);
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
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
                 (
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
            </View>
          )}
        />
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
    marginTop: 20,
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