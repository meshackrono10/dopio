/**
 * Badge Component
 * Reusable badge for status indicators and labels
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
    label: string;
    variant?: BadgeVariant;
    size?: BadgeSize;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({
    label,
    variant = 'neutral',
    size = 'md',
    style,
    textStyle,
}) => {
    const getBadgeColors = () => {
        switch (variant) {
            case 'success':
                return {
                    backgroundColor: colors.success + '20',
                    color: colors.success,
                };
            case 'error':
                return {
                    backgroundColor: colors.error + '20',
                    color: colors.error,
                };
            case 'warning':
                return {
                    backgroundColor: colors.warning + '20',
                    color: colors.warning,
                };
            case 'info':
                return {
                    backgroundColor: colors.info + '20',
                    color: colors.info,
                };
            case 'primary':
                return {
                    backgroundColor: colors.primary[100],
                    color: colors.primary[700],
                };
            case 'neutral':
            default:
                return {
                    backgroundColor: colors.neutral[200],
                    color: colors.neutral[700],
                };
        }
    };

    const getBadgeSize = () => {
        switch (size) {
            case 'sm':
                return {
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 2,
                    fontSize: 10,
                };
            case 'lg':
                return {
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    fontSize: 14,
                };
            case 'md':
            default:
                return {
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    fontSize: 12,
                };
        }
    };

    const badgeColors = getBadgeColors();
    const badgeSize = getBadgeSize();

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: badgeColors.backgroundColor,
                    paddingHorizontal: badgeSize.paddingHorizontal,
                    paddingVertical: badgeSize.paddingVertical,
                },
                style,
            ]}
        >
            <Text
                style={[
                    styles.text,
                    {
                        color: badgeColors.color,
                        fontSize: badgeSize.fontSize,
                    },
                    textStyle,
                ]}
            >
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        borderRadius: borderRadius.sm,
        alignSelf: 'flex-start',
    },
    text: {
        fontWeight: '700',
        textTransform: 'capitalize',
    },
});

export default Badge;
