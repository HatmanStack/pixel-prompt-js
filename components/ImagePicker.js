import React from "react";
import { Pressable, Image, View, StyleSheet, Text, Switch } from "react-native";
import * as ImagePicker from "expo-image-picker";

const MyImagePicker = ({
  imageSource,
  setImageSource,
  styleSwitch,
  setStyleSwitch,
  settingSwitch,
  setSettingSwitch,
}) => {
  const selectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need media library permissions to select an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageSource(result.assets[0]);
    }
  };

  const styleSwitchFunction = () => {
    setStyleSwitch(!styleSwitch);
  };

  const settingSwitchFunction = () => {
    setSettingSwitch(!settingSwitch);
  };

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
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

      {imageSource ? (
        <Image source={imageSource} style={styles.image} />
      ) : (
        <Image source={require("../assets/busta.png")} style={styles.image} />
      )}
      <Pressable style={styles.selectButton} onPress={selectImage}>
        <Text style={styles.promptText}>Select</Text>
      </Pressable>
    </View>
  );
};

const colors = {
  backgroundColor: "#25292e",
  selectButtonBackground: "#3a3c3f",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  rowContainer: {
    backgroundColor: colors.backgroundColor,
    alignItems: "center",
    flex: 1,
    width: "100%",
    flexDirection: "row",
    overflow: "auto",
  },
  columnContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
  },
  selectButton: {
    margin: 20,
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
});

export default MyImagePicker;
