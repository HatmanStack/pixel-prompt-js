import React from "react";
import { StyleSheet, Pressable, Image, Text, View } from "react-native";

const Expand = ({ setPlaySound, isGuidance, visible, toggleVisibility }) => {
  const rightImage = require("../assets/right.png");
  const downImage = require("../assets/down.png");

  return (
    <View style={styles.expandContainer}>
      <View style={styles.buttonColumn}>
        <Pressable
          style={styles.expandButton}
          onPress={() => {
            setPlaySound("expand");
            toggleVisibility();
          }}
        >
          <Image
            source={visible ? downImage : rightImage}
            style={styles.expandImage}
          />
        </Pressable>
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.expandText}>
          {isGuidance ? "Guidance" : "Gallery"}
        </Text>
      </View>
      <View style={styles.ghostColumn}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  expandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  buttonColumn: {
    flex: 2,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 5,
  },
  textColumn: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  ghostColumn: {
    flex: 2,
  },
  expandButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3a3c3f",
  },
  expandImage: {
    width: 20,
    height: 20,
  },
  expandText: {
    fontSize: 24,
    color: '#ffffff',
    fontFamily: 'Sigmar',
    letterSpacing: 5,
  },
});

export default Expand;