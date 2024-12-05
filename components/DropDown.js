import { useState } from "react";
import { StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export default function DropDownComponent({
  passModelID,
  
}) {
    const [placeholderModelID, setPlaceholderModelID] = useState("Model ID");
      const data = [ 
        {
          label: "Random",
          value: "Random",
        },
        {
          label: "True Random",
          value: "True Random",
        },
        {
          label: "SD 3.5 Turbo",
          value: "stabilityai/stable-diffusion-3.5-large-turbo",
        },   
        {
          label: "AWS Nova Canvas",
          value: "AWS Nova Canvas",
        }, 
        {
          label: "OpenAI Dalle3",
          value: "OpenAI Dalle3",
        }, 
        {
          label: "SD 3.5 Large",
          value: "stabilityai/stable-diffusion-3.5-large",
        }, 
        { label: "Pixel", value: "nerijs/pixel-art-xl" },
        { label: "Voxel", value: "Fictiverse/Voxel_XL_Lora" },
        { label: "Anime - (gsdf)", value: "gsdf/Counterfeit-V2.5" },
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
        passModelID(item);
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
