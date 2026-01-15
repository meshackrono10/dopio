import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

type HunterProfileParams = {
    HunterProfile: {
        hunterId: string;
    };
};

const HunterProfileScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<HunterProfileParams, 'HunterProfile'>>();
    const hunterId = route.params?.hunterId || 'hunter-1';

    // Mock hunter data
    const hunter = {
        id: hunterId,
        name: 'John Kamau',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        isVerified: true,
        rating: 4.8,
        reviewCount: 234,
        successfulViewings: 234,
        bio: 'Professional house hunter with 5+ years of experience helping tenants find their perfect home in Nairobi. I specialize in residential properties across Kasarani, Roysambu, and surrounding areas.',
        areasOfOperation: ['Kasarani', 'Roysambu', 'Ruiru', 'Thika Road'],
        joinedDate: '2019-03-15',
        phone: '+254 712 345 678',
        email: 'john.kamau@example.com',
        languages: ['English', 'Swahili', 'Kikuyu'],
        responseTime: '< 1 hour',
        achievements: [
            { icon: 'star', label: 'Top Rated', color: colors.warning },
            { icon: 'shield-checkmark', label: 'Verified', color: colors.success },
            { icon: 'trending-up', label: '200+ Viewings', color: colors.primary[500] },
        ],
    };

    const reviews = [
        {
            id: '1',
            tenantName: 'Sarah Wanjiku',
            tenantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
            rating: 5,
            comment: 'Excellent service! John was very professional and showed me exactly what I was looking for.',
            date: '2024-12-15',
        },
        {
            id: '2',
            tenantName: 'Michael Otieno',
            tenantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
            rating: 5,
            comment: 'Very knowledgeable about the area. Helped me find the perfect apartment within my budget.',
            date: '2024-12-10',
        },
        {
            id: '3',
            tenantName: 'Grace Muthoni',
            tenantAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
            rating: 4,
            comment: 'Good experience overall. John was punctual and showed me several great options.',
            date: '2024-12-05',
        },
    ];

    const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent={false} backgroundColor={isDark ? colors.neutral[900] : colors.neutral[50]} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Hunter Profile
                </Text>
                <TouchableOpacity>
                    <Ionicons name="share-outline" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: hunter.profilePhoto }} style={styles.avatar} />
                        {hunter.isVerified && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                            </View>
                        )}
                    </View>
                    <Text style={[styles.hunterName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        {hunter.name}
                    </Text>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={20} color={colors.warning} />
                        <Text style={[styles.ratingText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {hunter.rating} ({hunter.reviewCount} reviews)
                        </Text>
                    </View>

                    {/* Achievements */}
                    <View style={styles.achievements}>
                        {hunter.achievements.map((achievement, index) => (
                            <View key={index} style={[styles.achievementBadge, { backgroundColor: achievement.color + '20' }]}>
                                <Ionicons name={achievement.icon as any} size={16} color={achievement.color} />
                                <Text style={[styles.achievementText, { color: achievement.color }]}>
                                    {achievement.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Stats */}
                <View style={[styles.statsContainer, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {hunter.successfulViewings}
                        </Text>
                        <Text style={styles.statLabel}>Viewings</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.neutral[200] }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {hunter.areasOfOperation.length}
                        </Text>
                        <Text style={styles.statLabel}>Areas</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.neutral[200] }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {hunter.responseTime}
                        </Text>
                        <Text style={styles.statLabel}>Response</Text>
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
                            Reviews ({hunter.reviewCount})
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
                                    About {hunter.name}
                                </Text>
                                <Text style={[styles.bioText, { color: colors.neutral[600] }]}>
                                    {hunter.bio}
                                </Text>
                            </View>

                            {/* Areas of Operation */}
                            <View style={[styles.section, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Areas of Operation
                                </Text>
                                <View style={styles.areasList}>
                                    {hunter.areasOfOperation.map((area, index) => (
                                        <View key={index} style={styles.areaChip}>
                                            <Ionicons name="location" size={16} color={colors.primary[500]} />
                                            <Text style={[styles.areaText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                                {area}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Languages */}
                            <View style={[styles.section, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Languages
                                </Text>
                                <Text style={[styles.infoText, { color: colors.neutral[600] }]}>
                                    {hunter.languages.join(', ')}
                                </Text>
                            </View>

                            {/* Member Since */}
                            <View style={[styles.section, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Member Since
                                </Text>
                                <Text style={[styles.infoText, { color: colors.neutral[600] }]}>
                                    {new Date(hunter.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <>
                            {reviews.map(review => (
                                <View key={review.id} style={[styles.reviewCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                    <View style={styles.reviewHeader}>
                                        <Image source={{ uri: review.tenantAvatar }} style={styles.reviewAvatar} />
                                        <View style={styles.reviewHeaderText}>
                                            <Text style={[styles.reviewerName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                                {review.tenantName}
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
                            ))}
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Contact Button */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity
                    style={[styles.contactButton, { backgroundColor: colors.primary[500] }]}
                    onPress={() => (navigation as any).navigate('MessagesTab', {
                        screen: 'Chat',
                        params: {
                            conversationId: `hunter-${hunterId}`,
                            otherPartyName: hunter.name,
                            otherPartyAvatar: hunter.profilePhoto
                        }
                    })}
                >
                    <Ionicons name="chatbubble" size={20} color="white" />
                    <Text style={styles.contactButtonText}>Contact Hunter</Text>
                </TouchableOpacity>
            </SafeAreaView>
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
    hunterName: {
        ...typography.h2,
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    ratingText: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    achievements: {
        flexDirection: 'row',
        gap: spacing.sm,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    achievementBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    achievementText: {
        ...typography.caption,
        fontWeight: '700',
        fontSize: 12,
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
        paddingBottom: spacing.xxl * 2,
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
    areasList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    areaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary[50],
    },
    areaText: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    infoText: {
        ...typography.body,
    },
    reviewCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
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
    reviewerName: {
        ...typography.bodySemiBold,
        fontSize: 15,
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
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    contactButton: {
        flexDirection: 'row',
        height: 52,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },
    contactButtonText: {
        ...typography.bodySemiBold,
        fontSize: 16,
        color: 'white',
    },
});

export default HunterProfileScreen;
