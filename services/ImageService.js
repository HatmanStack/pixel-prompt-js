import AWSService from './AWSService';
import { createObjectURLFromBase64 } from '../utils/imageUtils';
import { withRetry, handleAPIError, withTimeout } from '../utils/apiUtils';
import { API_ENDPOINTS } from '../data/constants';

class ImageService {
  constructor() {
    this.s3Client = null;
  }

  initialize() {
    if (!this.s3Client) {
      this.s3Client = AWSService.getS3Client();
    }
  }

  /**
   * Get all folders in the S3 bucket
   * @returns {Promise<string[]>} Array of folder prefixes
   */
  async getFolders() {
    this.initialize();
    
    const params = {
      Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
      Prefix: API_ENDPOINTS.S3_PREFIX,
      Delimiter: "/"
    };
    
    const data = await withTimeout(
      this.s3Client.listObjectsV2(params).promise(),
      10000 // 10 second timeout
    );
    
    return data.CommonPrefixes?.map(prefix => prefix.Prefix) || [];
  }

  /**
   * Get all image keys from a specific folder
   * @param {string} folder - Folder prefix
   * @returns {Promise<string[]>} Array of image keys
   */
  async getImagesFromFolder(folder) {
    this.initialize();
    
    const params = {
      Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
      Prefix: folder
    };
    
    const data = await withTimeout(
      this.s3Client.listObjectsV2(params).promise(),
      10000
    );
    
    if (!data.Contents || data.Contents.length === 0) {
      return [];
    }

    // Filter out non-image files and folder markers
    return data.Contents
      .filter(item => !item.Key.endsWith('/'))
      .map(item => item.Key);
  }

  /**
   * Get a random image from a folder
   * @param {string} folder - Folder prefix
   * @returns {Promise<string>} Random image key
   */
  async getRandomImageFromFolder(folder) {
    const imageKeys = await this.getImagesFromFolder(folder);
    
    if (imageKeys.length === 0) {
      throw new Error(`No images found in folder: ${folder}`);
    }
    
    const randomIndex = Math.floor(Math.random() * imageKeys.length);
    return imageKeys[randomIndex];
  }

  /**
   * Fetch image data from CloudFront
   * @param {string} imageKey - S3 object key
   * @returns {Promise<Object>} Image data object
   */
  async fetchImageData(imageKey) {
    const objectUrlCF = `https://${API_ENDPOINTS.CLOUDFRONT_DOMAIN}/${imageKey}`;
    
    const response = await withTimeout(
      fetch(objectUrlCF),
      15000 // 15 second timeout for image fetch
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * Convert image data to blob URL
   * @param {Object} imageData - Image data with base64image property
   * @returns {string|null} Blob URL or null if conversion fails
   */
  convertToObjectURL(imageData) {
    if (!imageData.base64image) {
      throw new Error('No base64image data found');
    }
    
    return createObjectURLFromBase64(imageData.base64image, 'image/png');
  }

  /**
   * Process a single folder to get a random image
   * @param {string} folder - Folder prefix
   * @param {number} folderIndex - Index of the folder
   * @returns {Promise<Object>} Processing result
   */
  async processFolderImage(folder, folderIndex) {
    try {
      // Get random image key from folder
      const randomImageKey = await this.getRandomImageFromFolder(folder);
      
      // Fetch image data
      const imageData = await withRetry(
        () => this.fetchImageData(randomImageKey),
        3, // 3 retries
        1000 // 1 second initial delay
      );
      
      // Convert to object URL
      const objectURL = this.convertToObjectURL(imageData);
      
      if (!objectURL) {
        throw new Error('Failed to create object URL');
      }
      
      return {
        folderIndex,
        objectURL,
        folder,
        imageKey: randomImageKey,
        success: true
      };
      
    } catch (error) {
      console.error(`Error processing folder ${folder}:`, error);
      return {
        folderIndex,
        folder,
        error: handleAPIError(error, `folder processing: ${folder}`),
        success: false
      };
    }
  }

  /**
   * Process multiple folders in parallel
   * @param {string[]} folders - Array of folder prefixes
   * @param {number} concurrency - Maximum concurrent operations
   * @returns {Promise<Object[]>} Array of processing results
   */
  async processFoldersInParallel(folders, concurrency = 3) {
    const results = [];
    
    // Process folders in batches
    for (let i = 0; i < folders.length; i += concurrency) {
      const batch = folders.slice(i, i + concurrency);
      const batchPromises = batch.map((folder, batchIndex) => 
        this.processFolderImage(folder, i + batchIndex)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : { 
          error: result.reason, 
          success: false 
        }
      ));
    }
    
    return results;
  }

  /**
   * Upload image to S3
   * @param {string} key - S3 object key
   * @param {Buffer|Blob} imageData - Image data
   * @param {string} contentType - MIME type
   * @returns {Promise<Object>} Upload result
   */
  async uploadImage(key, imageData, contentType = 'image/png') {
    this.initialize();
    
    const params = {
      Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
      Key: key,
      Body: imageData,
      ContentType: contentType,
    };
    
    return withTimeout(
      this.s3Client.upload(params).promise(),
      30000 // 30 second timeout for upload
    );
  }

  /**
   * Delete image from S3
   * @param {string} key - S3 object key
   * @returns {Promise<Object>} Delete result
   */
  async deleteImage(key) {
    this.initialize();
    
    const params = {
      Bucket: process.env.EXPO_PUBLIC_S3_BUCKET,
      Key: key,
    };
    
    return withTimeout(
      this.s3Client.deleteObject(params).promise(),
      10000
    );
  }
}

// Export singleton instance
export default new ImageService();
