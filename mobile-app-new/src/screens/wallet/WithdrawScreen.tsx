import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useWallet } from '../../contexts/WalletContext';
import { ProfileStackParamList } from '../../types/navigation';
import { colors, spacing, typography, borderRadius } from '../../theme';

type Props = StackScreenProps<ProfileStackParamList, 'Withdraw'>;

export default function WithdrawScreen({ navigation }: Props) {
    const { isDark } = useTheme();
    const { balance, withdraw, payoutSettings } = useWallet();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const MIN_WITHDRAWAL = 100;
    const MAX_WITHDRAWAL = 150000;

    const quickAmounts = [500, 1000, 2000, 5000];

    const handleWithdraw = async () => {
        const withdrawAmount = parseInt(amount);

        if (!amount || isNaN(withdrawAmount)) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        if (withdrawAmount < MIN_WITHDRAWAL) {
            Alert.alert('Amount Too Low', `Minimum withdrawal is KES ${MIN_WITHDRAWAL.toLocaleString()}`);
            return;
        }

        if (withdrawAmount > MAX_WITHDRAWAL) {
            Alert.alert('Amount Too High', `Maximum withdrawal is KES ${MAX_WITHDRAWAL.toLocaleString()}`);
            return;
        }

        if (withdrawAmount > balance) {
            Alert.alert('Insufficient Balance', 'You don\'t have enough balance to withdraw this amount');
            return;
        }

        if (!payoutSettings?.mpesaNumber) {
            Alert.alert('No Payout Method', 'Please set up your M-Pesa number in payout settings first', [
                {
                    text: 'Set Up Now',
                    onPress: () => navigation.navigate('Wallet' as any),
                },
                { text: 'Cancel', style: 'cancel' },
            ]);
            return;
        }

        Alert.alert(
            'Confirm Withdrawal',
            `Withdraw KES ${withdrawAmount.toLocaleString()} to M-Pesa ${payoutSettings.mpesaNumber}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setLoading(true);
                        const success = await withdraw(withdrawAmount);
                        setLoading(false);

                        if (success) {
                            Alert.alert(
                                'Withdrawal Successful',
                                `KES ${withdrawAmount.toLocaleString()} has been sent to your M-Pesa number. You will receive a confirmation SMS shortly.`,
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => navigation.goBack(),
                                    },
                                ]
                            );
                        } else {
                            Alert.alert('Withdrawal Failed', 'Please try again later');
                        }
                    },
                },
            ]
        );
    };

    const handleQuickAmount = (quickAmount: number) => {
        if (quickAmount <= balance) {
            setAmount(quickAmount.toString());
        } else {
            Alert.alert('Insufficient Balance', 'You don\'t have enough balance for this amount');
        }
    };

    const handleMaxAmount = () => {
        const maxAllowed = Math.min(balance, MAX_WITHDRAWAL);
        setAmount(maxAllowed.toString());
    };

    const formatCurrency = (amount: number) => {
        return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            {/* Balance Card */}
            <View style={[styles.balanceCard, { backgroundColor: colors.primary[500] }]}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
            </View>

            {/* Amount Input */}
            <View style={[styles.section, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Withdrawal Amount</Text>

                <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                    <Text style={[styles.currency, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>KES</Text>
                    <TextInput
                        style={[styles.input, { color: isDark ? colors.text.dark : colors.text.light }]}
                        placeholder="0"
                        placeholderTextColor={isDark ? colors.text.dark : colors.neutral[500]}
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                        editable={!loading}
                    />
                    <TouchableOpacity onPress={handleMaxAmount} disabled={loading}>
                        <Text style={[styles.maxButton, { color: colors.primary[600] }]}>
                            MAX
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.helperText, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                    Min: {formatCurrency(MIN_WITHDRAWAL)} • Max: {formatCurrency(MAX_WITHDRAWAL)}
                </Text>

                {/* Quick Amount Buttons */}
                <View style={styles.quickAmounts}>
                    {quickAmounts.map((quickAmount) => (
                        <TouchableOpacity
                            key={quickAmount}
                            style={[
                                styles.quickButton,
                                { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.primary[300] },
                            ]}
                            onPress={() => handleQuickAmount(quickAmount)}
                            disabled={loading}
                        >
                            <Text style={[styles.quickButtonText, { color: colors.primary[700] }]}>
                                {quickAmount.toLocaleString()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Payout Details */}
            <View style={[styles.section, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Payout Method</Text>

                {payoutSettings ? (
                    <View style={styles.payoutInfo}>
                        <View style={[styles.payoutIcon, { backgroundColor: colors.success[100] }]}>
                            <Ionicons name="phone-portrait" size={24} color={colors.success[600]} />
                        </View>
                        <View style={styles.payoutDetails}>
                            <Text style={[styles.payoutLabel, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                M-Pesa Number
                            </Text>
                            <Text style={[styles.payoutValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {payoutSettings.mpesaNumber}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Wallet' as any)}>
                            <Ionicons name="create-outline" size={20} color={colors.primary[500]} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.setupButton, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.primary[300] }]}
                        onPress={() => navigation.navigate('Wallet' as any)}
                    >
                        <Ionicons name="add-circle-outline" size={24} color={colors.primary[500]} />
                        <Text style={[styles.setupButtonText, { color: colors.primary[600] }]}>
                            Set Up Payout Method
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Info Box */}
            <View style={[styles.infoBox, { backgroundColor: colors.info[50] }]}>
                <Ionicons name="information-circle" size={20} color={colors.info[600]} />
                <View style={styles.infoContent}>
                    <Text style={[styles.infoTitle, { color: colors.info[900] }]}>
                        Processing Time
                    </Text>
                    <Text style={[styles.infoText, { color: colors.info[700] }]}>
                        Withdrawals are processed instantly. You will receive an M-Pesa confirmation SMS within 1-2 minutes.
                    </Text>
                </View>
            </View>

            {/* Withdraw Button */}
            <TouchableOpacity
                style={[
                    styles.withdrawButton,
                    { backgroundColor: loading ? colors.neutral[300] : colors.primary[500] },
                ]}
                onPress={handleWithdraw}
                disabled={loading}
            >
                {loading ? (
                    <Text style={styles.withdrawButtonText}>Processing...</Text>
                ) : (
                    <>
                        <Ionicons name="arrow-up-circle" size={20} color={colors.neutral[50]} />
                        <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
                    </>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    balanceCard: {
        padding: spacing.xl,
        margin: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    balanceLabel: {
        color: colors.primary[100],
        fontSize: 14,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    balanceAmount: {
        color: colors.neutral[50],
        fontSize: 36,
        fontWeight: '700',
    },
    section: {
        padding: spacing.md,
        margin: spacing.md,
        borderRadius: borderRadius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        ...typography.h3,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: spacing.md,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.primary[300],
    },
    currency: {
        fontSize: 20,
        fontWeight: '600',
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 28,
        fontWeight: '700',
    },
    maxButton: {
        fontSize: 15,
        fontWeight: '700',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    helperText: {
        fontSize: 13,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    quickAmounts: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    quickButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
    },
    quickButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    payoutInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    payoutIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    payoutDetails: {
        flex: 1,
    },
    payoutLabel: {
        fontSize: 13,
        marginBottom: 2,
    },
    payoutValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    setupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderStyle: 'dashed',
        gap: spacing.sm,
    },
    setupButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    infoBox: {
        flexDirection: 'row',
        padding: spacing.md,
        margin: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 18,
    },
    withdrawButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        margin: spacing.md,
        marginBottom: spacing.xl * 2,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    withdrawButtonText: {
        color: colors.neutral[50],
        fontSize: 18,
        fontWeight: '700',
    },
});
