import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings, Booking } from '../../contexts/BookingContext';

type MeetupDayScreenParams = {
    bookingId: string;
};

const MeetupDayScreen = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<{ params: MeetupDayScreenParams }, 'params'>>();
    const { getBookingById, checkIn, requestReschedule, respondToReschedule, completeViewing } = useBookings();

    const bookingId = route.params?.bookingId;
    const [booking, setBooking] = useState<Booking | undefined>();
    const [checkingIn, setCheckingIn] = useState(false);
    const [hasCheckedIn, setHasCheckedIn] = useState(false);
    const [countdown, setCountdown] = useState('');
    const [rescheduleVisible, setRescheduleVisible] = useState(false);

    const userRole = user?.role === 'hunter' ? 'hunter' : 'tenant';

    useEffect(() => {
        if (bookingId) {
            const b = getBookingById(bookingId);
            setBooking(b);
            if (b) {
                const checkInData = userRole === 'tenant' ? b.tenantCheckIn : b.hunterCheckIn;
                setHasCheckedIn(!!checkInData);
            }
        }
    }, [bookingId, userRole]);

    // Countdown to meetup time
    useEffect(() => {
        if (!booking) return;

        const updateCountdown = () => {
            const meetupTime = new Date(`${booking.scheduledDate} ${booking.scheduledTime}`);
            const now = new Date();
            const diff = meetupTime.getTime() - now.getTime();

            if (diff <= 0) {
                setCountdown('Meetup time reached');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (hours > 0) {
                setCountdown(`${hours}h ${minutes}m until meetup`);
            } else {
                setCountdown(`${minutes} minutes until meetup`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000);
        return () => clearInterval(interval);
    }, [booking]);

    const handleCheckIn = async () => {
        if (!booking?.meetupLocation) {
            Alert.alert('Error', 'Meetup location not available');
            return;
        }

        setCheckingIn(true);
        try {
            // Request location permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Location access is required to check in.');
                return;
            }

            // Get current location
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            // Perform check-in
            checkIn(booking.id, userRole, {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                accuracy: location.coords.accuracy || 0,
            });

            setHasCheckedIn(true);

            // Refresh booking data
            const updatedBooking = getBookingById(bookingId);
            setBooking(updatedBooking);

            const checkInData = updatedBooking && (userRole === 'tenant'
                ? updatedBooking.tenantCheckIn
                : updatedBooking.hunterCheckIn);

            if (checkInData?.isWithinRange) {
                Alert.alert(
                    'Check-in Successful!',
                    `You're at the meetup location. ${checkInData.isOnTime ? "You're on time!" : "You're a bit late, but you made it!"}`,
                );
            } else {
                Alert.alert(
                    'Check-in Recorded',
                    "Your location has been recorded. You appear to be outside the meetup area - please head to the location.",
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Could not get your location. Please try again.');
        } finally {
            setCheckingIn(false);
        }
    };

    const handleOpenMaps = () => {
        if (!booking?.meetupLocation) return;

        const { lat, lng } = booking.meetupLocation;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        Linking.openURL(url);
    };

    const handleRequestReschedule = () => {
        Alert.alert(
            'Request Reschedule',
            'You can only reschedule to a different time on the same day. What time works for you?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Morning (10 AM)',
                    onPress: () => {
                        requestReschedule(booking!.id, userRole, '10:00 AM', 'Morning works better for me');
                        Alert.alert('Request Sent', 'The other party will be notified of your reschedule request.');
                    },
                },
                {
                    text: 'Afternoon (2 PM)',
                    onPress: () => {
                        requestReschedule(booking!.id, userRole, '2:00 PM', 'Afternoon works better for me');
                        Alert.alert('Request Sent', 'The other party will be notified of your reschedule request.');
                    },
                },
                {
                    text: 'Evening (5 PM)',
                    onPress: () => {
                        requestReschedule(booking!.id, userRole, '5:00 PM', 'Evening works better for me');
                        Alert.alert('Request Sent', 'The other party will be notified of your reschedule request.');
                    },
                },
            ]
        );
    };

    const handleRespondToReschedule = (accept: boolean) => {
        respondToReschedule(booking!.id, accept);
        Alert.alert(
            accept ? 'Accepted' : 'Declined',
            accept
                ? `The viewing has been rescheduled to ${booking?.rescheduleRequest?.newTime}`
                : 'The reschedule request has been declined.'
        );
    };

    const handleCompleteViewing = () => {
        Alert.alert(
            'Complete Viewing',
            'Confirm that the viewing has been completed? The tenant will have 24 hours to accept or report any issues.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Complete',
                    onPress: () => {
                        completeViewing(booking!.id);
                        (navigation as any).navigate('PostViewing', { bookingId: booking!.id });
                    },
                },
            ]
        );
    };

    if (!booking) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                </View>
            </SafeAreaView>
        );
    }

    const bothCheckedIn = booking.tenantCheckIn && booking.hunterCheckIn;
    const hasPendingReschedule = booking.rescheduleRequest?.status === 'pending';
    const isRescheduleRequestMine = booking.rescheduleRequest?.requestedBy === userRole;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Meetup Day
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Countdown Banner */}
                <View style={[styles.countdownBanner, { backgroundColor: colors.primary[500] }]}>
                    <Ionicons name="time" size={24} color="white" />
                    <Text style={styles.countdownText}>{countdown}</Text>
                </View>

                {/* Property Card */}
                <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Image source={{ uri: booking.propertyImage }} style={styles.propertyImage} />
                    <View style={styles.propertyDetails}>
                        <Text style={[styles.propertyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {booking.propertyTitle}
                        </Text>
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar" size={14} color={colors.neutral[500]} />
                            <Text style={styles.detailText}>
                                {booking.scheduledDate} at {booking.scheduledTime}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="person" size={14} color={colors.neutral[500]} />
                            <Text style={styles.detailText}>
                                {userRole === 'tenant' ? `Hunter: ${booking.hunterName}` : `Tenant: ${booking.tenantName}`}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Location Card */}
                {booking.meetupLocation && (
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <View style={styles.locationHeader}>
                            <Ionicons name="location" size={20} color={colors.primary[500]} />
                            <Text style={[styles.locationTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Meetup Location
                            </Text>
                        </View>
                        <Text style={styles.locationAddress}>{booking.meetupLocation.address}</Text>
                        {booking.meetupLocation.directions && (
                            <Text style={styles.locationDirections}>{booking.meetupLocation.directions}</Text>
                        )}
                        <TouchableOpacity style={styles.directionsButton} onPress={handleOpenMaps}>
                            <Ionicons name="navigate" size={16} color={colors.primary[500]} />
                            <Text style={styles.directionsButtonText}>Get Directions</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Reschedule Request Banner */}
                {hasPendingReschedule && !isRescheduleRequestMine && (
                    <View style={[styles.rescheduleCard, { backgroundColor: colors.warning + '20' }]}>
                        <Ionicons name="swap-horizontal" size={20} color={colors.warning} />
                        <View style={styles.rescheduleContent}>
                            <Text style={[styles.rescheduleTitle, { color: colors.warning }]}>
                                Reschedule Request
                            </Text>
                            <Text style={styles.rescheduleText}>
                                {booking.rescheduleRequest?.requestedBy === 'tenant' ? 'Tenant' : 'Hunter'} wants to change time to {booking.rescheduleRequest?.newTime}
                            </Text>
                            {booking.rescheduleRequest?.reason && (
                                <Text style={styles.rescheduleReason}>Reason: {booking.rescheduleRequest.reason}</Text>
                            )}
                        </View>
                        <View style={styles.rescheduleActions}>
                            <TouchableOpacity
                                style={[styles.rescheduleButton, { backgroundColor: colors.success }]}
                                onPress={() => handleRespondToReschedule(true)}
                            >
                                <Text style={styles.rescheduleButtonText}>Accept</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.rescheduleButton, { backgroundColor: colors.error }]}
                                onPress={() => handleRespondToReschedule(false)}
                            >
                                <Text style={styles.rescheduleButtonText}>Decline</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Check-in Status */}
                <View style={[styles.checkInSection, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Check-in Status
                    </Text>

                    <View style={styles.checkInRow}>
                        <View style={styles.checkInItem}>
                            <View style={[
                                styles.checkInIcon,
                                { backgroundColor: booking.tenantCheckIn ? colors.success + '20' : colors.neutral[200] }
                            ]}>
                                <Ionicons
                                    name={booking.tenantCheckIn ? 'checkmark-circle' : 'person'}
                                    size={24}
                                    color={booking.tenantCheckIn ? colors.success : colors.neutral[500]}
                                />
                            </View>
                            <Text style={styles.checkInLabel}>Tenant</Text>
                            <Text style={[styles.checkInStatus, { color: booking.tenantCheckIn ? colors.success : colors.neutral[500] }]}>
                                {booking.tenantCheckIn ? 'Checked In' : 'Not Yet'}
                            </Text>
                        </View>

                        <View style={styles.checkInDivider} />

                        <View style={styles.checkInItem}>
                            <View style={[
                                styles.checkInIcon,
                                { backgroundColor: booking.hunterCheckIn ? colors.success + '20' : colors.neutral[200] }
                            ]}>
                                <Ionicons
                                    name={booking.hunterCheckIn ? 'checkmark-circle' : 'briefcase'}
                                    size={24}
                                    color={booking.hunterCheckIn ? colors.success : colors.neutral[500]}
                                />
                            </View>
                            <Text style={styles.checkInLabel}>Hunter</Text>
                            <Text style={[styles.checkInStatus, { color: booking.hunterCheckIn ? colors.success : colors.neutral[500] }]}>
                                {booking.hunterCheckIn ? 'Checked In' : 'Not Yet'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsSection}>
                    {!hasCheckedIn && (
                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: colors.primary[500] }]}
                            onPress={handleCheckIn}
                            disabled={checkingIn}
                        >
                            {checkingIn ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="location" size={20} color="white" />
                                    <Text style={styles.primaryButtonText}>Check In at Location</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {hasCheckedIn && !bothCheckedIn && (
                        <View style={[styles.waitingBanner, { backgroundColor: colors.info + '20' }]}>
                            <Ionicons name="time" size={20} color={colors.info} />
                            <Text style={[styles.waitingText, { color: colors.info }]}>
                                Waiting for {userRole === 'tenant' ? 'Hunter' : 'Tenant'} to check in...
                            </Text>
                        </View>
                    )}

                    {bothCheckedIn && userRole === 'hunter' && (
                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: colors.success }]}
                            onPress={handleCompleteViewing}
                        >
                            <Ionicons name="checkmark-done" size={20} color="white" />
                            <Text style={styles.primaryButtonText}>Complete Viewing</Text>
                        </TouchableOpacity>
                    )}

                    {bothCheckedIn && userRole === 'tenant' && (
                        <View style={[styles.waitingBanner, { backgroundColor: colors.success + '20' }]}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                            <Text style={[styles.waitingText, { color: colors.success }]}>
                                Both parties checked in! Proceed with viewing.
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleRequestReschedule}
                        disabled={hasPendingReschedule}
                    >
                        <Ionicons name="swap-horizontal" size={18} color={colors.neutral[600]} />
                        <Text style={styles.secondaryButtonText}>
                            {hasPendingReschedule ? 'Reschedule Pending' : 'Request Same-Day Reschedule'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Grace Period Info */}
                <View style={[styles.infoNote, { backgroundColor: colors.neutral[100] }]}>
                    <Ionicons name="information-circle" size={18} color={colors.neutral[500]} />
                    <Text style={styles.infoNoteText}>
                        You have a 1-hour grace period. If one party doesn't check in within this time,
                        appropriate actions may be taken regarding the deposit.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
    },
    headerBack: { padding: spacing.xs },
    headerTitle: { ...typography.h3, fontSize: 18 },
    content: { padding: spacing.lg },
    countdownBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
    },
    countdownText: { color: 'white', fontSize: 16, fontWeight: '700' },
    card: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    propertyImage: { width: '100%', height: 150, borderRadius: borderRadius.md, marginBottom: spacing.md },
    propertyDetails: {},
    propertyTitle: { ...typography.bodySemiBold, marginBottom: spacing.sm },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
    detailText: { ...typography.caption, color: colors.neutral[500] },
    locationHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
    locationTitle: { ...typography.bodySemiBold },
    locationAddress: { ...typography.body, color: colors.neutral[600], marginBottom: spacing.sm },
    locationDirections: { ...typography.caption, color: colors.neutral[500], marginBottom: spacing.md },
    directionsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    directionsButtonText: { color: colors.primary[500], fontWeight: '600' },
    rescheduleCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    rescheduleContent: { flex: 1 },
    rescheduleTitle: { ...typography.bodySemiBold, marginBottom: spacing.xs },
    rescheduleText: { ...typography.caption, color: colors.neutral[600] },
    rescheduleReason: { ...typography.caption, color: colors.neutral[500], fontStyle: 'italic', marginTop: spacing.xs },
    rescheduleActions: { gap: spacing.xs },
    rescheduleButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
    rescheduleButtonText: { color: 'white', fontWeight: '600', fontSize: 12 },
    checkInSection: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    sectionTitle: { ...typography.bodySemiBold, marginBottom: spacing.md },
    checkInRow: { flexDirection: 'row', alignItems: 'center' },
    checkInItem: { flex: 1, alignItems: 'center' },
    checkInIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    checkInLabel: { ...typography.caption, color: colors.neutral[500] },
    checkInStatus: { ...typography.caption, fontWeight: '700', marginTop: spacing.xs },
    checkInDivider: { width: 1, height: 60, backgroundColor: colors.neutral[200] },
    actionsSection: { gap: spacing.md, marginBottom: spacing.lg },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        height: 52,
        borderRadius: borderRadius.md,
        ...shadows.sm,
    },
    primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        height: 44,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[300],
    },
    secondaryButtonText: { color: colors.neutral[600], fontWeight: '600' },
    waitingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    waitingText: { fontWeight: '600' },
    infoNote: {
        flexDirection: 'row',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    infoNoteText: { ...typography.caption, color: colors.neutral[600], flex: 1 },
});

export default MeetupDayScreen;
