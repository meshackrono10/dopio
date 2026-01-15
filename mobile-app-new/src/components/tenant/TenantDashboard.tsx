import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../common/Card';
import Button from '../common/Button';
import DashboardTabs from '../common/DashboardTabs';
import WalletCard from '../common/WalletCard';
import { MOCK_PROPERTIES, getSearchRequestsByTenantId } from '../../services/mockData';

interface TenantDashboardProps {
    onNavigateToSearch: () => void;
    onNavigateToRequests: () => void;
    onNavigateToBookings: () => void;
    onNavigateToChat: (id: string) => void;
    onNavigateToRequestDetail: (id: string) => void;
}

const TenantDashboard: React.FC<TenantDashboardProps> = ({
    onNavigateToSearch,
    onNavigateToRequests,
    onNavigateToBookings,
    onNavigateToChat,
    onNavigateToRequestDetail
}) => {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('saved');

    const tabs = [
        { id: 'saved', label: 'Saved', icon: 'heart' },
        { id: 'bookings', label: 'Bookings', icon: 'calendar' },
        { id: 'requests', label: 'Requests', icon: 'search' },
        { id: 'reviews', label: 'Reviews', icon: 'star' },
        { id: 'wallet', label: 'Wallet', icon: 'wallet' },
    ];

    const tenantId = "tenant-1";
    const myRequests = getSearchRequestsByTenantId(tenantId);
    const savedProperties = MOCK_PROPERTIES.slice(0, 3); // Mock saved properties

    const renderSaved = () => (
        <View style={styles.section}>
            {savedProperties.map((item) => (
                <Card key={item.id} style={[styles.propertyCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Image source={{ uri: item.images[0] as string }} style={styles.propertyImage} />
                    <View style={styles.propertyInfo}>
                        <Text style={[styles.propertyTitle, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={[styles.propertyLocation, { color: colors.neutral[500] }]}>
                            {item.location.generalArea}
                        </Text>
                        <View style={styles.propertyFooter}>
                            <Text style={[styles.propertyPrice, { color: colors.primary[600] }]}>
                                KES {item.rent.toLocaleString()}
                                <Text style={styles.priceUnit}>/mo</Text>
                            </Text>
                            <TouchableOpacity>
                                <Ionicons name="heart" size={20} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Card>
            ))}
            {savedProperties.length === 0 && (
                <View style={styles.emptyState}>
                    <Ionicons name="heart-outline" size={48} color={colors.neutral[300]} />
                    <Text style={[styles.emptyText, { color: colors.neutral[500] }]}>No saved properties yet</Text>
                    <Button size="sm" onPress={onNavigateToSearch}>Browse Properties</Button>
                </View>
            )}
        </View>
    );

    const renderBookings = () => (
        <View style={styles.section}>
            <Card style={[styles.bookingCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <View style={styles.bookingHeader}>
                    <View style={styles.bookingDate}>
                        <Text style={styles.dateDay}>18</Text>
                        <Text style={styles.dateMonth}>DEC</Text>
                    </View>
                    <View style={styles.bookingInfo}>
                        <Text style={[styles.bookingTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Modern 2BR Kasarani
                        </Text>
                        <Text style={[styles.bookingStatus, { color: colors.success }]}>Confirmed</Text>
                    </View>
                </View>
                <View style={styles.bookingFooter}>
                    <View style={styles.hunterInfo}>
                        <Ionicons name="person-circle" size={24} color={colors.neutral[400]} />
                        <Text style={[styles.hunterName, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                            John Kamau
                        </Text>
                    </View>
                    <Button size="sm" variant="outline" onPress={() => onNavigateToChat('hunter-1')}>Chat</Button>
                </View>
            </Card>
        </View>
    );

    const renderRequests = () => (
        <View style={styles.section}>
            {myRequests.map((request) => (
                <Card key={request.id} style={[styles.requestCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <View style={styles.requestHeader}>
                        <Text style={[styles.requestTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {request.propertyType} in {request.preferredAreas[0]}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: colors.primary[50] }]}>
                            <Text style={[styles.statusText, { color: colors.primary[600] }]}>
                                {request.status.replace('_', ' ')}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.requestBudget, { color: colors.neutral[500] }]}>
                        Budget: KES {request.minRent.toLocaleString()} - {request.maxRent.toLocaleString()}
                    </Text>
                    <View style={styles.requestFooter}>
                        <Text style={[styles.bidCount, { color: colors.secondary[500] }]}>
                            {request.bids.length} Bids received
                        </Text>
                        <TouchableOpacity onPress={() => onNavigateToRequestDetail(request.id.toString())}>
                            <Text style={{ color: colors.primary[600], fontWeight: '600' }}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                </Card>
            ))}
            {myRequests.length === 0 && (
                <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={48} color={colors.neutral[300]} />
                    <Text style={[styles.emptyText, { color: colors.neutral[500] }]}>No search requests yet</Text>
                    <Button size="sm" onPress={onNavigateToRequests}>Create Request</Button>
                </View>
            )}
        </View>
    );

    const renderReviews = () => (
        <View style={styles.section}>
            <Card style={[styles.reviewCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <View style={styles.reviewHeader}>
                    <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Ionicons key={i} name="star" size={16} color="#F59E0B" />
                        ))}
                    </View>
                    <Text style={[styles.reviewDate, { color: colors.neutral[500] }]}>Nov 15, 2024</Text>
                </View>
                <Text style={[styles.reviewText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                    "Excellent service! John was very professional and showed me exactly what was advertised."
                </Text>
                <Text style={[styles.reviewProperty, { color: colors.primary[600] }]}>
                    Re: Modern 2BR Kasarani
                </Text>
            </Card>
        </View>
    );

    const renderWallet = () => (
        <View style={styles.section}>
            <WalletCard
                balance={5000}
                escrow={2500}
                pending={0}
            />
        </View>
    );

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: colors.neutral[500] }]}>Hello, Jane</Text>
                    <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Your Dashboard
                    </Text>
                </View>
                <TouchableOpacity style={[styles.notificationBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                    <Ionicons name="notifications-outline" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                    <View style={styles.notificationBadge} />
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>3</Text>
                    <Text style={styles.statLabel}>Saved</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>1</Text>
                    <Text style={styles.statLabel}>Bookings</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>2</Text>
                    <Text style={styles.statLabel}>Requests</Text>
                </View>
            </View>

            <DashboardTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {activeTab === 'saved' && renderSaved()}
            {activeTab === 'bookings' && renderBookings()}
            {activeTab === 'requests' && renderRequests()}
            {activeTab === 'reviews' && renderReviews()}
            {activeTab === 'wallet' && renderWallet()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    greeting: {
        ...typography.bodySmall,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    title: {
        ...typography.h1,
        marginTop: 4,
    },
    notificationBtn: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.error,
        borderWidth: 2,
        borderColor: 'white',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
        backgroundColor: colors.primary[600],
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        ...typography.h2,
        color: 'white',
        fontWeight: '800',
    },
    statLabel: {
        ...typography.caption,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginTop: 2,
    },
    section: {
        marginBottom: spacing.xl,
    },
    propertyCard: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    propertyImage: {
        width: 100,
        height: 100,
    },
    propertyInfo: {
        flex: 1,
        padding: spacing.sm,
        justifyContent: 'space-between',
    },
    propertyTitle: {
        ...typography.body,
        fontWeight: '700',
    },
    propertyLocation: {
        ...typography.caption,
    },
    propertyFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    propertyPrice: {
        ...typography.body,
        fontWeight: '800',
    },
    priceUnit: {
        ...typography.caption,
        fontWeight: '400',
    },
    bookingCard: {
        padding: spacing.md,
    },
    bookingHeader: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    bookingDate: {
        backgroundColor: colors.primary[50],
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        minWidth: 50,
    },
    dateDay: {
        ...typography.h3,
        color: colors.primary[600],
        fontWeight: '800',
    },
    dateMonth: {
        ...typography.caption,
        color: colors.primary[600],
        fontWeight: '700',
    },
    bookingInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    bookingTitle: {
        ...typography.body,
        fontWeight: '700',
    },
    bookingStatus: {
        ...typography.caption,
        fontWeight: '600',
        marginTop: 2,
    },
    bookingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    hunterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    hunterName: {
        ...typography.bodySmall,
        fontWeight: '500',
    },
    requestCard: {
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xs,
    },
    requestTitle: {
        ...typography.body,
        fontWeight: '700',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    requestBudget: {
        ...typography.caption,
        marginBottom: spacing.sm,
    },
    requestFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bidCount: {
        ...typography.caption,
        fontWeight: '600',
    },
    reviewCard: {
        padding: spacing.md,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
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
        fontStyle: 'italic',
    },
    reviewProperty: {
        ...typography.caption,
        fontWeight: '600',
        marginTop: spacing.sm,
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
});

export default TenantDashboard;
