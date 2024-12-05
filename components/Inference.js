import { useEffect } from "react";
import Constants from 'expo-constants';

function getScaledIP(styleSwitch, settingSwitch) {
  let scaledIP = 'Load original IP-Adapter';
  if (styleSwitch) {
    scaledIP = "Load only style blocks";
  }
  if (settingSwitch) {
    scaledIP = "Load only layout blocks";
  }
  if (styleSwitch && settingSwitch) {
    scaledIP = "Load style+layout block";
  }
  return scaledIP;
}

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
 
  useEffect(() => {
    const fetchImagesFromS3 = async () => {
      try {
        const AWS = require('aws-sdk');
        

        const s3 = new AWS.S3({
          region: Constants.manifest.extra.AWS_REGION,
          accessKeyId: Constants.manifest.extra.AWS_ID,
          secretAccessKey: Constants.manifest.extra.AWS_SECRET
        });
        
        const params = {
          Bucket: Constants.manifest.extra.S3_BUCKET
        };
        
        const data = await s3.listObjectsV2(params).promise();
        
        for (const item of data.Contents) {
          
          const objectParams = {
            Bucket: Constants.manifest.extra.S3_BUCKET,
            Key: item.Key
          };
          
          const objectData = await s3.getObject(objectParams).promise();
          const jsonData = JSON.parse(objectData.Body.toString('utf-8'));
          
          const base64Data = jsonData.base64image; 
          const prompt = jsonData.returnedPrompt; 
          setPromptList(prevPromptList => [prompt, ...prevPromptList]);
          setImageSource(prevImageSource => [base64Data, ...prevImageSource]);
        }

      } catch (error) {
        console.error('Error fetching images from S3:', error);
      }
    };

    fetchImagesFromS3();
  }, []);

  useEffect(() => {
    if (inferrenceButton) {
      setActivity(true);
      let inferreceModel = modelID.value;
      const ipScaleHolder = getScaledIP(styleSwitch, settingSwitch);
      const controlImage = imageSource[selectedImageIndex];

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
          prompt: prompt,
          steps: steps,
          guidance: guidance,
          modelID: inferreceModel,
          image: controlImage,
          target: ipScaleHolder,
          control: control,
          task: "image"
        })
      };

      lambda.invoke(params)
        .promise()
        .then(data => {
          const jsonHolder = JSON.parse(data.Payload).body;
          const responseData = JSON.parse(jsonHolder);
          console.log(responseData);
          if (/Model Waking/.test(responseData.output)) {
            setModelMessage("Model Waking");
            setModelError(true);
          } else if(/You have exceeded your GPU quota/.test(responseData.output)) {
            const gpu = responseData.output.split(": ")[2];
            const gpuName = gpu.slice(-9);
            setModelMessage(`GPU Quota Exceeded! Try Random Models without enlarged images for ${gpuName.slice(0,-1)}`);
            setModelError(true);
          } else if(/An error occurred/.test(responseData.output)) {
            setModelMessage(`Model Error!`);
            setModelError(true);
          } else {
            setInitialReturnedPrompt("Model:\n" + responseData.model + "\n\nPrompt:\n" + prompt);
            setModelError(false);
          }
          if(responseData.NSFW) {
            setModelMessage(`NSFW...Image will not be Saved`);
            setModelError(true);
          }

          setInferrenceButton(false);
          setActivity(false);
          setReturnedPrompt("Model:\n" + responseData.model + "\n\nPrompt:\n" + prompt);
          setInferredImage("data:image/png;base64," + responseData.output);
        })
        .catch(error => {
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
