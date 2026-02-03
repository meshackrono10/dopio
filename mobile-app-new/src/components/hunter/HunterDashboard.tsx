import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../contexts/BookingContext';
import Card from '../common/Card';
import Button from '../common/Button';
import DashboardTabs from '../common/DashboardTabs';
import WalletCard from '../common/WalletCard';

interface HunterDashboardProps {
    onNavigateToBookings: () => void;
    onNavigateToChat: (id: string) => void;
}

const HunterDashboard: React.FC<HunterDashboardProps> = ({ onNavigateToBookings, onNavigateToChat }) => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const { getBookingsForUser, confirmMeetup, markDone, respondToIssue } = useBookings();
    const [activeTab, setActiveTab] = React.useState('overview');

    const myBookings = getBookingsForUser(user?.id || '', 'hunter');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'grid' },
        { id: 'earnings', label: 'Earnings', icon: 'wallet' },
        { id: 'reviews', label: 'Reviews', icon: 'star' },
    ];

    const StatCard = ({ label, value, icon, color }: any) => (
        <Card style={[styles.statCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
            <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>{value}</Text>
                <Text style={[styles.statLabel, { color: colors.neutral[500] }]}>{label}</Text>
            </View>
        </Card>
    );

    const renderOverview = () => (
        <>
            <View style={styles.statsGrid}>
                <StatCard label="Active Listings" value="8" icon="home" color={colors.primary[600]} />
                <StatCard label="Confirmed" value="5" icon="calendar" color={colors.success} />
                <StatCard label="Total Earned" value="KES 45k" icon="wallet" color={colors.secondary[500]} />
                <StatCard label="Avg. Rating" value="4.9" icon="star" color="#F59E0B" />
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Recently Listed
                    </Text>
                </View>

                <Card style={[styles.requestCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <View style={styles.requestHeader}>
                        <View style={styles.requestInfo}>
                            <Text style={[styles.requestTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                2BR Apartment in Westlands
                            </Text>
                            <Text style={[styles.requestBudget, { color: colors.primary[600] }]}>
                                KES 45,000 / mo
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.requestDesc, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        Modern apartment with a balcony and high-speed internet. Located in a secure neighborhood.
                    </Text>
                </Card>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Upcoming Viewings
                    </Text>
                    <TouchableOpacity onPress={onNavigateToBookings}>
                        <Text style={[styles.seeAll, { color: colors.primary[600] }]}>See All</Text>
                    </TouchableOpacity>
                </View>

                {myBookings.map((booking) => {
                    const today = new Date();
                    const bDate = new Date(booking.scheduledDate);

                    const isToday = today.getFullYear() === bDate.getFullYear() &&
                        today.getMonth() === bDate.getMonth() &&
                        today.getDate() === bDate.getDate();

                    const canMeetup = isToday && !booking.hunterMetConfirmed && !booking.physicalMeetingConfirmed;
                    const canMarkDone = booking.physicalMeetingConfirmed && !booking.hunterDone;
                    const canRespondIssue = booking.issueCreated;

                    const day = bDate.getDate();
                    const month = bDate.toLocaleString('default', { month: 'short' }).toUpperCase();

                    return (
                        <Card key={booking.id} style={[styles.viewingCard, { backgroundColor: isDark ? colors.neutral[800] : 'white', marginBottom: spacing.md }]}>
                            <View style={styles.viewingHeader}>
                                <View style={styles.viewingTime}>
                                    <Text style={styles.viewingDay}>{day}</Text>
                                    <Text style={styles.viewingMonth}>{month}</Text>
                                </View>
                                <View style={styles.viewingInfo}>
                                    <Text style={[styles.viewingTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        {booking.propertyTitle}
                                    </Text>
                                    <Text style={[styles.viewingDetail, { color: colors.neutral[500] }]}>
                                        {booking.scheduledTime} • Client: {booking.tenantName}
                                    </Text>
                                </View>
                                <TouchableOpacity style={styles.viewingAction} onPress={() => onNavigateToChat(booking.tenantId)}>
                                    <Ionicons name="chatbubble-outline" size={20} color={colors.primary[600]} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.viewingControls}>
                                {canMeetup && (
                                    <Button size="sm" style={styles.controlBtn} onPress={() => confirmMeetup(booking.id)}>
                                        Confirm Meetup
                                    </Button>
                                )}
                                {canMarkDone && (
                                    <Button size="sm" style={styles.controlBtn} onPress={() => markDone(booking.id)}>
                                        Done
                                    </Button>
                                )}
                                {canRespondIssue && (
                                    <View style={styles.row}>
                                        <Button size="sm" style={[styles.controlBtn, { flex: 1, marginRight: spacing.xs }]} onPress={() => respondToIssue(booking.id, 'accept')}>
                                            Accept Issue
                                        </Button>
                                        <Button size="sm" variant="outline" style={[styles.controlBtn, { flex: 1 }]} onPress={() => respondToIssue(booking.id, 'deny')}>
                                            Deny
                                        </Button>
                                    </View>
                                )}
                            </View>
                        </Card>
                    );
                })}
                {myBookings.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={48} color={colors.neutral[300]} />
                        <Text style={[styles.emptyText, { color: colors.neutral[500] }]}>No upcoming viewings</Text>
                    </View>
                )}
            </View>
        </>
    );

    const renderEarnings = () => (
        <View style={styles.section}>
            <WalletCard
                balance={45000}
                escrow={12000}
                pending={8500}
            />
            <View style={[styles.section, { marginTop: spacing.xl }]}>
                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light, marginBottom: spacing.md }]}>
                    Recent Transactions
                </Text>
                {[1, 2, 3].map((i) => (
                    <Card key={i} style={[styles.transactionCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <View style={[styles.transactionIcon, { backgroundColor: colors.success + '20' }]}>
                            <Ionicons name="arrow-down" size={20} color={colors.success} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.transactionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Payout for Viewing #BK-123
                            </Text>
                            <Text style={[styles.transactionDate, { color: colors.neutral[500] }]}>
                                Jan 12, 2025 • 2:30 PM
                            </Text>
                        </View>
                        <Text style={[styles.transactionAmount, { color: colors.success }]}>
                            +KES 2,500
                        </Text>
                    </Card>
                ))}
            </View>
        </View>
    );

    const renderReviews = () => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light, marginBottom: spacing.md }]}>
                Client Reviews
            </Text>
            {[1, 2].map((i) => (
                <Card key={i} style={[styles.reviewCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <View style={styles.reviewHeader}>
                        <View style={styles.reviewerInfo}>
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={20} color={colors.neutral[400]} />
                            </View>
                            <View>
                                <Text style={[styles.reviewerName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Sarah Wanjiku
                                </Text>
                                <View style={styles.ratingRow}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Ionicons key={s} name="star" size={12} color="#F59E0B" />
                                    ))}
                                </View>
                            </View>
                        </View>
                        <Text style={[styles.reviewDate, { color: colors.neutral[500] }]}>2 days ago</Text>
                    </View>
                    <Text style={[styles.reviewText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        "John was very professional and showed me exactly what was advertised. Highly recommend his services!"
                    </Text>
                </Card>
            ))}
        </View>
    );

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
            <View style={styles.welcomeSection}>
                <Text style={[styles.greeting, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    Welcome Back,
                </Text>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Hunter Dashboard 🚀
                </Text>
            </View>

            <DashboardTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'earnings' && renderEarnings()}
            {activeTab === 'reviews' && renderReviews()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
    },
    welcomeSection: {
        marginBottom: spacing.xl,
    },
    greeting: {
        ...typography.bodySmall,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        ...typography.h1,
        marginTop: spacing.xs,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        ...typography.h3,
        fontWeight: '700',
    },
    statLabel: {
        ...typography.caption,
        fontWeight: '500',
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...typography.h3,
    },
    seeAll: {
        ...typography.bodySmall,
        fontWeight: '600',
    },
    requestCard: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    requestInfo: {
        flex: 1,
    },
    requestTitle: {
        ...typography.body,
        fontWeight: '700',
    },
    requestBudget: {
        ...typography.caption,
        fontWeight: '600',
        marginTop: 2,
    },
    badge: {
        backgroundColor: colors.error + '20',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    badgeText: {
        color: colors.error,
        fontSize: 10,
        fontWeight: '700',
    },
    requestDesc: {
        ...typography.bodySmall,
        lineHeight: 20,
        marginBottom: spacing.sm,
    },
    viewingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    viewingTime: {
        backgroundColor: colors.primary[50],
        width: 50,
        height: 50,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewingDay: {
        color: colors.primary[600],
        fontSize: 18,
        fontWeight: '800',
    },
    viewingMonth: {
        color: colors.primary[600],
        fontSize: 10,
        fontWeight: '700',
    },
    viewingInfo: {
        flex: 1,
    },
    viewingTitle: {
        ...typography.body,
        fontWeight: '700',
    },
    viewingDetail: {
        ...typography.caption,
        marginTop: 2,
    },
    viewingAction: {
        padding: spacing.xs,
    },
    viewingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        width: '100%',
    },
    viewingControls: {
        marginTop: spacing.md,
        width: '100%',
    },
    controlBtn: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        padding: spacing.xl,
        gap: spacing.md,
    },
    emptyText: {
        ...typography.body,
        textAlign: 'center',
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        marginBottom: spacing.sm,
        gap: spacing.md,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionTitle: {
        ...typography.body,
        fontWeight: '600',
    },
    transactionDate: {
        ...typography.caption,
    },
    transactionAmount: {
        ...typography.body,
        fontWeight: '700',
    },
    reviewCard: {
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    reviewerInfo: {
        flexDirection: 'row',
        gap: spacing.sm,
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.full,
        backgroundColor: colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewerName: {
        ...typography.body,
        fontWeight: '600',
    },
    ratingRow: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewDate: {
        ...typography.caption,
    },
    reviewText: {
        ...typography.bodySmall,
        lineHeight: 20,
    },
});

export default HunterDashboard;
