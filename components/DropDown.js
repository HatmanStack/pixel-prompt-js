import { useState } from "react";
import { StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export default function DropDownComponent({
  passModelID,
  
}) {
    const [placeholderModelID, setPlaceholderModelID] = useState("Model ID");
      const data = [ 
        
        {
          label: "SD 3.5 Turbo",
          value: "stabilityai/stable-diffusion-3.5-large-turbo",
        }, 
        {
          label: "Black Forest Schnel",
          value: "black-forest-labs/FLUX.1-schnell",
        },    
        {
          label: "SD 3.5 Large",
          value: "stabilityai/stable-diffusion-3.5-large",
        }, 
        
        {
          label: "Black Forest Dev",
          value: "black-forest-labs/FLUX.1-dev",
        },   
        {
          label: "AWS Nova Canvas",
          value: "AWS Nova Canvas",
        }, 
        { label: "Imagen 3.0", value: "Imagen 3.0" },
        {
          label: "OpenAI Dalle3",
          value: "OpenAI Dalle3",
        }, 
        
        { label: "Gemini 2.0", value: "Gemini 2.0" },
        
       
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
