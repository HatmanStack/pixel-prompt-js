import { useEffect } from "react";
import seeds from "../assets/seeds.json";

const PromptInference = ({
  prompt,
  textInference,
  setTextInference,
  setLongPrompt,
  setShortPrompt,
  setInferredPrompt,
  promptLengthValue,
  setActivity,
  setModelError,
  setModelMessage
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
        region: process.env.EXPO_PUBLIC_AWS_REGION,
        accessKeyId: process.env.EXPO_PUBLIC_AWS_ID,
        secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET,
      });
      
      const params = {
        FunctionName: process.env.EXPO_PUBLIC_AWS_LAMBDA_FUNCTION,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({
          itemString: alteredPrompt,
          task: "text",
          ip:'1.1.1.1',
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
          if (responseData.output && responseData.output === 'Rate limit exceeded') {
            setModelError(true);
            setModelMessage('Rate limit exceeded. Please try again later.');
            setActivity(false);
            // Return early since we can't proceed with this model
            return;
          }
          const longPrompt = responseData.plain;
          //console.log(longPrompt);
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
