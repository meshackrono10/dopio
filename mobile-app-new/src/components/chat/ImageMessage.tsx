import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { borderRadius, spacing } from '../../theme';

interface ImageMessageProps {
    images: string[];
    onPress?: (index: number) => void;
}

const { width } = Dimensions.get('window');
const MAX_BUBBLE_WIDTH = width * 0.7;

const ImageMessage: React.FC<ImageMessageProps> = ({ images, onPress }) => {
    if (images.length === 0) return null;

    if (images.length === 1) {
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onPress?.(0)}
                style={styles.singleImageContainer}
            >
                <Image
                    source={{ uri: images[0] }}
                    style={styles.singleImage}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.gridContainer}>
            {images.slice(0, 4).map((uri, index) => (
                <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    onPress={() => onPress?.(index)}
                    style={[
                        styles.gridItem,
                        images.length === 2 && styles.halfWidth,
                        images.length >= 3 && index < 2 && styles.halfWidth,
                        images.length >= 3 && index >= 2 && styles.halfWidth,
                    ]}
                >
                    <Image
                        source={{ uri }}
                        style={styles.gridImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    singleImageContainer: {
        width: MAX_BUBBLE_WIDTH,
        height: MAX_BUBBLE_WIDTH * 0.75,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    singleImage: {
        width: '100%',
        height: '100%',
    },
    gridContainer: {
        width: MAX_BUBBLE_WIDTH,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 2,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    gridItem: {
        height: MAX_BUBBLE_WIDTH / 2,
    },
    halfWidth: {
        width: (MAX_BUBBLE_WIDTH - 2) / 2,
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
});

export default ImageMessage;
