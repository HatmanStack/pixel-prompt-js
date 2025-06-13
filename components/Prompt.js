import { useEffect } from "react";
import { useAppStore } from '../stores/useAppStore';
import ModelService from '../services/ModelService';
import seeds from "../assets/seeds.json";

const PromptInference = () => {
  const {
    prompt,
    textInference,
    promptLengthValue,
    setTextInference,
    setLongPrompt,
    setShortPrompt,
    setInferredPrompt,
    setActivity,
    setModelError,
  } = useAppStore();
  
  useEffect(() => {
    if (!textInference) return;

    const generatePrompt = async () => {
      try {
        setActivity(true);
        setModelError(false, "");
        
        // Use seed prompt if default or empty
        let alteredPrompt = prompt;
        if (prompt === "Avocado Armchair" || prompt === "") {
          const randomIndex = Math.floor(Math.random() * seeds.seeds.length);
          alteredPrompt = seeds.seeds[randomIndex];
        }
        
        const result = await ModelService.generateTextPrompt(alteredPrompt);
        
        if (result.success) {
          setLongPrompt(result.longPrompt);
          setShortPrompt(result.shortPrompt);
          
          // Set the appropriate prompt based on current toggle state
          if (promptLengthValue) {
            setInferredPrompt(result.longPrompt);
          } else {
            setInferredPrompt(result.shortPrompt);
          }
        }
        
      } catch (error) {
        console.error("Prompt generation error:", error);
        setModelError(true, error.message);
      } finally {
        setActivity(false);
        setTextInference(false);
      }
    };

    generatePrompt();
  }, [
    textInference,
    prompt,
    promptLengthValue,
    setActivity,
    setModelError,
    setLongPrompt,
    setShortPrompt,
    setInferredPrompt,
    setTextInference
  ]);

  return null; // This is a logic-only component
};

export default PromptInference;
