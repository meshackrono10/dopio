import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import HunterAnalytics from '../../components/analytics/HunterAnalytics';
import { useBookings } from '../../contexts/BookingContext';

const { width } = Dimensions.get('window');

const HunterDashboardScreen = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
    const { bookings } = useBookings();

    // Mock data
    const stats = {
        totalEarnings: 145000,
        thisMonthEarnings: 28500,
        activeViewings: 5,
        completedViewings: 123,
        averageRating: 4.8,
        upcomingViewings: 3,
    };

    const upcomingViewings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending_payment');
    const completedViewings = bookings.filter(b => b.status === 'completed');

    const earnings = [
        { month: 'Dec', amount: 32000 },
        { month: 'Nov', amount: 28000 },
        { month: 'Oct', amount: 35000 },
        { month: 'Sep', amount: 30000 },
    ];

    const maxEarning = Math.max(...earnings.map(e => e.amount));

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <View style={{ width: 40 }} />
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Hunter Dashboard
                </Text>
                {user?.role === 'admin' ? (
                    <TouchableOpacity onPress={() => navigation.navigate('ProfileTab', { screen: 'AdminSettings' })} style={styles.settingsButton}>
                        <Ionicons name="settings-outline" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>


                {/* Quick Stats */}
                <View style={styles.statsGrid}>
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                        onPress={() => navigation.navigate('RequestsTab' as any)}
                    >
                        <View style={[styles.statIcon, { backgroundColor: colors.success[100] }]}>
                            <Ionicons name="calendar" size={20} color={colors.success[600]} />
                        </View>
                        <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {stats.upcomingViewings}
                        </Text>
                        <Text style={styles.statLabel}>Upcoming</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                        onPress={() => navigation.navigate('RequestsTab' as any)}
                    >
                        <View style={[styles.statIcon, { backgroundColor: colors.primary[100] }]}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.primary[600]} />
                        </View>
                        <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {stats.completedViewings}
                        </Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                        onPress={() => navigation.navigate('ReviewsTab' as any)}
                    >
                        <View style={[styles.statIcon, { backgroundColor: colors.warning[100] }]}>
                            <Ionicons name="star" size={20} color={colors.warning[600]} />
                        </View>
                        <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {stats.averageRating}
                        </Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </TouchableOpacity>
                </View>

                {/* Performance Analytics Overview */}
                <View style={[styles.analyticsSection, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Performance Analytics
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('EarningsTab' as any)}>
                            <Text style={styles.viewAllText}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                    <HunterAnalytics />
                </View>

                {/* Viewings Section */}
                <View style={[styles.section, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Viewings
                    </Text>

                    {/* Tabs */}
                    <View style={[styles.tabBar, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
                            <TouchableOpacity
                                style={[styles.tabItem, activeTab === 'upcoming' && styles.activeTabItem]}
                                onPress={() => setActiveTab('upcoming')}
                            >
                                <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
                                    Upcoming ({upcomingViewings.length})
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabItem, activeTab === 'completed' && styles.activeTabItem]}
                                onPress={() => setActiveTab('completed')}
                            >
                                <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
                                    Completed ({completedViewings.length})
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    {/* Viewing List */}
                    {activeTab === 'upcoming' ? (
                        <>
                            {upcomingViewings.map(viewing => (
                                <TouchableOpacity
                                    key={viewing.id}
                                    style={styles.viewingCard}
                                    onPress={() => (navigation as any).navigate('ProfileTab', {
                                        screen: 'PropertyDetail',
                                        params: { propertyId: viewing.propertyId }
                                    })}
                                >
                                    <View style={styles.viewingHeader}>
                                        <View style={styles.viewingInfo}>
                                            <Text style={[styles.propertyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                                {viewing.propertyTitle}
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.tenantRow}
                                                onPress={() => (navigation as any).navigate('MessagesTab', {
                                                    screen: 'Chat',
                                                    params: {
                                                        conversationId: viewing.id,
                                                        otherPartyName: viewing.tenantName || 'Tenant',
                                                        propertyTitle: viewing.propertyTitle
                                                    }
                                                })}
                                            >
                                                <Ionicons name="chatbubble-outline" size={14} color={colors.primary[500]} />
                                                <Text style={[styles.tenantName, { color: colors.primary[500] }]}>Contact Tenant</Text>
                                            </TouchableOpacity>
                                            <View style={styles.viewingMeta}>
                                                <Ionicons name="calendar-outline" size={14} color={colors.neutral[500]} />
                                                <Text style={styles.metaText}>{viewing.scheduledDate} at {viewing.scheduledTime}</Text>
                                            </View>
                                            <View style={styles.viewingMeta}>
                                                <Ionicons name="location-outline" size={14} color={colors.neutral[500]} />
                                                <Text style={styles.metaText}>Viewing Location</Text>
                                            </View>
                                        </View>
                                        <View style={styles.viewingRight}>
                                            <Text style={[styles.price, { color: colors.success }]}>
                                                +{viewing.price}
                                            </Text>
                                            <View style={[
                                                styles.statusBadge,
                                                { backgroundColor: viewing.status === 'confirmed' ? colors.success + '20' : colors.warning + '20' }
                                            ]}>
                                                <Text style={[
                                                    styles.statusText,
                                                    { color: viewing.status === 'confirmed' ? colors.success : colors.warning }
                                                ]}>
                                                    {viewing.status.replace('_', ' ')}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </>
                    ) : (
                        <>
                            {completedViewings.map(viewing => (
                                <TouchableOpacity
                                    key={viewing.id}
                                    style={styles.viewingCard}
                                    onPress={() => (navigation as any).navigate('ExploreTab', {
                                        screen: 'PropertyDetail',
                                        params: { propertyId: viewing.propertyId }
                                    })}
                                >
                                    <View style={styles.viewingHeader}>
                                        <View style={styles.viewingInfo}>
                                            <Text style={[styles.propertyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                                {viewing.propertyTitle}
                                            </Text>
                                            <Text style={styles.metaText}>{viewing.scheduledDate}</Text>
                                        </View>
                                        <View style={styles.viewingRight}>
                                            <Text style={[styles.price, { color: colors.success }]}>
                                                +{viewing.price}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
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
    settingsButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    earningsCard: {
        margin: spacing.lg,
        padding: spacing.xl,
        borderRadius: borderRadius.xl,
        ...shadows.lg,
    },
    earningsLabel: {
        ...typography.body,
        color: 'white',
        opacity: 0.9,
        marginBottom: spacing.xs,
    },
    earningsValue: {
        ...typography.h1,
        fontSize: 36,
        color: 'white',
        marginBottom: spacing.lg,
    },
    earningsSubRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    earningsSub: {},
    earningsSubLabel: {
        ...typography.caption,
        color: 'white',
        opacity: 0.8,
    },
    earningsSubValue: {
        ...typography.h3,
        fontSize: 18,
        color: 'white',
    },
    withdrawButton: {
        backgroundColor: 'white',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    withdrawButtonText: {
        ...typography.bodySemiBold,
        color: colors.primary[500],
    },
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    statValue: {
        ...typography.h3,
        fontSize: 24,
        marginVertical: spacing.xs,
    },
    statLabel: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    section: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    sectionTitle: {
        ...typography.bodySemiBold,
        fontSize: 18,
        marginBottom: spacing.lg,
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 150,
    },
    chartBar: {
        flex: 1,
        alignItems: 'center',
    },
    barContainer: {
        width: '80%',
        height: 120,
        justifyContent: 'flex-end',
        marginBottom: spacing.xs,
    },
    bar: {
        width: '100%',
        borderTopLeftRadius: borderRadius.sm,
        borderTopRightRadius: borderRadius.sm,
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
    tabBar: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
        marginBottom: spacing.md,
        marginHorizontal: -spacing.lg,
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
    viewingCard: {
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    viewingHeader: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    tenantAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    viewingInfo: {
        flex: 1,
    },
    propertyTitle: {
        ...typography.bodySemiBold,
        fontSize: 15,
        marginBottom: 2,
    },
    tenantName: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    tenantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    viewingMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    metaText: {
        ...typography.caption,
        color: colors.neutral[500],
        fontSize: 12,
    },
    reviewText: {
        ...typography.caption,
        color: colors.neutral[600],
        fontStyle: 'italic',
        marginTop: spacing.xs,
    },
    viewingRight: {
        alignItems: 'flex-end',
    },
    price: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.xs,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        ...typography.caption,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: colors.warning + '20',
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    ratingText: {
        ...typography.caption,
        fontSize: 11,
        fontWeight: '700',
        color: colors.warning,
    },
    earningsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    earningsIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    analyticsSection: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    viewAllText: {
        ...typography.caption,
        color: colors.primary[500],
        fontWeight: '700',
    },
});

export default HunterDashboardScreen;
