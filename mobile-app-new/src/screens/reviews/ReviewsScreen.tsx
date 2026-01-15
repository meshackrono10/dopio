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
import { MainTabParamList } from '../../types/navigation';
import { colors, spacing, typography, borderRadius } from '../../theme';
import EmptyState from '../../components/common/EmptyState';

type ReviewsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'ReviewsTab'>;

interface Props {
    navigation: ReviewsScreenNavigationProp;
}

// Mock review data
const mockReviews = [
    {
        id: '1',
        tenantName: 'John Kamau',
        tenantAvatar: null,
        rating: 5,
        comment: 'Excellent service! Found me the perfect apartment within my budget. Very professional and responsive.',
        propertyTitle: '3 Bedroom Apartment in Westlands',
        date: '2024-01-05',
        searchRequestId: 'SR-2024-001',
    },
    {
        id: '2',
        tenantName: 'Mary Wanjiku',
        tenantAvatar: null,
        rating: 5,
        comment: 'Great hunter! Showed me multiple options and was very patient with my requirements.',
        propertyTitle: '2 Bedroom in Kilimani',
        date: '2024-01-03',
        searchRequestId: 'SR-2024-002',
    },
    {
        id: '3',
        tenantName: 'Peter Ochieng',
        tenantAvatar: null,
        rating: 4,
        comment: 'Good service overall. Found a nice place but took a bit longer than expected.',
        propertyTitle: 'Studio in Parklands',
        date: '2024-01-02',
        searchRequestId: 'SR-2024-003',
    },
    {
        id: '4',
        tenantName: 'Jane Akinyi',
        tenantAvatar: null,
        rating: 5,
        comment: 'Amazing experience! Very knowledgeable about the area and helped me negotiate a better price.',
        propertyTitle: '1 Bedroom in Lavington',
        date: '2023-12-28',
        searchRequestId: 'SR-2023-045',
    },
    {
        id: '5',
        tenantName: 'David Mutua',
        tenantAvatar: null,
        rating: 4,
        comment: 'Professional and helpful. Would recommend to others looking for properties.',
        propertyTitle: '2 Bedroom in Upperhill',
        date: '2023-12-25',
        searchRequestId: 'SR-2023-042',
    },
];

const mockStats = {
    totalReviews: 47,
    averageRating: 4.8,
    fiveStars: 38,
    fourStars: 7,
    threeStars: 2,
    twoStars: 0,
    oneStars: 0,
};

export default function ReviewsScreen({ navigation }: Props) {
    const { isDark } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    };

    const filteredReviews =
        filter === 'all'
            ? mockReviews
            : mockReviews.filter((review) => review.rating === parseInt(filter));

    const renderStars = (rating: number) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={16}
                        color={star <= rating ? colors.warning : colors.neutral[300]}
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent={false} backgroundColor={isDark ? colors.neutral[900] : colors.neutral[50]} />
            {/* Header */}
            <View style={[styles.header, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>My Reviews</Text>
                    <Text style={[styles.headerSubtitle, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                        {mockStats.totalReviews} reviews • {mockStats.averageRating} ⭐ average
                    </Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Rating Summary */}
                <View style={[styles.summaryCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <View style={styles.summaryHeader}>
                        <View style={styles.ratingBadge}>
                            <Text style={[styles.ratingNumber, { color: colors.warning }]}>
                                {mockStats.averageRating}
                            </Text>
                            <Ionicons name="star" size={32} color={colors.warning} />
                        </View>
                        <View style={styles.ratingDetails}>
                            <Text style={[styles.totalReviews, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {mockStats.totalReviews} Reviews
                            </Text>
                            <Text style={[styles.ratingBreakdown, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                {mockStats.fiveStars} five stars, {mockStats.fourStars} four stars
                            </Text>
                        </View>
                    </View>

                    {/* Rating Bars */}
                    <View style={styles.ratingBars}>
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = (mockStats as any)[`${['', 'one', 'two', 'three', 'four', 'five'][rating]}Stars`];
                            const percentage = (count / mockStats.totalReviews) * 100;
                            return (
                                <TouchableOpacity
                                    key={rating}
                                    style={styles.ratingBar}
                                    onPress={() => setFilter(rating.toString() as any)}
                                >
                                    <Text style={[styles.barLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        {rating} ⭐
                                    </Text>
                                    <View style={[styles.barTrack, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
                                        <View
                                            style={[
                                                styles.barFill,
                                                {
                                                    width: `${percentage}%`,
                                                    backgroundColor: colors.warning,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.barCount, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                        {count}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Filter Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContainer}
                >
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            filter === 'all' && { backgroundColor: colors.primary[500] },
                            filter !== 'all' && { backgroundColor: isDark ? colors.neutral[800] : 'white' },
                        ]}
                        onPress={() => setFilter('all')}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                { color: filter === 'all' ? colors.neutral[50] : isDark ? colors.text.dark : colors.text.light },
                            ]}
                        >
                            All
                        </Text>
                    </TouchableOpacity>
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <TouchableOpacity
                            key={rating}
                            style={[
                                styles.filterChip,
                                filter === rating.toString() && { backgroundColor: colors.primary[500] },
                                filter !== rating.toString() && { backgroundColor: isDark ? colors.neutral[800] : 'white' },
                            ]}
                            onPress={() => setFilter(rating.toString() as any)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    {
                                        color:
                                            filter === rating.toString()
                                                ? colors.neutral[50]
                                                : isDark ? colors.text.dark : colors.text.light,
                                    },
                                ]}
                            >
                                {rating} ⭐
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Reviews List */}
                {filteredReviews.length === 0 ? (
                    <EmptyState
                        icon="⭐"
                        title="No Reviews Yet"
                        message={`You don't have any ${filter === 'all' ? '' : filter + '-star '}reviews yet`}
                    />
                ) : (
                    <View style={styles.reviewsList}>
                        <Text style={[styles.listHeader, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {filteredReviews.length} {filter === 'all' ? 'Total' : `${filter}-Star`} Review
                            {filteredReviews.length !== 1 ? 's' : ''}
                        </Text>
                        {filteredReviews.map((review) => (
                            <View
                                key={review.id}
                                style={[styles.reviewCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                            >
                                <View style={styles.reviewHeader}>
                                    <View
                                        style={[
                                            styles.avatar,
                                            { backgroundColor: colors.primary[100] },
                                        ]}
                                    >
                                        <Text style={[styles.avatarText, { color: colors.primary[700] }]}>
                                            {review.tenantName.charAt(0)}
                                        </Text>
                                    </View>
                                    <View style={styles.reviewInfo}>
                                        <Text style={[styles.tenantName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                            {review.tenantName}
                                        </Text>
                                        <Text style={[styles.reviewDate, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                            {new Date(review.date).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </Text>
                                    </View>
                                    {renderStars(review.rating)}
                                </View>

                                <Text style={[styles.reviewComment, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    {review.comment}
                                </Text>

                                <View style={[styles.propertyTag, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                                    <Ionicons name="home" size={14} color={isDark ? colors.text.dark : colors.neutral[500]} />
                                    <Text style={[styles.propertyText, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                        {review.propertyTitle}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
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
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl * 2,
    },
    summaryCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    ratingBadge: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    ratingNumber: {
        fontSize: 32,
        fontWeight: '700',
    },
    ratingDetails: {
        flex: 1,
    },
    totalReviews: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    ratingBreakdown: {
        fontSize: 13,
    },
    ratingBars: {
        gap: spacing.sm,
    },
    ratingBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    barLabel: {
        fontSize: 13,
        fontWeight: '600',
        width: 40,
    },
    barTrack: {
        flex: 1,
        height: 8,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    barCount: {
        fontSize: 12,
        width: 30,
        textAlign: 'right',
    },
    filterContainer: {
        paddingVertical: spacing.sm,
        gap: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    reviewsList: {
        marginTop: spacing.md,
    },
    listHeader: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: spacing.md,
    },
    reviewCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        gap: spacing.sm,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
    },
    reviewInfo: {
        flex: 1,
    },
    tenantName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    reviewDate: {
        fontSize: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewComment: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: spacing.sm,
    },
    propertyTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        alignSelf: 'flex-start',
    },
    propertyText: {
        fontSize: 12,
    },
});
