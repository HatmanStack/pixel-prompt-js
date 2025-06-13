import { useEffect, useCallback } from 'react';
import { useAppStore } from '../stores/useAppStore';
import AWSService from '../services/AWSService';
import { createObjectURLFromBase64, revokeObjectURLs } from '../utils/imageUtils';
import { withRetry, handleAPIError, batchProcess } from '../utils/apiUtils';
import { API_ENDPOINTS } from '../data/constants';

const placeholderImage = require('../assets/avocado.jpg');
const errorImage = require('../assets/add_image.png');

export const useImageGallery = () => {
  const {
    imageSource,
    setImageSource,
    setGalleryLoaded,
    galleryLoaded,
    setModelError,
  } = useAppStore();

  const processFolderImages = useCallback(async (folder, folderIndex) => {
    try {
      const s3 = AWSService.getS3Client();
      
      const folderParams = {
        Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
        Prefix: folder
      };
      
      const imagesData = await s3.listObjectsV2(folderParams).promise();
      
      if (!imagesData.Contents || imagesData.Contents.length === 0) {
        return { folderIndex, error: 'No images found' };
      }

      // Filter out non-image files
      const imageKeys = imagesData.Contents
        .filter(item => !item.Key.endsWith('/'))
        .map(item => item.Key);
      
      if (imageKeys.length === 0) {
        return { folderIndex, error: 'No valid images found' };
      }
      
      // Select a random image from this folder
      const randomIndex = Math.floor(Math.random() * imageKeys.length);
      const randomKey = imageKeys[randomIndex];
      
      // Fetch the selected image data with timeout
      const objectUrlCF = `https://${API_ENDPOINTS.CLOUDFRONT_DOMAIN}/${randomKey}`;
      
      const response = await withRetry(async () => {
        const res = await fetch(objectUrlCF);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      });
      
      const jsonData = response;
      const base64Data = jsonData.base64image;
      
      // Convert base64 to Blob URL
      const objectURL = createObjectURLFromBase64(base64Data, 'image/png');
      
      if (!objectURL) {
        throw new Error('Failed to create object URL');
      }
      
      return {
        folderIndex,
        objectURL,
        folder,
        success: true
      };
      
    } catch (error) {
      console.error(`Error processing folder ${folder}:`, error);
      return {
        folderIndex,
        error: handleAPIError(error, `folder processing: ${folder}`),
        success: false
      };
    }
  }, []);

  const fetchGalleryImages = useCallback(async () => {
    try {
      setGalleryLoaded(false);
      const s3 = AWSService.getS3Client();
      
      // Get all folders in the group-images/ directory
      const params = {
        Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
        Prefix: API_ENDPOINTS.S3_PREFIX,
        Delimiter: "/"
      };
      
      const folderData = await s3.listObjectsV2(params).promise();
      const folders = folderData.CommonPrefixes?.map(prefix => prefix.Prefix) || [];
      
      if (folders.length === 0) {
        console.log('No folders found in gallery');
        setGalleryLoaded(true);
        return;
      }
      
      // Initialize arrays with placeholders
      const initialImages = Array(folders.length).fill(placeholderImage);
      setImageSource(initialImages);
      
      // Process folders in parallel with concurrency limit
      const results = await batchProcess(
        folders, 
        processFolderImages, 
        3 // Process 3 folders concurrently
      );
      
      // Update images as they complete
      const newImages = [...initialImages];
      const folderList = Array(folders.length).fill('Holder-Image/');
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          const { folderIndex, objectURL, folder } = result.value;
          if (folderIndex >= 0 && folderIndex < newImages.length) {
            newImages[folderIndex] = objectURL;
            folderList[folderIndex] = folder;
          }
        } else if (result.status === 'rejected' || !result.value.success) {
          const folderIndex = result.value?.folderIndex;
          if (folderIndex >= 0 && folderIndex < newImages.length) {
            newImages[folderIndex] = errorImage;
          }
        }
      });
      
      setImageSource(newImages);
      setGalleryLoaded(true);
      
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      setModelError(true, handleAPIError(error, 'gallery loading'));
      setGalleryLoaded(true);
    }
  }, [processFolderImages, setImageSource, setGalleryLoaded, setModelError]);

  // Cleanup function for blob URLs
  const cleanupImageURLs = useCallback(() => {
    if (Array.isArray(imageSource)) {
      const blobUrls = imageSource.filter(url => 
        typeof url === 'string' && url.startsWith('blob:')
      );
      revokeObjectURLs(blobUrls);
    }
  }, [imageSource]);

  // Auto-fetch gallery images on mount
  useEffect(() => {
    fetchGalleryImages();
    
    // Cleanup on unmount
    return () => {
      cleanupImageURLs();
    };
  }, []);

  return {
    imageSource,
    galleryLoaded,
    fetchGalleryImages,
    cleanupImageURLs,
  };
};

export default useImageGallery;
