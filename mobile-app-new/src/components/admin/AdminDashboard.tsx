import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../common/Card';

interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string | number;
    change?: string;
    positive?: boolean;
    isDark: boolean;
}

const StatCard = ({ icon, title, value, change, positive, isDark }: StatCardProps) => (
    <Card style={[styles.statCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
        <View style={styles.statHeader}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primary[600] + '20' }]}>
                <Ionicons name={icon} size={24} color={colors.primary[600]} />
            </View>
            {change && (
                <Text style={[styles.statChange, { color: positive ? colors.success : colors.neutral[500] }]}>
                    {change}
                </Text>
            )}
        </View>
        <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{title}</Text>
    </Card>
);

interface ActionCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    count?: number;
    color: string;
    isDark: boolean;
    onPress: () => void;
}

const ActionCard = ({ icon, title, description, count, color, isDark, onPress }: ActionCardProps) => (
    <TouchableOpacity
        style={[
            styles.actionCard,
            {
                backgroundColor: color + (isDark ? '20' : '10'),
                borderColor: color + '40',
            }
        ]}
        onPress={onPress}
    >
        <View style={styles.actionHeader}>
            <Ionicons name={icon} size={24} color={color} />
            {count !== undefined && (
                <View style={[styles.actionCount, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                    <Text style={[styles.actionCountText, { color: isDark ? colors.text.dark : colors.text.light }]}>{count}</Text>
                </View>
            )}
        </View>
        <Text style={[styles.actionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>{title}</Text>
        <Text style={[styles.actionDesc, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]} numberOfLines={2}>{description}</Text>
    </TouchableOpacity>
);

const AdminDashboard = () => {
    const { isDark } = useTheme();

    const stats = {
        totalUsers: 1247,
        activeHunters: 89,
        pendingVerifications: 12,
        totalProperties: 456,
        openDisputes: 5,
        monthlyRevenue: 458900,
    };

    const recentActivity = [
        { id: 1, type: "user", message: "New user registered: Jane Doe", time: "5 min ago" },
        { id: 2, type: "verification", message: "Hunter verification submitted: John Smith", time: "15 min ago" },
        { id: 3, type: "property", message: "New property listed: 2BR in Westlands", time: "1 hour ago" },
        { id: 5, type: "payment", message: "Payment received: KES 25,000", time: "3 hours ago" },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>Admin Dashboard</Text>
                <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    Manage and oversee the entire Dapio platform
                </Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.section}>
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="people-outline"
                        title="Total Users"
                        value={stats.totalUsers}
                        change="+12%"
                        positive
                        isDark={isDark}
                    />
                    <StatCard
                        icon="home-outline"
                        title="Active Hunters"
                        value={stats.activeHunters}
                        change="+8%"
                        positive
                        isDark={isDark}
                    />
                    <StatCard
                        icon="time-outline"
                        title="Pending Verif."
                        value={stats.pendingVerifications}
                        change="+3"
                        isDark={isDark}
                    />
                    <StatCard
                        icon="cash-outline"
                        title="Monthly Rev."
                        value={`KES ${(stats.monthlyRevenue / 1000).toFixed(0)}K`}
                        change="+15%"
                        positive
                        isDark={isDark}
                    />
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <ActionCard
                        icon="checkmark-circle-outline"
                        title="Verify Hunters"
                        description="Review pending hunter verifications"
                        count={stats.pendingVerifications}
                        color={colors.primary[600]}
                        isDark={isDark}
                        onPress={() => { }}
                    />
                    <ActionCard
                        icon="person-outline"
                        title="Manage Users"
                        description="View and manage all users"
                        count={stats.totalUsers}
                        color="#8B5CF6"
                        isDark={isDark}
                        onPress={() => { }}
                    />
                    <ActionCard
                        icon="business-outline"
                        title="Properties"
                        description="Oversee property listings"
                        count={stats.totalProperties}
                        color="#10B981"
                        isDark={isDark}
                        onPress={() => { }}
                    />
                    <ActionCard
                        icon="warning-outline"
                        title="Disputes"
                        description="Resolve platform disputes"
                        count={stats.openDisputes}
                        color="#EF4444"
                        isDark={isDark}
                        onPress={() => { }}
                    />
                    <ActionCard
                        icon="bar-chart-outline"
                        title="Analytics"
                        description="View platform analytics"
                        color="#6366F1"
                        isDark={isDark}
                        onPress={() => { }}
                    />
                </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
                <Card style={[styles.activityCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light, marginBottom: spacing.md }]}>Recent Activity</Text>
                    {recentActivity.map((activity, index) => (
                        <View key={activity.id} style={[styles.activityItem, index === recentActivity.length - 1 && styles.lastItem]}>
                            <View style={[styles.activityIcon, { backgroundColor: colors.primary[600] + '20' }]}>
                                <Ionicons name="notifications-outline" size={16} color={colors.primary[600]} />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={[styles.activityMessage, { color: isDark ? colors.text.dark : colors.text.light }]}>{activity.message}</Text>
                                <Text style={[styles.activityTime, { color: colors.neutral[500] }]}>{activity.time}</Text>
                            </View>
                        </View>
                    ))}
                </Card>
            </View>

            <View style={{ height: spacing.xxl }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: spacing.lg,
    },
    title: {
        ...typography.h2,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.md,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    statCard: {
        width: '47%',
        padding: spacing.md,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statChange: {
        ...typography.caption,
        fontWeight: '600',
    },
    statValue: {
        ...typography.h3,
        marginBottom: 2,
    },
    statTitle: {
        ...typography.caption,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    actionCard: {
        width: '47%',
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
    },
    actionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    actionCount: {
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
    },
    actionCountText: {
        fontSize: 10,
        fontWeight: '700',
    },
    actionTitle: {
        ...typography.body,
        fontWeight: '700',
        marginBottom: 4,
    },
    actionDesc: {
        ...typography.caption,
        lineHeight: 16,
    },
    activityCard: {
        padding: spacing.lg,
    },
    activityItem: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    activityIcon: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityContent: {
        flex: 1,
    },
    activityMessage: {
        ...typography.bodySmall,
    },
    activityTime: {
        ...typography.caption,
        marginTop: 2,
    },
});

export default AdminDashboard;
