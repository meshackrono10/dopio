import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

interface CustomTextInputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    containerStyle?: any;
}

const TextInput: React.FC<CustomTextInputProps> = ({
    label,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    ...props
}) => {
    const { isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    {label}
                </Text>
            )}
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                        borderColor: error
                            ? colors.error
                            : isFocused
                                ? colors.primary[600]
                                : 'transparent',
                    },
                ]}
            >
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={20}
                        color={isDark ? colors.neutral[400] : colors.neutral[500]}
                        style={styles.leftIcon}
                    />
                )}
                <RNTextInput
                    {...props}
                    style={[
                        styles.input,
                        { color: isDark ? colors.text.dark : colors.text.light },
                        leftIcon && styles.inputWithLeftIcon,
                        rightIcon && styles.inputWithRightIcon,
                    ]}
                    placeholderTextColor={colors.neutral[400]}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {rightIcon && (
                    <Ionicons
                        name={rightIcon}
                        size={20}
                        color={isDark ? colors.neutral[400] : colors.neutral[500]}
                        style={styles.rightIcon}
                        onPress={onRightIconPress}
                    />
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        ...typography.bodySmall,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        paddingHorizontal: spacing.md,
    },
    input: {
        flex: 1,
        ...typography.body,
        paddingVertical: spacing.md,
        height: 48,
    },
    inputWithLeftIcon: {
        marginLeft: spacing.sm,
    },
    inputWithRightIcon: {
        marginRight: spacing.sm,
    },
    leftIcon: {
        marginRight: spacing.xs,
    },
    rightIcon: {
        marginLeft: spacing.xs,
    },
    errorText: {
        ...typography.caption,
        color: colors.error,
        marginTop: spacing.xs,
    },
});

export default TextInput;
