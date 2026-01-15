import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

type PaymentMethod = 'mpesa' | 'bank';

const PayoutSettingsScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
    const [autoWithdraw, setAutoWithdraw] = useState(false);
    const [minimumBalance, setMinimumBalance] = useState('5000');

    // M-Pesa settings
    const [mpesaNumber, setMpesaNumber] = useState('+254 712 345 678');
    const [mpesaName, setMpesaName] = useState('John Kamau');

    // Bank settings
    const [bankName, setBankName] = useState('Equity Bank');
    const [accountNumber, setAccountNumber] = useState('1234567890');
    const [accountName, setAccountName] = useState('John Kamau');
    const [branchCode, setBranchCode] = useState('068');

    // Mock earnings data
    const earnings = {
        available: 12500,
        pending: 3500,
        totalEarned: 156000,
        lastPayout: {
            amount: 15000,
            date: '2025-01-01',
            method: 'M-Pesa',
        },
    };

    const handleSave = () => {
        Alert.alert('Success', 'Payout settings saved successfully!');
    };

    const handleWithdraw = () => {
        if (earnings.available < parseInt(minimumBalance)) {
            Alert.alert(
                'Insufficient Balance',
                `Minimum withdrawal amount is KES ${minimumBalance}`
            );
            return;
        }

        Alert.alert(
            'Confirm Withdrawal',
            `Withdraw KES ${earnings.available.toLocaleString()} to ${paymentMethod === 'mpesa' ? mpesaNumber : `${bankName} ${accountNumber}`}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Withdraw',
                    onPress: () => {
                        Alert.alert('Success', 'Withdrawal request submitted! Funds will be credited within 1-2 business days.');
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Payout Settings
                </Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={[styles.saveText, { color: colors.primary[500] }]}>Save</Text>
                </TouchableOpacity>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Balance Card */}
                <View style={[styles.balanceCard, { backgroundColor: colors.primary[500] }]}>
                    <Text style={styles.balanceLabel}>Available Balance</Text>
                    <Text style={styles.balanceAmount}>KES {earnings.available.toLocaleString()}</Text>
                    <View style={styles.balanceRow}>
                        <View style={styles.balanceItem}>
                            <Text style={styles.balanceSubLabel}>Pending</Text>
                            <Text style={styles.balanceSubValue}>KES {earnings.pending.toLocaleString()}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.withdrawButton}
                            onPress={handleWithdraw}
                        >
                            <Text style={styles.withdrawButtonText}>Withdraw</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Last Payout */}
                {earnings.lastPayout && (
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50] }]}>
                        <View style={styles.lastPayoutHeader}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                            <Text style={[styles.lastPayoutTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Last Payout
                            </Text>
                        </View>
                        <Text style={styles.lastPayoutAmount}>
                            KES {earnings.lastPayout.amount.toLocaleString()}
                        </Text>
                        <Text style={styles.lastPayoutDetails}>
                            {earnings.lastPayout.date} • {earnings.lastPayout.method}
                        </Text>
                    </View>
                )}

                {/* Payment Method Selection */}
                <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Preferred Payment Method
                    </Text>
                    <View style={styles.methodButtons}>
                        <TouchableOpacity
                            style={[
                                styles.methodButton,
                                paymentMethod === 'mpesa' && styles.methodButtonActive,
                                { borderColor: paymentMethod === 'mpesa' ? colors.primary[500] : colors.neutral[200] }
                            ]}
                            onPress={() => setPaymentMethod('mpesa')}
                        >
                            <Ionicons
                                name="phone-portrait"
                                size={24}
                                color={paymentMethod === 'mpesa' ? colors.primary[500] : colors.neutral[500]}
                            />
                            <Text style={[
                                styles.methodText,
                                { color: paymentMethod === 'mpesa' ? colors.primary[500] : (isDark ? colors.text.dark : colors.text.light) }
                            ]}>
                                M-Pesa
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.methodButton,
                                paymentMethod === 'bank' && styles.methodButtonActive,
                                { borderColor: paymentMethod === 'bank' ? colors.primary[500] : colors.neutral[200] }
                            ]}
                            onPress={() => setPaymentMethod('bank')}
                        >
                            <Ionicons
                                name="business"
                                size={24}
                                color={paymentMethod === 'bank' ? colors.primary[500] : colors.neutral[500]}
                            />
                            <Text style={[
                                styles.methodText,
                                { color: paymentMethod === 'bank' ? colors.primary[500] : (isDark ? colors.text.dark : colors.text.light) }
                            ]}>
                                Bank Transfer
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* M-Pesa Details */}
                {paymentMethod === 'mpesa' && (
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            M-Pesa Details
                        </Text>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Phone Number
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                value={mpesaNumber}
                                onChangeText={setMpesaNumber}
                                placeholder="+254 7XX XXX XXX"
                                placeholderTextColor={colors.neutral[400]}
                                keyboardType="phone-pad"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Account Name
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                value={mpesaName}
                                onChangeText={setMpesaName}
                                placeholder="Name on M-Pesa account"
                                placeholderTextColor={colors.neutral[400]}
                            />
                        </View>
                    </View>
                )}

                {/* Bank Details */}
                {paymentMethod === 'bank' && (
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Bank Account Details
                        </Text>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Bank Name
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                value={bankName}
                                onChangeText={setBankName}
                                placeholder="e.g., Equity Bank"
                                placeholderTextColor={colors.neutral[400]}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Account Number
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                value={accountNumber}
                                onChangeText={setAccountNumber}
                                placeholder="1234567890"
                                placeholderTextColor={colors.neutral[400]}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Account Name
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                value={accountName}
                                onChangeText={setAccountName}
                                placeholder="Name on account"
                                placeholderTextColor={colors.neutral[400]}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Branch Code
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                value={branchCode}
                                onChangeText={setBranchCode}
                                placeholder="068"
                                placeholderTextColor={colors.neutral[400]}
                            />
                        </View>
                    </View>
                )}

                {/* Auto-Withdrawal Settings */}
                <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Automatic Withdrawal
                    </Text>
                    <View style={styles.switchRow}>
                        <View style={styles.switchInfo}>
                            <Text style={[styles.switchLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Enable Auto-Withdraw
                            </Text>
                            <Text style={styles.switchDescription}>
                                Automatically withdraw when balance reaches minimum
                            </Text>
                        </View>
                        <Switch
                            value={autoWithdraw}
                            onValueChange={setAutoWithdraw}
                            trackColor={{ false: colors.neutral[300], true: colors.primary[300] }}
                            thumbColor={autoWithdraw ? colors.primary[500] : colors.neutral[100]}
                        />
                    </View>

                    {autoWithdraw && (
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Minimum Balance (KES)
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                value={minimumBalance}
                                onChangeText={setMinimumBalance}
                                placeholder="5000"
                                placeholderTextColor={colors.neutral[400]}
                                keyboardType="numeric"
                            />
                        </View>
                    )}
                </View>

                {/* Processing Info */}
                <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                    <View style={styles.infoHeader}>
                        <Ionicons name="time-outline" size={20} color={colors.primary[500]} />
                        <Text style={[styles.infoTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Processing Times
                        </Text>
                    </View>
                    <Text style={styles.infoText}>
                        • M-Pesa: Instant to 1 hour{'\n'}
                        • Bank Transfer: 1-2 business days{'\n'}
                        • Minimum withdrawal: KES 1,000{'\n'}
                        • No withdrawal fees
                    </Text>
                </View>
            </ScrollView>
        </View>
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
    saveText: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    content: {
        paddingBottom: spacing.xxl,
    },
    balanceCard: {
        margin: spacing.lg,
        padding: spacing.xl,
        borderRadius: borderRadius.xl,
    },
    balanceLabel: {
        ...typography.body,
        color: 'white',
        opacity: 0.9,
        marginBottom: spacing.xs,
    },
    balanceAmount: {
        ...typography.h1,
        fontSize: 36,
        color: 'white',
        marginBottom: spacing.lg,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    balanceItem: {},
    balanceSubLabel: {
        ...typography.caption,
        color: 'white',
        opacity: 0.8,
    },
    balanceSubValue: {
        ...typography.bodySemiBold,
        color: 'white',
        fontSize: 16,
    },
    withdrawButton: {
        backgroundColor: 'white',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    withdrawButtonText: {
        ...typography.bodySemiBold,
        color: colors.primary[500],
    },
    card: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
    },
    lastPayoutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    lastPayoutTitle: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    lastPayoutAmount: {
        ...typography.h3,
        fontSize: 20,
        color: colors.success,
        marginBottom: spacing.xs,
    },
    lastPayoutDetails: {
        ...typography.caption,
        color: colors.neutral[600],
    },
    sectionTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.md,
    },
    methodButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    methodButton: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        alignItems: 'center',
        gap: spacing.xs,
    },
    methodButtonActive: {
        backgroundColor: colors.primary[50],
    },
    methodText: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        ...typography.bodySemiBold,
        fontSize: 14,
        marginBottom: spacing.sm,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        ...typography.body,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    switchInfo: {
        flex: 1,
    },
    switchLabel: {
        ...typography.bodySemiBold,
        fontSize: 15,
        marginBottom: 2,
    },
    switchDescription: {
        ...typography.caption,
        color: colors.neutral[600],
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    infoTitle: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    infoText: {
        ...typography.caption,
        color: colors.neutral[600],
        lineHeight: 20,
    },
});

export default PayoutSettingsScreen;
