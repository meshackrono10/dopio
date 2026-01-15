import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

type BookingReviewParams = {
    BookingReview: {
        bookingId: string;
    };
};

const BookingReviewScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<BookingReviewParams, 'BookingReview'>>();

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [professionalismRating, setProfessionalismRating] = useState(0);
    const [accuracyRating, setAccuracyRating] = useState(0);

    // Mock booking data
    const booking = {
        propertyTitle: 'Modern 2-Bedroom Apartment in Kasarani',
        propertyImage: 'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800',
        hunterName: 'John Kamau',
        hunterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    };

    const handleSubmit = () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select an overall rating');
            return;
        }
        if (!review.trim()) {
            Alert.alert('Review Required', 'Please write a review');
            return;
        }

        Alert.alert('Success', 'Thank you for your review!', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    const RatingSelector = ({
        label,
        value,
        onChange
    }: {
        label: string;
        value: number;
        onChange: (rating: number) => void;
    }) => (
        <View style={styles.ratingSection}>
            <Text style={[styles.ratingLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>
                {label}
            </Text>
            <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => onChange(star)}>
                        <Ionicons
                            name={star <= value ? 'star' : 'star-outline'}
                            size={36}
                            color={star <= value ? colors.warning : colors.neutral[300]}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <SafeAreaView edges={['top']} style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Leave a Review
                    </Text>
                    <View style={{ width: 24 }} />
                </SafeAreaView>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Property Card */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Image source={{ uri: booking.propertyImage }} style={styles.propertyImage} />
                        <Text style={[styles.propertyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {booking.propertyTitle}
                        </Text>
                    </View>

                    {/* Hunter Info */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Your House Hunter
                        </Text>
                        <View style={styles.hunterInfo}>
                            <Image source={{ uri: booking.hunterAvatar }} style={styles.hunterAvatar} />
                            <Text style={[styles.hunterName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {booking.hunterName}
                            </Text>
                        </View>
                    </View>

                    {/* Overall Rating */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <RatingSelector
                            label="Overall Rating *"
                            value={rating}
                            onChange={setRating}
                        />
                    </View>

                    {/* Detailed Ratings */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Rate Your Experience
                        </Text>
                        <RatingSelector
                            label="Professionalism"
                            value={professionalismRating}
                            onChange={setProfessionalismRating}
                        />
                        <View style={styles.divider} />
                        <RatingSelector
                            label="Accuracy of Listing"
                            value={accuracyRating}
                            onChange={setAccuracyRating}
                        />
                    </View>

                    {/* Written Review */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Write Your Review *
                        </Text>
                        <TextInput
                            style={[
                                styles.reviewInput,
                                {
                                    backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50],
                                    color: isDark ? colors.text.dark : colors.text.light,
                                    borderColor: colors.neutral[200]
                                }
                            ]}
                            value={review}
                            onChangeText={setReview}
                            placeholder="Share your experience with this viewing..."
                            placeholderTextColor={colors.neutral[400]}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                        <Text style={styles.characterCount}>
                            {review.length} / 500
                        </Text>
                    </View>

                    {/* Guidelines */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50] }]}>
                        <View style={styles.guidelineHeader}>
                            <Ionicons name="information-circle" size={20} color={colors.primary[500]} />
                            <Text style={[styles.guidelineTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Review Guidelines
                            </Text>
                        </View>
                        <Text style={styles.guidelineText}>
                            • Be honest and constructive{'\n'}
                            • Focus on your viewing experience{'\n'}
                            • Avoid personal information{'\n'}
                            • Be respectful and professional
                        </Text>
                    </View>
                </ScrollView>

                <SafeAreaView edges={['bottom']} style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: rating === 0 || !review.trim() ? colors.neutral[300] : colors.primary[500] }
                        ]}
                        onPress={handleSubmit}
                        disabled={rating === 0 || !review.trim()}
                    >
                        <Text style={styles.submitButtonText}>Submit Review</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        </KeyboardAvoidingView>
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
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    card: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },
    propertyImage: {
        width: '100%',
        height: 180,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    propertyTitle: {
        ...typography.h3,
        fontSize: 18,
        textAlign: 'center',
    },
    sectionTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.md,
    },
    hunterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    hunterAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    hunterName: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    ratingSection: {
        marginVertical: spacing.sm,
    },
    ratingLabel: {
        ...typography.bodySemiBold,
        fontSize: 15,
        marginBottom: spacing.sm,
    },
    stars: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    divider: {
        height: 1,
        backgroundColor: colors.neutral[100],
        marginVertical: spacing.md,
    },
    reviewInput: {
        height: 140,
        borderWidth: 1,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        ...typography.body,
        marginBottom: spacing.xs,
    },
    characterCount: {
        ...typography.caption,
        color: colors.neutral[400],
        textAlign: 'right',
    },
    guidelineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    guidelineTitle: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    guidelineText: {
        ...typography.caption,
        color: colors.neutral[600],
        lineHeight: 20,
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    submitButton: {
        height: 52,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        ...typography.bodySemiBold,
        fontSize: 16,
        color: 'white',
    },
});

export default BookingReviewScreen;
