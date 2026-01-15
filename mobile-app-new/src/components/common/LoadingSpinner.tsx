import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../theme';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    color?: string;
}

export default function LoadingSpinner({ size = 'large', color }: LoadingSpinnerProps) {
    const { isDark } = useTheme();
    const spinnerColor = color || (isDark ? colors.primary[400] : colors.primary[500]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={spinnerColor} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
