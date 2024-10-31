import React from "react";
import { StyleSheet, Pressable, Image, Text, View } from "react-native";
import { Dimensions } from "react-native";

const Expand = ({ setPlaySound, isImagePickerVisible, setImagePickerVisible, setIsGuidanceVisible, isGuidanceVisible, isGuidance }) => {

  const rightImage = require("../assets/right.png");
  const downImage = require("../assets/down.png");
  
  return (
    <View style={[styles.galleryContainer]}>
    <Pressable
      style={[
        styles.expandButton,
      ]}
      onPress={() => {setPlaySound("expand"); {isGuidance ? setIsGuidanceVisible(!isGuidanceVisible): 
        setImagePickerVisible(!isImagePickerVisible)
        }}}
    >
      {isGuidance ? isGuidanceVisible ? (<Image
          source={downImage}
          style={styles.expandImage}
        />
      ) : (
        <Image
          source={rightImage}
          style={styles.expandImage}
        />
      ): isImagePickerVisible ? (
        <Image
          source={downImage}
          style={styles.expandImage}
        />
      ) : (
        <Image
          source={rightImage}
          style={styles.expandImage}
        />
      )}
      
    </Pressable>
    <Text style={{fontSize: 24, color: '#ffffff', fontFamily: 'Sigmar', letterSpacing: 5}}>{isGuidance ? "Guidance": "Gallery"}</Text>
    </View>
  );
};

const colors = {
  buttonBackground: "#3a3c3f",
};

const styles = StyleSheet.create({
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
    marginRight: 30,
    margin:5
  },
  expandImage: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryContainer: {
    flex:1,
    flexDirection:'row',
    alignSelf: "flex-start",
    marginLeft: Dimensions.get('window').width < 1000 ? "20%" : "20%",
    marginBottom: 10,
    
  }
});

export default Expand;
