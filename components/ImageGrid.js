import React, { useState, useEffect, useCallback } from "react"; // Import useState, useEffect, useCallback
import {
  Pressable,
  Image,
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator, // Import ActivityIndicator
  Text, // Import Text for the placeholder
} from "react-native";

// Define a standard size for grid items
const ITEM_MARGIN = 5;
const calculateItemSize = (columns) => {
  const screenWidth = Dimensions.get('window').width;
  return Math.floor((screenWidth - (columns + 1) * ITEM_MARGIN * 2) / columns);
};


// --- Simplified Grid Item Component ---
// Memoized for performance
const GridItem = React.memo(({ source, index, onPress, isSelected, itemSize, isLoading, onLoadCallback }) => {
  const itemStyle = [
    styles.gridItem,
    { width: itemSize, height: itemSize, margin: ITEM_MARGIN },
    isSelected ? styles.selectedGridItem : null,
  ];

  return (
    <Pressable onPress={() => onPress(index)} style={itemStyle}>
       {/* Container View needed for positioning the loader */}
       <View style={styles.imageContainer}>
            <Image
                source={typeof source === "number" ? source : { uri: source }}
                style={styles.gridImage}
                resizeMode="cover"
                onLoad={() => onLoadCallback(index)} // Notify parent when image loads
            />
            {/* Show loader if it's loading */}
            {isLoading && (
                <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
            )}
       </View>
    </Pressable>
  );
});

// --- Main Simplified Image Grid Component ---
const ImageGrid = ({
  imageSource,
  columnCount = 3,
  setSelectedImageIndex,
  selectedImageIndex,
  setPlaySound,
  galleryLoadingStatus, // External loading status (e.g., from server/generation)
}) => {

  // State to track if each individual image has loaded its source
  // Using an object keyed by index for easier updates with FlatList
  const [imageLoadedStatus, setImageLoadedStatus] = useState({});

  // Calculate item size based on current column count
  const itemSize = calculateItemSize(columnCount);

  // Reset local loaded status when the source array changes fundamentally
  useEffect(() => {
    setImageLoadedStatus({});
  }, [imageSource]);

  // Callback for GridItem to report when its image has loaded
  // Use useCallback to prevent unnecessary re-renders of GridItem
  const handleImageLoaded = useCallback((index) => {
    setImageLoadedStatus(prevStatus => ({
      ...prevStatus,
      [index]: true // Mark this index as loaded
    }));
  }, []); // Empty dependency array means this function is created once

  const onImagePress = (index) => {
    setPlaySound("click");
    // Check if the image has actually loaded before allowing selection
    // Or remove this check if you want to allow selection even while loading
    if (imageLoadedStatus[index] && index !== selectedImageIndex) {
      setSelectedImageIndex(index);
   
    }
  };

  // Render function for each item in the FlatList
  const renderItem = useCallback(({ item: source, index }) => {
     // Determine if the loader should be shown for this item
     const isExternallyLoading = galleryLoadingStatus && galleryLoadingStatus[index];
     const isInternallyLoading = !imageLoadedStatus[index]; // True if not yet loaded locally
     const isLoading = isExternallyLoading || isInternallyLoading;

    return (
        <GridItem
            source={source}
            index={index}
            onPress={onImagePress}
            isSelected={index === selectedImageIndex}
            itemSize={itemSize}
            isLoading={isLoading} // Pass loading status down
            onLoadCallback={handleImageLoaded} // Pass the loading callback down
        />
    );
  // Add dependencies for useCallback to ensure it updates correctly
  }, [columnCount, selectedImageIndex, galleryLoadingStatus, imageLoadedStatus, itemSize, onImagePress, handleImageLoaded]);


  return (
    <View style={styles.gridContainer}>
      {imageSource && imageSource.length > 0 ? (
        <FlatList
          data={imageSource}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={columnCount}
          key={columnCount.toString()}
          initialNumToRender={columnCount * 5}
          maxToRenderPerBatch={columnCount * 3}
          windowSize={10}
          removeClippedSubviews={true}
          // contentContainerStyle={styles.flatListContentContainer}
        />
      ) : (
        <Text style={styles.noImagesText}>No images to display.</Text>
      )}
    </View>
  );
};

// --- Styles ---
const colors = {
  backgroundColor: "#25292e",
  white: "#FFFFFF",
  highlightBorder: "#007AFF",
};

const styles = StyleSheet.create({
  gridContainer: {
    flex: 1,
    width: '100%',
  },
  gridItem: {
    backgroundColor: "#555", // Darker placeholder background while loading
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 8,
    position: 'relative', // Needed for absolute positioning of children
  },
  selectedGridItem: {
    borderColor: colors.highlightBorder,
    borderWidth: 3,
  },
  // Added container specifically for Image and Loader
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative', // Context for the loader
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  // Copied loader container style from NewImage.js
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
    // borderRadius: 8, // Inherit from gridItem if needed, or set here
  },
  noImagesText: {
    color: colors.white,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default ImageGrid;