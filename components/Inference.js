import { useEffect, useState } from "react";
const AWS = require("aws-sdk"); 
const placeholderImage = require('../assets/avocado.jpg'); // Or a dedicated loading image asset
const errorImage = require('../assets/add_image.png');

const Inference = ({
  setImageSource,
  setPromptList,
  setInferrenceButton,
  inferrenceButton,
  setModelMessage,
  prompt,
  settingSwitch,
  control,
  guidance,
  steps,
  setActivity,
  setModelError,
  setReturnedPrompt,
  setInitialReturnedPrompt,
  setInferredImage,
  setLoadingStatus
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

    //fetchImagesFromS3();
  }, []);

  function base64ToBlob(base64, mimeType = 'image/png') {
    try {
        const byteCharacters = atob(base64); // Decode base64
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    } catch (error) {
        console.error("Error converting base64 to Blob:", error);
        return null; // Handle error appropriately
    }
}

  useEffect(() => {
    if (inferrenceButton) {
      setModelError(false);
      setModelMessage(""); // Clear previous messages

      // --- Troll check logic ---
      if (/\b(elf|elves|elven|girl|girls|fairy|fairies|pixie|pixies|naked|nude|shower)\b/i.test(prompt)) {
        const trollImages = [
          require('../assets/troll/troll_1.jpg'), require('../assets/troll/ct.png'),
          require('../assets/troll/ct1.png'), require('../assets/troll/ct2.png'),
          require('../assets/troll/ct3.png'), require('../assets/troll/ct4.png'),
          require('../assets/troll/ct5.png'), require('../assets/troll/troll_3.jpg'),
          require('../assets/troll/troll_4.jpg'),
        ];
        const trollPrompt = "Model:\nThese are not the Droids you are looking for\n\nPrompt:\nYou have to pay the Troll Toll to get inside this boys hole";
        const trollPromptsArray = Array(trollImages.length).fill(trollPrompt);

        setInferredImage(trollImages);
        setReturnedPrompt(trollPromptsArray);
        setInitialReturnedPrompt(trollPromptsArray); // Keep initial and returned in sync here
        setLoadingStatus(Array(trollImages.length).fill(false));
        setActivity(false);
        
        return; 
      }
      // --- End Troll check ---

      // Configure AWS Lambda
      const lambda = new AWS.Lambda({
        region: process.env.EXPO_PUBLIC_AWS_REGION,
        accessKeyId: process.env.EXPO_PUBLIC_AWS_ID,
        secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET,
      });

      // Define the models
      const models = [
        { label: "SD 3.5 Turbo", value: "stabilityai/stable-diffusion-3.5-large-turbo" },
        { label: "Black Forest Schnel", value: "black-forest-labs/FLUX.1-schnell" },
        { label: "SD 3.5 Large", value: "stabilityai/stable-diffusion-3.5-large" },
        { label: "Recraft v3", value: "Recraft v3" },
        { label: "Black Forest Dev", value: "black-forest-labs/FLUX.1-dev" },
        { label: "AWS Nova Canvas", value: "AWS Nova Canvas" },
        { label: "Imagen 3.0", value: "Imagen 3.0" },
        { label: "OpenAI Dalle3", value: "OpenAI Dalle3" },
        { label: "Gemini 2.0", value: "Gemini 2.0" }
      ];

      let completedRequests = 0;
      let processingErrorOccurred = false; // Track if any request fails

      // --- Set Initial Loading State for all items ---
      setActivity(true); // Indicate processing has started
      setLoadingStatus(Array(models.length).fill(true));
      // Optional: Set placeholders immediately if desired
      setInferredImage(Array(models.length).fill(placeholderImage));
      const loadingPrompts = Array(models.length).fill("Loading...");
      setReturnedPrompt(loadingPrompts);
      setInitialReturnedPrompt(loadingPrompts); // Keep initial/returned in sync during load


      // --- Process each model ---
      models.forEach((model, index) => {
        const isGoogleModel = /Gemini|Imagen|Recraft/i.test(model.value);
        const lambdaFunction = isGoogleModel
          ? process.env.EXPO_PUBLIC_AWS_LAMBDA_GOOGLE_FUNCTION
          : process.env.EXPO_PUBLIC_AWS_LAMBDA_FUNCTION;

        const params = {
          FunctionName: lambdaFunction,
          InvocationType: "RequestResponse",
          Payload: JSON.stringify({
            prompt: prompt,
            steps: steps,
            guidance: guidance,
            modelID: model.value,
            image: '', // Pass image data if using image-to-image features
            target: '', // Pass target data if needed
            control: control,
            task: "image", // Ensure lambda handles this task type
            safety: settingSwitch
          }),
        };

        console.log(`Invoking model ${index + 1}/${models.length}: ${model.label}`);

        lambda.invoke(params).promise()
          .then((data) => {
            let currentImageResult = errorImage; // Default to error image
            let currentPromptResult = `Error parsing response for ${model.label}`;
            let parseSuccess = false;

            try {
              const jsonHolder = JSON.parse(data.Payload).body;
              const responseData = JSON.parse(jsonHolder);

              // Basic validation of response
              if (responseData && responseData.output) {
                currentImageResult = responseData.output;
                // Decide which prompt to display: original user prompt or model-specific output?
                // Using original prompt combined with model label for clarity:
                currentPromptResult = `Model:\n${responseData.model || model.label}\n\nPrompt:\n${prompt}`;
                parseSuccess = true;
              } else {
                 console.error(`Invalid response structure for ${model.label}:`, responseData);
                 processingErrorOccurred = true;
              }
            } catch (error) {
              console.error(`Error parsing JSON response for ${model.label}:`, error);
              processingErrorOccurred = true;
            }

            // --- Update states incrementally using functional updates ---
            
            const mimeType = 'image/png'; // Or determine dynamically if possible
            const blob = base64ToBlob(currentImageResult, mimeType);

            if (blob) {
                const objectURL = URL.createObjectURL(blob);
                // Store the objectURL instead of base64
                // If using local accumulator (batching approach):
                // localInferredImages[index] = objectURL;

                // If using incremental state updates:
                setInferredImage(prevImages => {
                  const newImages = [...prevImages];
                  // --- Revoke previous URL if necessary! See point 3 ---
                  const oldUrl = newImages[index];
                  if (oldUrl && typeof oldUrl === 'string' && oldUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(oldUrl);
                  }
                  // --- End Revocation ---
                  newImages[index] = objectURL;
                  return newImages;
                });
            } else {
                // Handle blob creation error - maybe set an error image URL or placeholder
                // If using local accumulator:
                // localInferredImages[index] = errorImage; // Assuming errorImage is a static path
                // If using incremental updates:
                setInferredImage(prevImages => {
                  const newImages = [...prevImages];
                  // Revoke previous if needed
                  const oldUrl = newImages[index];
                  if (oldUrl && typeof oldUrl === 'string' && oldUrl.startsWith('blob:')) {
                      URL.revokeObjectURL(oldUrl);
                  }
                  newImages[index] = errorImage; // Your static error image path
                  return newImages;
                });
            }
            // Update both returned and initial prompt states to keep them in sync
            setReturnedPrompt(prevPrompts => {
              const newPrompts = [...prevPrompts];
              newPrompts[index] = currentPromptResult;
              return newPrompts;
            });
            setInitialReturnedPrompt(prevPrompts => {
              const newPrompts = [...prevPrompts];
              newPrompts[index] = currentPromptResult;
              return newPrompts;
            });
            setLoadingStatus(prevStatus => {
              const newStatus = [...prevStatus];
              newStatus[index] = false; // Mark this index as not loading
              return newStatus;
            });
          })
          .catch((error) => {
            console.error(`Lambda invocation error for ${model.label}:`, error);
            processingErrorOccurred = true;
            const lambdaErrorPrompt = `Lambda Error: ${model.label}`;

            // --- Update states incrementally on Lambda error ---
            setInferredImage(prevImages => {
              const newImages = [...prevImages];
              newImages[index] = errorImage;
              return newImages;
            });
            // Update both returned and initial prompt states
            setReturnedPrompt(prevPrompts => {
              const newPrompts = [...prevPrompts];
              newPrompts[index] = lambdaErrorPrompt;
              return newPrompts;
            });
            setInitialReturnedPrompt(prevPrompts => {
              const newPrompts = [...prevPrompts];
              newPrompts[index] = lambdaErrorPrompt;
              return newPrompts;
            });
            setLoadingStatus(prevStatus => {
              const newStatus = [...prevStatus];
              newStatus[index] = false; // Mark this index as not loading
              return newStatus;
            });

          })
          .finally(() => {
            completedRequests++;
            // Check if ALL requests are done
            if (completedRequests === models.length) {
              setActivity(false); // Reset activity state
              setInferrenceButton(false);
              if (processingErrorOccurred) {
                setModelMessage("One or more images failed to generate.");
                // setModelError(true); // Uncomment if you want a general error flag
              }
            }
          });
      }); // End models.forEach
    }
  }, [inferrenceButton]); // End useEffect for Inference Logic

  // Return null or some minimal JSX as this is a logic component
  return null;
};

export default Inference;