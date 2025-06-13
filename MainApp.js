import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
} from "react-native";
import { useFonts } from "expo-font";

// Components
import SliderComponent from "./components/Slider";
import PromptInputComponent from "./components/PromptInput";
import BreathingComponent from "./components/Breathing";
import ImageGrid from "./components/ImageGrid";
import Buttons from "./components/Buttons";
import Expand from "./components/Expand";
import PromptInference from "./components/Prompt";
import Inference from "./components/Inference";
import SoundPlayer from "./components/Sounds";
import NewImage from "./components/NewImage";

// Layout Components
import DesktopLayout from "./components/Layout/DesktopLayout";
import MobileLayout from "./components/Layout/MobileLayout";
import ErrorBoundary from "./components/ErrorHandling/ErrorBoundary";

// Hooks and Stores
import { useAppStore } from "./stores/useAppStore";
import { useUIStore } from "./stores/useUIStore";
import { useWindowDimensions } from "./hooks/useWindowDimensions";
import { useImageGallery } from "./hooks/useImageGallery";

// Styles and Theme
import { commonStyles } from "./styles/commonStyles";
import { colors, spacing } from "./theme";

export default function App() {
  useFonts({ Sigmar: require("./assets/Sigmar/Sigmar-Regular.ttf") });
  
  // Hooks
  const { isDesktopLayout } = useWindowDimensions();
  const { imageSource, galleryLoaded } = useImageGallery();
  
  // Store state
  const {
    modelError,
    modelMessage,
    makeSound,
    inferredImage,
    returnedPrompt,
    loadingStatus,
    selectedImageIndex,
    inferrenceButton,
  } = useAppStore();
  
  const {
    isGuidanceVisible,
    isImagePickerVisible,
    columnCount,
    reactiveWindowHeight,
    isWindowBiggerThanContainer,
    toggleGuidance,
    toggleImagePicker,
    getContainerWidth,
  } = useUIStore();

  const renderLeftColumn = () => (
    <>
      <PromptInputComponent />
      <Buttons />
      
      {modelError && (
        <Text style={commonStyles.promptText}>{modelMessage}</Text>
      )}
      
      <Expand
        isGuidance={true}
        visible={isGuidanceVisible}
        toggleVisibility={toggleGuidance}
      />
      
      {isGuidanceVisible && (
        <Text style={[
          commonStyles.promptText, 
          { 
            width: isWindowBiggerThanContainer, 
            margin: spacing.containerPadding, 
            fontSize: 14 
          }
        ]}>
          The prompt button returns two different prompts; a seed prompt, descriptive prompt. 
          If the user creates a prompt and then uses the prompt button, user input will be 
          treated as the seed prompt. To generate fresh prompts clear the input window.
        </Text>
      )}

      <Expand
        isGuidance={false}
        visible={isImagePickerVisible}
        toggleVisibility={toggleImagePicker}
      />
      
      {isImagePickerVisible && (
        <View style={commonStyles.imageGridContainer}>
          <ImageGrid
            imageSource={imageSource}
            columnCount={columnCount}
            galleryLoaded={galleryLoaded}
            selectedImageIndex={selectedImageIndex}
            containerWidth={getContainerWidth()}
          />
        </View>
      )}
      
      <SliderComponent />
    </>
  );

  const renderRightColumn = () => (
    <View style={[commonStyles.imageCard, { height: reactiveWindowHeight }]}>
      <NewImage 
        inferredImage={inferredImage}
        returnedPrompt={returnedPrompt}
        loadingStatus={loadingStatus}
        inferrenceButton={inferrenceButton}
        galleryLoaded={galleryLoaded}
      />
    </View>
  );

  const renderMobileLayout = () => (
    <MobileLayout>
      {renderLeftColumn()}
      {renderRightColumn()}
    </MobileLayout>
  );

  const renderDesktopLayout = () => (
    <DesktopLayout
      leftColumn={renderLeftColumn()}
      rightColumn={renderRightColumn()}
    />
  );

  return (
    <ErrorBoundary>
      <View style={commonStyles.titleContainer}>
        {/* Background Components */}
        <SoundPlayer makeSound={makeSound} />
        <PromptInference />
        <Inference />
        <BreathingComponent />
        
        {/* Main Content */}
        <ScrollView
          scrollY={true}
          style={commonStyles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {isDesktopLayout ? renderDesktopLayout() : renderMobileLayout()}
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}
