import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const AdminAnalyticsScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

    // Mock analytics data
    const stats = {
        totalUsers: 1248,
        activeUsers: 892,
        totalHunters: 156,
        totalTenants: 1092,
        totalBookings: 3456,
        completedBookings: 3102,
        totalRevenue: 456789,
        monthlyRevenue: 45678,
        averageBookingValue: 2500,
        conversionRate: 68,
    };

    const userGrowth = [
        { month: 'Jan', users: 950, hunters: 120 },
        { month: 'Feb', users: 1050, hunters: 135 },
        { month: 'Mar', users: 1150, hunters: 145 },
        { month: 'Apr', users: 1248, hunters: 156 },
    ];

    const revenueData = [
        { month: 'Jan', amount: 38500 },
        { month: 'Feb', amount: 42000 },
        { month: 'Mar', amount: 39500 },
        { month: 'Apr', amount: 45678 },
    ];

    const topAreas = [
        { name: 'Kasarani', bookings: 456, revenue: 125000 },
        { name: 'Westlands', bookings: 389, revenue: 118000 },
        { name: 'Kilimani', bookings: 345, revenue: 98000 },
        { name: 'Roysambu', bookings: 312, revenue: 87000 },
    ];

    const maxUsers = Math.max(...userGrowth.map(d => d.users));
    const maxRevenue = Math.max(...revenueData.map(d => d.amount));

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Analytics Dashboard
                </Text>
                <TouchableOpacity>
                    <Ionicons name="download-outline" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Timeframe Selector */}
            <View style={[styles.tabBar, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
                    {['week', 'month', 'year'].map(tf => (
                        <TouchableOpacity
                            key={tf}
                            style={[
                                styles.tabItem,
                                timeframe === tf && styles.activeTabItem
                            ]}
                            onPress={() => setTimeframe(tf as any)}
                        >
                            <Text style={[
                                styles.tabText,
                                timeframe === tf && styles.activeTabText
                            ]}>
                                {tf.charAt(0).toUpperCase() + tf.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Key Metrics */}
                <View style={styles.metricsGrid}>
                    <View style={[styles.metricCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Ionicons name="people" size={24} color={colors.primary[500]} />
                        <Text style={[styles.metricValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {stats.totalUsers.toLocaleString()}
                        </Text>
                        <Text style={styles.metricLabel}>Total Users</Text>
                        <Text style={[styles.metricChange, { color: colors.success }]}>+12% vs last month</Text>
                    </View>

                    <View style={[styles.metricCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Ionicons name="calendar" size={24} color={colors.success} />
                        <Text style={[styles.metricValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {stats.totalBookings.toLocaleString()}
                        </Text>
                        <Text style={styles.metricLabel}>Total Bookings</Text>
                        <Text style={[styles.metricChange, { color: colors.success }]}>+8% vs last month</Text>
                    </View>

                    <View style={[styles.metricCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Ionicons name="cash" size={24} color={colors.warning} />
                        <Text style={[styles.metricValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {(stats.monthlyRevenue / 1000).toFixed(0)}K
                        </Text>
                        <Text style={styles.metricLabel}>Revenue (KES)</Text>
                        <Text style={[styles.metricChange, { color: colors.success }]}>+15% vs last month</Text>
                    </View>

                    <View style={[styles.metricCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Ionicons name="trending-up" size={24} color={colors.error} />
                        <Text style={[styles.metricValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {stats.conversionRate}%
                        </Text>
                        <Text style={styles.metricLabel}>Conversion Rate</Text>
                        <Text style={[styles.metricChange, { color: colors.error }]}>-2% vs last month</Text>
                    </View>
                </View>

                {/* User Growth Chart */}
                <View style={[styles.chartCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.chartTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        User Growth
                    </Text>
                    <View style={styles.chart}>
                        {userGrowth.map((item, index) => (
                            <View key={index} style={styles.chartColumn}>
                                <View style={styles.barGroup}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: `${(item.users / maxUsers) * 100}%`,
                                                backgroundColor: colors.primary[500]
                                            }
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.bar,
                                            styles.barSecondary,
                                            {
                                                height: `${(item.hunters / maxUsers) * 100}%`,
                                                backgroundColor: colors.warning
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.chartLabel}>{item.month}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.primary[500] }]} />
                            <Text style={styles.legendText}>Total Users</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                            <Text style={styles.legendText}>Hunters</Text>
                        </View>
                    </View>
                </View>

                {/* Revenue Chart */}
                <View style={[styles.chartCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.chartTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Revenue Trend
                    </Text>
                    <View style={styles.chart}>
                        {revenueData.map((item, index) => (
                            <View key={index} style={styles.chartColumn}>
                                <View style={styles.barContainer}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: `${(item.amount / maxRevenue) * 100}%`,
                                                backgroundColor: colors.success
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.chartLabel}>{item.month}</Text>
                                <Text style={styles.chartValue}>{(item.amount / 1000).toFixed(0)}K</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Search Request Volume Chart */}
                <View style={[styles.chartCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.chartTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Search Request Volume
                    </Text>
                    <View style={styles.chart}>
                        {[25, 40, 35, 50].map((val, index) => (
                            <View key={index} style={styles.chartColumn}>
                                <View style={styles.barContainer}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: `${(val / 50) * 100}%`,
                                                backgroundColor: colors.primary[600]
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.chartLabel}>{['Jan', 'Feb', 'Mar', 'Apr'][index]}</Text>
                                <Text style={styles.chartValue}>{val}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Top Performing Areas */}
                <View style={[styles.chartCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.chartTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Top Performing Areas
                    </Text>
                    {topAreas.map((area, index) => (
                        <View key={index} style={styles.areaRow}>
                            <View style={styles.areaRank}>
                                <Text style={[styles.rankNumber, { color: index === 0 ? colors.warning : colors.neutral[500] }]}>
                                    #{index + 1}
                                </Text>
                            </View>
                            <View style={styles.areaInfo}>
                                <Text style={[styles.areaName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    {area.name}
                                </Text>
                                <Text style={styles.areaStats}>
                                    {area.bookings} bookings • KES {(area.revenue / 1000).toFixed(0)}K
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.progressBar,
                                    { width: `${(area.bookings / topAreas[0].bookings) * 100}%` }
                                ]}
                            />
                        </View>
                    ))}
                </View>

                {/* Quick Stats */}
                <View style={styles.quickStatsContainer}>
                    <View style={[styles.quickStatCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={styles.quickStatLabel}>Active Users</Text>
                        <Text style={[styles.quickStatValue, { color: colors.success }]}>
                            {stats.activeUsers}
                        </Text>
                        <Text style={styles.quickStatSubtext}>
                            {((stats.activeUsers / stats.totalUsers) * 100).toFixed(0)}% of total
                        </Text>
                    </View>

                    <View style={[styles.quickStatCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={styles.quickStatLabel}>Avg Booking Value</Text>
                        <Text style={[styles.quickStatValue, { color: colors.primary[500] }]}>
                            {stats.averageBookingValue.toLocaleString()}
                        </Text>
                        <Text style={styles.quickStatSubtext}>KES per booking</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
        flex: 1,
        textAlign: 'center',
    },
    tabBar: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    tabBarContent: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        gap: spacing.md,
    },
    tabItem: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
    },
    activeTabItem: {
        backgroundColor: colors.primary[500],
    },
    tabText: {
        ...typography.bodySemiBold,
        fontSize: 14,
        color: colors.neutral[500],
    },
    activeTabText: {
        color: 'white',
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    metricCard: {
        width: (width - spacing.lg * 3) / 2,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    metricValue: {
        ...typography.h2,
        fontSize: 28,
        marginVertical: spacing.xs,
    },
    metricLabel: {
        ...typography.caption,
        color: colors.neutral[500],
        marginBottom: spacing.xs,
    },
    metricChange: {
        ...typography.caption,
        fontSize: 11,
        fontWeight: '600',
    },
    chartCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    chartTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.lg,
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 150,
        marginBottom: spacing.md,
    },
    chartColumn: {
        flex: 1,
        alignItems: 'center',
    },
    barContainer: {
        width: '80%',
        height: 120,
        justifyContent: 'flex-end',
    },
    barGroup: {
        flexDirection: 'row',
        gap: 4,
        height: 120,
        alignItems: 'flex-end',
    },
    bar: {
        width: 20,
        borderTopLeftRadius: borderRadius.sm,
        borderTopRightRadius: borderRadius.sm,
    },
    barSecondary: {
        width: 16,
    },
    chartLabel: {
        ...typography.caption,
        color: colors.neutral[500],
        marginTop: spacing.xs,
    },
    chartValue: {
        ...typography.caption,
        color: colors.neutral[400],
        fontSize: 10,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.lg,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        ...typography.caption,
        color: colors.neutral[600],
    },
    areaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    areaRank: {
        width: 40,
    },
    rankNumber: {
        ...typography.bodySemiBold,
        fontSize: 18,
    },
    areaInfo: {
        flex: 1,
    },
    areaName: {
        ...typography.bodySemiBold,
        fontSize: 15,
        marginBottom: 2,
    },
    areaStats: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    progressBar: {
        position: 'absolute',
        left: 40,
        right: 0,
        height: '100%',
        backgroundColor: colors.primary[100],
        opacity: 0.3,
        zIndex: -1,
    },
    quickStatsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    quickStatCard: {
        flex: 1,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    quickStatLabel: {
        ...typography.caption,
        color: colors.neutral[500],
        marginBottom: spacing.xs,
    },
    quickStatValue: {
        ...typography.h2,
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    quickStatSubtext: {
        ...typography.caption,
        color: colors.neutral[400],
        fontSize: 11,
    },
});

export default AdminAnalyticsScreen;
