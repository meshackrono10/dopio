import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../../theme';
import Pressable from './Pressable';

interface ButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    disabled?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    style?: any;
}

const Button: React.FC<ButtonProps> = ({
    onPress,
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    style,
}) => {
    const getButtonStyle = () => {
        const base = [
            styles.button,
            styles[size],
            fullWidth && styles.fullWidth,
            disabled && styles.disabled,
        ];

        if (variant === 'outline') {
            return [...base, styles.outline];
        } else if (variant === 'ghost') {
            return [...base, styles.ghost];
        } else if (variant === 'secondary') {
            return [...base, styles.secondary];
        }

        return base;
    };

    const getTextStyle = () => {
        const base = [styles.text, styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles]];

        if (variant === 'outline') {
            return [...base, styles.outlineText];
        } else if (variant === 'ghost') {
            return [...base, styles.ghostText];
        } else if (variant === 'secondary') {
            return [...base, styles.secondaryText];
        }

        return [...base, styles.primaryText];
    };

    const content = (
        <View style={styles.contentContainer}>
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? colors.primary[600] : 'white'}
                />
            ) : (
                <View style={styles.innerContent}>
                    {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                    <Text style={getTextStyle()}>{children}</Text>
                    {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
                </View>
            )}
        </View>
    );

    if (variant === 'primary' && !disabled) {
        return (
            <Pressable
                onPress={onPress}
                disabled={disabled || loading}
                style={[getButtonStyle(), style]}
            >
                <LinearGradient
                    colors={[colors.primary[600], colors.primary[700]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    {content}
                </LinearGradient>
            </Pressable>
        );
    }

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={[getButtonStyle(), style]}
        >
            {content}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    leftIcon: {
        marginRight: spacing.xs,
    },
    rightIcon: {
        marginLeft: spacing.xs,
    },
    sm: {
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        minHeight: 28,
    },
    md: {
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        minHeight: 36,
    },
    lg: {
        paddingHorizontal: spacing.lg,
        paddingVertical: 10,
        minHeight: 42,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    gradient: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
    },
    secondary: {
        backgroundColor: colors.secondary[600],
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary[600],
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    text: {
        ...typography.button,
    },
    textsm: {
        fontSize: 13,
    },
    textMd: {
        fontSize: 14,
    },
    textLg: {
        fontSize: 16,
    },
    primaryText: {
        color: 'white',
    },
    secondaryText: {
        color: 'white',
    },
    outlineText: {
        color: colors.primary[600],
    },
    ghostText: {
        color: colors.primary[600],
    },
});

export default Button;
