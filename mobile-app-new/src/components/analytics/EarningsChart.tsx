import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

const { width } = Dimensions.get('window');

interface EarningsData {
    month: string;
    amount: number;
}

interface EarningsChartProps {
    data: EarningsData[];
    title?: string;
}

export default function EarningsChart({ data, title = 'Earnings Overview' }: EarningsChartProps) {
    const { isDark } = useTheme();

    const maxEarnings = Math.max(...data.map(d => d.amount));
    const total = data.reduce((sum, d) => sum + d.amount, 0);
    const average = total / data.length;

    const chartWidth = width - spacing.md * 4;
    const chartHeight = 200;
    const barWidth = (chartWidth - spacing.xs * (data.length - 1)) / data.length;

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
            <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>{title}</Text>

            {/* Summary Stats */}
            <View style={styles.stats}>
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>Total</Text>
                    <Text style={[styles.statValue, { color: colors.success[600] }]}>
                        KES {total.toLocaleString()}
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>Average</Text>
                    <Text style={[styles.statValue, { color: colors.primary[600] }]}>
                        KES {Math.round(average).toLocaleString()}
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>Highest</Text>
                    <Text style={[styles.statValue, { color: colors.warning[600] }]}>
                        KES {maxEarnings.toLocaleString()}
                    </Text>
                </View>
            </View>

            {/* Bar Chart */}
            <View style={styles.chartContainer}>
                <View style={[styles.chart, { height: chartHeight }]}>
                    {data.map((item, index) => {
                        const barHeight = maxEarnings > 0 ? (item.amount / maxEarnings) * (chartHeight - 30) : 0;

                        return (
                            <View key={item.month} style={[styles.barContainer, { width: barWidth }]}>
                                <View style={styles.barWrapper}>
                                    <View style={[styles.bar, { height: barHeight, backgroundColor: colors.primary[500] }]}>
                                        {item.amount > 0 && (
                                            <Text style={styles.barValue}>
                                                {(item.amount / 1000).toFixed(0)}K
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <Text style={[styles.monthLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                                    {item.month}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Trend Indicator */}
            {data.length >= 2 && (
                <View style={styles.trend}>
                    {data[data.length - 1].amount > data[data.length - 2].amount ? (
                        <>
                            <Ionicons name="trending-up" size={18} color={colors.success[500]} />
                            <Text style={[styles.trendText, { color: colors.success[600] }]}>
                                Growing earnings
                            </Text>
                        </>
                    ) : data[data.length - 1].amount < data[data.length - 2].amount ? (
                        <>
                            <Ionicons name="trending-down" size={18} color={colors.error[500]} />
                            <Text style={[styles.trendText, { color: colors.error[600] }]}>
                                Declining earnings
                            </Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="remove" size={18} color={colors.neutral[500]} />
                            <Text style={[styles.trendText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                                Stable earnings
                            </Text>
                        </>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        ...typography.h3,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: spacing.md,
    },
    stats: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    chartContainer: {
        overflow: 'hidden',
    },
    chart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: spacing.xs,
    },
    barContainer: {
        alignItems: 'center',
    },
    barWrapper: {
        flex: 1,
        justifyContent: 'flex-end',
        width: '100%',
    },
    bar: {
        width: '100%',
        borderTopLeftRadius: borderRadius.sm,
        borderTopRightRadius: borderRadius.sm,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 4,
        minHeight: 20,
    },
    barValue: {
        color: colors.neutral[50],
        fontSize: 10,
        fontWeight: '700',
    },
    monthLabel: {
        fontSize: 10,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    trend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        gap: spacing.xs,
    },
    trendText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
