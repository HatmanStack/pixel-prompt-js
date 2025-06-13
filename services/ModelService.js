import AWSService from './AWSService';
import { withRetry, handleAPIError, withTimeout } from '../utils/apiUtils';
import { AI_MODELS } from '../data/models';
import seeds from '../assets/seeds.json';

class ModelService {
  constructor() {
    this.lambdaClient = null;
  }

  initialize() {
    if (!this.lambdaClient) {
      this.lambdaClient = AWSService.getLambdaClient();
    }
  }

  /**
   * Generate text prompt using Lambda function
   * @param {string} prompt - Input prompt
   * @param {string} task - Task type (default: "text")
   * @returns {Promise<Object>} Generated prompt data
   */
  async generateTextPrompt(prompt, task = "text") {
    this.initialize();
    
    // Use seed prompt if default or empty
    let alteredPrompt = prompt;
    if (prompt === "Avocado Armchair" || prompt === "") {
      const randomIndex = Math.floor(Math.random() * seeds.seeds.length);
      alteredPrompt = seeds.seeds[randomIndex];
    }
    
    const params = {
      FunctionName: process.env.EXPO_PUBLIC_AWS_LAMBDA_FUNCTION,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({
        itemString: alteredPrompt,
        task: task,
        ip: '1.1.1.1',
      })
    };
    
    try {
      const data = await withTimeout(
        this.lambdaClient.invoke(params).promise(),
        30000 // 30 second timeout
      );
      
      if (data.FunctionError) {
        throw new Error(`Lambda function error: ${data.FunctionError}`);
      }
      
      const jsonHolder = JSON.parse(data.Payload).body;
      const responseData = JSON.parse(jsonHolder);
      
      // Check for rate limiting
      if (responseData.output && responseData.output === 'Rate limit exceeded') {
        throw new Error('Rate limit exceeded');
      }
      
      return {
        longPrompt: responseData.plain,
        shortPrompt: alteredPrompt,
        success: true
      };
      
    } catch (error) {
      console.error("Lambda Error:", error);
      throw new Error(handleAPIError(error, 'text prompt generation'));
    }
  }

  /**
   * Generate image using Lambda function
   * @param {Object} params - Image generation parameters
   * @returns {Promise<Object>} Generated image data
   */
  async generateImage(params) {
    this.initialize();
    
    const {
      prompt,
      model = AI_MODELS[0],
      steps = 28,
      guidance = 5,
      control = 1.0,
      selectedImageIndex = null,
      ...otherParams
    } = params;
    
    const lambdaParams = {
      FunctionName: process.env.EXPO_PUBLIC_AWS_LAMBDA_FUNCTION,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({
        itemString: prompt,
        task: "image",
        model: model,
        steps: steps,
        guidance: guidance,
        control: control,
        selectedImageIndex: selectedImageIndex,
        ip: '1.1.1.1',
        ...otherParams
      })
    };
    
    try {
      const data = await withTimeout(
        this.lambdaClient.invoke(lambdaParams).promise(),
        60000 // 60 second timeout for image generation
      );
      
      if (data.FunctionError) {
        throw new Error(`Lambda function error: ${data.FunctionError}`);
      }
      
      const jsonHolder = JSON.parse(data.Payload).body;
      const responseData = JSON.parse(jsonHolder);
      
      // Check for rate limiting or other errors
      if (responseData.output && responseData.output === 'Rate limit exceeded') {
        throw new Error('Rate limit exceeded');
      }
      
      if (responseData.error) {
        throw new Error(responseData.error);
      }
      
      return {
        ...responseData,
        success: true
      };
      
    } catch (error) {
      console.error("Image generation error:", error);
      throw new Error(handleAPIError(error, 'image generation'));
    }
  }

  /**
   * Generate multiple images in parallel
   * @param {Array} imageRequests - Array of image generation parameters
   * @param {number} concurrency - Maximum concurrent requests
   * @returns {Promise<Array>} Array of generation results
   */
  async generateImagesInParallel(imageRequests, concurrency = 3) {
    const results = [];
    
    // Process requests in batches to avoid overwhelming the service
    for (let i = 0; i < imageRequests.length; i += concurrency) {
      const batch = imageRequests.slice(i, i + concurrency);
      const batchPromises = batch.map(async (request, batchIndex) => {
        try {
          const result = await this.generateImage(request);
          return {
            index: i + batchIndex,
            ...result,
            success: true
          };
        } catch (error) {
          return {
            index: i + batchIndex,
            error: error.message,
            success: false
          };
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : {
          error: result.reason?.message || 'Unknown error',
          success: false
        }
      ));
    }
    
    return results;
  }

  /**
   * Get available models
   * @returns {Array} Array of available AI models
   */
  getAvailableModels() {
    return [...AI_MODELS];
  }

  /**
   * Validate model parameters
   * @param {Object} params - Parameters to validate
   * @returns {Object} Validation result
   */
  validateParameters(params) {
    const errors = [];
    const warnings = [];
    
    const { prompt, steps, guidance, control, model } = params;
    
    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      errors.push('Prompt is required and must be a string');
    } else if (prompt.length > 20000) {
      errors.push('Prompt must be less than 20,000 characters');
    }
    
    // Validate steps
    if (steps !== undefined) {
      if (typeof steps !== 'number' || steps < 1 || steps > 100) {
        errors.push('Steps must be a number between 1 and 100');
      }
    }
    
    // Validate guidance
    if (guidance !== undefined) {
      if (typeof guidance !== 'number' || guidance < 0 || guidance > 20) {
        errors.push('Guidance must be a number between 0 and 20');
      }
    }
    
    // Validate control
    if (control !== undefined) {
      if (typeof control !== 'number' || control < 0 || control > 2) {
        errors.push('Control must be a number between 0 and 2');
      }
    }
    
    // Validate model
    if (model && !AI_MODELS.includes(model)) {
      warnings.push(`Model "${model}" is not in the list of known models`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Export singleton instance
export default new ModelService();
