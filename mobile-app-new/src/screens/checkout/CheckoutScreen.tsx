import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SearchStackParamList } from '../../types/navigation';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { getPropertyById } from '../../services/mockData';
import { PropertyListing, ViewingPackage } from '../../data/types';
import { useToast } from '../../contexts/ToastContext';
import { useInvoices } from '../../contexts/InvoiceContext';

type CheckoutParams = {
    Checkout: {
        propertyId: string;
        packageId: string;
    };
};

const CheckoutScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation<StackNavigationProp<SearchStackParamList>>();
    const route = useRoute<RouteProp<CheckoutParams, 'Checkout'>>();
    const { propertyId, packageId } = route.params;
    const { success, error } = useToast();
    const { payInvoice, getInvoiceById } = useInvoices();

    // Check if we have an invoiceId (for invoice payment flow)
    const invoiceId = (route.params as any)?.invoiceId;

    const [property, setProperty] = useState<PropertyListing | undefined>(undefined);
    const [selectedPackage, setSelectedPackage] = useState<ViewingPackage | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | null>(null);
    const [mpesaNumber, setMpesaNumber] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    useEffect(() => {
        const loadData = () => {
            const prop = getPropertyById(propertyId);
            if (prop) {
                setProperty(prop);
                const pkg = prop.viewingPackages.find(p => p.id === packageId);
                setSelectedPackage(pkg);
            }
            setLoading(false);
        };
        loadData();
    }, [propertyId, packageId]);

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    if (!property || !selectedPackage) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <Text style={{ color: isDark ? colors.text.dark : colors.text.light }}>Details not found</Text>
            </View>
        );
    }

    const serviceFee = selectedPackage.price * 0.15; // 15% service fee
    const total = selectedPackage.price + serviceFee;

    const handlePayment = async () => {
        if (!paymentMethod) {
            Alert.alert('Payment Method Required', 'Please select a payment method');
            return;
        }

        if (paymentMethod === 'mpesa' && !mpesaNumber) {
            Alert.alert('M-Pesa Number Required', 'Please enter your M-Pesa number');
            return;
        }

        if (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv)) {
            Alert.alert('Card Details Required', 'Please enter your card details');
            return;
        }

        setProcessing(true);

        try {
            // If we have an invoice ID, use the InvoiceContext
            if (invoiceId) {
                const invoice = await payInvoice(
                    invoiceId,
                    mpesaNumber || '0700000000' // Use actual number or fallback
                );

                setProcessing(false);
                success('Payment Successful! 🎉');

                Alert.alert(
                    'Success',
                    `Your payment of KES ${invoice.totalAmount.toLocaleString()} has been received and is now in escrow. You'll receive the meetup location shortly.`,
                    [{
                        text: 'View Booking',
                        onPress: () => {
                            (navigation as any).navigate('Bookings');
                        }
                    }]
                );
            } else {
                // Legacy flow for direct booking
                setTimeout(() => {
                    setProcessing(false);
                    success('Booking Confirmed! 🏠');
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Bookings' } as any],
                    });
                }, 2000);
            }
        } catch (err: any) {
            setProcessing(false);
            error(err.message || 'Payment Failed. Please try again.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Checkout
                </Text>
                <View style={{ width: 24 }} />
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Property Summary */}
                <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Booking Summary
                    </Text>
                    <View style={styles.propertyInfo}>
                        <Image source={{ uri: property.images[0] as string }} style={styles.propertyImage} />
                        <View style={styles.propertyDetails}>
                            <Text style={[styles.propertyTitle, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={2}>
                                {property.title}
                            </Text>
                            <Text style={styles.propertyMeta}>
                                {property.location.generalArea}
                            </Text>
                            <Text style={styles.packageName}>{selectedPackage.name}</Text>
                        </View>
                    </View>
                </View>

                {/* Price Breakdown */}
                <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Price Breakdown
                    </Text>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {selectedPackage.name}
                        </Text>
                        <Text style={[styles.priceValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            KES {selectedPackage.price.toLocaleString()}
                        </Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Service Fee (15%)
                        </Text>
                        <Text style={[styles.priceValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            KES {serviceFee.toLocaleString()}
                        </Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.neutral[200] }]} />
                    <View style={styles.priceRow}>
                        <Text style={[styles.totalLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Total
                        </Text>
                        <Text style={[styles.totalValue, { color: colors.primary[500] }]}>
                            KES {total.toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Payment Method */}
                <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Payment Method
                    </Text>

                    {/* M-Pesa Option */}
                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === 'mpesa' && styles.selectedPayment,
                            { borderColor: paymentMethod === 'mpesa' ? colors.primary[500] : colors.neutral[200] }
                        ]}
                        onPress={() => setPaymentMethod('mpesa')}
                    >
                        <View style={styles.paymentOptionLeft}>
                            <View style={[styles.radioOuter, paymentMethod === 'mpesa' && styles.radioOuterSelected]}>
                                {paymentMethod === 'mpesa' && <View style={styles.radioInner} />}
                            </View>
                            <View>
                                <Text style={[styles.paymentMethodName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    M-Pesa
                                </Text>
                                <Text style={styles.paymentMethodDesc}>Pay with your mobile money</Text>
                            </View>
                        </View>
                        <Ionicons name="phone-portrait" size={24} color={colors.success} />
                    </TouchableOpacity>

                    {paymentMethod === 'mpesa' && (
                        <View style={styles.paymentDetails}>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50],
                                        color: isDark ? colors.text.dark : colors.text.light
                                    }
                                ]}
                                placeholder="M-Pesa Number (e.g., 0712345678)"
                                placeholderTextColor={colors.neutral[400]}
                                value={mpesaNumber}
                                onChangeText={setMpesaNumber}
                                keyboardType="phone-pad"
                            />
                        </View>
                    )}

                    {/* Card Option */}
                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === 'card' && styles.selectedPayment,
                            { borderColor: paymentMethod === 'card' ? colors.primary[500] : colors.neutral[200] }
                        ]}
                        onPress={() => setPaymentMethod('card')}
                    >
                        <View style={styles.paymentOptionLeft}>
                            <View style={[styles.radioOuter, paymentMethod === 'card' && styles.radioOuterSelected]}>
                                {paymentMethod === 'card' && <View style={styles.radioInner} />}
                            </View>
                            <View>
                                <Text style={[styles.paymentMethodName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Credit/Debit Card
                                </Text>
                                <Text style={styles.paymentMethodDesc}>Visa, Mastercard, Amex</Text>
                            </View>
                        </View>
                        <Ionicons name="card" size={24} color={colors.primary[500]} />
                    </TouchableOpacity>

                    {paymentMethod === 'card' && (
                        <View style={styles.paymentDetails}>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50],
                                        color: isDark ? colors.text.dark : colors.text.light
                                    }
                                ]}
                                placeholder="Card Number"
                                placeholderTextColor={colors.neutral[400]}
                                value={cardNumber}
                                onChangeText={setCardNumber}
                                keyboardType="numeric"
                            />
                            <View style={styles.row}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.halfInput,
                                        {
                                            backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50],
                                            color: isDark ? colors.text.dark : colors.text.light
                                        }
                                    ]}
                                    placeholder="MM/YY"
                                    placeholderTextColor={colors.neutral[400]}
                                    value={expiryDate}
                                    onChangeText={setExpiryDate}
                                    keyboardType="numeric"
                                />
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.halfInput,
                                        {
                                            backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50],
                                            color: isDark ? colors.text.dark : colors.text.light
                                        }
                                    ]}
                                    placeholder="CVV"
                                    placeholderTextColor={colors.neutral[400]}
                                    value={cvv}
                                    onChangeText={setCvv}
                                    keyboardType="numeric"
                                    maxLength={3}
                                />
                            </View>
                        </View>
                    )}
                </View>

                {/* Terms */}
                <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50] }]}>
                    <View style={styles.termsHeader}>
                        <Ionicons name="shield-checkmark" size={20} color={colors.primary[500]} />
                        <Text style={[styles.termsTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Secure Payment
                        </Text>
                    </View>
                    <Text style={styles.termsText}>
                        Your payment will be held securely in escrow until the viewing is completed.
                        By proceeding, you agree to our Terms of Service and Cancellation Policy.
                    </Text>
                </View>
            </ScrollView>

            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.payButton,
                        { backgroundColor: (!paymentMethod || processing) ? colors.neutral[300] : colors.primary[500] }
                    ]}
                    onPress={handlePayment}
                    disabled={!paymentMethod || processing}
                >
                    {processing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.payButtonText}>Pay KES {total.toLocaleString()}</Text>
                    )}
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
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
    propertyDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    propertyTitle: {
        ...typography.bodySemiBold,
        fontSize: 15,
        marginBottom: 4,
    },
    propertyMeta: {
        ...typography.caption,
        color: colors.neutral[500],
        marginBottom: 2,
    },
    packageName: {
        ...typography.caption,
        color: colors.primary[500],
        fontWeight: 'bold',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    priceLabel: {
        ...typography.body,
    },
    priceValue: {
        ...typography.bodySemiBold,
    },
    divider: {
        height: 1,
        marginVertical: spacing.md,
    },
    totalLabel: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    totalValue: {
        ...typography.h3,
        fontSize: 20,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        marginBottom: spacing.md,
    },
    selectedPayment: {
        backgroundColor: colors.primary[50],
    },
    paymentOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.neutral[300],
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: colors.primary[500],
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary[500],
    },
    paymentMethodName: {
        ...typography.bodySemiBold,
        fontSize: 15,
        marginBottom: 2,
    },
    paymentMethodDesc: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    paymentDetails: {
        marginBottom: spacing.md,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        ...typography.body,
        marginBottom: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    halfInput: {
        flex: 1,
    },
    termsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    termsTitle: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    termsText: {
        ...typography.caption,
        color: colors.neutral[600],
        lineHeight: 18,
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    payButton: {
        height: 52,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    payButtonText: {
        ...typography.bodySemiBold,
        fontSize: 16,
        color: 'white',
    },
});

export default CheckoutScreen;
