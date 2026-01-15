/**
 * ProgressBar Component
 * Animated progress indicator for multi-step forms
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
    showLabel?: boolean;
    height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    currentStep,
    totalSteps,
    showLabel = false,
    height = 6,
}) => {
    const progress = (currentStep / totalSteps) * 100;
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(animatedWidth, {
            toValue: progress,
            useNativeDriver: false,
            tension: 40,
            friction: 7,
        }).start();
    }, [progress]);

    return (
        <View style={styles.container}>
            {showLabel && (
                <Text style={styles.label}>
                    Step {currentStep} of {totalSteps}
                </Text>
            )}
            <View style={[styles.track, { height }]}>
                <Animated.View
                    style={[
                        styles.fill,
                        {
                            height,
                            width: animatedWidth.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%'],
                            }),
                        },
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        ...typography.caption,
        color: colors.neutral[600],
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    track: {
        width: '100%',
        backgroundColor: colors.neutral[200],
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    fill: {
        backgroundColor: colors.primary[600],
        borderRadius: borderRadius.full,
    },
});

export default ProgressBar;
