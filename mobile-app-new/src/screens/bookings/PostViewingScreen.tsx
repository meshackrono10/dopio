import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useBookings, Booking } from '../../contexts/BookingContext';
import { useInvoices } from '../../contexts/InvoiceContext';

type PostViewingScreenParams = {
    bookingId: string;
};

const PostViewingScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<{ params: PostViewingScreenParams }, 'params'>>();
    const { getBookingById, acceptViewing, reportIssue, requestAlternative } = useBookings();
    const { releasePayment } = useInvoices();

    const bookingId = route.params?.bookingId;
    const [booking, setBooking] = useState<Booking | undefined>();
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        if (bookingId) {
            setBooking(getBookingById(bookingId));
        }
    }, [bookingId]);

    // 24-hour countdown
    useEffect(() => {
        if (!booking?.resolutionDeadline) return;

        const updateCountdown = () => {
            const deadline = new Date(booking.resolutionDeadline!).getTime();
            const now = Date.now();
            const diff = deadline - now;

            if (diff <= 0) {
                setCountdown('Time expired - Auto-accepting');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setCountdown(`${hours}h ${minutes}m left to respond`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000);
        return () => clearInterval(interval);
    }, [booking]);

    const handleAccept = () => {
        Alert.alert(
            'Confirm Viewing Complete',
            'You confirm that the property matched the listing and you are satisfied with the viewing. The payment will be released to the House Hunter.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm & Release Payment',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await acceptViewing(booking!.id);
                            releasePayment(booking!.invoiceId);
                            Alert.alert(
                                'Thank You!',
                                'The viewing has been completed and payment released. Would you like to leave a review?',
                                [
                                    { text: 'Later', onPress: () => navigation.goBack() },
                                    { text: 'Leave Review', onPress: () => navigation.navigate('LeaveReview' as never) },
                                ]
                            );
                        } catch (error) {
                            Alert.alert('Error', 'Something went wrong. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleReport = () => {
        Alert.alert(
            'Report an Issue',
            'You will be able to describe the issue and attach evidence. The payment will be frozen until our team reviews your report.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Continue',
                    onPress: () => {
                        reportIssue(booking!.id);
                        (navigation as any).navigate('ReportIssue', { bookingId: booking!.id });
                    },
                },
            ]
        );
    };

    const handleRequestAlternative = () => {
        Alert.alert(
            'Request Alternative Property',
            'The House Hunter will show you a different property. Your payment stays in escrow until you\'re satisfied.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Request',
                    onPress: () => {
                        requestAlternative(booking!.id);
                        Alert.alert(
                            'Request Sent',
                            'We\'ve notified the House Hunter. They will contact you with alternative options.',
                            [{ text: 'OK', onPress: () => navigation.goBack() }]
                        );
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

    // Already resolved
    if (booking.status === 'verified' || booking.status === 'completed') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <View style={styles.center}>
                    <Ionicons name="checkmark-circle" size={80} color={colors.success} />
                    <Text style={[styles.resolvedTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Viewing Completed
                    </Text>
                    <Text style={styles.resolvedSubtitle}>
                        This viewing has been completed and payment released.
                    </Text>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.primary[500] }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Post-Viewing
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Countdown Banner */}
                <View style={[styles.countdownBanner, { backgroundColor: colors.warning + '15' }]}>
                    <Ionicons name="time" size={20} color={colors.warning} />
                    <Text style={[styles.countdownText, { color: colors.warning }]}>
                        {countdown}
                    </Text>
                </View>

                {/* Booking Summary */}
                <View style={[styles.summaryCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Image source={{ uri: booking.propertyImage }} style={styles.propertyImage} />
                    <View style={styles.summaryDetails}>
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
                            <Text style={styles.detailText}>Hunter: {booking.hunterName}</Text>
                        </View>
                    </View>
                </View>

                {/* Question */}
                <View style={styles.questionSection}>
                    <Text style={[styles.questionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        How was your viewing?
                    </Text>
                    <Text style={styles.questionSubtitle}>
                        Please let us know if the property matched the listing description.
                    </Text>
                </View>

                {/* Action Options */}
                <View style={styles.optionsSection}>
                    {/* Accept */}
                    <TouchableOpacity
                        style={[styles.optionCard, styles.optionAccept]}
                        onPress={handleAccept}
                        disabled={loading}
                    >
                        <View style={[styles.optionIcon, { backgroundColor: colors.success + '20' }]}>
                            <Ionicons name="thumbs-up" size={28} color={colors.success} />
                        </View>
                        <Text style={[styles.optionTitle, { color: colors.success }]}>
                            I'm Satisfied
                        </Text>
                        <Text style={styles.optionDesc}>
                            Property matched the listing. Release payment to Hunter.
                        </Text>
                        {loading && <ActivityIndicator color={colors.success} style={styles.optionLoader} />}
                    </TouchableOpacity>

                    {/* Report Issue */}
                    <TouchableOpacity
                        style={[styles.optionCard, styles.optionReport]}
                        onPress={handleReport}
                    >
                        <View style={[styles.optionIcon, { backgroundColor: colors.error + '20' }]}>
                            <Ionicons name="warning" size={28} color={colors.error} />
                        </View>
                        <Text style={[styles.optionTitle, { color: colors.error }]}>
                            There's an Issue
                        </Text>
                        <Text style={styles.optionDesc}>
                            Property didn't match or there was a problem. Payment frozen.
                        </Text>
                    </TouchableOpacity>

                    {/* Request Alternative */}
                    <TouchableOpacity
                        style={[styles.optionCard, styles.optionAlt]}
                        onPress={handleRequestAlternative}
                    >
                        <View style={[styles.optionIcon, { backgroundColor: colors.info + '20' }]}>
                            <Ionicons name="swap-horizontal" size={28} color={colors.info} />
                        </View>
                        <Text style={[styles.optionTitle, { color: colors.info }]}>
                            Show Me Another
                        </Text>
                        <Text style={styles.optionDesc}>
                            This property isn't for me. Ask Hunter to show alternatives.
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Info Note */}
                <View style={[styles.infoNote, { backgroundColor: colors.neutral[100] }]}>
                    <Ionicons name="information-circle" size={18} color={colors.neutral[500]} />
                    <Text style={styles.infoNoteText}>
                        If you don't respond within 24 hours, the viewing will be automatically marked as successful and payment released.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    resolvedTitle: { ...typography.h2, marginTop: spacing.lg },
    resolvedSubtitle: { ...typography.body, color: colors.neutral[500], textAlign: 'center', marginTop: spacing.sm },
    backButton: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.xl,
    },
    backButtonText: { color: 'white', fontWeight: '700' },
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
    countdownText: { ...typography.bodySemiBold },
    summaryCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    propertyImage: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.md,
    },
    summaryDetails: {
        flex: 1,
        marginLeft: spacing.md,
        justifyContent: 'center',
    },
    propertyTitle: { ...typography.bodySemiBold, marginBottom: spacing.xs },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
    detailText: { ...typography.caption, color: colors.neutral[500] },
    questionSection: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    questionTitle: { ...typography.h3, textAlign: 'center' },
    questionSubtitle: { ...typography.body, color: colors.neutral[500], textAlign: 'center', marginTop: spacing.xs },
    optionsSection: { gap: spacing.md },
    optionCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        alignItems: 'center',
        ...shadows.sm,
    },
    optionAccept: { borderColor: colors.success, backgroundColor: 'white' },
    optionReport: { borderColor: colors.error, backgroundColor: 'white' },
    optionAlt: { borderColor: colors.info, backgroundColor: 'white' },
    optionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    optionTitle: { ...typography.h4, marginBottom: spacing.xs },
    optionDesc: { ...typography.caption, color: colors.neutral[500], textAlign: 'center' },
    optionLoader: { marginTop: spacing.sm },
    infoNote: {
        flexDirection: 'row',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.xl,
    },
    infoNoteText: { ...typography.caption, color: colors.neutral[600], flex: 1 },
});

export default PostViewingScreen;
