import { useEffect, useState } from "react";
const AWS = require("aws-sdk"); 
const placeholderImage = require('../assets/avocado.jpg'); // Or a dedicated loading image asset
const errorImage = require('../assets/add_image.png');
const cloudFrontDomain = process.env.EXPO_PUBLIC_CLOUDFRONT_DOMAIN;

const Inference = ({
  setGalleryLoaded,
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
        
        // Set initial states ONLY ONCE before we start processing folders
        setFolderList(Array(folders.length).fill('Holder-Image/'));
        setImageSource(Array(folders.length).fill(placeholderImage));
        
        // For each folder, get a random image
        for (const folder of folders) {
          // Get all images in this folder
          const folderParams = {
            Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
            Prefix: folder
          };
          
          
          const imagesData = await s3.listObjectsV2(folderParams).promise();
          
          if (imagesData.Contents && imagesData.Contents.length > 0) {
            // Filter out non-image files
            const imageKeys = imagesData.Contents
              .filter(item => !item.Key.endsWith('/'))
              .map(item => item.Key);
            
            if (imageKeys.length === 0) continue;
            
            // Select a random image from this folder
            const randomIndex = Math.floor(Math.random() * imageKeys.length);
            const randomKey = imageKeys[randomIndex];
            
            console.log(`Selected random image: ${randomKey}`);
            
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
                
                // Find the correct folder index
                const folderIndex = folders.indexOf(folder);
                
                // IMPORTANT: Only update the specific folder's loading state and image
                // Without touching the loading states of other folders
                
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
        }
        
        // After all folders are processed
        if (folders.length > 0) {
          console.log(`Processed ${folders.length} folders`);
        }
        
      } catch (error) {
        console.error("Error fetching images from S3:", error);
        // Handle overall error - set all loading states to false
        
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
            const objectUrlCF = `https://${cloudFrontDomain}/${item.Key}`;
            
            const response = await fetch(objectUrlCF);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const objectData = await response.json(); // If you're expecting JSON
            const jsonData = objectData; 
            
          
            const base64Data = jsonData.base64image;
            const base64Clean = base64Data.includes('base64,') 
              ? base64Data.split('base64,')[1]  
              : base64Data; 
            const prompt = jsonData.returnedPrompt;
            
            // Find the correct model index based on the prompt content
            let modelIndex = 0; // Default to first position if no match found
            
              
            
            // Check which model this prompt belongs to
            
            for (let i = 0; i < models.length; i++) {
              if (prompt.includes(models[i])) {
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
        setLoadingStatus(prevStatus => {
          const newStatus = [...prevStatus];
          newStatus[selectedImageIndex] = false; // Mark this index as not loading
          return newStatus;
        });
        setLoadingStatus(Array(models.length).fill(false)); // Set all loading states to false

        // Set prompts for any images that are still placeholders
        setInferredImage(prevImages => {
          const newImages = [...prevImages];
          newImages.forEach((image, index) => {
            // If the image is still the placeholder image
            if (image === placeholderImage) {
              setReturnedPrompt(prevPrompts => {
                const newPrompts = [...prevPrompts];
                // Set the prompt to indicate which model had no image
                newPrompts[index] = `No image found for model: ${models[index]}`;
                return newPrompts;
              });
            }
          });
          return newImages;
        });
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
        httpOptions: {
          timeout: 60000 
        }
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
      const clientIP = await getClientIP();
      
      // --- Process each model ---
      models.forEach((model, index) => {
        
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
            task: "image", // Ensure lambda handles this task type
            safety: settingSwitch
          }),
        };

       
        lambda.invoke(params).promise()
          .then((data) => {
            let currentImageResult = errorImage; // Default to error image
            let currentPromptResult = `Error parsing response for ${model}`;
            
            try {
              const jsonHolder = JSON.parse(data.Payload).body;
              const responseData = JSON.parse(jsonHolder);
              if (responseData.output && responseData.output === 'Rate limit exceeded') {
                setModelError(true);
                setModelMessage('Rate limit exceeded. Please try again later.');
                setActivity(false);
                setLoadingStatus(Array(models.length).fill(false));
                // Return early since we can't proceed with this model
                return;
              }
              if (responseData.output && /Error/.test(responseData.output)){
                currentImageResult = placeholderImage
                currentPromptResult = `Model:\n${responseData.model}\n\n${responseData.output}`;
              }
              else if (responseData && responseData.output) {
                currentImageResult = responseData.output;
                // Decide which prompt to display: original user prompt or model-specific output?
                // Using original prompt combined with model label for clarity:
                currentPromptResult = `Model:\n${responseData.model || model}\n\nPrompt:\n${prompt}`;
              } else {
                 console.error(`Invalid response structure for ${model}:`, responseData);
                 processingErrorOccurred = true;
              }
            } catch (error) {
              console.error(`Error parsing JSON response for ${model}:`, error);
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
            console.error(`Lambda invocation error for ${model}:`, error);
            processingErrorOccurred = true;
            const lambdaErrorPrompt = `Lambda Error: ${model}`;

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
      // Start processing models
    
  }
  processModels(); 
   // Call the function to start processing
  }, [inferrenceButton]); // End useEffect for Inference Logic

  // Return null or some minimal JSX as this is a logic component
  return null;
};

export default Inference;