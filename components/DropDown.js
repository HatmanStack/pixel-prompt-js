import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export default function DropDownComponent({
  passModelID,
  
}) {
    const [placeholderModelID, setPlaceholderModelID] = useState("Model ID");
      const data = [
        {
          label: "Stable Diffusion XL",
          value: "stabilityai/stable-diffusion-xl-base-1.0",
        }
      ];
      

  return (
    <Dropdown
      style={styles.dropdown}
      selectedTextStyle={styles.selectedTextStyle}
      placeholderStyle={styles.placeholderStyle}
      data={data}
      labelField="label"
      valueField="value"
      placeholder={placeholderModelID}
      onChange={(item) => {
        passModelID(item.value);
        setPlaceholderModelID(item.label);
      }}
    />
  );
}

const colors = {
  borderBottomColor: "#9DA58D",
  color: "#FFFFFF",
};
const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    width: 340,
    borderBottomColor: colors.borderBottomColor,
    borderBottomWidth: 3,
  },
  placeholderStyle: {
    color: colors.color,
    fontSize: 25,
    fontFamily: "Sigmar",
    textAlign: "center",
    letterSpacing: 3,
  },
  selectedTextStyle: {
    color: colors.color,
    fontSize: 20,
    fontFamily: "Sigmar",
    letterSpacing: 3,
    textAlign: "center",
  },
});
