import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useWallet } from '../../contexts/WalletContext';
import { useComparison } from '../../contexts/ComparisonContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useProperties } from '../../contexts/PropertyContext';
import { useBookings } from '../../contexts/BookingContext';
import WalletCard from '../../components/wallet/WalletCard';
import NotificationList from '../../components/notifications/NotificationList';
import ComparisonBar from '../../components/comparison/ComparisonBar';
import TransactionList from '../../components/wallet/TransactionList';

const TenantDashboardScreen = ({ route }: any) => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const { balance, transactions } = useWallet();
    const { comparisonList, clearComparison } = useComparison();
    const { notifications, markAllAsRead, unreadCount } = useNotifications();
    const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
    const { properties } = useProperties();
    const { bookings } = useBookings();

    // const initialTab = route?.params?.initialTab || 'overview';
    // const [activeTab, setActiveTab] = useState<'overview' | 'wallet' | 'notifications'>(initialTab);

    // Mock data
    const stats = {
        scheduledViewings: 3,
        savedProperties: 12,
    };



    const upcomingViewings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending_payment');

    const savedProperties = [
        {
            id: '1',
            title: 'Cozy Bedsitter in Roysambu',
            image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200',
            rent: 18000,
            location: 'Roysambu',
            bedrooms: 1,
        },
        {
            id: '2',
            title: 'Modern 2-Bedroom in Kilimani',
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200',
            rent: 35000,
            location: 'Kilimani',
            bedrooms: 2,
        },
        {
            id: '3',
            title: 'Spacious 3-Bedroom Villa',
            image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200',
            rent: 55000,
            location: 'Karen',
            bedrooms: 3,
        },
    ];

    const recommendations = [
        {
            id: '1',
            title: 'Beautiful 2-Bedroom Apartment',
            image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=200',
            rent: 28000,
            location: 'Kasarani',
            match: 95,
        },
        {
            id: '2',
            title: 'Luxury Apartment in Westlands',
            image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200',
            rent: 45000,
            location: 'Westlands',
            match: 88,
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Tenant Dashboard
                </Text>
                <TouchableOpacity onPress={() => (navigation as any).navigate('ProfileTab', { screen: 'Notifications' })}>
                    <Ionicons name="notifications-outline" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                    {notifications.filter(n => !n.read).length > 0 && (
                        <View style={styles.notificationBadge} />
                    )}
                </TouchableOpacity>
            </SafeAreaView>



            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.overviewContainer}>
                    {/* Quick Stats */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <Ionicons name="calendar" size={24} color={colors.success[500]} />
                            <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {stats.scheduledViewings}
                            </Text>
                            <Text style={styles.statLabel}>Viewings</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <Ionicons name="heart" size={24} color={colors.error[500]} />
                            <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {stats.savedProperties}
                            </Text>
                            <Text style={styles.statLabel}>Saved</Text>
                        </View>
                    </View>

                    {/* Wallet Summary */}
                    <View style={styles.walletSummary}>
                        <WalletCard
                            balance={balance}
                            onDeposit={() => (navigation as any).navigate('Wallet' as any)}
                            onViewHistory={() => (navigation as any).navigate('Wallet' as any)}
                        />
                    </View>

                    {/* Upcoming Viewings */}
                    <View style={[styles.section, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Upcoming Viewings
                            </Text>
                            <TouchableOpacity onPress={() => (navigation as any).navigate('BookingsTab')}>
                                <Text style={[styles.seeAllText, { color: colors.primary[500] }]}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        {upcomingViewings.map(viewing => (
                            <TouchableOpacity
                                key={viewing.id}
                                style={styles.viewingCard}
                                onPress={() => (navigation as any).navigate('ExploreTab', {
                                    screen: 'PropertyDetail',
                                    params: { propertyId: viewing.propertyId }
                                })}
                            >
                                <Image source={{ uri: viewing.propertyImage }} style={styles.propertyImage} />
                                <View style={styles.viewingInfo}>
                                    <Text style={[styles.propertyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        {viewing.propertyTitle}
                                    </Text>
                                    <View style={styles.hunterRow}>
                                        <TouchableOpacity
                                            style={styles.hunterRowInner}
                                            onPress={() => (navigation as any).navigate('MessagesTab', {
                                                screen: 'Chat',
                                                params: {
                                                    conversationId: viewing.id,
                                                    otherPartyName: viewing.hunterName,
                                                    propertyTitle: viewing.propertyTitle
                                                }
                                            })}
                                        >
                                            <Ionicons name="chatbubble-outline" size={14} color={colors.primary[500]} />
                                            <Text style={[styles.hunterName, { color: colors.primary[500] }]}>Contact {viewing.hunterName}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.viewingMeta}>
                                        <Ionicons name="calendar-outline" size={12} color={colors.neutral[500]} />
                                        <Text style={styles.metaText}>{viewing.scheduledDate} at {viewing.scheduledTime}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Saved Properties */}
                    <View style={[styles.section, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Saved Properties
                            </Text>
                            <TouchableOpacity onPress={() => (navigation as any).navigate('Saved')}>
                                <Text style={[styles.seeAllText, { color: colors.primary[500] }]}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.propertiesScroll}>
                            {savedProperties.map(property => (
                                <TouchableOpacity
                                    key={property.id}
                                    style={styles.propertyCard}
                                    onPress={() => (navigation as any).navigate('ExploreTab', {
                                        screen: 'PropertyDetail',
                                        params: { propertyId: property.id }
                                    })}
                                >
                                    <Image source={{ uri: property.image }} style={styles.savedPropertyImage} />
                                    <TouchableOpacity
                                        style={styles.heartButton}
                                        onPress={() => toggleWishlist(property.id)}
                                    >
                                        <Ionicons
                                            name={isInWishlist(property.id) ? "heart" : "heart-outline"}
                                            size={18}
                                            color={isInWishlist(property.id) ? colors.error[500] : colors.neutral[400]}
                                        />
                                    </TouchableOpacity>
                                    <View style={styles.propertyCardContent}>
                                        <Text style={[styles.savedPropertyTitle, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                                            {property.title}
                                        </Text>
                                        <Text style={styles.savedPropertyLocation}>{property.location}</Text>
                                        <Text style={[styles.savedPropertyRent, { color: colors.primary[500] }]}>
                                            KES {property.rent.toLocaleString()}/mo
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </ScrollView>
            <ComparisonBar />
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
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
        fontWeight: '700',
    },
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.error[500],
        borderWidth: 2,
        borderColor: 'white',
    },
    overviewContainer: {
        paddingBottom: spacing.xl,
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
    statsGrid: {
        flexDirection: 'row',
        padding: spacing.lg,
        gap: spacing.md,
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
        textAlign: 'center',
    },
    section: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    walletSummary: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    walletTabContent: {
        flex: 1,
        paddingTop: spacing.md,
    },
    walletHeader: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    notificationsTabContent: {
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
    },
    emptyStateText: {
        ...typography.body,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    browseButton: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        backgroundColor: colors.primary[500],
        borderRadius: borderRadius.md,
    },
    browseButtonText: {
        ...typography.bodySemiBold,
        color: 'white',
    },
    comparisonCount: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    compareNowButton: {
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    compareNowText: {
        ...typography.bodySemiBold,
        color: 'white',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    seeAllText: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    viewingCard: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    propertyImage: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.md,
    },
    viewingInfo: {
        flex: 1,
    },
    propertyTitle: {
        ...typography.bodySemiBold,
        fontSize: 14,
        marginBottom: spacing.xs,
    },
    hunterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    hunterRowInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    hunterAvatar: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    hunterName: {
        ...typography.caption,
        color: colors.neutral[600],
        fontSize: 12,
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
        fontSize: 11,
    },
    propertiesScroll: {
        marginHorizontal: -spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    propertyCard: {
        width: 160,
        marginRight: spacing.md,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        backgroundColor: colors.neutral[50],
    },
    savedPropertyImage: {
        width: '100%',
        height: 100,
    },
    heartButton: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },
    propertyCardContent: {
        padding: spacing.sm,
    },
    savedPropertyTitle: {
        ...typography.bodySemiBold,
        fontSize: 13,
        marginBottom: 2,
    },
    savedPropertyLocation: {
        ...typography.caption,
        color: colors.neutral[500],
        fontSize: 11,
        marginBottom: spacing.xs,
    },
    savedPropertyRent: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    recommendationCard: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    recommendationImage: {
        width: 100,
        height: 80,
        borderRadius: borderRadius.md,
    },
    recommendationInfo: {
        flex: 1,
    },
    recommendationTitle: {
        ...typography.bodySemiBold,
        fontSize: 14,
        marginBottom: 2,
    },
    recommendationLocation: {
        ...typography.caption,
        color: colors.neutral[500],
        marginBottom: spacing.xs,
    },
    recommendationRent: {
        ...typography.bodySemiBold,
        fontSize: 15,
    },
    matchBadge: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.sm,
    },
    matchText: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    matchLabel: {
        ...typography.caption,
        fontSize: 10,
    },
});

export default TenantDashboardScreen;
