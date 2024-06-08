// Prompt.js
import { useEffect, useState } from 'react';
import Constants from "expo-constants";
import { HfInference } from "@huggingface/inference";
import seeds from "../assets/seeds.json"; 

const HF_TOKEN = Constants.expoConfig.extra.HF_TOKEN_VAR;
const inference = new HfInference(HF_TOKEN);

const PromptInference = ({ prompt, textInference, setTextInference, setLongPrompt, setShortPrompt, setInferredPrompt, promptLengthValue, setActivity, setModelError }) => {
  useEffect(() => {
    if (textInference) {
      setActivity(true);
      setModelError(false);
      let alteredPrompt = "";

      if (prompt === "Avocado Armchair" || prompt === "") {
        const randomIndex = Math.floor(Math.random() * seeds.seeds.length);
        alteredPrompt = seeds.seeds[randomIndex];
      } else {
        alteredPrompt = prompt;
      }
      console.log("Altered Prompt:", alteredPrompt);
      alteredPrompt = `I'm giving you a seed string for a stable diffusion model. Return two versions \
        in fewer than 500 tokens. A long version and a shortened version.  Make both descriptive and creative. \
        Here is the seed string. : ${alteredPrompt}`;
      inference
        .chatCompletion({
          model: "mistralai/Mistral-7B-Instruct-v0.3",
          messages: [{ role: "user", content: alteredPrompt }],
          max_tokens: 500,
        })
        .then((response) => {
          const generatedText = response.choices[0].message.content;
          console.log("Generated Text:", generatedText);
          const splitPrompt = generatedText.split(/Short(?:ened)? (?:Version:)?/i);
          const longPromptHolder = splitPrompt[0].substring(0,150).split(/\n\n/).slice(-1)[0];
          const lPrompt =  longPromptHolder + splitPrompt[0].substring(150)
          const holderShortPrompt = splitPrompt[1].substring(0,150).split(/\n\n/).slice(-1)[0];
          const sPrompt = holderShortPrompt + splitPrompt[1].substring(150).split(/\n\n/)[0];
          
          setLongPrompt(lPrompt);
          setShortPrompt(sPrompt);
          if(!promptLengthValue) {
            setInferredPrompt(sPrompt);
          }else {
            setInferredPrompt(lPrompt);
          }
          setActivity(false);
        })
        .catch((error) => console.error("Error:", error));
    }
    setTextInference(false);
  }, [textInference]);

  return null;
};

export default PromptInference;