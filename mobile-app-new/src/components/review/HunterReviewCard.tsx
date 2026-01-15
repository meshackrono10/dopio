import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

export interface HunterReview {
    id: string;
    hunterId: string;
    tenantName: string;
    tenantAvatar?: string;
    rating: number;
    professionalismRating?: number;
    accuracyRating?: number;
    comment: string;
    propertyTitle: string;
    createdAt: string;
    hunterResponse?: string;
}

interface HunterReviewCardProps {
    review: HunterReview;
}

const HunterReviewCard: React.FC<HunterReviewCardProps> = ({ review }) => {
    const { isDark } = useTheme();

    const renderStars = (rating: number) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={star <= rating ? "star" : "star-outline"}
                        size={14}
                        color={star <= rating ? colors.warning : colors.neutral[300]}
                    />
                ))}
            </View>
        );
    };

    return (
        <View style={[styles.container, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary[100] }]}>
                        {review.tenantAvatar ? (
                            <Image source={{ uri: review.tenantAvatar }} style={styles.avatarImage} />
                        ) : (
                            <Text style={[styles.avatarText, { color: colors.primary[600] }]}>
                                {review.tenantName.charAt(0)}
                            </Text>
                        )}
                    </View>
                    <View>
                        <Text style={[styles.userName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {review.tenantName}
                        </Text>
                        <Text style={[styles.date, { color: colors.neutral[500] }]}>
                            {review.createdAt}
                        </Text>
                    </View>
                </View>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color={colors.warning} />
                    <Text style={[styles.ratingText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        {review.rating}
                    </Text>
                </View>
            </View>

            <Text style={[styles.propertyTitle, { color: colors.neutral[500] }]}>
                Viewing: {review.propertyTitle}
            </Text>

            <Text style={[styles.comment, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                {review.comment}
            </Text>

            {(review.professionalismRating || review.accuracyRating) && (
                <View style={styles.breakdown}>
                    {review.professionalismRating && (
                        <View style={styles.breakdownItem}>
                            <Text style={[styles.breakdownLabel, { color: colors.neutral[500] }]}>Professionalism:</Text>
                            <Text style={[styles.breakdownValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {review.professionalismRating}/5
                            </Text>
                        </View>
                    )}
                    {review.accuracyRating && (
                        <View style={styles.breakdownItem}>
                            <Text style={[styles.breakdownLabel, { color: colors.neutral[500] }]}>Accuracy:</Text>
                            <Text style={[styles.breakdownValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {review.accuracyRating}/5
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {review.hunterResponse && (
                <View style={[styles.responseContainer, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50] }]}>
                    <Text style={[styles.responseTitle, { color: colors.primary[600] }]}>House Hunter Response</Text>
                    <Text style={[styles.responseText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        {review.hunterResponse}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        ...typography.body,
        fontWeight: '700',
    },
    userName: {
        ...typography.bodySmall,
        fontWeight: '700',
    },
    date: {
        ...typography.caption,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        ...typography.caption,
        fontWeight: '700',
    },
    propertyTitle: {
        ...typography.caption,
        marginBottom: spacing.sm,
    },
    comment: {
        ...typography.bodySmall,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    breakdown: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginBottom: spacing.md,
    },
    breakdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    breakdownLabel: {
        fontSize: 10,
    },
    breakdownValue: {
        fontSize: 10,
        fontWeight: '700',
    },
    responseContainer: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary[600],
    },
    responseTitle: {
        ...typography.caption,
        fontWeight: '700',
        marginBottom: 4,
    },
    responseText: {
        ...typography.caption,
        lineHeight: 18,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
    },
});

export default HunterReviewCard;
