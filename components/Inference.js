// Inference.js
import { useEffect } from 'react';
import { HfInference } from "@huggingface/inference";
import Constants from "expo-constants";

const HF_TOKEN = Constants.expoConfig.extra.HF_TOKEN_VAR;
const inference = new HfInference(HF_TOKEN);

const Inference = ({ setInferrencebutton, inferrenceButton, setModelMessage, parameters, modelID, prompt, isImagePickerVisible, styleSwitch, settingSwitch, guidance, steps, setActivity, setModelError, setReturnedPrompt, setInferredImage }) => {
  useEffect(() => {
    if (inferrenceButton) {
      setActivity(true);
      setModelError(false);
      let alteredPrompt = "";
      if (modelID.includes("dallinmackay")) {
        alteredPrompt = "lvngvncnt, " + prompt;
      } else if (modelID.includes("nousr")) {
        alteredPrompt = "nousr robot, " + prompt;
      } else if (modelID.includes("nitrosocke")) {
        alteredPrompt = "arcane, " + prompt;
      } else if (modelID.includes("dreamlike")) {
        alteredPrompt = "photo, " + prompt;
      } else if (modelID.includes("prompthero")) {
        alteredPrompt = "mdjrny-v4 style, " + prompt;
      } else if (modelID.includes("Voxel")){
        alteredPrompt = "voxel style, " + prompt;
      } else if (modelID.includes("BalloonArt")){
        alteredPrompt = "BalloonArt, " + prompt;
      } else if (modelID.includes("PaperCut")){
        alteredPrompt = "PaperCut, " + prompt;
      } else {
        alteredPrompt = prompt;
      }
      console.log("Parameters:", parameters);
      let scale = {};
      if (isImagePickerVisible) {                      //   Check for timeline on IP Adapater inference API
        setModelMessage('Inference API img2img NotAvailable!');
        setActivity(false);
        setModelError(true);
        setInferrencebutton(false);
        /** 
        alteredPrompt = prompt;
        if (styleSwitch) {
          scale = {
            up: { block_0: [0.0, 1.0, 0.0] },
          };
        }
        if (settingSwitch) {
          scale = {
            down: { block_2: [0.0, 1.0] },
            up: { block_0: [0.0, 1.0, 0.0] },
          };
        }*/
      } else {
      inference
        .textToImage({
          model: modelID,
          inputs: alteredPrompt,
          parameters: {
            negative_prompt: "blurry",
            guidance: guidance,
            steps: steps,
          },
        })
        .then((response) => {
          setReturnedPrompt(prompt);
          if (response instanceof Blob) {           // InferenceClient to check for List of Active Models
            const reader = new FileReader();
            reader.onload = () => {
              setActivity(false);
              setInferrencebutton(false);
              if (typeof reader.result === "string") {
                console.log("Blob read successfully")
                setInferredImage(reader.result);
              } else {
                console.error(
                  "Expected reader.result to be a string, got",
                  typeof reader.result
                );
              }
            };
            reader.onerror = (error) => {
              console.log("Error reading Blob:", error);
            };
            reader.readAsDataURL(response);
          }
        })
        .catch(function (error) {
          setInferrencebutton(false);
          setActivity(false);
          setModelError(true);
          console.log(error);
        });
      }
    }
  }, [inferrenceButton]);

  return null;
};

export default Inference;