import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export default function DropDownComponent({ passModelID, isImagePickerVisible, parameters }) {
  const [dropDownData, setDropDownData] = useState([
    { label: "pix2pix", value: "timbrooks/instruct-pix2pix" },
    { label: "Stable Diffusion Refiner", value: "stabilityai/stable-diffusion-xl-refiner-1.0" }]);
  const [placeholderModelID, setPlaceholderModelID] = useState("Model ID");


  useEffect(() => {
    let data = [];
    if(isImagePickerVisible) {
       data = [
        { label: "pix2pix", value: "timbrooks/instruct-pix2pix" },
        { label: "Stable Diffusion", value: "stabilityai/stable-diffusion-xl-refiner-1.0" }]
        if(parameters ) {

        setPlaceholderModelID("pix2pix");
        passModelID("timbrooks/instruct-pix2pix");
        }
    }else {
       data = [
        { label: "Step Aware", value: "SPO-Diffusion-Models/SPO-SDXL_4k-p_10ep" },
        {
          label: "Stable Diffusion",
          value: "stabilityai/stable-diffusion-xl-base-1.0",
        },
        { label: "Voxel", value: "Fictiverse/Voxel_XL_Lora" },
        { label: "Paper Cut Out", value: "Fictiverse/Stable_Diffusion_PaperCut_Model" },
        { label: "Van-Gogh", value: "dallinmackay/Van-Gogh-diffusion" },
        { label: "Robots", value: "nousr/robo-diffusion" },
        { label: "Anime", value: "Eugeoter/artiwaifu-diffusion-1.0" },
        { label: "Arcane", value: "nitrosocke/Arcane-Diffusion" },
        { label: "Balloon Art", value: "Fictiverse/Stable_Diffusion_BalloonArt_Model" },
        { label: "Open Journey", value: "prompthero/openjourney" },
        { label: "Flintstones", value: "juliajoanna/sdxl-flintstones_finetuning_1" },
        { label: "SegMind", value: "segmind/Segmind-Vega" },
        { label: "Mickey 1928", value: "Pclanglais/Mickey-1928" },
        { label: "Maps", value: "firella/202404032300-oldvis-choropleth-lora-sdxl" },
        { label: "Absolute Reality", value: "digiplay/AbsoluteReality_v1.8.1" },
        { label: "Russian Vibe", value: "0x7o/RussianVibe-XL-v2.0" },
        { label: "Photo", value: "dreamlike-art/dreamlike-photoreal-2.0" },
        { label: "Acorn", value: "digiplay/Acorn_Photo_v1" }
      ];
      if(parameters) {
      setPlaceholderModelID("Step Aware");
      passModelID("SPO-Diffusion-Models/SPO-SDXL_4k-p_10ep");
      }
    }
    setDropDownData(data);
    
    }, [isImagePickerVisible]);

  return (
    <Dropdown
      style={styles.dropdown}
      selectedTextStyle={styles.selectedTextStyle}
      placeholderStyle={styles.placeholderStyle}
      data={dropDownData}
      labelField="label"
      valueField="value"
      placeholder={placeholderModelID}
      onChange={(item) => {
        passModelID(item.value);
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
    width: 300,
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
