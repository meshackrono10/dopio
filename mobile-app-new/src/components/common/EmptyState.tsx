import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, spacing, typography } from '../../theme';

interface EmptyStateProps {
    icon?: string;
    title: string;
    message: string;
    action?: React.ReactNode;
}

export default function EmptyState({ icon = 'box', title, message, action }: EmptyStateProps) {
    const { isDark } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon === 'box' ? '📦' : icon}</Text>
            <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                {title}
            </Text>
            <Text style={[styles.message, { color: colors.neutral[500] }]}>
                {message}
            </Text>
            {action && <View style={styles.actionContainer}>{action}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    icon: {
        fontSize: 64,
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h3,
        fontSize: 20,
        fontWeight: '700',
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    message: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    actionContainer: {
        marginTop: spacing.md,
    },
});
