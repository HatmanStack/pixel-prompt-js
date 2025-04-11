import { useEffect, useState } from "react";
const AWS = require("aws-sdk"); 
const placeholderImage = require('../assets/avocado.jpg'); // Or a dedicated loading image asset
const errorImage = require('../assets/add_image.png');

const Inference = ({
  setGalleryLoaded,
  setGalleryLoadingStatus,
  selectedImageIndex,
  setImageSource,
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
  setInferredImage,
  setLoadingStatus
}) => {

  const [folderList, setFolderList] = useState([]);
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

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const AWS = require("aws-sdk");
    
        const s3 = new AWS.S3({
          region: process.env.EXPO_PUBLIC_AWS_REGION,
          accessKeyId: process.env.EXPO_PUBLIC_AWS_ID,
          secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET,
        });
    
        // First, get all keys in the group-images/ folder
        const params = {
          Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
          Prefix: "group-images/",
          Delimiter: "/"  // Use delimiter to get "folders"
        };
        
        console.log("Fetching folders in group-images/");
        const folderData = await s3.listObjectsV2(params).promise();
        
        // Extract folder names from CommonPrefixes (S3's way of representing folders)
        const folders = folderData.CommonPrefixes?.map(prefix => prefix.Prefix) || [];
        console.log(`Found ${folders.length} folders:`, folders);
        setGalleryLoadingStatus(Array(folders.length).fill(true));
        setImageSource(Array(folders.length).fill(placeholderImage)); // Set placeholder for all images initially
        const randomImages = [];
        const folderList = [];
        
        // For each folder, get a random image
        for (const folder of folders) {
          
          
          // Get all images in this folder
          const folderParams = {
            Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
            Prefix: folder
          };
          
          const imagesData = await s3.listObjectsV2(folderParams).promise();
          
          if (imagesData.Contents && imagesData.Contents.length > 0) {
            // Filter out non-image files if needed
            const imageKeys = imagesData.Contents
              .filter(item => !item.Key.endsWith('/')) // Exclude folder markers
              .map(item => item.Key);
            
            if (imageKeys.length < 9) {
              console.log(`Skipping folder ${folder} - only has ${imageKeys.length} images (minimum 9 required)`);
              continue; // Skip to next folder
            }  

           
              // Select a random image from this folder
              const randomIndex = Math.floor(Math.random() * imageKeys.length);
              const randomKey = imageKeys[randomIndex];
              
              console.log(`Selected random image: ${randomKey}`);
              
              try {
                // Fetch the selected image data
                const objectParams = {
                  Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
                  Key: randomKey,
                };
                
                const objectData = await s3.getObject(objectParams).promise();
                const jsonData = JSON.parse(objectData.Body.toString("utf-8"));
                
                // Add to our collections
                randomImages.push(jsonData.base64image);
                folderList.push(folder);
                const folderIndex = folders.indexOf(folder);
                
                setGalleryLoadingStatus(prevStatus => {
                  const newStatus = [...prevStatus];
                  newStatus[folderIndex] = false; 
                  return newStatus;
                });
                
              } catch (error) {
                console.error(`Error processing ${randomKey}:`, error);
                // Add placeholder for failed image
                randomImages.push(null);
                
                // Mark as loaded but with error
                const folderIndex = folders.indexOf(folder);
                if (folderIndex !== -1) {
                  setGalleryLoadingStatus(prevStatus => {
                    const newStatus = [...prevStatus];
                    newStatus[folderIndex] = false; // Still mark as loaded, but you can handle error cases differently if needed
                    return newStatus;
                  });
                }
              
              } 
            
          }
        }
        
        
        // Update app state with our random selections
        if (randomImages.length > 0) {
          console.log(`Setting ${randomImages.length} random images`);
          setImageSource(randomImages);
          
          setFolderList(folderList);
        }
        
      } catch (error) {
        console.error("Error fetching images from S3:", error);
      }
    };

    fetchGalleryImages();
  }, []);

  useEffect(() => {
    
    const fetchImagesFromS3 = async () => {
      
      if(selectedImageIndex !== null && selectedImageIndex !== undefined) {
        setGalleryLoaded(false);
        const selectedFolder = folderList[selectedImageIndex];
        console.log("Selected folder:", selectedFolder);
        const AWS = require("aws-sdk");
        setActivity(true); 
        setLoadingStatus(Array(models.length).fill(true));
        setInferredImage(Array(models.length).fill(placeholderImage));
        const loadingPrompts = Array(models.length).fill("Loading...");
        setReturnedPrompt(loadingPrompts);
       
        const s3 = new AWS.S3({
          region: process.env.EXPO_PUBLIC_AWS_REGION,
          accessKeyId: process.env.EXPO_PUBLIC_AWS_ID,
          secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET,
        });

        const params = {
          Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
          Prefix: selectedFolder
        };
        
        const data = await s3.listObjectsV2(params).promise();
        
        for (const item of data.Contents) {
         
          
          try {
            const objectParams = {
              Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
              Key: item.Key,
            };
          
            const objectData = await s3.getObject(objectParams).promise();
            const jsonData = JSON.parse(objectData.Body.toString("utf-8"));
          
            const base64Data = jsonData.base64image;
            const base64Clean = base64Data.includes('base64,') 
              ? base64Data.split('base64,')[1]  
              : base64Data; 
            const prompt = jsonData.returnedPrompt;
            
            // Find the correct model index based on the prompt content
            let modelIndex = 0; // Default to first position if no match found
            modelPlace =["stabilityai/stable-diffusion-3.5-large-turbo" ,
              "black-forest-labs/FLUX.1-schnell" ,
              "stabilityai/stable-diffusion-3.5-large" ,
             "Recraft v3", 
               "black-forest-labs/FLUX.1-dev" ,
               "AWS Nova Canvas" ,
             "Imagen 3.0" ,
            "OpenAI Dalle3" ,
              "Gemini 2.0" ]
            
            // Check which model this prompt belongs to
            
            for (let i = 0; i < models.length; i++) {
              if (prompt.includes(modelPlace[i])) {
                modelIndex = i;
                break;
              }
            }
            
            const mimeType = 'image/png'; // Or determine dynamically if possible
            const blob = base64ToBlob(base64Clean, mimeType);

            if (blob) {
                const objectURL = URL.createObjectURL(blob);
                
                setInferredImage(prevImages => {
                  const newImages = [...prevImages];
                  // --- Revoke previous URL if necessary! See point 3 ---
                  const oldUrl = newImages[modelIndex];
                  if (oldUrl && typeof oldUrl === 'string' && oldUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(oldUrl);
                  }
                  // --- End Revocation ---
                  newImages[modelIndex] = objectURL;
                  return newImages;
                });
            } else {
                
                setInferredImage(prevImages => {
                  const newImages = [...prevImages];
                  // Revoke previous if needed
                  const oldUrl = newImages[modelIndex];
                  if (oldUrl && typeof oldUrl === 'string' && oldUrl.startsWith('blob:')) {
                      URL.revokeObjectURL(oldUrl);
                  }
                  newImages[modelIndex] = errorImage; // Your static error image path
                  return newImages;
                });
            }
            // Update state with the image/prompt at the correct index
            setReturnedPrompt(prevPromptList => {
              const newPrompts = [...prevPromptList];
              newPrompts[modelIndex] = prompt;
              return newPrompts;
            });
            
           
            
            // Also update loading status to show image is loaded
            setLoadingStatus(prevStatus => {
              const newStatus = [...prevStatus];
              newStatus[modelIndex] = false;
              return newStatus;
            });
            
          } catch (error) {
            console.error(`Error processing ${item.Key}:`, error);
            continue;
          }
        }
        setGalleryLoaded(true); // Set gallery loaded to true after processing all images
        setActivity(false); // Reset activity state
      }
    };
  

    fetchImagesFromS3();
  }, [selectedImageIndex]);

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
      

      let completedRequests = 0;
      let processingErrorOccurred = false; // Track if any request fails

      // --- Set Initial Loading State for all items ---
      setActivity(true); // Indicate processing has started
      setLoadingStatus(Array(models.length).fill(true));
      // Optional: Set placeholders immediately if desired
      setInferredImage(Array(models.length).fill(placeholderImage));
      const loadingPrompts = Array(models.length).fill("Loading...");
      setReturnedPrompt(loadingPrompts);
     
      const time = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/[/:,\s]/g, '-');

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
            target: time, // Pass target data if needed
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