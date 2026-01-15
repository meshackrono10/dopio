import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import Pressable from './Pressable';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'flat' | 'elevated' | 'outline';
    pressable?: boolean;
    onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'elevated',
    pressable = false,
    onPress
}) => {
    const { isDark } = useTheme();

    const getVariantStyle = () => {
        switch (variant) {
            case 'flat':
                return {
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                };
            case 'outline':
                return {
                    backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                    borderWidth: 1,
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                };
            case 'elevated':
            default:
                return {
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                    ...(!isDark && shadows.md),
                    ...(isDark && {
                        borderWidth: 1,
                        borderColor: colors.neutral[700],
                    }),
                };
        }
    };

    const cardContent = (
        <View style={[styles.card, getVariantStyle(), style]}>
            {children}
        </View>
    );

    if (pressable && onPress) {
        return (
            <Pressable onPress={onPress} style={{ backgroundColor: 'transparent' }}>
                {cardContent}
            </Pressable>
        );
    }

    return cardContent;
};

const styles = StyleSheet.create({
    card: {
        borderRadius: borderRadius.xxxl,
        overflow: 'hidden',
    },
});

export default Card;
