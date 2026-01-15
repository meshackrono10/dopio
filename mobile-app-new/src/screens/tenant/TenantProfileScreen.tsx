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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

type TenantProfileParams = {
    TenantProfile: {
        tenantId: string;
    };
};

const TenantProfileScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<TenantProfileParams, 'TenantProfile'>>();

    // Mock tenant data
    const tenant = {
        id: route.params?.tenantId || 'tenant-1',
        name: 'Sarah Wanjiku',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        isVerified: true,
        joinedDate: '2024-05-01',
        bio: 'Looking for a comfortable 2-bedroom apartment in Nairobi. Prefer quiet neighborhoods with good security.',
        completedViewings: 12,
        activeSearches: 2,
        reviewsGiven: 8,
    };

    const reviews = [
        {
            id: '1',
            propertyTitle: 'Modern 2-Bedroom Apartment in Kasarani',
            hunterName: 'John Kamau',
            hunterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            rating: 5,
            comment: 'Great viewing experience! The hunter was professional and showed me multiple options.',
            date: '2024-12-15',
        },
        {
            id: '2',
            propertyTitle: 'Spacious 3-Bedroom in Westlands',
            hunterName: 'Mary Njeri',
            hunterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
            rating: 5,
            comment: 'Excellent service. Found my dream home thanks to this platform!',
            date: '2024-11-28',
        },
    ];

    const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'negative_reviews'>('about');

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Tenant Profile
                </Text>
                <View style={{ width: 24 }} />
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: tenant.profilePhoto }} style={styles.avatar} />
                        {tenant.isVerified && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                            </View>
                        )}
                    </View>
                    <Text style={[styles.tenantName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        {tenant.name}
                    </Text>
                    <Text style={styles.memberSince}>
                        Member since {new Date(tenant.joinedDate).getFullYear()}
                    </Text>
                </View>

                {/* Stats */}
                <View style={[styles.statsContainer, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {tenant.completedViewings}
                        </Text>
                        <Text style={styles.statLabel}>Viewings</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.neutral[200] }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {tenant.activeSearches}
                        </Text>
                        <Text style={styles.statLabel}>Active Searches</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.neutral[200] }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {tenant.reviewsGiven}
                        </Text>
                        <Text style={styles.statLabel}>Reviews</Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'about' && styles.activeTab]}
                        onPress={() => setActiveTab('about')}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === 'about' && styles.activeTabText,
                            { color: activeTab === 'about' ? colors.primary[500] : colors.neutral[500] }
                        ]}>
                            About
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
                        onPress={() => setActiveTab('reviews')}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === 'reviews' && styles.activeTabText,
                            { color: activeTab === 'reviews' ? colors.primary[500] : colors.neutral[500] }
                        ]}>
                            Reviews ({tenant.reviewsGiven})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'negative_reviews' && styles.activeTab]}
                        onPress={() => setActiveTab('negative_reviews')}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === 'negative_reviews' && styles.activeTabText,
                            { color: activeTab === 'negative_reviews' ? colors.error : colors.neutral[500] }
                        ]}>
                            Critical ({reviews.filter(r => r.rating <= 2).length})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {activeTab === 'about' ? (
                        <>
                            {/* Bio */}
                            <View style={[styles.section, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    About {tenant.name}
                                </Text>
                                <Text style={[styles.bioText, { color: colors.neutral[600] }]}>
                                    {tenant.bio}
                                </Text>
                            </View>

                            {/* Verification */}
                            {tenant.isVerified && (
                                <View style={[styles.section, { backgroundColor: isDark ? colors.neutral[800] : colors.success + '10' }]}>
                                    <View style={styles.verificationHeader}>
                                        <Ionicons name="shield-checkmark" size={24} color={colors.success} />
                                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light, marginBottom: 0 }]}>
                                            Verified Tenant
                                        </Text>
                                    </View>
                                    <Text style={[styles.verificationText, { color: colors.neutral[600] }]}>
                                        This tenant has verified their identity and contact information.
                                    </Text>
                                </View>
                            )}
                        </>
                    ) : (
                        <>
                            {(activeTab === 'reviews' ? reviews : reviews.filter(r => r.rating <= 2)).length === 0 ? (
                                <View style={styles.emptyReviews}>
                                    <Text style={{ color: colors.neutral[500] }}>No reviews found.</Text>
                                </View>
                            ) : (
                                (activeTab === 'reviews' ? reviews : reviews.filter(r => r.rating <= 2)).map(review => (
                                    <View key={review.id} style={[styles.reviewCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                        <Text style={[styles.propertyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                            {review.propertyTitle}
                                        </Text>
                                        <View style={styles.reviewHeader}>
                                            <Image source={{ uri: review.hunterAvatar }} style={styles.reviewAvatar} />
                                            <View style={styles.reviewHeaderText}>
                                                <Text style={[styles.hunterName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                                    Hunter: {review.hunterName}
                                                </Text>
                                                <Text style={styles.reviewDate}>{review.date}</Text>
                                            </View>
                                            <View style={styles.reviewRating}>
                                                <Ionicons name="star" size={16} color={colors.warning} />
                                                <Text style={[styles.reviewRatingText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                                    {review.rating}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={[styles.reviewComment, { color: colors.neutral[600] }]}>
                                            {review.comment}
                                        </Text>
                                    </View>
                                ))
                            )}
                        </>
                    )}

                    <TouchableOpacity
                        style={styles.reportButton}
                        onPress={() => (navigation as any).navigate('ProfileTab', { screen: 'ReportIssue', params: { tenantId: tenant.id } })}
                    >
                        <Ionicons name="flag-outline" size={16} color={colors.error} />
                        <Text style={styles.reportText}>Report this Tenant</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView >
        </View >
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
    profileHeader: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 14,
    },
    tenantName: {
        ...typography.h2,
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    memberSince: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        ...typography.h3,
        fontSize: 20,
        marginBottom: spacing.xs,
    },
    statLabel: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    statDivider: {
        width: 1,
        height: '100%',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: colors.primary[500],
    },
    tabText: {
        ...typography.bodySemiBold,
        fontSize: 15,
    },
    activeTabText: {
        fontWeight: '700',
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    section: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.md,
    },
    bioText: {
        ...typography.body,
        lineHeight: 22,
    },
    verificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    verificationText: {
        ...typography.caption,
        lineHeight: 18,
    },
    reviewCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },
    propertyTitle: {
        ...typography.bodySemiBold,
        fontSize: 15,
        marginBottom: spacing.md,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    reviewAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    reviewHeaderText: {
        flex: 1,
    },
    hunterName: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    reviewDate: {
        ...typography.caption,
        color: colors.neutral[400],
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    reviewRatingText: {
        ...typography.bodySemiBold,
    },
    reviewComment: {
        ...typography.body,
        lineHeight: 20,
    },
    emptyReviews: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    reportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: spacing.xl,
        paddingVertical: spacing.md,
    },
    reportText: {
        ...typography.caption,
        color: colors.error,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default TenantProfileScreen;
