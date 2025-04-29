import React, { useState, useMemo, useEffect } from 'react';
import { View, Image, Pressable, StyleSheet, Animated, Text, ActivityIndicator, Dimensions } from 'react-native';
const placeholderImage = require('../assets/avocado.jpg'); 

const NewImage = ({ inferredImage, setPlaySound, returnedPrompt, loadingStatus, inferrenceButton, galleryLoaded}) => {
  const [expandedImageIndex, setExpandedImageIndex] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [imageLoadedStatus, setImageLoadedStatus] = useState(Array(9).fill(true));
  
  // Get window dimensions
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 1000;
  
  // Create animated values for each potential image
  const animatedValues = useMemo(() => 
    Array(9).fill(0).map(() => new Animated.Value(0)), 
    []
  );

  useEffect(() => {
    // Store the current URLs that this component instance rendered
    const currentUrls = Array.isArray(inferredImage)
        ? inferredImage.filter(url => typeof url === 'string' && url.startsWith('blob:'))
        : (typeof inferredImage === 'string' && inferredImage.startsWith('blob:') ? [inferredImage] : []);

    // Return a cleanup function that runs when the component unmounts
    // or BEFORE the effect runs again (due to inferredImage changing)
    if(!inferrenceButton && galleryLoaded) {
      return () => {
          // console.log("Cleaning up object URLs:", currentUrls);
          currentUrls.forEach(url => URL.revokeObjectURL(url));
      };
    }
}, [inferredImage]);

  const handleImageLoaded = (index) => {
    const newStatus = [...imageLoadedStatus];
    newStatus[index] = true;
    setImageLoadedStatus(newStatus);
  };
  // Animation function to expand/collapse images
  const handleImagePress = (index) => {
    // Only set the current prompt when actually expanding an image
    if (expandedImageIndex !== index) {
      if (Array.isArray(returnedPrompt)) {
        setCurrentPrompt(returnedPrompt[index]);
      }
    }
    
    setPlaySound("click");
    
    if (expandedImageIndex === index) {
      // Collapse this image
      Animated.timing(animatedValues[index], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start();
      
      setExpandedImageIndex(null);
      setCurrentPrompt(null); // Clear the prompt when collapsing
    } else {
      // If another image is expanded, collapse it first
      if (expandedImageIndex !== null) {
        Animated.timing(animatedValues[expandedImageIndex], {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        }).start();
      }
      
      // Expand the clicked image
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }).start();
      setExpandedImageIndex(index);
    }
  };

  // If there's no array of images, show a placeholder or return null
  if (!inferredImage || !Array.isArray(inferredImage)) {
    return (
      <View style={styles.placeholderContainer}>
        <Image 
          source={require("../assets/avocado.jpg")} 
          style={styles.placeholderImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  // If an image is expanded, only show that image
  if (expandedImageIndex !== null) {
    const expandedImage = inferredImage[expandedImageIndex];
    
    return (
      <>
        <View style={[
          styles.expandedContainer,
          isSmallScreen && styles.expandedContainerSmall
        ]}>
          <Pressable 
            style={({pressed}) => [
              styles.expandedImageContainer,
              pressed && { opacity: 0.9 }
            ]}
            onPress={() => handleImagePress(expandedImageIndex)}
          >
            <Image
               source={
                typeof expandedImage === "number" || expandedImage === placeholderImage
                  ? placeholderImage // Use placeholderImage if it's an asset
                  : { uri: expandedImage } // Use the URI for other cases
              }
              style={styles.expandedImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>
        <View style={[
          styles.promptTextContainer,
          isSmallScreen && styles.promptTextContainerSmall
        ]}>
          <Text 
            style={styles.promptText}
            numberOfLines={isSmallScreen ? 4 : null}
            ellipsizeMode="tail"
          >
            {currentPrompt}
          </Text>
        </View>
      </>
    );
  }
  
  // Otherwise show the grid
  return (
    <View style={[
      styles.imageGrid, 
      isSmallScreen && { height: '33%' }
    ]}>
      {inferredImage.map((image, index) => (
        <Pressable 
          key={index} 
          style={({pressed}) => [
            styles.gridItem,
            isSmallScreen && styles.gridItemSmall,
            pressed && { opacity: 0.8 }
          ]}
          onPress={() => handleImagePress(index)}
        >
          <View style={styles.imageContainer}>
            <Image
              source={
                typeof image === 'string' 
                  ? { uri: image }      
                  : image                
              }
              style={styles.gridImageStyle}
              resizeMode="cover"
              onLoad={() => handleImageLoaded(index)}
            />
            
            {/* Show loader if the server is still loading or if the image is not yet rendered */}
            {(loadingStatus && loadingStatus[index] === true || !imageLoadedStatus[index]) && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#B58392" />
              </View>
            )}
          </View>
          
          {/* Only show prompt text if this is expanded and we're on a small screen */}
          {isSmallScreen && expandedImageIndex === index && Array.isArray(returnedPrompt) && returnedPrompt[index] && (
            <View style={styles.inlinePromptContainer}>
              <Text 
                style={styles.inlinePromptText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {returnedPrompt[index]}
              </Text>
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
};

const colors = {
    backgroundColor: "#25292e",
    selectButtonBackground: "#3a3c3f",
    white: "#FFFFFF",
  };

const styles = StyleSheet.create({
    imageContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
      },
      loaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
      },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    width: '50%',
    height: '50%',
    opacity: 0.5,
  },
  imageGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  promptTextContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'relative',
    zIndex: 20,
    marginTop: 8,
  },
  promptText: {
    color: colors.white,
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 1,
    lineHeight: 24,
    fontFamily: "System",
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '32%',
    height: '32%',
    margin: '0.5%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  expandedContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  expandedImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
   
  },
  gridItemSmall: {
    height: '33vh',
  },
  
  // Add responsive styles for expanded view on small screens
  expandedContainerSmall: {
    height: '60vh', // Use less height on small screens
  },
  
  promptTextContainerSmall: {
    maxHeight: '20vh', // Limit the text height on small screens
    overflow: 'hidden',
  },
  expandedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'fill',
  },
  gridImageStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  }
});

export default NewImage;