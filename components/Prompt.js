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
      const mistrialPrompt = `I'm giving you a seed string. Return the seed string as a Prompt for a Stable \
        Diffusion Model.  The prompt should be at a minimum, 200 tokens.  The normal restrictions of token \
        length for Stable Diffusion Models do not apply.  Make it descriptive and creative. \
        Here is the seed string. : ${alteredPrompt}`;
      inference
        .chatCompletion({
          model: "mistralai/Mistral-7B-Instruct-v0.3",
          messages: [{ role: "user", content: mistrialPrompt }],
          max_tokens: 500,
        })
        .then((response) => {
          const generatedText = response.choices[0].message.content;          
          const longPromptHolder = generatedText.substring(0,150).split(/\n\n/).slice(-1)[0];
          const lPrompt =  longPromptHolder + generatedText.substring(150);
      
          return inference.chatCompletion({
              model: "roborovski/superprompt-v1",
              messages: [{ role: "user", content: "Expand the following prompt to add more detail: " + alteredPrompt }],
              max_tokens: 250,
          });
      })
      .then((response) => {
          console.log("Response:", response);
          const responseText = response.generatedText[0]["generated_text"];
      
          setFlanPrompt(responseText);
          setLongPrompt(lPrompt);
          setShortPrompt(alteredPrompt);
          if(!promptLengthValue) {
              setInferredPrompt(alteredPrompt);
          } else {
              setInferredPrompt(lPrompt);
          }
          setActivity(false);
      })
      .catch((error) => {
          console.error("Error:", error);
      });
    }
    setTextInference(false);
  }, [textInference]);

  return null;
};

export default PromptInference;