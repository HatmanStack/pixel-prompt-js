const AWS = require("aws-sdk");

class AWSService {
  constructor() {
    if (AWSService.instance) {
      return AWSService.instance;
    }
    
    this.s3Client = null;
    this.lambdaClient = null;
    this.initialized = false;
    AWSService.instance = this;
  }

  initialize() {
    if (this.initialized) return;
    
    const config = {
      region: process.env.EXPO_PUBLIC_AWS_REGION,
      accessKeyId: process.env.EXPO_PUBLIC_AWS_ID,
      secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET,
    };

    this.s3Client = new AWS.S3(config);
    this.lambdaClient = new AWS.Lambda(config);
    this.initialized = true;
    
    console.log('AWS Service initialized');
  }

  getS3Client() {
    this.initialize();
    return this.s3Client;
  }

  getLambdaClient() {
    this.initialize();
    return this.lambdaClient;
  }

  // Helper method to check if service is initialized
  isInitialized() {
    return this.initialized;
  }

  // Method to reinitialize if needed (useful for testing)
  reinitialize() {
    this.initialized = false;
    this.s3Client = null;
    this.lambdaClient = null;
    this.initialize();
  }
}

// Export singleton instance
export default new AWSService();
