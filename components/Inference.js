import { useEffect, useState, useCallback } from "react";
import { useAppStore } from '../stores/useAppStore';
import ImageService from '../services/ImageService';
import ModelService from '../services/ModelService';
import { createObjectURLFromBase64, revokeObjectURLs } from '../utils/imageUtils';
import { withRetry, handleAPIError, batchProcess } from '../utils/apiUtils';
import { AI_MODELS } from '../data/models';

const placeholderImage = require('../assets/avocado.jpg');
const errorImage = require('../assets/add_image.png');
const trollImages = require('../assets/trolls.json');

const Inference = () => {
  const [folderList, setFolderList] = useState([]);
  const [time, setTime] = useState(new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/[/:,\s]/g, '-'));

  const {
    selectedImageIndex,
    inferrenceButton,
    prompt,
    control,
    guidance,
    steps,
    setGalleryLoaded,
    setImageSource,
    setInferrenceButton,
    setModelMessage,
    setActivity,
    setModelError,
    setReturnedPrompt,
    setInferredImage,
    setLoadingStatus,
    batchUpdateImages,
    updateLoadingStatusAtIndex,
  } = useAppStore();

  // Fetch gallery images with improved performance
  const fetchGalleryImages = useCallback(async () => {
    try {
      setGalleryLoaded(false);
      
      const folders = await ImageService.getFolders();
      
      if (folders.length === 0) {
        console.log('No folders found in gallery');
        setGalleryLoaded(true);
        return;
      }
      
      // Initialize arrays with placeholders
      const initialImages = Array(folders.length).fill(placeholderImage);
      setImageSource(initialImages);
      setFolderList(Array(folders.length).fill('Holder-Image/'));
      
      // Process folders in parallel with improved error handling
      const results = await ImageService.processFoldersInParallel(folders, 3);
      
      // Batch update images for better performance
      const imageUpdates = [];
      const newFolderList = [...Array(folders.length).fill('Holder-Image/')];
      
      results.forEach((result, index) => {
        if (result.success) {
          imageUpdates.push({ index, image: result.objectURL });
          newFolderList[index] = result.folder;
        } else {
          imageUpdates.push({ index, image: errorImage });
          console.error(`Failed to load image for folder ${folders[index]}:`, result.error);
        }
      });
      
      // Batch update for performance
      batchUpdateImages(imageUpdates);
      setFolderList(newFolderList);
      setGalleryLoaded(true);
      
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      setModelError(true, handleAPIError(error, 'gallery loading'));
      setGalleryLoaded(true);
    }
  }, [setGalleryLoaded, setImageSource, setModelError, batchUpdateImages]);

  // Generate single image with improved error handling
  const generateSingleImage = useCallback(async (imageIndex, modelName) => {
    try {
      updateLoadingStatusAtIndex(imageIndex, true);
      
      const params = {
        prompt,
        model: modelName,
        steps,
        guidance,
        control,
        selectedImageIndex,
        imageIndex,
        time,
      };
      
      // Validate parameters before sending
      const validation = ModelService.validateParameters(params);
      if (!validation.isValid) {
        throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
      }
      
      const result = await ModelService.generateImage(params);
      
      if (result.success && result.base64image) {
        const objectURL = createObjectURLFromBase64(result.base64image, 'image/png');
        
        if (objectURL) {
          return {
            index: imageIndex,
            objectURL,
            prompt: result.prompt || prompt,
            success: true
          };
        }
      }
      
      throw new Error('Failed to generate image or convert to object URL');
      
    } catch (error) {
      console.error(`Error generating image ${imageIndex}:`, error);
      return {
        index: imageIndex,
        error: handleAPIError(error, `image generation ${imageIndex}`),
        success: false
      };
    } finally {
      updateLoadingStatusAtIndex(imageIndex, false);
    }
  }, [
    prompt, 
    steps, 
    guidance, 
    control, 
    selectedImageIndex, 
    time,
    updateLoadingStatusAtIndex
  ]);

  // Generate multiple images in parallel
  const generateImages = useCallback(async () => {
    if (!inferrenceButton || !prompt) return;
    
    try {
      setActivity(true);
      setModelError(false, "");
      
      // Determine which images to generate based on button type
      const imagesToGenerate = [];
      
      if (typeof inferrenceButton === 'number') {
        // Single image generation
        imagesToGenerate.push({
          index: inferrenceButton,
          model: AI_MODELS[0] // Default model
        });
      } else if (inferrenceButton === 'all') {
        // Generate all 9 images
        for (let i = 0; i < 9; i++) {
          imagesToGenerate.push({
            index: i,
            model: AI_MODELS[i % AI_MODELS.length] // Distribute models
          });
        }
      }
      
      // Generate images in parallel with concurrency limit
      const results = await Promise.allSettled(
        imagesToGenerate.map(({ index, model }) => 
          generateSingleImage(index, model)
        )
      );
      
      // Process results and update state
      const imageUpdates = [];
      const promptUpdates = [];
      let hasErrors = false;
      
      results.forEach((result, i) => {
        const imageIndex = imagesToGenerate[i].index;
        
        if (result.status === 'fulfilled' && result.value.success) {
          imageUpdates.push({ 
            index: imageIndex, 
            image: result.value.objectURL 
          });
          promptUpdates[imageIndex] = result.value.prompt;
        } else {
          hasErrors = true;
          const errorMsg = result.status === 'rejected' 
            ? result.reason?.message || 'Unknown error'
            : result.value.error;
          console.error(`Failed to generate image ${imageIndex}:`, errorMsg);
        }
      });
      
      // Batch update images and prompts
      if (imageUpdates.length > 0) {
        batchUpdateImages(imageUpdates);
        
        // Update prompts array
        setReturnedPrompt(prev => {
          const newPrompts = [...prev];
          promptUpdates.forEach((prompt, index) => {
            if (prompt) newPrompts[index] = prompt;
          });
          return newPrompts;
        });
      }
      
      if (hasErrors) {
        setModelError(true, "Some images failed to generate. Please try again.");
      }
      
    } catch (error) {
      console.error('Error in image generation process:', error);
      setModelError(true, handleAPIError(error, 'image generation'));
    } finally {
      setActivity(false);
      setInferrenceButton(null);
    }
  }, [
    inferrenceButton,
    prompt,
    generateSingleImage,
    setActivity,
    setModelError,
    batchUpdateImages,
    setReturnedPrompt,
    setInferrenceButton
  ]);

  // Effect for fetching gallery images on mount
  useEffect(() => {
    fetchGalleryImages();
  }, [fetchGalleryImages]);

  // Effect for generating images when button is pressed
  useEffect(() => {
    if (inferrenceButton) {
      generateImages();
    }
  }, [inferrenceButton, generateImages]);

  // Cleanup effect for blob URLs
  useEffect(() => {
    return () => {
      // Cleanup any blob URLs when component unmounts
      const { inferredImage } = useAppStore.getState();
      if (Array.isArray(inferredImage)) {
        const blobUrls = inferredImage.filter(url => 
          typeof url === 'string' && url.startsWith('blob:')
        );
        revokeObjectURLs(blobUrls);
      }
    };
  }, []);

  return null; // This is a logic-only component
};

export default Inference;
