import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

interface PropertyAnalyticsProps {
    views: number;
    inquiries: number;
    bookings: number;
    revenue: number;
}

const PropertyAnalytics: React.FC<PropertyAnalyticsProps> = ({ views, inquiries, bookings, revenue }) => {
    const { isDark } = useTheme();

    const stats = [
        { label: 'Total Views', value: views, icon: 'eye-outline', color: colors.primary[500] },
        { label: 'Inquiries', value: inquiries, icon: 'chatbubble-outline', color: colors.warning },
        { label: 'Bookings', value: bookings, icon: 'calendar-outline', color: colors.success },
        { label: 'Revenue', value: `KES ${revenue.toLocaleString()}`, icon: 'cash-outline', color: colors.primary[600] },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {stats.map((stat, index) => (
                    <View
                        key={index}
                        style={[
                            styles.statCard,
                            { backgroundColor: isDark ? colors.neutral[800] : 'white' }
                        ]}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: stat.color + '15' }]}>
                            <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                        </View>
                        <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {stat.value}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.neutral[500] }]}>
                            {stat.label}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={[styles.conversionCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <Text style={[styles.cardTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Conversion Rate
                </Text>
                <View style={styles.progressRow}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${(bookings / views * 100) || 0}%`, backgroundColor: colors.success }
                            ]}
                        />
                    </View>
                    <Text style={[styles.progressText, { color: colors.success }]}>
                        {((bookings / views * 100) || 0).toFixed(1)}%
                    </Text>
                </View>
                <Text style={[styles.cardSubtext, { color: colors.neutral[500] }]}>
                    Views to Bookings conversion
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: spacing.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        minWidth: (Dimensions.get('window').width - spacing.lg * 2 - spacing.md) / 2,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    statValue: {
        ...typography.h3,
        fontSize: 18,
        marginBottom: 2,
    },
    statLabel: {
        ...typography.caption,
        fontSize: 12,
    },
    conversionCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    cardTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.md,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.xs,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: colors.neutral[100],
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
    },
    progressText: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    cardSubtext: {
        ...typography.caption,
    },
});

export default PropertyAnalytics;
