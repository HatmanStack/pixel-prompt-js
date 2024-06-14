import React, { useState } from "react";
import { Pressable, Image, View, StyleSheet, Text, Switch, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";

const MyImagePicker = ({
  imageSource,
  setImageSource,
  styleSwitch,
  setStyleSwitch,
  settingSwitch,
  setSettingSwitch,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

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
      setImageSource(prevImageSource => {
        const newImageSource = [...prevImageSource];
        newImageSource[index] = result.assets[0].uri;
        return newImageSource;
      });
    }
  };

  const styleSwitchFunction = () => {
    setStyleSwitch(!styleSwitch);
  };

  const settingSwitchFunction = () => {
    setSettingSwitch(!settingSwitch);
  };

  const deleteFromImageArray = (index) => {
    setImageSource(prevImageSource => {
        if (prevImageSource.length > 1) {
            return prevImageSource.filter((_, i) => i !== index);
        }
        return prevImageSource;
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
    <FlatList
        data={imageSource}
        numColumns={3}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item: source, index }) => (
          <View style={[styles.imageColumnContainer, {height: selectedImageIndex === index ? 400 : 200}]}>
            <View style={[styles.columnContainer,]}>
          <Pressable
              onPress={() => {
                  if(selectedImageIndex === index) {
                      setSelectedImageIndex(null);
                      return;
                  }
                  setSelectedImageIndex(index);
                  
              }}
              style={{flex: 1, alignItems: "center", justifyContent: "center"}} 
          >
              <Image
                  source={
                      typeof source === "number" ? source : { uri: source }
                  }
                  style={[
                      styles.image,
                      {width: selectedImageIndex === index ? 400 : 150, height: selectedImageIndex === index ? 400 : 150,
                        margin: 10,
                        
                      }
                  ]}
              />
          </Pressable>
          </View>
          <Pressable
              onPress={() => {
                  deleteFromImageArray(index);
              }}
              style={{position: "absolute", top: 0, right: 0}} 
          >
           {({ pressed }) => (
              <Image
                  source={pressed ? require("../assets/delete_colored.png") : require("../assets/delete.png")}
                  style={[ styles.changeButton]}
              />)}
          </Pressable>       
          <Pressable style={[styles.selectButton]} onPress={() => selectImage(index)}>
              <Text style={styles.promptText}>Select</Text>
          </Pressable>
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
  image: {
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
    height: 200,
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
    margin: 0,
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
  
  changeButton: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center", // change as needed
    elevation: 3, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOffset: { width: 0, height: 2 }, // for iOS shadow
    shadowOpacity: 0.25, // for iOS shadow
    shadowRadius: 3.84, // for iOS shadow
  },
});

export default MyImagePicker;
