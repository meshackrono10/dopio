import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { HouseHunter } from '../../data/types';
import Card from '../common/Card';

interface HunterCardProps {
    hunter: HouseHunter;
    onPress: () => void;
}

const HunterCard: React.FC<HunterCardProps> = ({ hunter, onPress }) => {
    const { isDark } = useTheme();

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <Card style={styles.card}>
                <View style={styles.content}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: hunter.profilePhoto }} style={styles.avatar} />
                        {hunter.isVerified && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={16} color="white" />
                            </View>
                        )}
                    </View>

                    <View style={styles.info}>
                        <Text style={[styles.name, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                            {hunter.name}
                        </Text>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Text style={[styles.ratingText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {hunter.rating}
                            </Text>
                            <Text style={[styles.reviewCount, { color: colors.neutral[500] }]}>
                                ({hunter.reviewCount} reviews)
                            </Text>
                        </View>
                        <Text style={[styles.bio, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]} numberOfLines={2}>
                            {hunter.bio}
                        </Text>
                        <View style={styles.areasRow}>
                            {hunter.areasOfOperation.slice(0, 2).map((area, index) => (
                                <View key={index} style={[styles.areaBadge, { backgroundColor: colors.primary[50] }]}>
                                    <Text style={[styles.areaText, { color: colors.primary[700] }]}>{area}</Text>
                                </View>
                            ))}
                            {hunter.areasOfOperation.length > 2 && (
                                <Text style={[styles.moreText, { color: colors.neutral[500] }]}>
                                    +{hunter.areasOfOperation.length - 2} more
                                </Text>
                            )}
                        </View>
                    </View>

                    <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                </View>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.full,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary[600],
        borderRadius: borderRadius.full,
        padding: 2,
        borderWidth: 2,
        borderColor: 'white',
    },
    info: {
        flex: 1,
        gap: 4,
    },
    name: {
        ...typography.body,
        fontWeight: '700',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        ...typography.caption,
        fontWeight: '700',
    },
    reviewCount: {
        ...typography.caption,
    },
    bio: {
        ...typography.caption,
        lineHeight: 16,
    },
    areasRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: 4,
    },
    areaBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
    },
    areaText: {
        fontSize: 10,
        fontWeight: '600',
    },
    moreText: {
        fontSize: 10,
    },
});

export default HunterCard;
