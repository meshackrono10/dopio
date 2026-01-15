/**
 * Skeleton Loading Component
 * Animated skeleton loader for content placeholders
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonProps {
    width?: DimensionValue;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius: customRadius = borderRadius.md,
    style,
}) => {
    const { isDark } = useTheme();
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );

        animation.start();

        return () => animation.stop();
    }, []);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200],
    });

    const baseColor = isDark ? colors.neutral[800] : colors.neutral[200];
    const highlightColor = isDark ? colors.neutral[700] : colors.neutral[100];

    return (
        <View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius: customRadius,
                    backgroundColor: baseColor,
                    overflow: 'hidden',
                },
                style,
            ]}
        >
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            >
                <LinearGradient
                    colors={[baseColor, highlightColor, baseColor]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

// Pre-built skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 1 }) => (
    <View>
        {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
                key={index}
                height={16}
                width={index === lines - 1 ? '70%' : '100%'}
                style={{ marginBottom: 8 }}
            />
        ))}
    </View>
);

export const SkeletonCard: React.FC = () => (
    <View style={styles.card}>
        <Skeleton height={200} borderRadius={borderRadius.lg} style={{ marginBottom: 12 }} />
        <Skeleton height={20} width="80%" style={{ marginBottom: 8 }} />
        <Skeleton height={16} width="60%" style={{ marginBottom: 8 }} />
        <Skeleton height={14} width="40%" />
    </View>
);

export const SkeletonPropertyCard: React.FC = () => (
    <View style={styles.propertyCard}>
        <Skeleton height={180} borderRadius={borderRadius.lg} style={{ marginBottom: 12 }} />
        <Skeleton height={20} width="90%" style={{ marginBottom: 8 }} />
        <Skeleton height={16} width="60%" style={{ marginBottom: 8 }} />
        <View style={styles.row}>
            <Skeleton height={14} width={60} style={{ marginRight: 12 }} />
            <Skeleton height={14} width={60} />
        </View>
    </View>
);

export const SkeletonCircle: React.FC<{ size?: number }> = ({ size = 40 }) => (
    <Skeleton width={size} height={size} borderRadius={size / 2} />
);

export const SkeletonAvatar: React.FC = () => <SkeletonCircle size={48} />;

const styles = StyleSheet.create({
    skeleton: {},
    card: {
        padding: 16,
        marginBottom: 16,
    },
    propertyCard: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
    },
});

export default Skeleton;
