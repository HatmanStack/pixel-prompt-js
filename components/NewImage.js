import React, { useState, useMemo, useEffect, useContext, memo } from 'react'; // Import memo
import { View, Image, Pressable, StyleSheet, Animated, Text, ActivityIndicator, Dimensions } from 'react-native';
import AppContext from '../AppContext'; // Import AppContext
const placeholderImage = require('../assets/avocado.jpg'); 

const NewImage = () => {
  const {
    inferredImage,
    setPlaySound,
    returnedPrompt,
    loadingStatus,
    // inferrenceButton, // Confirm if needed, was in original props
    // galleryLoaded     // Confirm if needed, was in original props
  } = useContext(AppContext);

  // Initialize imageLoadedStatus based on the length of inferredImage or a default (e.g., 9)
  // This ensures it's correctly sized even if inferredImage is initially null or different length.
  const initialLoadStatusSize = Array.isArray(inferredImage) ? inferredImage.length : 9;
  const [imageLoadedStatus, setImageLoadedStatus] = useState(Array(initialLoadStatusSize).fill(true));

  const [expandedImageIndex, setExpandedImageIndex] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  
  // Get window dimensions
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 1000;
  
  // Create animated values for each potential image
  const animatedValues = useMemo(() => 
    Array(9).fill(0).map(() => new Animated.Value(0)), 
    []
  );

  useEffect(() => {
    // Identify all blob URLs from the inferredImage prop from context
    const currentBlobUrls = (Array.isArray(inferredImage) ? inferredImage : [inferredImage])
      .filter(url => typeof url === 'string' && url.startsWith('blob:'));

    // Return a cleanup function that will run when inferredImage changes or the component unmounts
    return () => {
      if (currentBlobUrls.length > 0) {
        // console.log("NewImage.js: Cleaning up object URLs:", currentBlobUrls);
        currentBlobUrls.forEach(url => URL.revokeObjectURL(url));
      }
    };
  }, [inferredImage]); // The effect re-runs if inferredImage from context changes

  // Adjust imageLoadedStatus array size if inferredImage length changes
  useEffect(() => {
    if (Array.isArray(inferredImage)) {
      setImageLoadedStatus(prevStatus => {
        const newStatus = Array(inferredImage.length).fill(true);
        // Preserve existing statuses if lengths match or if needed, otherwise reset
        // This simple reset assumes new images mean new loading states.
        return newStatus;
      });
    }
  }, [inferredImage]);

  const handleImageLoaded = (index) => {
    setImageLoadedStatus(prevStatus => {
      const newStatus = [...prevStatus];
      if (index < newStatus.length) { // Boundary check
        newStatus[index] = true;
      }
      return newStatus;
    });
  };

  // Animation function to expand/collapse images
  const handleImagePress = (index) => {
    // Only set the current prompt when actually expanding an image
    if (expandedImageIndex !== index) {
      if (Array.isArray(returnedPrompt) && index < returnedPrompt.length) {
        setCurrentPrompt(returnedPrompt[index]);
      } else {
        setCurrentPrompt(null); // Reset if no valid prompt
      }
    }
    
    if (setPlaySound) setPlaySound("click"); // Check if setPlaySound is available
    
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
          source={placeholderImage} // Use the imported constant
          style={styles.placeholderImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  // If an image is expanded, only show that image
  if (expandedImageIndex !== null && inferredImage[expandedImageIndex]) {
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
            onPress={() => handleImagePress(expandedImageIndex)} // Use the index
          >
            <Image
               source={
                typeof expandedImage === "number" || expandedImage === placeholderImage // Check against imported constant
                  ? placeholderImage
                  : { uri: expandedImage }
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
      isSmallScreen && { height: '33%' } // Consider if this fixed height is always desirable
    ]}>
      {inferredImage.map((image, index) => {
        // Check if image is a valid source or placeholder
        const imageSourceUri = typeof image === 'string' ? { uri: image } : image;
        // Determine loading state, checking bounds for loadingStatus and imageLoadedStatus
        const isLoading = (loadingStatus && index < loadingStatus.length && loadingStatus[index] === true) ||
                          (index < imageLoadedStatus.length && !imageLoadedStatus[index]);

        return (
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
                source={imageSourceUri}
                style={styles.gridImageStyle}
                resizeMode="cover"
                onLoad={() => handleImageLoaded(index)}
              />

              {isLoading && (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#B58392" />
                </View>
              )}
            </View>
            
            {isSmallScreen && expandedImageIndex === index && Array.isArray(returnedPrompt) && index < returnedPrompt.length && returnedPrompt[index] && (
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
        );
      })}
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

export default memo(NewImage); // Wrap with memo
