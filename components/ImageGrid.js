import React, { useState, useEffect, useCallback, useContext, memo } from "react"; // Import memo
import AppContext from "../AppContext"; // Import AppContext
import {
  Pressable,
  Image,
  View,
  StyleSheet,
  FlatList,
  Dimensions, 
  Text, // Import Text for the placeholder
} from "react-native";

// Define a standard size for grid items
const ITEM_MARGIN = 5;
const calculateItemSize = (columns, containerWidth) => {
  // Use provided containerWidth or window width
  const screenWidth = containerWidth || Dimensions.get('window').width;
  // Calculate available width accounting for margins
  const availableWidth = screenWidth - ((columns + 1) * ITEM_MARGIN * 2);
  return Math.floor(availableWidth / columns);
};


// --- Simplified Grid Item Component ---
// Memoized for performance
const GridItem = React.memo(({ source, index, onPress, isSelected, itemSize, onLoadCallback }) => {
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
                source={
                  typeof source === 'string' 
                    ? { uri: source }      
                    : source                
                }
                style={styles.gridImage}
                resizeMode="cover"
                onLoad={() => onLoadCallback(index)} // Notify parent when image loads
            />
           
            
       </View>
    </Pressable>
  );
});

// --- Main Simplified Image Grid Component ---
const ImageGrid = ({
  // Direct props
  imageSource,
  setSelectedImageIndex,
  selectedImageIndex,
  containerWidth,
}) => {
  const {
    setPlaySound,
    columnCount,
    // galleryLoaded // Available from context if needed by ImageGrid's logic
  } = useContext(AppContext);

  const [imageLoadedStatus, setImageLoadedStatus] = useState({});

  // Calculate item size based on current column count from context
  const itemSize = calculateItemSize(columnCount || 3, containerWidth); // Default columnCount to 3 if not in context initially

  useEffect(() => {
    setImageLoadedStatus({});
  }, [imageSource]);

  const handleImageLoaded = useCallback((index) => {
    setImageLoadedStatus(prevStatus => ({
      ...prevStatus,
      [index]: true,
    }));
  }, []);

  const onImagePress = useCallback((index) => {
    if (setPlaySound) setPlaySound("click");
    if (imageLoadedStatus[index] && index !== selectedImageIndex) {
      setSelectedImageIndex(index);  
    }
  }, [setPlaySound, imageLoadedStatus, selectedImageIndex, setSelectedImageIndex]);

  const renderItem = useCallback(({ item: source, index }) => {
    return (
        <GridItem
            source={source}
            index={index}
            onPress={onImagePress} // Now memoized
            isSelected={index === selectedImageIndex}
            itemSize={itemSize}
            onLoadCallback={handleImageLoaded}
        />
    );
  }, [itemSize, selectedImageIndex, onImagePress, handleImageLoaded]); // Dependencies: itemSize, selectedImageIndex, onImagePress, handleImageLoaded

  const isEmpty = !imageSource || imageSource.length === 0;
  // columnCount from context is used in key for FlatList and numColumns
  return (
    <View style={styles.gridContainer}>
      {!isEmpty ? (
        <FlatList
          data={imageSource}
          renderItem={renderItem}
          keyExtractor={(item, index) => `image-${index}`}
          numColumns={columnCount}
          key={`grid-${columnCount}`}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={21}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={true}
          style={[styles.flatList, { width: containerWidth || '100%' }]}
          contentContainerStyle={styles.flatListContent}
          columnWrapperStyle={styles.columnWrapper} // Add this
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
  highlightBorder: "#B58392",
};

const styles = StyleSheet.create({
  gridContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatList: {
    width: '100%',
  },
  emptyContainer: {
    minHeight: 150, // Adjust this value to your preferred empty/loading height
    justifyContent: 'center', // Center the placeholder content
    alignItems: 'center',
    // Add a background or border here for debugging if needed
    // backgroundColor: 'rgba(255,0,0,0.2)',
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
  flatListContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  columnWrapper: {
    justifyContent: 'center', // This centers items in each row
    marginVertical: 5,
  },
});

export default memo(ImageGrid); // Wrap with memo
