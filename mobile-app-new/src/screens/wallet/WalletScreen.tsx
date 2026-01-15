import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useWallet } from '../../contexts/WalletContext';
import WalletBalance from '../../components/common/WalletBalance';
import { ProfileStackParamList } from '../../types/navigation';
import { colors, spacing, typography, borderRadius } from '../../theme';

type Props = StackScreenProps<ProfileStackParamList, 'Wallet'>;

export default function WalletScreen({ navigation }: Props) {
    const { isDark } = useTheme();
    const { balance, transactions, payoutSettings } = useWallet();
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payout'>('overview');

    const recentTransactions = transactions.slice(0, 5);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-KE', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'deposit': return 'arrow-down-circle';
            case 'withdrawal': return 'arrow-up-circle';
            case 'earning': return 'cash';
            case 'payment': return 'card';
            case 'refund': return 'refresh-circle';
            default: return 'swap-horizontal';
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'deposit':
            case 'earning':
            case 'refund':
                return colors.success[500];
            case 'withdrawal':
            case 'payment':
                return colors.error[500];
            default:
                return colors.neutral[500];
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Wallet
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            {/* Header Tabs */}
            <View style={[styles.tabs, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
                    onPress={() => setActiveTab('overview')}
                >
                    <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
                        Overview
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'transactions' && styles.tabActive]}
                    onPress={() => setActiveTab('transactions')}
                >
                    <Text style={[styles.tabText, activeTab === 'transactions' && styles.tabTextActive]}>
                        Transactions
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'payout' && styles.tabActive]}
                    onPress={() => setActiveTab('payout')}
                >
                    <Text style={[styles.tabText, activeTab === 'payout' && styles.tabTextActive]}>
                        Payout
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {activeTab === 'overview' && (
                    <View>
                        {/* Balance Card */}
                        <WalletBalance />

                        {/* Quick Actions */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Quick Actions</Text>
                            <View style={styles.actionsGrid}>
                                <TouchableOpacity
                                    style={[styles.actionCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                                    onPress={() => Alert.alert('Deposit', 'Deposit via M-Pesa')}
                                >
                                    <Ionicons name="add-circle" size={32} color={colors.primary[500]} />
                                    <Text style={[styles.actionText, { color: isDark ? colors.text.dark : colors.text.light }]}>Deposit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                                    onPress={() => navigation.navigate('Withdraw' as any)}
                                >
                                    <Ionicons name="arrow-up-circle" size={32} color={colors.success[500]} />
                                    <Text style={[styles.actionText, { color: isDark ? colors.text.dark : colors.text.light }]}>Withdraw</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                                    onPress={() => setActiveTab('transactions')}
                                >
                                    <Ionicons name="list" size={32} color={colors.info[500]} />
                                    <Text style={[styles.actionText, { color: isDark ? colors.text.dark : colors.text.light }]}>History</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                                    onPress={() => setActiveTab('payout')}
                                >
                                    <Ionicons name="settings" size={32} color={colors.neutral[500]} />
                                    <Text style={[styles.actionText, { color: isDark ? colors.text.dark : colors.text.light }]}>Settings</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Recent Transactions */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Recent Transactions</Text>
                                <TouchableOpacity onPress={() => setActiveTab('transactions')}>
                                    <Text style={[styles.link, { color: colors.primary[500] }]}>View All</Text>
                                </TouchableOpacity>
                            </View>

                            {recentTransactions.map((transaction) => (
                                <View key={transaction.id} style={[styles.transactionItem, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                    <View style={[styles.transactionIcon, { backgroundColor: `${getTransactionColor(transaction.type)}15` }]}>
                                        <Ionicons
                                            name={getTransactionIcon(transaction.type)}
                                            size={24}
                                            color={getTransactionColor(transaction.type)}
                                        />
                                    </View>
                                    <View style={styles.transactionContent}>
                                        <Text style={[styles.transactionTitle, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                                            {transaction.description}
                                        </Text>
                                        <Text style={[styles.transactionDate, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                            {formatDate(transaction.createdAt)}
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.transactionAmount,
                                            { color: getTransactionColor(transaction.type) },
                                        ]}
                                    >
                                        {['deposit', 'earning', 'refund'].includes(transaction.type) ? '+' : '-'}
                                        {formatCurrency(transaction.amount)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {activeTab === 'transactions' && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>All Transactions</Text>
                        {transactions.map((transaction) => (
                            <View key={transaction.id} style={[styles.transactionItem, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                <View style={[styles.transactionIcon, { backgroundColor: `${getTransactionColor(transaction.type)}15` }]}>
                                    <Ionicons
                                        name={getTransactionIcon(transaction.type)}
                                        size={24}
                                        color={getTransactionColor(transaction.type)}
                                    />
                                </View>
                                <View style={styles.transactionContent}>
                                    <Text style={[styles.transactionTitle, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                                        {transaction.description}
                                    </Text>
                                    <Text style={[styles.transactionDate, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                        {formatDate(transaction.createdAt)}
                                        {transaction.mpesaRef && ` • ${transaction.mpesaRef}`}
                                    </Text>
                                </View>
                                <View style={styles.transactionRight}>
                                    <Text
                                        style={[
                                            styles.transactionAmount,
                                            { color: getTransactionColor(transaction.type) },
                                        ]}
                                    >
                                        {['deposit', 'earning', 'refund'].includes(transaction.type) ? '+' : '-'}
                                        {formatCurrency(transaction.amount)}
                                    </Text>
                                    <View style={[styles.statusBadge, { backgroundColor: colors.success[100] }]}>
                                        <Text style={[styles.statusText, { color: colors.success[700] }]}>
                                            {transaction.status}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === 'payout' && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Payout Settings</Text>
                        <Text style={[styles.sectionDescription, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                            Configure how you receive your earnings
                        </Text>

                        {payoutSettings ? (
                            <View style={[styles.payoutCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                <View style={styles.payoutMethod}>
                                    <Ionicons name="phone-portrait" size={24} color={colors.success[500]} />
                                    <View style={styles.payoutContent}>
                                        <Text style={[styles.payoutLabel, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                            M-Pesa Number
                                        </Text>
                                        <Text style={[styles.payoutValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                            {payoutSettings.mpesaNumber}
                                        </Text>
                                    </View>
                                    <TouchableOpacity>
                                        <Ionicons name="create-outline" size={20} color={colors.primary[500]} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[styles.addPayoutButton, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                                onPress={() => Alert.alert('Add Payout Method', 'Add your M-Pesa number')}
                            >
                                <Ionicons name="add-circle-outline" size={24} color={colors.primary[500]} />
                                <Text style={[styles.addPayoutText, { color: colors.primary[500] }]}>
                                    Add Payout Method
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
        fontWeight: '700',
    },
    tabs: {
        flexDirection: 'row',
        padding: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        borderRadius: borderRadius.md,
    },
    tabActive: {
        backgroundColor: colors.primary[500],
    },
    tabText: {
        ...typography.body,
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[600],
    },
    tabTextActive: {
        color: 'white',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...typography.h3,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    sectionDescription: {
        ...typography.body,
        fontSize: 14,
        marginBottom: spacing.md,
    },
    link: {
        ...typography.body,
        fontSize: 14,
        fontWeight: '600',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    actionCard: {
        width: '47%',
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    actionText: {
        ...typography.body,
        fontSize: 14,
        fontWeight: '600',
        marginTop: spacing.sm,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
    },
    transactionIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    transactionContent: {
        flex: 1,
    },
    transactionTitle: {
        ...typography.body,
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    transactionDate: {
        ...typography.body,
        fontSize: 13,
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        ...typography.body,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    payoutCard: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    payoutMethod: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    payoutContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    payoutLabel: {
        ...typography.body,
        fontSize: 13,
        marginBottom: 2,
    },
    payoutValue: {
        ...typography.body,
        fontSize: 16,
        fontWeight: '600',
    },
    addPayoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
        borderWidth: 2,
        borderColor: colors.primary[200],
        borderStyle: 'dashed',
    },
    addPayoutText: {
        ...typography.body,
        fontSize: 15,
        fontWeight: '600',
    },
});
