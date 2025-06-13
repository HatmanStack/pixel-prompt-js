import { ERROR_MESSAGES } from '../data/constants';

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in milliseconds
 * @returns {Promise} - Promise that resolves with function result
 */
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      console.log(`Retry attempt ${i + 1}/${maxRetries} after ${waitTime}ms`);
    }
  }
};

/**
 * Handle API errors with user-friendly messages
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @returns {string} - User-friendly error message
 */
export const handleAPIError = (error, context = 'API call') => {
  console.error(`Error in ${context}:`, error);
  
  const errorMessage = error.message || error.toString();
  
  const errorMap = {
    'Rate limit exceeded': ERROR_MESSAGES.RATE_LIMIT,
    'Network Error': ERROR_MESSAGES.NETWORK_ERROR,
    'timeout': ERROR_MESSAGES.TIMEOUT,
    'Timeout': ERROR_MESSAGES.TIMEOUT,
  };
  
  // Check for specific error patterns
  for (const [pattern, message] of Object.entries(errorMap)) {
    if (errorMessage.includes(pattern)) {
      return message;
    }
  }
  
  return `${ERROR_MESSAGES.GENERIC} (${context})`;
};

/**
 * Create a timeout promise
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise} - Promise that rejects after timeout
 */
export const createTimeout = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });
};

/**
 * Race a promise against a timeout
 * @param {Promise} promise - Promise to race
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise} - Promise that resolves/rejects first
 */
export const withTimeout = (promise, timeoutMs = 30000) => {
  return Promise.race([
    promise,
    createTimeout(timeoutMs)
  ]);
};

/**
 * Batch process items with concurrency limit
 * @param {Array} items - Items to process
 * @param {Function} processor - Function to process each item
 * @param {number} concurrency - Maximum concurrent operations
 * @returns {Promise<Array>} - Array of results
 */
export const batchProcess = async (items, processor, concurrency = 5) => {
  const results = [];
  
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchPromises = batch.map((item, index) => 
      processor(item, i + index).catch(error => ({ error, index: i + index }))
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
