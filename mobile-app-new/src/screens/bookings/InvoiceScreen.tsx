import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useInvoices } from '../../contexts/InvoiceContext';
import { useBookings } from '../../contexts/BookingContext';
import { Invoice } from '../../data/types';

type InvoiceScreenParams = {
    invoiceId: string;
};

const InvoiceScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<{ params: InvoiceScreenParams }, 'params'>>();
    const { getInvoiceById, payInvoice } = useInvoices();
    const { addBooking } = useBookings();

    const invoiceId = route.params?.invoiceId;
    const [invoice, setInvoice] = useState<Invoice | undefined>();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        if (invoiceId) {
            setInvoice(getInvoiceById(invoiceId));
        }
    }, [invoiceId]);

    // Countdown timer
    useEffect(() => {
        if (!invoice || invoice.status !== 'pending') return;

        const updateCountdown = () => {
            const expires = new Date(invoice.expiresAt).getTime();
            const now = Date.now();
            const diff = expires - now;

            if (diff <= 0) {
                setCountdown('Expired');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setCountdown(`${hours}h ${minutes}m remaining`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000);
        return () => clearInterval(interval);
    }, [invoice]);

    const handlePay = async () => {
        if (!invoice) return;

        Alert.alert(
            'Confirm Payment',
            `Pay KES ${invoice.totalAmount} via ${paymentMethod === 'mpesa' ? 'M-Pesa' : 'Card'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Pay Now',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            // Simulate M-Pesa STK Push
                            if (paymentMethod === 'mpesa') {
                                Alert.alert(
                                    'M-Pesa Request Sent',
                                    'Please check your phone and enter your M-Pesa PIN to complete the payment.',
                                    [{ text: 'OK' }]
                                );
                            }

                            // Process payment
                            const updatedInvoice = await payInvoice(invoice.id, paymentMethod);
                            setInvoice(updatedInvoice);

                            // Create booking after successful payment
                            addBooking({
                                invoiceId: invoice.id,
                                propertyId: invoice.propertyId,
                                propertyTitle: invoice.propertyTitle,
                                propertyImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
                                tenantId: invoice.tenantId,
                                tenantName: invoice.tenantName,
                                hunterId: invoice.hunterId,
                                hunterName: invoice.hunterName,
                                scheduledDate: invoice.meetupDate,
                                scheduledTime: invoice.meetupTime,
                                meetupLocation: invoice.meetupLocation,
                                packageName: 'Viewing',
                                price: invoice.totalAmount,
                                status: 'confirmed',
                            });

                            Alert.alert(
                                'Payment Successful!',
                                'Your viewing has been confirmed. You can now see the meetup location.',
                                [
                                    {
                                        text: 'View Booking',
                                        onPress: () => navigation.navigate('Bookings' as never),
                                    },
                                ]
                            );
                        } catch (error) {
                            Alert.alert('Payment Failed', 'Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    if (!invoice) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                </View>
            </SafeAreaView>
        );
    }

    const isPaid = invoice.status === 'paid' || invoice.status === 'released';
    const isExpired = invoice.status === 'expired';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Invoice
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Invoice Card */}
                <View style={[styles.invoiceCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    {/* Status Banner */}
                    {isPaid && (
                        <View style={[styles.statusBanner, { backgroundColor: colors.success + '20' }]}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                            <Text style={[styles.statusBannerText, { color: colors.success }]}>
                                Payment Received
                            </Text>
                        </View>
                    )}
                    {isExpired && (
                        <View style={[styles.statusBanner, { backgroundColor: colors.error + '20' }]}>
                            <Ionicons name="close-circle" size={20} color={colors.error} />
                            <Text style={[styles.statusBannerText, { color: colors.error }]}>
                                Invoice Expired
                            </Text>
                        </View>
                    )}

                    {/* Invoice Number */}
                    <Text style={styles.invoiceNumber}>Invoice #{invoice.id.slice(-6).toUpperCase()}</Text>

                    {/* Property Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Property</Text>
                        <Text style={[styles.sectionValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {invoice.propertyTitle}
                        </Text>
                    </View>

                    {/* Parties */}
                    <View style={styles.partiesRow}>
                        <View style={styles.partyInfo}>
                            <Text style={styles.sectionLabel}>From</Text>
                            <Text style={[styles.partyName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {invoice.hunterName}
                            </Text>
                        </View>
                        <Ionicons name="arrow-forward" size={18} color={colors.neutral[400]} />
                        <View style={styles.partyInfo}>
                            <Text style={styles.sectionLabel}>To</Text>
                            <Text style={[styles.partyName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {invoice.tenantName}
                            </Text>
                        </View>
                    </View>

                    {/* Meetup Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Meetup Date & Time</Text>
                        <View style={styles.meetupRow}>
                            <Ionicons name="calendar" size={18} color={colors.primary[500]} />
                            <Text style={[styles.meetupText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {invoice.meetupDate} at {invoice.meetupTime}
                            </Text>
                        </View>
                    </View>

                    {/* Location */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Meetup Location</Text>
                        {isPaid && invoice.meetupLocation ? (
                            <View style={styles.locationRevealed}>
                                <Ionicons name="location" size={18} color={colors.success} />
                                <View style={styles.locationDetails}>
                                    <Text style={[styles.locationAddress, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        {invoice.meetupLocation.address}
                                    </Text>
                                    {invoice.meetupLocation.directions && (
                                        <Text style={styles.locationDirections}>
                                            {invoice.meetupLocation.directions}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ) : (
                            <View style={styles.locationHidden}>
                                <Ionicons name="lock-closed" size={18} color={colors.neutral[400]} />
                                <Text style={styles.locationHiddenText}>
                                    Revealed after payment
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Fee Breakdown */}
                    <View style={styles.feeSection}>
                        <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>Viewing Fee</Text>
                            <Text style={styles.feeValue}>KES {invoice.viewingFee}</Text>
                        </View>
                        <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>Service Fee (15%)</Text>
                            <Text style={styles.feeValue}>KES {invoice.serviceFee}</Text>
                        </View>
                        <View style={[styles.feeRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>KES {invoice.totalAmount}</Text>
                        </View>
                    </View>

                    {/* Expiry Countdown */}
                    {invoice.status === 'pending' && countdown && (
                        <View style={[styles.expiryBanner, { backgroundColor: colors.warning + '15' }]}>
                            <Ionicons name="time" size={16} color={colors.warning} />
                            <Text style={[styles.expiryText, { color: colors.warning }]}>
                                {countdown}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Payment Section */}
                {invoice.status === 'pending' && !isExpired && (
                    <View style={[styles.paymentSection, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.paymentTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Select Payment Method
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.paymentOption,
                                paymentMethod === 'mpesa' && styles.paymentOptionSelected,
                            ]}
                            onPress={() => setPaymentMethod('mpesa')}
                        >
                            <View style={[styles.paymentIcon, { backgroundColor: '#00A651' + '20' }]}>
                                <Text style={{ fontSize: 18, fontWeight: '700', color: '#00A651' }}>M</Text>
                            </View>
                            <View style={styles.paymentDetails}>
                                <Text style={[styles.paymentName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    M-Pesa
                                </Text>
                                <Text style={styles.paymentDesc}>Pay with mobile money</Text>
                            </View>
                            <View style={[
                                styles.radio,
                                paymentMethod === 'mpesa' && { borderColor: colors.primary[500] },
                            ]}>
                                {paymentMethod === 'mpesa' && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.paymentOption,
                                paymentMethod === 'card' && styles.paymentOptionSelected,
                            ]}
                            onPress={() => setPaymentMethod('card')}
                        >
                            <View style={[styles.paymentIcon, { backgroundColor: colors.primary[100] }]}>
                                <Ionicons name="card" size={20} color={colors.primary[500]} />
                            </View>
                            <View style={styles.paymentDetails}>
                                <Text style={[styles.paymentName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Debit/Credit Card
                                </Text>
                                <Text style={styles.paymentDesc}>Visa, Mastercard</Text>
                            </View>
                            <View style={[
                                styles.radio,
                                paymentMethod === 'card' && { borderColor: colors.primary[500] },
                            ]}>
                                {paymentMethod === 'card' && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.payButton, { backgroundColor: colors.primary[500] }]}
                            onPress={handlePay}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="lock-closed" size={18} color="white" />
                                    <Text style={styles.payButtonText}>Pay KES {invoice.totalAmount}</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.secureNote}>
                            <Ionicons name="shield-checkmark" size={12} color={colors.success} />
                            {' '}Your payment is held securely until you confirm the viewing
                        </Text>
                    </View>
                )}
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
    invoiceCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    statusBannerText: { ...typography.bodySemiBold },
    invoiceNumber: {
        ...typography.caption,
        color: colors.neutral[500],
        marginBottom: spacing.lg,
    },
    section: { marginBottom: spacing.md },
    sectionLabel: { ...typography.caption, color: colors.neutral[400], marginBottom: spacing.xs },
    sectionValue: { ...typography.bodySemiBold },
    partiesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    partyInfo: { flex: 1 },
    partyName: { ...typography.body },
    meetupRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    meetupText: { ...typography.body },
    locationRevealed: { flexDirection: 'row', gap: spacing.sm },
    locationDetails: { flex: 1 },
    locationAddress: { ...typography.body },
    locationDirections: { ...typography.caption, color: colors.neutral[500], marginTop: spacing.xs },
    locationHidden: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.neutral[100],
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    locationHiddenText: { ...typography.body, color: colors.neutral[500] },
    divider: {
        height: 1,
        backgroundColor: colors.neutral[200],
        marginVertical: spacing.md,
    },
    feeSection: { marginBottom: spacing.md },
    feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
    feeLabel: { ...typography.body, color: colors.neutral[600] },
    feeValue: { ...typography.body, color: colors.neutral[700] },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
    },
    totalLabel: { ...typography.bodySemiBold },
    totalValue: { ...typography.h3, color: colors.primary[500] },
    expiryBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    expiryText: { ...typography.bodySemiBold, fontSize: 13 },
    paymentSection: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.md,
    },
    paymentTitle: { ...typography.bodySemiBold, marginBottom: spacing.md },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderWidth: 2,
        borderColor: colors.neutral[200],
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
    },
    paymentOptionSelected: { borderColor: colors.primary[500] },
    paymentIcon: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paymentDetails: { flex: 1, marginLeft: spacing.md },
    paymentName: { ...typography.bodySemiBold },
    paymentDesc: { ...typography.caption, color: colors.neutral[500] },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.neutral[300],
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary[500],
    },
    payButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        height: 52,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
    },
    payButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
    secureNote: {
        ...typography.caption,
        color: colors.neutral[500],
        textAlign: 'center',
        marginTop: spacing.md,
    },
});

export default InvoiceScreen;
