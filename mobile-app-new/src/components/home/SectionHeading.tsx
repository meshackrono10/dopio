import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

interface SectionHeadingProps {
    title: string;
    subtitle?: string;
    isCenter?: boolean;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ title, subtitle, isCenter }) => {
    const { isDark } = useTheme();

    return (
        <View style={[styles.container, isCenter && styles.center]}>
            <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }, isCenter && styles.textCenter]}>
                {title}
            </Text>
            {subtitle && (
                <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }, isCenter && styles.textCenter]}>
                    {subtitle}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
    },
    center: {
        alignItems: 'center',
    },
    title: {
        ...typography.h2,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.bodySmall,
    },
    textCenter: {
        textAlign: 'center',
    },
});

export default SectionHeading;
