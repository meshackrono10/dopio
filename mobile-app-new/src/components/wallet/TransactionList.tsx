import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useWallet, Transaction } from '../../contexts/WalletContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface TransactionListProps {
    transactions?: Transaction[];
    limit?: number;
    onViewAll?: () => void;
}

export default function TransactionList({ transactions: propTransactions, limit, onViewAll }: TransactionListProps) {
    const { isDark } = useTheme();
    const { transactions: contextTransactions } = useWallet();

    const transactions = propTransactions || contextTransactions;
    const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' });
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
            case 'commission': return 'pricetag';
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
            case 'commission':
                return colors.error[500];
            default:
                return colors.neutral[500];
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return colors.success[500];
            case 'failed': return colors.error[500];
            case 'pending': return colors.warning[500];
            default: return colors.neutral[500];
        }
    };

    if (displayTransactions.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <Ionicons name="receipt-outline" size={48} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
                <Text style={[styles.emptyText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    No transactions yet
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {displayTransactions.map((transaction) => (
                <View key={transaction.id} style={[styles.item, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <View style={[styles.iconContainer, { backgroundColor: `${getTransactionColor(transaction.type)}15` }]}>
                        <Ionicons
                            name={getTransactionIcon(transaction.type)}
                            size={24}
                            color={getTransactionColor(transaction.type)}
                        />
                    </View>

                    <View style={styles.content}>
                        <Text style={[styles.description, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                            {transaction.description}
                        </Text>
                        <View style={styles.details}>
                            <Text style={[styles.date, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                                {formatDate(transaction.createdAt)}
                            </Text>
                            {transaction.mpesaRef && (
                                <>
                                    <Text style={[styles.separator, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>•</Text>
                                    <Text style={[styles.reference, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                                        {transaction.mpesaRef}
                                    </Text>
                                </>
                            )}
                        </View>
                    </View>

                    <View style={styles.right}>
                        <Text
                            style={[
                                styles.amount,
                                { color: getTransactionColor(transaction.type) },
                            ]}
                        >
                            {['deposit', 'earning', 'refund'].includes(transaction.type) ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(transaction.status)}15` }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                                {transaction.status}
                            </Text>
                        </View>
                    </View>
                </View>
            ))}

            {limit && transactions.length > limit && onViewAll && (
                <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
                    <Text style={[styles.viewAllText, { color: colors.primary[600] }]}>
                        View All Transactions
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.primary[600]} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {},
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    content: {
        flex: 1,
    },
    description: {
        ...typography.body,
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    details: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    date: {
        fontSize: 13,
    },
    separator: {
        fontSize: 13,
        marginHorizontal: spacing.xs,
    },
    reference: {
        fontSize: 12,
        fontFamily: 'monospace',
    },
    right: {
        alignItems: 'flex-end',
    },
    amount: {
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
    emptyContainer: {
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    emptyText: {
        ...typography.body,
        fontSize: 15,
        marginTop: spacing.md,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        gap: spacing.xs,
    },
    viewAllText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
