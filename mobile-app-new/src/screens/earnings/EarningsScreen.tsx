import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useWallet } from '../../contexts/WalletContext';
import { MainTabParamList } from '../../types/navigation';
import { colors, spacing, typography, borderRadius } from '../../theme';
import EarningsChart from '../../components/analytics/EarningsChart';
import StatCard from '../../components/common/StatCard';

type EarningsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'EarningsTab'>;

interface Props {
    navigation: EarningsScreenNavigationProp;
}

// Mock data for earnings
const mockEarningsData = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 48000 },
    { month: 'Apr', amount: 61000 },
    { month: 'May', amount: 58000 },
    { month: 'Jun', amount: 67000 },
];

const mockRecentEarnings = [
    {
        id: '1',
        searchRequestId: 'SR-2024-001',
        tenantName: 'John Kamau',
        propertyTitle: '3 Bedroom Apartment in Westlands',
        amount: 15000,
        commission: 12000,
        date: '2024-01-05',
        status: 'completed' as const,
    },
    {
        id: '2',
        searchRequestId: 'SR-2024-002',
        tenantName: 'Mary Wanjiku',
        propertyTitle: '2 Bedroom in Kilimani',
        amount: 12000,
        commission: 9600,
        date: '2024-01-03',
        status: 'completed' as const,
    },
    {
        id: '3',
        searchRequestId: 'SR-2024-003',
        tenantName: 'Peter Ochieng',
        propertyTitle: 'Studio in Parklands',
        amount: 8000,
        commission: 6400,
        date: '2024-01-02',
        status: 'pending' as const,
    },
];

const mockStats = {
    totalEarnings: 331000,
    thisMonthEarnings: 67000,
    completedRequests: 18,
    activeRequests: 5,
    averageEarning: 18389,
    successRate: 94,
    topCategory: 'Apartments',
    totalClients: 23,
};

export default function EarningsScreen({ navigation }: Props) {
    const { isDark } = useTheme();
    const { balance } = useWallet();
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

    const handleRefresh = () => {
        setRefreshing(true);
        // Simulate refresh
        setTimeout(() => setRefreshing(false), 1500);
    };

    const periods = [
        { key: 'week' as const, label: 'Week' },
        { key: 'month' as const, label: 'Month' },
        { key: 'year' as const, label: 'Year' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent={false} backgroundColor={isDark ? colors.neutral[900] : colors.neutral[50]} />
            {/* Header */}
            <View style={[styles.header, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Earnings</Text>
                    <Text style={[styles.headerSubtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                        Track your income & performance
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.withdrawButton, { backgroundColor: colors.primary[500] }]}
                    onPress={() => navigation.navigate('ProfileTab', { screen: 'Withdraw' })}
                >
                    <Ionicons name="cash-outline" size={18} color="#FFF" />
                    <Text style={styles.withdrawText}>Withdraw</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Wallet Balance */}
                <View style={styles.section}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ProfileTab', { screen: 'Wallet' })}
                        style={[styles.walletCard, { backgroundColor: colors.primary[600] }]}
                    >
                        <View style={styles.walletHeader}>
                            <View>
                                <Text style={styles.walletLabel}>Total Balance</Text>
                                <Text style={styles.walletBalance}>
                                    KES {balance.toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.walletIconContainer}>
                                <Ionicons name="wallet" size={24} color="#FFF" />
                            </View>
                        </View>
                        <View style={styles.walletFooter}>
                            <View>
                                <Text style={styles.walletSubLabel}>Account Status</Text>
                                <Text style={styles.walletStatus}>Verified</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Quick Stats */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Overview</Text>
                    <View style={styles.statsGrid}>
                        <StatCard
                            icon="trending-up"
                            label="This Month"
                            value={`KES ${mockStats.thisMonthEarnings.toLocaleString()}`}
                            trend={{ value: 12, isPositive: true }}
                            color={colors.primary[500]}
                        />
                        <StatCard
                            icon="checkmark-circle"
                            label="Completed"
                            value={mockStats.completedRequests.toString()}
                            trend={{ value: 3, isPositive: true }}
                            color={colors.success}
                        />
                        <StatCard
                            icon="star"
                            label="Rating"
                            value="4.8"
                            trend={{ value: 0.2, isPositive: true }}
                            color={colors.warning}
                        />
                        <StatCard
                            icon="analytics"
                            label="Success Rate"
                            value={`${mockStats.successRate}%`}
                            trend={{ value: 2, isPositive: true }}
                            color={colors.info}
                        />
                    </View>
                </View>

                {/* Performance Metrics */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Performance</Text>
                    <View style={[styles.metricsCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <View style={styles.metricRow}>
                            <View style={styles.metricItem}>
                                <Ionicons name="star" size={20} color={colors.warning} />
                                <View style={styles.metricContent}>
                                    <Text style={[styles.metricLabel, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                        Avg. Earning
                                    </Text>
                                    <Text style={[styles.metricValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        KES {mockStats.averageEarning.toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.metricItem}>
                                <Ionicons name="people" size={20} color={colors.primary[500]} />
                                <View style={styles.metricContent}>
                                    <Text style={[styles.metricLabel, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                        Total Clients
                                    </Text>
                                    <Text style={[styles.metricValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        {mockStats.totalClients}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]} />
                        <View style={styles.metricRow}>
                            <View style={styles.metricItem}>
                                <Ionicons name="trophy" size={20} color={colors.success} />
                                <View style={styles.metricContent}>
                                    <Text style={[styles.metricLabel, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                        Top Category
                                    </Text>
                                    <Text style={[styles.metricValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        {mockStats.topCategory}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.metricItem}>
                                <Ionicons name="wallet" size={20} color={colors.info} />
                                <View style={styles.metricContent}>
                                    <Text style={[styles.metricLabel, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                        Total Earned
                                    </Text>
                                    <Text style={[styles.metricValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        KES {mockStats.totalEarnings.toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Earnings Chart */}
                <View style={styles.section}>
                    <View style={styles.chartHeader}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Earnings Trend
                        </Text>
                        <View style={styles.periodSelector}>
                            {periods.map((period) => (
                                <TouchableOpacity
                                    key={period.key}
                                    style={[
                                        styles.periodButton,
                                        selectedPeriod === period.key && {
                                            backgroundColor: colors.primary[500],
                                        },
                                    ]}
                                    onPress={() => setSelectedPeriod(period.key)}
                                >
                                    <Text
                                        style={[
                                            styles.periodText,
                                            {
                                                color:
                                                    selectedPeriod === period.key
                                                        ? colors.neutral[50]
                                                        : isDark ? colors.text.dark : colors.neutral[500],
                                            },
                                        ]}
                                    >
                                        {period.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <EarningsChart data={mockEarningsData} />
                </View>

                {/* Recent Earnings */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Recent Earnings
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ProfileTab', { screen: 'Wallet' })}>
                            <Text style={[styles.viewAllText, { color: colors.primary[500] }]}>
                                View All
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {mockRecentEarnings.map((earning) => (
                        <TouchableOpacity
                            key={earning.id}
                            style={[styles.earningCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                            activeOpacity={0.7}
                        >
                            <View style={styles.earningHeader}>
                                <View style={styles.earningInfo}>
                                    <Text style={[styles.earningTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        {earning.propertyTitle}
                                    </Text>
                                    <Text style={[styles.earningSubtitle, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                        {earning.tenantName} • {earning.searchRequestId}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor:
                                                earning.status === 'completed'
                                                    ? colors.success + '20'
                                                    : colors.warning + '20',
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            {
                                                color:
                                                    earning.status === 'completed'
                                                        ? colors.success
                                                        : colors.warning,
                                            },
                                        ]}
                                    >
                                        {earning.status === 'completed' ? 'Paid' : 'Pending'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.earningFooter}>
                                <View style={styles.earningAmount}>
                                    <Text style={[styles.amountLabel, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                        Commission
                                    </Text>
                                    <Text style={[styles.amountValue, { color: colors.success }]}>
                                        KES {earning.commission.toLocaleString()}
                                    </Text>
                                </View>
                                <Text style={[styles.earningDate, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                    {new Date(earning.date).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                    })}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                            onPress={() => navigation.navigate('RequestsTab')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: colors.primary[100] }]}>
                                <Ionicons name="search" size={24} color={colors.primary[600]} />
                            </View>
                            <Text style={[styles.actionText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Find Requests
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                            onPress={() => navigation.navigate('ProfileTab', { screen: 'Wallet' })}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: colors.success + '20' }]}>
                                <Ionicons name="wallet" size={24} color={colors.success} />
                            </View>
                            <Text style={[styles.actionText, { color: isDark ? colors.text.dark : colors.text.light }]}>My Wallet</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                            onPress={() => navigation.navigate('ReviewsTab')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
                                <Ionicons name="star" size={24} color={colors.warning} />
                            </View>
                            <Text style={[styles.actionText, { color: isDark ? colors.text.dark : colors.text.light }]}>My Reviews</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                            onPress={() => navigation.navigate('DashboardTab')}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: colors.info + '20' }]}>
                                <Ionicons name="analytics" size={24} color={colors.info} />
                            </View>
                            <Text style={[styles.actionText, { color: isDark ? colors.text.dark : colors.text.light }]}>Analytics</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView >
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    headerTitle: {
        ...typography.h2,
        fontSize: 24,
        fontWeight: '700',
    },
    headerSubtitle: {
        ...typography.body,
        fontSize: 14,
        marginTop: 2,
    },
    withdrawButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    withdrawText: {
        color: colors.neutral[50],
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl * 2,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        ...typography.h3,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    walletCard: {
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        elevation: 8,
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    walletHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
    },
    walletLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    walletBalance: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: '700',
    },
    walletIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    walletFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    walletSubLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        marginBottom: 2,
    },
    walletStatus: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    metricsCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.neutral[100],
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    metricItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    metricContent: {
        flex: 1,
    },
    metricLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        marginVertical: spacing.md,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    periodSelector: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    periodButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    periodText: {
        fontSize: 12,
        fontWeight: '600',
    },
    earningCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.neutral[100],
    },
    earningHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    earningInfo: {
        flex: 1,
        marginRight: spacing.sm,
    },
    earningTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    earningSubtitle: {
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    earningFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    earningAmount: {
        flex: 1,
    },
    amountLabel: {
        fontSize: 11,
        marginBottom: 2,
    },
    amountValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    earningDate: {
        fontSize: 12,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    actionCard: {
        flex: 1,
        minWidth: '45%',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.neutral[100],
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
});
