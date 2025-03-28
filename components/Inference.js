import { useEffect, useState } from "react";


const Inference = ({
  setImageSource,
  setPromptList,
  selectedImageIndex,
  setInferrenceButton,
  inferrenceButton,
  setModelMessage,
  imageSource,
  modelID,
  prompt,
  styleSwitch,
  settingSwitch,
  control,
  guidance,
  steps,
  setActivity,
  setModelError,
  setReturnedPrompt,
  setInitialReturnedPrompt,
  setInferredImage,
}) => {

  const [apiCalls, setApiCalls] = useState([]);
  useEffect(() => {
    const fetchImagesFromS3 = async () => {
      try {
        const AWS = require("aws-sdk");

        const s3 = new AWS.S3({
          region: process.env.EXPO_PUBLIC_AWS_REGION,
          accessKeyId: process.env.EXPO_PUBLIC_AWS_ID,
          secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET,
        });

        const params = {
          Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
        };
        
        const data = await s3.listObjectsV2(params).promise();
        
        for (const item of data.Contents) {
          if (item.Key === "images/") continue;
          if (item.Key.includes('cache')) continue;
          if (item.Key.includes('overflow_images')) continue;
          if (item.Key.includes('nondisplay_images')) continue;
          if (item.Key.includes('prompts')) continue;
          if (item.Key.includes('rate')) continue;
          
          try {
            const objectParams = {
              Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
              Key: item.Key,
            };
            if(item.Key.includes('ratelimit.json')){
              setApiCalls((JSON.parse(objectData.Body.toString("utf-8"))).timestamps);
            }

            const objectData = await s3.getObject(objectParams).promise();
            const jsonData = JSON.parse(objectData.Body.toString("utf-8"));

            const base64Data = jsonData.base64image;
            const prompt = jsonData.returnedPrompt;
            setPromptList((prevPromptList) => [prompt, ...prevPromptList]);
            setImageSource((prevImageSource) => [
              base64Data,
              ...prevImageSource,
            ]);
          } catch (error) {
            console.error(`Error processing ${item.Key}:`, error);
            continue;
          }
        }
      } catch (error) {
        console.error("Error fetching images from S3:", error);
      }
    };

    fetchImagesFromS3();
  }, []);

  useEffect(() => {
    if (inferrenceButton) {
      setModelError(false);
      setActivity(true);
      if (/\b(elf|elves|elven|girl|girls|fairy|fairies|pixie|pixies|naked|nude|shower)\b/i.test(prompt)) {
          const trollImages = [
            require('../assets/troll/troll_1.jpg'),
            require('../assets/troll/ct.png'),
            require('../assets/troll/ct1.png'),
            require('../assets/troll/ct2.png'),
            require('../assets/troll/ct3.png'),
            require('../assets/troll/troll_3.jpg'),
            require('../assets/troll/troll_4.jpg'), 
        ];
        const randomTroll = trollImages[Math.floor(Math.random() * trollImages.length)];
        setReturnedPrompt(
          "Model:\nThese are not the Droids you are looking for\n\nPrompt:\nYou have to pay the Troll Toll to get inside this boys hole" 
        );
        setInferredImage(randomTroll);
        setActivity(false);
        setInferrenceButton(false);
        return;
    }
      let inferreceModel = modelID.value;
      
      const controlImage = imageSource[selectedImageIndex];

      const AWS = require("aws-sdk");
      const lambda = new AWS.Lambda({
        region: process.env.EXPO_PUBLIC_AWS_REGION,
        accessKeyId: process.env.EXPO_PUBLIC_AWS_ID,
        secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET,
      });
      

      
      const params = {
        FunctionName: /Gemini|Imagen/i.test(modelID.value)
      ? process.env.EXPO_PUBLIC_AWS_LAMBDA_GOOGLE_FUNCTION
      : process.env.EXPO_PUBLIC_AWS_LAMBDA_FUNCTION,
        InvocationType: "RequestResponse",
        Payload: JSON.stringify({
          prompt: prompt,
          steps: steps,
          guidance: guidance,
          modelID: inferreceModel,
          image: controlImage,
          target: '',
          control: control,
          task: "image",
          safety: settingSwitch
        }),
      };
      console.log(params);
      lambda
        .invoke(params)
        .promise()
        .then((data) => {
          const jsonHolder = JSON.parse(data.Payload).body;
          const responseData = JSON.parse(jsonHolder);
          
          if (/Model Waking/.test(responseData.output)) {
            setModelMessage("Model Waking");
            setModelError(true);
          } else if (
            /You have exceeded your GPU quota/.test(responseData.output)
          ) {
            const gpu = responseData.output.split(": ")[2];
            const gpuName = gpu.slice(-9);
            setModelMessage(
              `GPU Quota Exceeded! Try Random Models without enlarged images for ${gpuName.slice(0, -1)}`
            );
            setModelError(true);
          } else if (/An error occurred/.test(responseData.output)) {
            setModelMessage(`Model Error!`);
            setModelError(true);
          } else if (/Rate/.test(responseData.output)) {
            setModelMessage(`Rate Limit Exceeded`);
            setModelError(true);
          } else {
            setInitialReturnedPrompt(
              "Model:\n" + responseData.model + "\n\nPrompt:\n" + prompt
            );
            setModelError(false);
          }
          
          setInferrenceButton(false);
          setActivity(false);
          setReturnedPrompt(
            "Model:\n" + responseData.model + "\n\nPrompt:\n" + prompt
          );
          setInferredImage("data:image/png;base64," + responseData.output);
        })
        .catch((error) => {
          setModelMessage("Application Error!");
          setActivity(false);
          setModelError(true);
          setInferrenceButton(false);
          console.log(error);
        });
    }
  }, [inferrenceButton]);
};

export default Inference;