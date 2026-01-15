/**
 * Optimized Image Component
 * Progressive image loading with placeholder and error states
 */

import React, { useState } from 'react';
import {
    Image,
    View,
    StyleSheet,
    ActivityIndicator,
    ImageSourcePropType,
    ImageStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

interface OptimizedImageProps {
    source: ImageSourcePropType | { uri: string };
    style?: ImageStyle;
    placeholder?: ImageSourcePropType;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
    onLoad?: () => void;
    onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
    source,
    style,
    placeholder,
    resizeMode = 'cover',
    onLoad,
    onError,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleLoad = () => {
        setLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        setLoading(false);
        setError(true);
        onError?.();
    };

    if (error) {
        return (
            <View style={[styles.placeholder, style]}>
                <Ionicons name="image-outline" size={48} color={colors.neutral[400]} />
            </View>
        );
    }

    return (
        <View style={style}>
            {loading && (
                <View style={[styles.loadingContainer, StyleSheet.absoluteFill]}>
                    {placeholder ? (
                        <Image
                            source={placeholder}
                            style={StyleSheet.absoluteFill}
                            resizeMode={resizeMode}
                            blurRadius={1}
                        />
                    ) : (
                        <View style={styles.placeholder}>
                            <ActivityIndicator size="small" color={colors.primary[600]} />
                        </View>
                    )}
                </View>
            )}
            <Image
                source={source}
                style={style}
                resizeMode={resizeMode}
                onLoad={handleLoad}
                onError={handleError}
                fadeDuration={300}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
    },
});

export default OptimizedImage;
