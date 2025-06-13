/**
 * Convert base64 string to Blob object
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} mimeType - MIME type of the image
 * @returns {Blob|null} - Blob object or null if conversion fails
 */
export const base64ToBlob = (base64Data, mimeType = 'image/png') => {
  try {
    // Clean base64 data
    const base64Clean = base64Data.includes('base64,') 
      ? base64Data.split('base64,')[1]  
      : base64Data;
    
    // Convert base64 to binary
    const byteCharacters = atob(base64Clean);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    return null;
  }
};

/**
 * Create object URL from base64 data
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} mimeType - MIME type of the image
 * @returns {string|null} - Object URL or null if creation fails
 */
export const createObjectURLFromBase64 = (base64Data, mimeType = 'image/png') => {
  const blob = base64ToBlob(base64Data, mimeType);
  return blob ? URL.createObjectURL(blob) : null;
};

/**
 * Revoke object URLs to prevent memory leaks
 * @param {string|string[]} urls - URL or array of URLs to revoke
 */
export const revokeObjectURLs = (urls) => {
  const urlArray = Array.isArray(urls) ? urls : [urls];
  urlArray.forEach(url => {
    if (typeof url === 'string' && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
};

/**
 * Check if URL is a blob URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if URL is a blob URL
 */
export const isBlobURL = (url) => {
  return typeof url === 'string' && url.startsWith('blob:');
};

/**
 * Get image dimensions from URL
 * @param {string} url - Image URL
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = url;
  });
};
