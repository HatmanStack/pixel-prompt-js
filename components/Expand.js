import React from 'react';
import {StyleSheet, Pressable, Image } from 'react-native'; 
import { Dimensions } from 'react-native';

const Expand = ({isImagePickerVisible, setImagePickerVisible, window}) => {
  return (
    
      <Pressable
      style={[
        styles.expandButton,
        {
          alignSelf: 'flex-start',
          marginLeft: window.width < 1000 ? '20%' : '0',
          marginBottom: 0,
        },
      ]}
        onPress={() => setImagePickerVisible(!isImagePickerVisible)}
      >
        {isImagePickerVisible ? (
          <Image
            source={require("../assets/right.png")}
            style={styles.expandImage}
          />
        ) : (
          <Image
            source={require("../assets/down.png")}
            style={styles.expandImage}
          />
        )}
      </Pressable>
      
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
    },
    expandImage: {
      width: 20,
      height: 20,
    }
  });

export default Expand;