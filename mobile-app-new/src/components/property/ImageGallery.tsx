import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    ScrollView,
    Image,
    Dimensions,
    StyleSheet,
    Modal,
    StatusBar,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, animations } from '../../theme';
import Pressable from '../common/Pressable';

const { width, height } = Dimensions.get('window');

interface ImageGalleryProps {
    images: string[];
    initialIndex?: number;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [modalVisible, setModalVisible] = useState(false);

    // Animation for dots
    const dotAnimations = useRef(images.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        images.forEach((_, index) => {
            Animated.spring(dotAnimations[index], {
                toValue: index === currentIndex ? 1 : 0,
                friction: 8,
                tension: 40,
                useNativeDriver: false, // width is not supported by native driver
            }).start();
        });
    }, [currentIndex]);

    const handleScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        setCurrentIndex(Math.round(index));
    };

    return (
        <View>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.scrollView}
            >
                {images.map((image, index) => (
                    <Pressable
                        key={index}
                        onPress={() => setModalVisible(true)}
                        scaleOnPress={false}
                        activeOpacity={0.9}
                    >
                        <Image source={{ uri: image }} style={styles.image} />
                    </Pressable>
                ))}
            </ScrollView>

            <View style={styles.pagination}>
                <View style={styles.paginationDots}>
                    {images.map((_, index) => {
                        const dotWidth = dotAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [8, 24],
                        });
                        const dotOpacity = dotAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1],
                        });

                        return (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.dot,
                                    {
                                        width: dotWidth,
                                        opacity: dotOpacity,
                                        backgroundColor: 'white',
                                    },
                                ]}
                            />
                        );
                    })}
                </View>
            </View>

            <Modal
                visible={modalVisible}
                transparent={false}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <StatusBar barStyle="light-content" />
                    <Pressable
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Ionicons name="close" size={32} color="white" />
                    </Pressable>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        contentOffset={{ x: currentIndex * width, y: 0 }}
                    >
                        {images.map((image, index) => (
                            <View key={index} style={styles.modalImageContainer}>
                                <Image
                                    source={{ uri: image }}
                                    style={styles.modalImage}
                                    resizeMode="contain"
                                />
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        width,
        height: 300,
    },
    image: {
        width,
        height: 300,
        resizeMode: 'cover',
    },
    pagination: {
        position: 'absolute',
        bottom: spacing.lg,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    paginationDots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    dot: {
        height: 8,
        borderRadius: borderRadius.full,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: spacing.xl,
        zIndex: 10,
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalImageContainer: {
        width,
        height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
});

export default ImageGallery;
