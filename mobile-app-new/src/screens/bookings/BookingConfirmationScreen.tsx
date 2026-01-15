import React from 'react';
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
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

type BookingConfirmationParams = {
    BookingConfirmation: {
        bookingId: string;
    };
};

const BookingConfirmationScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<BookingConfirmationParams, 'BookingConfirmation'>>();
    const bookingId = route.params?.bookingId || 'book-1';

    // Mock booking data - in real app, fetch from context using bookingId
    const booking = {
        id: bookingId,
        propertyTitle: 'Modern 2-Bedroom Apartment in Kasarani',
        propertyImage: 'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800',
        packageName: 'Gold Package',
        price: 2500,
        scheduledDate: '2025-01-15',
        scheduledTime: '10:00 AM',
        hunterName: 'John Kamau',
        hunterPhone: '+254 712 345 678',
        hunterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        location: 'Kasarani, Nairobi',
        confirmationNumber: 'CONF-2025-001',
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Bookings' as never)} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Success Icon */}
                <View style={styles.successSection}>
                    <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
                        <Ionicons name="checkmark-circle" size={80} color={colors.success} />
                    </View>
                    <Text style={[styles.successTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Booking Confirmed!
                    </Text>
                    <Text style={styles.successSubtitle}>
                        Your viewing has been successfully booked
                    </Text>
                </View>

                {/* Confirmation Number */}
                <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={styles.cardLabel}>Confirmation Number</Text>
                    <Text style={[styles.confirmationNumber, { color: colors.primary[500] }]}>
                        {booking.confirmationNumber}
                    </Text>
                </View>

                {/* Property Details */}
                <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Property Details
                    </Text>
                    <View style={styles.propertyInfo}>
                        <Image source={{ uri: booking.propertyImage }} style={styles.propertyImage} />
                        <View style={styles.propertyText}>
                            <Text style={[styles.propertyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {booking.propertyTitle}
                            </Text>
                            <Text style={styles.propertyLocation}>{booking.location}</Text>
                        </View>
                    </View>
                </View>

                {/* Viewing Details */}
                <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Viewing Details
                    </Text>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={20} color={colors.neutral[500]} />
                        <Text style={styles.detailLabel}>Date:</Text>
                        <Text style={[styles.detailValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {booking.scheduledDate}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={20} color={colors.neutral[500]} />
                        <Text style={styles.detailLabel}>Time:</Text>
                        <Text style={[styles.detailValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {booking.scheduledTime}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="cube-outline" size={20} color={colors.neutral[500]} />
                        <Text style={styles.detailLabel}>Package:</Text>
                        <Text style={[styles.detailValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {booking.packageName}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="cash-outline" size={20} color={colors.neutral[500]} />
                        <Text style={styles.detailLabel}>Amount Paid:</Text>
                        <Text style={[styles.detailValue, { color: colors.success, fontWeight: '700' }]}>
                            KES {booking.price.toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Hunter Details */}
                <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Your House Hunter
                    </Text>
                    <View style={styles.hunterInfo}>
                        <Image source={{ uri: booking.hunterAvatar }} style={styles.hunterAvatar} />
                        <View style={styles.hunterText}>
                            <Text style={[styles.hunterName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {booking.hunterName}
                            </Text>
                            <Text style={styles.hunterPhone}>{booking.hunterPhone}</Text>
                        </View>
                        <TouchableOpacity style={styles.contactButton}>
                            <Ionicons name="chatbubble" size={20} color={colors.primary[500]} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Next Steps */}
                <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        What's Next?
                    </Text>
                    <View style={styles.stepItem}>
                        <View style={[styles.stepNumber, { backgroundColor: colors.primary[100] }]}>
                            <Text style={[styles.stepNumberText, { color: colors.primary[500] }]}>1</Text>
                        </View>
                        <Text style={[styles.stepText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Your hunter will contact you to confirm the meeting point
                        </Text>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={[styles.stepNumber, { backgroundColor: colors.primary[100] }]}>
                            <Text style={[styles.stepNumberText, { color: colors.primary[500] }]}>2</Text>
                        </View>
                        <Text style={[styles.stepText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Meet at the agreed time and location
                        </Text>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={[styles.stepNumber, { backgroundColor: colors.primary[100] }]}>
                            <Text style={[styles.stepNumberText, { color: colors.primary[500] }]}>3</Text>
                        </View>
                        <Text style={[styles.stepText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            View the property and ask any questions
                        </Text>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={[styles.stepNumber, { backgroundColor: colors.primary[100] }]}>
                            <Text style={[styles.stepNumberText, { color: colors.primary[500] }]}>4</Text>
                        </View>
                        <Text style={[styles.stepText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Leave a review after your viewing
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity
                    style={[styles.viewBookingButton, { backgroundColor: colors.primary[500] }]}
                    onPress={() => navigation.navigate('Bookings' as never)}
                >
                    <Text style={styles.viewBookingButtonText}>View My Bookings</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: spacing.xs,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    successSection: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    successIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    successTitle: {
        ...typography.h2,
        fontSize: 28,
        marginBottom: spacing.sm,
    },
    successSubtitle: {
        ...typography.body,
        color: colors.neutral[500],
        textAlign: 'center',
    },
    card: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },
    cardLabel: {
        ...typography.caption,
        color: colors.neutral[500],
        marginBottom: spacing.xs,
    },
    confirmationNumber: {
        ...typography.h3,
        fontSize: 20,
        fontWeight: '700',
    },
    sectionTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.md,
    },
    propertyInfo: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    propertyImage: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.md,
    },
    propertyText: {
        flex: 1,
        justifyContent: 'center',
    },
    propertyTitle: {
        ...typography.bodySemiBold,
        fontSize: 15,
        marginBottom: 4,
    },
    propertyLocation: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
    },
    detailLabel: {
        ...typography.body,
        color: colors.neutral[500],
        flex: 1,
    },
    detailValue: {
        ...typography.bodySemiBold,
    },
    hunterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    hunterAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    hunterText: {
        flex: 1,
    },
    hunterName: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: 2,
    },
    hunterPhone: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    contactButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepItem: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumberText: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    stepText: {
        ...typography.body,
        flex: 1,
        lineHeight: 20,
        paddingTop: 6,
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    viewBookingButton: {
        height: 52,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewBookingButtonText: {
        ...typography.bodySemiBold,
        fontSize: 16,
        color: 'white',
    },
});

export default BookingConfirmationScreen;
