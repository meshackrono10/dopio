import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

type RefundRequestParams = {
    RefundRequest: {
        bookingId: string;
    };
};

const REFUND_REASONS = [
    'Booking cancelled by hunter',
    'Property not as described',
    'Hunter no-show',
    'Safety concerns',
    'Duplicate payment',
    'Other',
];

const RefundRequestScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RefundRequestParams, 'RefundRequest'>>();

    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [refundAmount, setRefundAmount] = useState('');

    // Mock booking data
    const booking = {
        id: route.params?.bookingId || '1',
        propertyTitle: 'Modern 2-Bedroom Apartment',
        amount: 2500,
        date: '2025-01-15',
        hunterName: 'John Kamau',
    };

    const handleSubmit = () => {
        if (!selectedReason) {
            Alert.alert('Required', 'Please select a refund reason');
            return;
        }
        if (!refundAmount) {
            Alert.alert('Required', 'Please enter the refund amount');
            return;
        }

        Alert.alert(
            'Refund Request Submitted',
            `Your refund request for KES ${refundAmount} has been submitted and will be reviewed within 2-3 business days.`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

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
                        Request Refund
                    </Text>
                    <View style={{ width: 24 }} />
                </SafeAreaView>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Booking Info */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Booking Information
                        </Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Property:</Text>
                            <Text style={[styles.infoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {booking.propertyTitle}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Hunter:</Text>
                            <Text style={[styles.infoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {booking.hunterName}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Date:</Text>
                            <Text style={[styles.infoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {booking.date}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Amount Paid:</Text>
                            <Text style={[styles.infoValue, { color: colors.success, fontWeight: '700' }]}>
                                KES {booking.amount.toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    {/* Refund Amount */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Refund Amount *
                        </Text>
                        <View style={styles.amountContainer}>
                            <Text style={styles.currencyLabel}>KES</Text>
                            <TextInput
                                style={[styles.amountInput, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                value={refundAmount}
                                onChangeText={setRefundAmount}
                                placeholder={booking.amount.toString()}
                                placeholderTextColor={colors.neutral[400]}
                                keyboardType="numeric"
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.fullAmountButton}
                            onPress={() => setRefundAmount(booking.amount.toString())}
                        >
                            <Text style={[styles.fullAmountText, { color: colors.primary[500] }]}>
                                Request full amount
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Refund Reason */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Reason for Refund *
                        </Text>
                        {REFUND_REASONS.map(reason => (
                            <TouchableOpacity
                                key={reason}
                                style={[
                                    styles.reasonOption,
                                    selectedReason === reason && styles.reasonOptionActive,
                                    { borderColor: selectedReason === reason ? colors.primary[500] : colors.neutral[200] }
                                ]}
                                onPress={() => setSelectedReason(reason)}
                            >
                                <Ionicons
                                    name={selectedReason === reason ? 'radio-button-on' : 'radio-button-off'}
                                    size={20}
                                    color={selectedReason === reason ? colors.primary[500] : colors.neutral[400]}
                                />
                                <Text style={[
                                    styles.reasonText,
                                    { color: selectedReason === reason ? colors.primary[500] : (isDark ? colors.text.dark : colors.text.light) }
                                ]}>
                                    {reason}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Additional Details */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Additional Details
                        </Text>
                        <TextInput
                            style={[
                                styles.textArea,
                                { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }
                            ]}
                            value={additionalDetails}
                            onChangeText={setAdditionalDetails}
                            placeholder="Please provide any additional information..."
                            placeholderTextColor={colors.neutral[400]}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Refund Policy */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50] }]}>
                        <View style={styles.policyHeader}>
                            <Ionicons name="information-circle" size={20} color={colors.primary[500]} />
                            <Text style={[styles.policyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Refund Policy
                            </Text>
                        </View>
                        <Text style={styles.policyText}>
                            • Refunds are processed within 5-7 business days{'\n'}
                            • You'll receive email confirmation once approved{'\n'}
                            • Refunds are credited to original payment method{'\n'}
                            • Full refund available if cancelled 24hrs before viewing{'\n'}
                            • 50% refund if cancelled  within 24hrs
                        </Text>
                    </View>
                </ScrollView>

                <SafeAreaView edges={['bottom']} style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: (!selectedReason || !refundAmount) ? colors.neutral[300] : colors.primary[500] }
                        ]}
                        onPress={handleSubmit}
                        disabled={!selectedReason || !refundAmount}
                    >
                        <Text style={styles.submitButtonText}>Submit Refund Request</Text>
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
    sectionTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
    },
    infoLabel: {
        ...typography.body,
        color: colors.neutral[600],
    },
    infoValue: {
        ...typography.bodySemiBold,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    currencyLabel: {
        ...typography.bodySemiBold,
        fontSize: 18,
        color: colors.neutral[600],
    },
    amountInput: {
        flex: 1,
        height: 52,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        ...typography.h3,
        fontSize: 20,
    },
    fullAmountButton: {
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    fullAmountText: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    reasonOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        marginBottom: spacing.sm,
    },
    reasonOptionActive: {
        backgroundColor: colors.primary[50],
    },
    reasonText: {
        ...typography.body,
        flex: 1,
    },
    textArea: {
        height: 120,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        ...typography.body,
    },
    policyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    policyTitle: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    policyText: {
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

export default RefundRequestScreen;
