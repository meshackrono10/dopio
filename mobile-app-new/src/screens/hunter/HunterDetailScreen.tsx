import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    FlatList,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { MOCK_HUNTERS, MOCK_PROPERTIES, getReviewsByHunterId } from '../../services/mockData';
import { HomeStackParamList } from '../../types/navigation';
import PropertyCard from '../../components/property/PropertyCard';
import Button from '../../components/common/Button';
import HunterReviewCard from '../../components/review/HunterReviewCard';

type HunterDetailRouteProp = RouteProp<HomeStackParamList, 'HunterDetail'>;

const HunterDetailScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<HunterDetailRouteProp>();
    const { hunterId } = route.params;

    const hunter = MOCK_HUNTERS.find(h => h.id.toString() === hunterId);
    const hunterProperties = MOCK_PROPERTIES.filter(p => p.houseHunter.id === hunterId);
    const hunterReviews = getReviewsByHunterId(hunterId);

    const [activeTab, setActiveTab] = useState<'properties' | 'reviews' | 'negative_reviews'>('properties');

    if (!hunter) return null;

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: hunter.profilePhoto }} style={styles.avatar} />
                    {hunter.isVerified && (
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={20} color="white" />
                        </View>
                    )}
                </View>
                <Text style={[styles.name, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    {hunter.name}
                </Text>
                <Text style={[styles.memberSince, { color: colors.neutral[500] }]}>
                    House Hunter • Member since {new Date(hunter.joinedDate).getFullYear()}
                </Text>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: colors.secondary[500] }]}>{hunter.rating}</Text>
                        <Text style={[styles.statLabel, { color: colors.neutral[500] }]}>Rating</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: colors.primary[600] }]}>{hunterProperties.length}</Text>
                        <Text style={[styles.statLabel, { color: colors.neutral[500] }]}>Properties</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: colors.success }]}>{hunter.successfulViewings}</Text>
                        <Text style={[styles.statLabel, { color: colors.neutral[500] }]}>Viewings</Text>
                    </View>
                </View>

                <Text style={[styles.bio, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                    {hunter.bio}
                </Text>

                <View style={styles.availabilityContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.neutral[500] }]}>AVAILABILITY</Text>
                    <View style={styles.availabilityRow}>
                        <Ionicons name="calendar" size={16} color={colors.primary[500]} />
                        <Text style={[styles.availabilityText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Available for viewings: Mon - Sat, 9 AM - 5 PM
                        </Text>
                    </View>
                </View>

                <View style={styles.areasContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.neutral[500] }]}>AREAS OF OPERATION</Text>
                    <View style={styles.areasRow}>
                        {hunter.areasOfOperation.map((area, index) => (
                            <View key={index} style={[styles.areaBadge, { backgroundColor: colors.primary[50] }]}>
                                <Ionicons name="location-sharp" size={12} color={colors.primary[600]} />
                                <Text style={[styles.areaText, { color: colors.primary[700] }]}>{area}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <Button
                        style={{ flex: 1 }}
                        onPress={() => Linking.openURL(`tel:${hunter.phone || '+254700000000'}`)}
                        leftIcon={<Ionicons name="call-outline" size={20} color="white" />}
                    >
                        Call
                    </Button>
                    <Button
                        variant="outline"
                        style={{ flex: 1 }}
                        onPress={() => (navigation as any).navigate('MessagesTab', {
                            screen: 'Chat',
                            params: {
                                conversationId: `hunter-${hunter.id}`,
                                otherPartyName: hunter.name,
                                otherPartyAvatar: hunter.profilePhoto
                            }
                        })}
                        leftIcon={<Ionicons name="chatbubble-outline" size={20} color={colors.primary[600]} />}
                    >
                        Message
                    </Button>
                </View>

                <TouchableOpacity
                    style={styles.reportHunterButton}
                    onPress={() => (navigation as any).navigate('ProfileTab', { screen: 'ReportIssue', params: { hunterId: hunter.id } })}
                >
                    <Ionicons name="flag-outline" size={16} color={colors.error} />
                    <Text style={styles.reportHunterText}>Report this House Hunter</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'properties' && styles.activeTab]}
                    onPress={() => setActiveTab('properties')}
                >
                    <Text style={[styles.tabText, activeTab === 'properties' && styles.activeTabText]}>
                        Properties ({hunterProperties.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
                    onPress={() => setActiveTab('reviews')}
                >
                    <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                        Reviews ({hunterReviews.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'negative_reviews' && styles.activeTab]}
                    onPress={() => setActiveTab('negative_reviews' as any)}
                >
                    <Text style={[styles.tabText, activeTab === 'negative_reviews' && styles.activeTabText, { color: activeTab === 'negative_reviews' ? colors.error : colors.neutral[500] }]}>
                        Critical ({hunterReviews.filter(r => r.rating <= 2).length})
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent={false} backgroundColor={isDark ? colors.neutral[900] : colors.neutral[50]} />

            <View style={styles.navHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.navTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Profile
                </Text>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="share-outline" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={(activeTab === 'properties' ? hunterProperties : hunterReviews) as any[]}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                renderItem={({ item, index }: { item: any; index: number }) => {
                    if (activeTab === 'properties') {
                        return (
                            <PropertyCard
                                property={item}
                                onPress={() => (navigation as any).navigate('PropertyDetail', { propertyId: item.id.toString() })}
                                variant="list"
                                index={index}
                            />
                        );
                    }
                    if (activeTab === 'reviews' || activeTab === 'negative_reviews' as any) {
                        const reviewsToShow = activeTab === 'reviews' ? hunterReviews : hunterReviews.filter(r => r.rating <= 2);
                        if (reviewsToShow.length === 0) {
                            return (
                                <View style={styles.emptyReviews}>
                                    <Text style={{ color: colors.neutral[500] }}>No reviews found.</Text>
                                </View>
                            );
                        }
                        return (
                            <View style={{ paddingHorizontal: spacing.md }}>
                                {reviewsToShow.map(review => (
                                    <HunterReviewCard key={review.id} review={review} />
                                ))}
                            </View>
                        );
                    }
                    return null;
                }}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    backButton: {
        padding: spacing.xs,
    },
    navTitle: {
        ...typography.h4,
    },
    header: {
        padding: spacing.md,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: borderRadius.full,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary[600],
        borderRadius: borderRadius.full,
        padding: 4,
        borderWidth: 3,
        borderColor: 'white',
    },
    name: {
        ...typography.h2,
        marginBottom: 4,
    },
    memberSince: {
        ...typography.caption,
        marginBottom: spacing.lg,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xl,
        marginBottom: spacing.lg,
        width: '100%',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        ...typography.h3,
        fontWeight: '700',
    },
    statLabel: {
        ...typography.caption,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: colors.neutral[200],
    },
    bio: {
        ...typography.bodySmall,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
    },
    areasContainer: {
        width: '100%',
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.caption,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: spacing.sm,
    },
    areasRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    areaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
    },
    areaText: {
        ...typography.caption,
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary[600],
    },
    tabText: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.neutral[500],
    },
    activeTabText: {
        color: colors.primary[600],
    },
    listContent: {
        paddingBottom: spacing.xl,
    },
    reviewCard: {
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    reviewerInfo: {
        gap: 2,
    },
    reviewerName: {
        ...typography.bodySmall,
        fontWeight: '700',
    },
    ratingRow: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewDate: {
        ...typography.caption,
        color: colors.neutral[400],
    },
    reviewComment: {
        ...typography.bodySmall,
        lineHeight: 18,
    },
    availabilityContainer: {
        width: '100%',
        marginBottom: spacing.lg,
    },
    availabilityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary[50] + '40',
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    availabilityText: {
        ...typography.bodySmall,
        fontWeight: '600',
    },
    reportHunterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: spacing.lg,
        paddingVertical: spacing.sm,
    },
    reportHunterText: {
        ...typography.caption,
        color: colors.error,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    emptyReviews: {
        padding: spacing.xl,
        alignItems: 'center',
    },
});

export default HunterDetailScreen;
