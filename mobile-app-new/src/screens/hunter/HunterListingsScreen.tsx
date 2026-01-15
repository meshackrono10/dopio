import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    RefreshControl,
    Alert,
    StatusBar,
    Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useProperties } from '../../contexts/PropertyContext';
import { MainTabParamList } from '../../types/navigation';
import { colors, spacing, typography, borderRadius } from '../../theme';

type HunterListingsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'ProfileTab'>;


export default function HunterListingsScreen() {
    const { isDark } = useTheme();
    const { properties, deleteProperty, updateProperty } = useProperties();
    const navigation: any = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    };

    const filteredListings = properties.filter(listing => {
        const status = listing.status === 'approved' ? 'active' : listing.status;
        if (activeFilter === 'all') return true;
        return status === activeFilter;
    });

    const stats = {
        total: properties.length,
        active: properties.filter(l => l.status === 'approved').length,
        pending: properties.filter(l => l.status === 'pending').length,
        totalViews: properties.reduce((sum, l) => sum + (l.viewCount || 0), 0),
        totalInquiries: properties.reduce((sum, l) => sum + (l.bookingCount || 0), 0),
    };

    const renderListingCard = (listing: any) => {
        const displayStatus = listing.status === 'approved' ? 'active' : listing.status;
        return (
            <TouchableOpacity
                key={listing.id}
                style={[styles.listingCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                onPress={() => navigation.navigate('ProfileTab', { screen: 'PropertyDetail', params: { propertyId: listing.id } })}
            >
                <Image source={{ uri: listing.images[0] }} style={styles.listingImage} />
                {listing.featured && (
                    <View style={styles.featuredBadge}>
                        <Ionicons name="star" size={14} color="#FFF" />
                        <Text style={styles.featuredText}>Featured</Text>
                    </View>
                )}
                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor:
                                displayStatus === 'active'
                                    ? colors.success
                                    : displayStatus === 'pending'
                                        ? colors.warning
                                        : colors.neutral[500],
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.statusText,
                            {
                                color: '#FFF',
                            },
                        ]}
                    >
                        {displayStatus.toUpperCase()}
                    </Text>
                </View>

                <View style={styles.listingContent}>
                    <Text style={[styles.listingTitle, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                        {listing.title}
                    </Text>
                    <Text style={[styles.listingLocation, { color: colors.neutral[500] }]}>
                        {listing.location.generalArea}, {listing.location.county}
                    </Text>
                    <View style={styles.listingDetails}>
                        <Text style={[styles.listingRent, { color: colors.primary[600] }]}>
                            KES {listing.rent.toLocaleString()}/mo
                        </Text>
                        <Text style={[styles.listingBeds, { color: colors.neutral[500] }]}>
                            {listing.bedrooms > 0 ? `${listing.bedrooms} Bed` : 'Studio'} • {listing.bathrooms} Bath
                        </Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="eye-outline" size={16} color={colors.neutral[500]} />
                            <Text style={[styles.statText, { color: colors.neutral[500] }]}>{listing.viewCount || 0}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="chatbubble-outline" size={16} color={colors.neutral[500]} />
                            <Text style={[styles.statText, { color: colors.neutral[500] }]}>{listing.bookingCount || 0}</Text>
                        </View>
                    </View>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.primary[500] }]}
                            onPress={() => navigation.navigate('ProfileTab', { screen: 'EditProperty', params: { propertyId: listing.id } })}
                        >
                            <Ionicons name="pencil" size={16} color="#FFF" />
                            <Text style={styles.actionText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.neutral[200] }]}
                            onPress={async () => {
                                try {
                                    await Share.share({
                                        message: `Check out this property: ${listing.title} at KES ${listing.rent.toLocaleString()}/mo. View more on Dapio!`,
                                        title: listing.title,
                                    });
                                } catch (error: any) {
                                    Alert.alert('Error', error.message);
                                }
                            }}
                        >
                            <Ionicons name="share-social" size={16} color={colors.neutral[700]} />
                            <Text style={[styles.actionText, { color: colors.neutral[700] }]}>Share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.error }]}
                            onPress={() => Alert.alert('Delete', 'Are you sure you want to delete this listing?', [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: () => {
                                        deleteProperty(listing.id);
                                        Alert.alert('Deleted', 'Listing has been removed');
                                    }
                                }
                            ])}
                        >
                            <Ionicons name="trash-outline" size={16} color="#FFF" />
                            <Text style={styles.actionText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                    {displayStatus === 'active' && (
                        <TouchableOpacity
                            style={styles.rentedButton}
                            onPress={() => Alert.alert('Mark as Rented', 'Is this property now rented?', [
                                { text: 'No', style: 'cancel' },
                                {
                                    text: 'Yes, Mark as Rented',
                                    onPress: () => {
                                        updateProperty(listing.id, { status: 'inactive' });
                                        Alert.alert('Success', 'Property marked as rented');
                                    }
                                }
                            ])}
                        >
                            <Text style={styles.rentedButtonText}>Mark as Rented</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent={false} backgroundColor={isDark ? colors.neutral[900] : colors.neutral[50]} />
            {/* Header */}
            <View style={[styles.header, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        My Listings
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        {stats.total} properties • {stats.active} active
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primary[500] }]}
                    onPress={() => navigation.navigate('ProfileTab', { screen: 'AddListing' })}
                >
                    <Ionicons name="add" size={28} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <View style={[styles.quickStatCard, { backgroundColor: isDark ? colors.neutral[800] : 'white', borderColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: colors.primary[50] }]}>
                        <Ionicons name="home" size={20} color={colors.primary[500]} />
                    </View>
                    <View>
                        <Text style={[styles.quickStatValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {stats.active}
                        </Text>
                        <Text style={[styles.quickStatLabel, { color: colors.neutral[500] }]}>Active</Text>
                    </View>
                </View>
                <View style={[styles.quickStatCard, { backgroundColor: isDark ? colors.neutral[800] : 'white', borderColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: colors.success[50] }]}>
                        <Ionicons name="eye" size={20} color={colors.success[500]} />
                    </View>
                    <View>
                        <Text style={[styles.quickStatValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {stats.totalViews}
                        </Text>
                        <Text style={[styles.quickStatLabel, { color: colors.neutral[500] }]}>Views</Text>
                    </View>
                </View>
                <View style={[styles.quickStatCard, { backgroundColor: isDark ? colors.neutral[800] : 'white', borderColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: colors.warning[50] }]}>
                        <Ionicons name="chatbubbles" size={20} color={colors.warning[500]} />
                    </View>
                    <View>
                        <Text style={[styles.quickStatValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {stats.totalInquiries}
                        </Text>
                        <Text style={[styles.quickStatLabel, { color: colors.neutral[500] }]}>Inquiries</Text>
                    </View>
                </View>
            </View>

            {/* Filter Pills */}
            <View style={[styles.tabBar, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
                    {(['all', 'active', 'pending', 'inactive'] as const).map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.tabItem,
                                activeFilter === filter && styles.activeTabItem
                            ]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeFilter === filter && styles.activeTabText
                                ]}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Listings List */}
            <ScrollView
                contentContainerStyle={styles.listingsContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
                {filteredListings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="home-outline" size={64} color={colors.neutral[300]} />
                        <Text style={[styles.emptyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            No {activeFilter !== 'all' ? activeFilter : ''} listings
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.neutral[500] }]}>
                            {activeFilter === 'all'
                                ? 'Add your first property to get started'
                                : `You don't have any ${activeFilter} properties`}
                        </Text>
                        {activeFilter === 'all' && (
                            <TouchableOpacity
                                style={[styles.addPropertyButton, { backgroundColor: colors.primary[500] }]}
                                onPress={() => navigation.navigate('ProfileTab', { screen: 'AddListing' })}
                            >
                                <Text style={styles.addPropertyText}>Add Property</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    filteredListings.map(renderListingCard)
                )}
            </ScrollView>
        </SafeAreaView>
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
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
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
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.sm,
    },
    quickStatCard: {
        flex: 1,
        padding: spacing.sm,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickStatValue: {
        ...typography.h3,
        fontSize: 16,
        fontWeight: '700',
    },
    quickStatLabel: {
        ...typography.caption,
        fontSize: 11,
    },
    tabBar: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
        marginBottom: spacing.sm,
    },
    tabBarContent: {
        paddingHorizontal: spacing.md,
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
    listingsContainer: {
        padding: spacing.md,
        paddingBottom: spacing.xl * 2,
    },
    listingCard: {
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    listingImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    featuredBadge: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.warning[500],
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        gap: 4,
    },
    featuredText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    statusBadge: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    listingContent: {
        padding: spacing.md,
    },
    listingTitle: {
        ...typography.body,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    listingLocation: {
        ...typography.caption,
        fontSize: 13,
        marginBottom: spacing.sm,
    },
    listingDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    listingRent: {
        fontSize: 18,
        fontWeight: '700',
    },
    listingBeds: {
        fontSize: 13,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.neutral[100],
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 13,
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        gap: 4,
    },
    actionText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl * 3,
    },
    emptyTitle: {
        ...typography.h3,
        fontSize: 20,
        fontWeight: '700',
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    emptySubtitle: {
        ...typography.body,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    addPropertyButton: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
    },
    addPropertyText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    rentedButton: {
        marginTop: spacing.md,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.success,
        elevation: 2,
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    rentedButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
        letterSpacing: 0.5,
    },
});
