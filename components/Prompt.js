import { useEffect } from "react";
import Constants from 'expo-constants';
import seeds from "../assets/seeds.json";

const PromptInference = ({
  setFlanPrompt,
  prompt,
  textInference,
  setTextInference,
  setLongPrompt,
  setShortPrompt,
  setInferredPrompt,
  promptLengthValue,
  setActivity,
  setModelError,
}) => {
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

      const AWS = require('aws-sdk');
      const lambda = new AWS.Lambda({
        region: Constants.manifest.extra.AWS_REGION,
          accessKeyId: Constants.manifest.extra.AWS_ID,
          secretAccessKey: Constants.manifest.extra.AWS_SECRET
      });

      const params = {
        FunctionName: Constants.manifest.extra.AWS_LAMBDA_FUNCTION,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({
          itemString: alteredPrompt,
          task: "text"
        })
      };

      lambda.invoke(params, (err, data) => {
        if (err) {
          console.error("Lambda Error:", err);
          setModelError(true);
          setActivity(false);
          return;
        }

        try {
          const jsonHolder = JSON.parse(data.Payload).body;
          const responseData = JSON.parse(jsonHolder);
          const generatedText = responseData.plain;
          const longPrompt = generatedText.split("Stable Diffusion Prompt:")[1];
          setFlanPrompt(responseData.magic);
          setLongPrompt(longPrompt);
          setShortPrompt(alteredPrompt);
          if (!promptLengthValue) {
            setInferredPrompt(alteredPrompt);
          } else {
            setInferredPrompt(longPrompt);
          }
        } catch (error) {
          console.error("Parse Error:", error);
          setModelError(true);
        }
        setActivity(false);
      });

      setTextInference(false);
    }
  }, [textInference]);
};

export default PromptInference;
