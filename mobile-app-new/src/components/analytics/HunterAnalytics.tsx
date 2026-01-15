import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../../theme';
import EarningsChart from './EarningsChart';

const { width } = Dimensions.get('window');

interface MetricCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color: string;
}

const MetricCard = ({ icon, label, value, trend, color }: MetricCardProps) => {
    const { isDark } = useTheme();
    return (
        <View style={[styles.metricCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.metricInfo}>
                <Text style={[styles.metricLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>{label}</Text>
                <Text style={[styles.metricValue, { color: isDark ? colors.text.dark : colors.text.light }]}>{value}</Text>
                {trend && (
                    <View style={styles.trendContainer}>
                        <Ionicons
                            name={trend.isPositive ? 'trending-up' : 'trending-down'}
                            size={14}
                            color={trend.isPositive ? colors.success : colors.error}
                        />
                        <Text style={[styles.trendText, { color: trend.isPositive ? colors.success : colors.error }]}>
                            {trend.value}% vs last month
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default function HunterAnalytics() {
    const { isDark } = useTheme();

    // Mock data for analytics
    const earningsData = [
        { month: 'Jan', amount: 45000 },
        { month: 'Feb', amount: 52000 },
        { month: 'Mar', amount: 48000 },
        { month: 'Apr', amount: 61000 },
        { month: 'May', amount: 58000 },
        { month: 'Jun', amount: 67000 },
    ];

    const conversionData = [
        { month: 'Jan', amount: 15 },
        { month: 'Feb', amount: 18 },
        { month: 'Mar', amount: 12 },
        { month: 'Apr', amount: 22 },
        { month: 'May', amount: 20 },
        { month: 'Jun', amount: 25 },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Performance Overview</Text>

            <View style={styles.metricsGrid}>
                <MetricCard
                    icon="flash"
                    label="Response Rate"
                    value="98%"
                    trend={{ value: 2, isPositive: true }}
                    color={colors.primary[500]}
                />
                <MetricCard
                    icon="time"
                    label="Avg. Response"
                    value="12m"
                    trend={{ value: 5, isPositive: true }}
                    color={colors.info}
                />
                <MetricCard
                    icon="checkmark-circle"
                    label="Conversion"
                    value="24%"
                    trend={{ value: 3, isPositive: true }}
                    color={colors.success}
                />
                <MetricCard
                    icon="star"
                    label="Profile Views"
                    value="1,240"
                    trend={{ value: 12, isPositive: true }}
                    color={colors.warning}
                />
            </View>

            <View style={styles.chartSection}>
                <EarningsChart data={earningsData} title="Earnings Growth" />
            </View>

            <View style={styles.chartSection}>
                <EarningsChart data={conversionData} title="Booking Conversion (%)" />
            </View>

            <View style={[styles.insightCard, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                <View style={styles.insightHeader}>
                    <Ionicons name="bulb" size={24} color={colors.primary[500]} />
                    <Text style={[styles.insightTitle, { color: colors.primary[700] }]}>Growth Tip</Text>
                </View>
                <Text style={[styles.insightText, { color: isDark ? colors.neutral[300] : colors.primary[900] }]}>
                    Your response time is 15% faster than average hunters in Westlands. This is contributing to your high conversion rate!
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sectionTitle: {
        ...typography.h3,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: spacing.md,
        marginTop: spacing.sm,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    metricCard: {
        width: (width - spacing.md * 3) / 2,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricInfo: {
        flex: 1,
    },
    metricLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginTop: 2,
    },
    trendText: {
        fontSize: 9,
        fontWeight: '600',
    },
    chartSection: {
        marginBottom: spacing.lg,
    },
    insightCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    insightText: {
        fontSize: 14,
        lineHeight: 20,
    },
});
