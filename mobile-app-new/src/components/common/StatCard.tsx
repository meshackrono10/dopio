import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: string;
    onPress?: () => void;
}

export default function StatCard({ icon, label, value, trend, color = colors.primary[500], onPress }: StatCardProps) {
    const { isDark } = useTheme();

    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            onPress={onPress}
            style={[
                styles.container,
                { backgroundColor: isDark ? colors.neutral[800] : 'white' },
            ]}
        >
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                {trend && (
                    <View style={[styles.trendBadge, { backgroundColor: trend.isPositive ? colors.success[50] : colors.error[50] }]}>
                        <Ionicons
                            name={trend.isPositive ? 'trending-up' : 'trending-down'}
                            size={12}
                            color={trend.isPositive ? colors.success[600] : colors.error[600]}
                        />
                        <Text
                            style={[
                                styles.trendText,
                                { color: trend.isPositive ? colors.success[600] : colors.error[600] },
                            ]}
                        >
                            {Math.abs(trend.value)}%
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.content}>
                <Text style={[styles.label, { color: colors.neutral[500] }]} numberOfLines={1}>
                    {label}
                </Text>
                <Text style={[styles.value, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                    {value}
                </Text>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        minWidth: '45%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
        gap: 2,
    },
    content: {
        marginTop: spacing.xs,
    },
    label: {
        ...typography.body,
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
    },
    value: {
        ...typography.h3,
        fontSize: 18,
        fontWeight: '700',
    },
    trendText: {
        fontSize: 10,
        fontWeight: '700',
    },
});
