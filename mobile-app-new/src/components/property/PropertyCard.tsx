import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows, animations } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import Pressable from '../common/Pressable';
import OptimizedImage from '../common/OptimizedImage';

const { width } = Dimensions.get('window');
const FULL_CARD_WIDTH = width - spacing.lg * 2;

interface PropertyCardProps {
    property: {
        id: string | number;
        title: string;
        rent: number;
        location: {
            generalArea: string;
            county?: string;
        };
        layout: string;
        bathrooms: number;
        images: (string | number)[];
        furnished?: string;
        averageRating?: number;
        reviewCount?: number;
        featured?: boolean;
    };
    onPress: () => void;
    isSaved?: boolean;
    onToggleSave?: () => void;
    variant?: 'grid' | 'list' | 'full';
    index?: number;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
    property,
    onPress,
    isSaved = false,
    onToggleSave,
    variant = 'full',
    index = 0
}) => {
    const { isDark } = useTheme();
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: animations.durations.normal,
                delay: index * 50,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                friction: 8,
                tension: 40,
                delay: index * 50,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const formatPrice = (price: number) => {
        return `KES ${price.toLocaleString()}`;
    };

    const imageSource = typeof property.images[0] === 'string'
        ? { uri: property.images[0] }
        : property.images[0];

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            <View style={styles.card}>
                <Pressable
                    onPress={onPress}
                    style={{ backgroundColor: 'transparent' }}
                >
                    <View style={styles.imageContainer}>
                        <OptimizedImage
                            source={imageSource}
                            style={styles.fullImage}
                            resizeMode="cover"
                        />
                        {property.featured && (
                            <View style={styles.featuredBadge}>
                                <Text style={styles.featuredBadgeText}>Guest favorite</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.content}>
                        <View style={styles.headerRow}>
                            <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                                {property.location.generalArea}, Kenya
                            </Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={14} color={colors.text.light} />
                                <Text style={[styles.ratingText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    {property.averageRating || 'New'}
                                </Text>
                            </View>
                        </View>

                        <Text style={[styles.subtitle, { color: colors.neutral[500] }]}>
                            {property.layout} · {property.bathrooms} Bath
                        </Text>

                        <Text style={[styles.dateText, { color: colors.neutral[500] }]}>
                            Available now
                        </Text>

                        <View style={styles.priceRow}>
                            <Text style={[styles.price, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {formatPrice(property.rent)}
                            </Text>
                            <Text style={[styles.perMonth, { color: isDark ? colors.text.dark : colors.text.light }]}>month</Text>
                        </View>
                    </View>
                </Pressable>

                <Pressable
                    style={styles.heartIcon}
                    onPress={onToggleSave}
                    hitSlop={15}
                >
                    <View style={styles.heartIconInner}>
                        <Ionicons
                            name={isSaved ? "heart" : "heart-outline"}
                            size={24}
                            color={isSaved ? colors.error[500] : "white"}
                        />
                    </View>
                </Pressable>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        position: 'relative',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    featuredBadge: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        backgroundColor: 'white',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        ...shadows.sm,
    },
    featuredBadgeText: {
        ...typography.caption,
        color: colors.text.light,
        fontWeight: '700',
    },
    heartIcon: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.lg + spacing.md,
        zIndex: 999,
    },
    heartIconInner: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    content: {
        marginTop: spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        ...typography.bodySemiBold,
        flex: 1,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        ...typography.bodySmall,
        fontWeight: '500',
    },
    subtitle: {
        ...typography.bodySmall,
        marginTop: 2,
    },
    dateText: {
        ...typography.bodySmall,
        marginTop: 2,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: spacing.xs,
    },
    price: {
        ...typography.bodySemiBold,
    },
    perMonth: {
        ...typography.bodySmall,
    },
});

export default PropertyCard;
