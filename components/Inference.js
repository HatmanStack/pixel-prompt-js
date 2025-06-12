import { useEffect, useState } from "react";
const AWS = require("aws-sdk");

// Initialize AWS clients once
const s3Client = new AWS.S3({
  region: process.env.EXPO_PUBLIC_AWS_REGION,
  accessKeyId: process.env.EXPO_PUBLIC_AWS_ID,
  secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET,
});

const lambdaClient = new AWS.Lambda({
  region: process.env.EXPO_PUBLIC_AWS_REGION,
  accessKeyId: process.env.EXPO_PUBLIC_AWS_ID,
  secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET,
  httpOptions: {
    timeout: 60000,
  },
});

const placeholderImage = require('../assets/avocado.jpg'); // Or a dedicated loading image asset
const errorImage = require('../assets/add_image.png');
const trollImages = require('../assets/trolls.json');
const cloudFrontDomain = process.env.EXPO_PUBLIC_CLOUDFRONT_DOMAIN;


const Inference = ({
  setGalleryLoaded,
  selectedImageIndex,
  setImageSource,
  setInferrenceButton,
  inferrenceButton,
  setModelMessage,
  prompt,
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
   "Stable Diffusion 3.5 Turbo",
    "Black Forest Pro", 
     "Stable Diffusion 3.5 Large", 
     "Recraft v3", 
     "Black Forest Dev", 
     "AWS Nova Canvas", 
     "Imagen 3.0", 
     "OpenAI Dalle3", 
     "Gemini 2.0",
  ];
  const [time, setTime] = useState(new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/[/:,\s]/g, '-'));

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        // First, get all keys in the group-images/ folder
        const params = {
          Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
          Prefix: "group-images/",
          Delimiter: "/"  // Use delimiter to get "folders"
        };
        
        //console.log("Fetching folders in group-images/");
        const folderData = await s3Client.listObjectsV2(params).promise();
        
        // Extract folder names from CommonPrefixes (S3's way of representing folders)
        const folders = folderData.CommonPrefixes?.map(prefix => prefix.Prefix) || [];
        //console.log(`Found ${folders.length} folders:`, folders);
        
        // Set initial states ONLY ONCE before we start processing folders
        setFolderList(Array(folders.length).fill('Holder-Image/'));
        setImageSource(Array(folders.length).fill(placeholderImage));
        
        // For each folder, get a random image
        const imageProcessingPromises = folders.map(async (folder, folderIndex) => {
          // Get all images in this folder
          const folderParams = {
            Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
            Prefix: folder
          };
          
          const imagesData = await s3Client.listObjectsV2(folderParams).promise();
          
          if (imagesData.Contents && imagesData.Contents.length > 0) {
            // Filter out non-image files
            const imageKeys = imagesData.Contents
              .filter(item => !item.Key.endsWith('/'))
              .map(item => item.Key);
            
            if (imageKeys.length === 0) return;
            
            // Select a random image from this folder
            const randomIndex = Math.floor(Math.random() * imageKeys.length);
            const randomKey = imageKeys[randomIndex];
            
            //console.log(`Selected random image: ${randomKey}`);
            
            try {
              // Fetch the selected image data
              const objectUrlCF = `https://${cloudFrontDomain}/${randomKey}`;
              
              const response = await fetch(objectUrlCF);
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              const objectData = await response.json(); // If you're expecting JSON
              const jsonData = objectData; 
              
              // Convert base64 to Blob URL
              const base64Data = jsonData.base64image;
              const base64Clean = base64Data.includes('base64,') 
                ? base64Data.split('base64,')[1]  
                : base64Data;
              
              const mimeType = 'image/png';
              const blob = base64ToBlob(base64Clean, mimeType);
              
              if (blob) {
                const objectURL = URL.createObjectURL(blob);

                if (folderIndex !== -1) {
                  setImageSource(prevImages => {
                    const newImages = [...prevImages];
                    newImages[folderIndex] = objectURL;
                    return newImages;
                  });

                  setFolderList(prevFolders => {
                    const newFolders = [...prevFolders];
                    newFolders[folderIndex] = folder;
                    return newFolders;
                  });
                }
              } else {
                // Handle blob creation error
                console.error(`Error creating blob for ${randomKey}`);
              }
            } catch (error) {
              console.error(`Error processing ${randomKey}:`, error);
            }
          }
        });

        await Promise.allSettled(imageProcessingPromises);
        
        // After all folders are processed
        if (folders.length > 0) {
          //console.log(`Processed ${folders.length} folders`);
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
        setActivity(true); 
        setLoadingStatus(Array(models.length).fill(true));
        setInferredImage(Array(models.length).fill(placeholderImage));
        const loadingPrompts = Array(models.length).fill("Loading...");
        setReturnedPrompt(loadingPrompts);
       
        const params = {
          Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
          Prefix: selectedFolder
        };
        
        const data = await s3Client.listObjectsV2(params).promise();
        
        const imageProcessingPromises = data.Contents.map(async (item) => {
          try {
            const objectUrlCF = `https://${cloudFrontDomain}/${item.Key}`;
            
            const response = await fetch(objectUrlCF);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const objectData = await response.json();
            const jsonData = objectData; 
            
            const base64Data = jsonData.base64image;
            const base64Clean = base64Data.includes('base64,') 
              ? base64Data.split('base64,')[1]  
              : base64Data; 
            const prompt = jsonData.returnedPrompt;
            
            let modelIndex = 0;
            for (let i = 0; i < models.length; i++) {
              if (prompt.includes(models[i])) {
                modelIndex = i;
                break;
              }
            }
            
            const mimeType = 'image/png';
            const blob = base64ToBlob(base64Clean, mimeType);

            if (blob) {
                const objectURL = URL.createObjectURL(blob);
                setInferredImage(prevImages => {
                  const newImages = [...prevImages];
                  const oldUrl = newImages[modelIndex];
                  if (oldUrl && typeof oldUrl === 'string' && oldUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(oldUrl);
                  }
                  newImages[modelIndex] = objectURL;
                  return newImages;
                });
            } else {
                setInferredImage(prevImages => {
                  const newImages = [...prevImages];
                  const oldUrl = newImages[modelIndex];
                  if (oldUrl && typeof oldUrl === 'string' && oldUrl.startsWith('blob:')) {
                      URL.revokeObjectURL(oldUrl);
                  }
                  newImages[modelIndex] = errorImage;
                  return newImages;
                });
            }
            setReturnedPrompt(prevPromptList => {
              const newPrompts = [...prevPromptList];
              newPrompts[modelIndex] = prompt;
              return newPrompts;
            });
            
            setLoadingStatus(prevStatus => {
              const newStatus = [...prevStatus];
              newStatus[modelIndex] = false;
              return newStatus;
            });
            
          } catch (error) {
            console.error(`Error processing ${item.Key}:`, error);
            // Decide how to handle individual errors, e.g., set specific error states
          }
        });

        await Promise.allSettled(imageProcessingPromises);

        setLoadingStatus(Array(models.length).fill(false));

        setInferredImage(prevImages => {
          const newImages = [...prevImages];
          newImages.forEach((image, index) => {
            if (image === placeholderImage) {
              setReturnedPrompt(prevPrompts => {
                const newPrompts = [...prevPrompts];
                newPrompts[index] = `No image found for model: ${models[index]}`;
                return newPrompts;
              });
            }
          });
          return newImages;
        });
        setGalleryLoaded(true);
        setActivity(false);
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

  const getClientIP = async () => {
    try {
      
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      
      return data.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
      return 'unknown-ip';
    }
  };

  useEffect(() => {
    const processModels = async () => {
    if (inferrenceButton) {
      
      setModelError(false);
      setModelMessage(""); // Clear previous messages
      
      if (/\b(elf|elves|elven|girl|girls|fairy|fairies|pixie|pixies|naked|nude|shower)\b/i.test(prompt)) {
        // Example: Set the base64 images in state
        const convertBase64ToBlobs = (imagesJson) => {
          const blobs = {};
        
          Object.keys(imagesJson).forEach((key) => {
            const base64Data = imagesJson[key];
            const mimeType = 'image/png'; // Adjust the MIME type if necessary
            const blob = base64ToBlob(base64Data, mimeType);
        
            if (blob) {
              blobs[key] = URL.createObjectURL(blob); // Create a blob URL for each image
            } else {
              console.error(`Failed to convert base64 to blob for key: ${key}`);
            }
          });
        
          return blobs;
        };
        
        // Convert the troll images to blobs
        
        
        const trollPrompt = "Model:\nThese are not the Droids you are looking for\n\nPrompt:\nYou have to pay the Troll Toll to get inside this boys hole";
        const trollPromptsArray = Array(9).fill(trollPrompt);
        setReturnedPrompt(trollPromptsArray);
        setLoadingStatus(Array(trollImages.length).fill(false));
        const trollImageBlobs = convertBase64ToBlobs(trollImages);
        setInferredImage(Object.values(trollImageBlobs));
        setActivity(false);
        setInferrenceButton(false);
        return; 
      }
      
      // --- End Troll check ---
      if (prompt.trim() === "") {
        setModelError(true);
        setModelMessage("Please enter a prompt before inferring.");
        return;
      }
      setActivity(true);
      setLoadingStatus(Array(models.length).fill(true));
      setInferredImage(Array(models.length).fill(placeholderImage));
      const loadingPrompts = Array(models.length).fill("Loading...");
      setReturnedPrompt(loadingPrompts);
      
      const clientIP = await getClientIP();
      let processingErrorOccurred = false;

      const modelPromises = models.map(async (model, index) => {
        const params = {
          FunctionName: process.env.EXPO_PUBLIC_AWS_LAMBDA_FUNCTION,
          InvocationType: "RequestResponse",
          Payload: JSON.stringify({
            prompt: prompt,
            steps: steps,
            guidance: guidance,
            modelID: model,
            ip: clientIP,
            target: time,
            control: control,
            task: "image"
          }),
        };

        try {
          const data = await lambdaClient.invoke(params).promise();
          let currentImageResult = errorImage;
          let currentPromptResult = `Error parsing response for ${model}`;

          try {
            const jsonHolder = JSON.parse(data.Payload).body;
            const responseData = JSON.parse(jsonHolder);

            if (responseData.output && responseData.output === 'Rate limit exceeded') {
              setModelError(true);
              setModelMessage('Rate limit exceeded. Please try again later.');
              processingErrorOccurred = true; // Mark that an error occurred
              // No need to set individual state here as it will be handled by Promise.allSettled
              return { status: 'rejected', reason: 'Rate limit exceeded', model, index };
            }
            if (responseData.output && /Error/.test(responseData.output)) {
              currentImageResult = placeholderImage;
              currentPromptResult = `Model:\n${responseData.model}\n\n${responseData.output}`;
            } else if (responseData && responseData.output) {
              currentImageResult = responseData.output;
              currentPromptResult = `Model:\n${responseData.model || model}\n\nPrompt:\n${prompt}`;
            } else {
              console.error(`Invalid response structure for ${model}:`, responseData);
              processingErrorOccurred = true;
            }
          } catch (error) {
            console.error(`Error parsing JSON response for ${model}:`, error);
            processingErrorOccurred = true;
          }

          return { status: 'fulfilled', value: { currentImageResult, currentPromptResult, index, model } };
        } catch (error) {
          console.error(`Lambda invocation error for ${model}:`, error);
          processingErrorOccurred = true;
          return { status: 'rejected', reason: error, model, index };
        }
      });

      const results = await Promise.allSettled(modelPromises);

      results.forEach((result, index) => {
        // Ensure we use the original index from the mapping, not the results array index if they differ
        // though in this case, they should be the same.
        const modelIndex = result.status === 'fulfilled' ? result.value.index : result.reason.index !== undefined ? result.reason.index : index;

        if (result.status === 'fulfilled') {
          const { currentImageResult, currentPromptResult } = result.value;
          const mimeType = 'image/png';
          const blob = base64ToBlob(currentImageResult, mimeType);

          if (blob) {
            const objectURL = URL.createObjectURL(blob);
            setInferredImage(prevImages => {
              const newImages = [...prevImages];
              const oldUrl = newImages[modelIndex];
              if (oldUrl && typeof oldUrl === 'string' && oldUrl.startsWith('blob:')) {
                URL.revokeObjectURL(oldUrl);
              }
              newImages[modelIndex] = objectURL;
              return newImages;
            });
          } else {
            setInferredImage(prevImages => {
              const newImages = [...prevImages];
              const oldUrl = newImages[modelIndex];
              if (oldUrl && typeof oldUrl === 'string' && oldUrl.startsWith('blob:')) {
                URL.revokeObjectURL(oldUrl);
              }
              newImages[modelIndex] = errorImage;
              return newImages;
            });
          }
          setReturnedPrompt(prevPrompts => {
            const newPrompts = [...prevPrompts];
            newPrompts[modelIndex] = currentPromptResult;
            return newPrompts;
          });
        } else {
          // Handle rejected promise
          const lambdaErrorPrompt = `Lambda Error: ${result.reason.model || models[modelIndex]}`;
          setInferredImage(prevImages => {
            const newImages = [...prevImages];
            newImages[modelIndex] = errorImage;
            return newImages;
          });
          setReturnedPrompt(prevPrompts => {
            const newPrompts = [...prevPrompts];
            newPrompts[modelIndex] = lambdaErrorPrompt;
            return newPrompts;
          });
        }
        setLoadingStatus(prevStatus => {
          const newStatus = [...prevStatus];
          newStatus[modelIndex] = false;
          return newStatus;
        });
      });

      setActivity(false);
      setInferrenceButton(false);
      setTime(new Date().toLocaleString('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      }).replace(/[/:,\s]/g, '-'));

      if (processingErrorOccurred) {
        setModelMessage("One or more images failed to generate or a rate limit was hit.");
        // Optionally set a general error flag if needed: setModelError(true);
      }
    }
  }; // processModels function ends

  useEffect(() => {
    if (inferrenceButton) {
      processModels();
    }
  }, [inferrenceButton]); // End useEffect for Inference Logic

  return null;
  return null;
};

export default Inference;