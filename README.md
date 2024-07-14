# Pixel Prompt JS

**Pixel Prompt** is an app made with React Native built using Expo. It uses the Hugging Face Inference API along with  diffusion models to create images. An explanation of some of the componenets and deployment architectures: [Cloud Bound](https://medium.com/@HatmanStack/cloud-bound-react-native-and-fastapi-ml-684a658f967a).  This version is completly self-contained and uses the HuggingFace JS libraries to call the huggingface infernence api.  It can be built and deployed for web, android, or ios.

## Preview :zap:

To preview the application visit the hosted version on the Hugging Face Spaces platform [here](https://huggingface.co/spaces/Hatman/pixel-prompt).

## Screenshots :camera:

<table>
  <tr><p align="center">
    <td><img src="https://github.com/HatmanStack/pixel-prompt-js/blob/main/pics/pixel_prompt.png" alt="Image 1"></td>
    <td><img src="https://github.com/HatmanStack/pixel-prompt-js/blob/main/pics/pixel_prompt_1.png" alt="Image 2"></td>
    <td><img src="https://github.com/HatmanStack/pixel-prompt-js/blob/main/pics/pixel_prompt_2.png" alt="Image 3"></td></p>
    </tr>
    <tr><p align="center">
    <td><img src="https://github.com/HatmanStack/pixel-prompt-js/blob/main/pics/pixel_prompt_3.png" alt="Image 4"></td>
    <td><img src="https://github.com/HatmanStack/pixel-prompt-js/blob/main/pics/pixel_prompt_4.png" alt="Image 5"></td>
    <td><img src="https://github.com/HatmanStack/pixel-prompt-js/blob/main/pics/pixel_prompt_5.png" alt="Image 6"></td></p>
    
  </tr>
</table>

## Prerequisites

Before running this application locally, ensure that you have the following dependencies installed on your machine:

- Node
- npm (Node Package Manager)

## Installation :hammer:

To install and run the application:
   
   ```shell
   git clone https://github.com/hatmanstack/pixel-prompt-js.git
   cd pixel-prompt-js
   npm install -g yarn
   yarn
   npm start
   ```

The app will be running locally at http://localhost:19006. For different environments you can switch the port at startup, use 'npm start -- --port 8080' to start Metro(Expo's Compiler) on port 8080.

Include an .env file for your Hugging Face API Key.

   ```shell
   HF_TOKEN=<hf-api-token>
   ```

## Models :sparkles:

All the models are opensource and available on HuggingFace.
       
### Diffusion

- **stabilityai/stable-diffusion-3-medium**
- **stabilityai/stable-diffusion-xl-base-1.0**
- **fluently/Fluently-XL-Final**
- **nerijs/pixel-art-xl**
- **Fictiverse/Voxel_XL_Lora**
- **dallinmackay/Van-Gogh-diffusion**
- **gsdf/Counterfeit-V2.5**
- **digiplay/Acorn_Photo_v1**

### Prompts

- **mistralai/Mistral-7B-Instruct-v0.3**
- **Gustavosta/MagicPrompt-Stable-Diffusion**
- **meta-llama/Meta-Llama-3-70B-Instruct**

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments :trophy:

This application is built with Expo, a powerful framework for building cross-platform mobile applications. Learn more about [Expo:](https://expo.io)

<p align="center">This application is using the HuggingFace Inference API, provided by <a href="https://huggingface.co">HuggingFace</a> </br><img src="https://github.com/HatmanStack/pixel-prompt-backend/blob/main/logo.png" alt="Image 4"></p>

