import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

type TransactionType = 'booking_payment' | 'refund' | 'payout' | 'service_fee';
type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';

interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    status: TransactionStatus;
    date: string;
    description: string;
    relatedTo?: string;
    paymentMethod?: string;
    transactionId?: string;
}

const PaymentHistoryScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const [filter, setFilter] = useState<'all' | TransactionType>('all');

    // Mock transaction data
    const allTransactions: Transaction[] = [
        {
            id: '1',
            type: 'booking_payment',
            amount: 2500,
            status: 'completed',
            date: '2025-01-05',
            description: 'Payment for viewing - Modern 2-Bedroom Apartment',
            relatedTo: 'Booking #B001',
            paymentMethod: 'M-Pesa',
            transactionId: 'MP2501051234',
        },
        {
            id: '2',
            type: 'payout',
            amount: 12500,
            status: 'completed',
            date: '2025-01-03',
            description: 'Weekly payout for 5 viewings',
            paymentMethod: 'M-Pesa',
            transactionId: 'MP2501035678',
        },
        {
            id: '3',
            type: 'booking_payment',
            amount: 3000,
            status: 'pending',
            date: '2025-01-06',
            description: 'Payment for viewing - Spacious 3-Bedroom Villa',
            relatedTo: 'Booking #B002',
            paymentMethod: 'Card',
        },
        {
            id: '4',
            type: 'refund',
            amount: 2500,
            status: 'completed',
            date: '2024-12-28',
            description: 'Refund for cancelled booking',
            relatedTo: 'Booking #B003',
            transactionId: 'RF2412281234',
        },
        {
            id: '5',
            type: 'service_fee',
            amount: -250,
            status: 'completed',
            date: '2025-01-05',
            description: 'Platform service fee',
            relatedTo: 'Booking #B001',
        },
    ];

    const transactions = filter === 'all'
        ? allTransactions
        : allTransactions.filter(t => t.type === filter);

    const getTypeIcon = (type: TransactionType) => {
        switch (type) {
            case 'booking_payment': return 'calendar';
            case 'refund': return 'return-up-back';
            case 'payout': return 'wallet';
            case 'service_fee': return 'pricetag';
        }
    };

    const getTypeLabel = (type: TransactionType) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const getStatusColor = (status: TransactionStatus) => {
        switch (status) {
            case 'completed': return colors.success;
            case 'pending': return colors.warning;
            case 'failed': return colors.error;
            case 'refunded': return colors.neutral[500];
        }
    };

    const getTotalAmount = () => {
        return transactions.reduce((sum, t) => sum + t.amount, 0);
    };

    const filterButtons = [
        { id: 'all', label: 'All' },
        { id: 'booking_payment', label: 'Payments' },
        { id: 'payout', label: 'Payouts' },
        { id: 'refund', label: 'Refunds' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Payment History
                </Text>
                <TouchableOpacity>
                    <Ionicons name="download-outline" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: colors.primary[500] }]}>
                <Text style={styles.summaryLabel}>Total {filter === 'all' ? 'Balance' : getTypeLabel(filter as TransactionType)}</Text>
                <Text style={styles.summaryAmount}>
                    {getTotalAmount() >= 0 ? '+' : ''}KES {getTotalAmount().toLocaleString()}
                </Text>
                <Text style={styles.summarySubtext}>{transactions.length} transactions</Text>
            </View>

            {/* Filter Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
            >
                {filterButtons.map(btn => (
                    <TouchableOpacity
                        key={btn.id}
                        style={[
                            styles.filterButton,
                            filter === btn.id && styles.filterButtonActive
                        ]}
                        onPress={() => setFilter(btn.id as any)}
                    >
                        <Text style={[
                            styles.filterText,
                            filter === btn.id && styles.filterTextActive,
                            { color: filter === btn.id ? colors.primary[500] : colors.neutral[500] }
                        ]}>
                            {btn.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {transactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={64} color={colors.neutral[300]} />
                        <Text style={[styles.emptyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            No Transactions
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {filter === 'all' ? "You haven't made any transactions yet" : `No ${getTypeLabel(filter as TransactionType).toLowerCase()}`}
                        </Text>
                    </View>
                ) : (
                    transactions.map(transaction => (
                        <TouchableOpacity
                            key={transaction.id}
                            style={[styles.transactionCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: colors.primary[100] }]}>
                                <Ionicons name={getTypeIcon(transaction.type) as any} size={24} color={colors.primary[500]} />
                            </View>

                            <View style={styles.transactionInfo}>
                                <View style={styles.transactionHeader}>
                                    <Text style={[styles.transactionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        {getTypeLabel(transaction.type)}
                                    </Text>
                                    <Text style={[
                                        styles.transactionAmount,
                                        { color: transaction.amount >= 0 ? colors.success : colors.error }
                                    ]}>
                                        {transaction.amount >= 0 ? '+' : ''}KES {Math.abs(transaction.amount).toLocaleString()}
                                    </Text>
                                </View>

                                <Text style={styles.transactionDescription}>{transaction.description}</Text>

                                {transaction.relatedTo && (
                                    <View style={styles.relatedInfo}>
                                        <Ionicons name="link-outline" size={14} color={colors.neutral[500]} />
                                        <Text style={styles.relatedText}>{transaction.relatedTo}</Text>
                                    </View>
                                )}

                                <View style={styles.transactionFooter}>
                                    <View style={styles.dateInfo}>
                                        <Ionicons name="calendar-outline" size={14} color={colors.neutral[500]} />
                                        <Text style={styles.dateText}>{transaction.date}</Text>
                                    </View>

                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) + '20' }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                                            {transaction.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                {transaction.transactionId && (
                                    <View style={styles.transactionIdRow}>
                                        <Text style={styles.transactionIdLabel}>Transaction ID:</Text>
                                        <Text style={styles.transactionId}>{transaction.transactionId}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                )}
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
    summaryCard: {
        margin: spacing.lg,
        padding: spacing.xl,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
    },
    summaryLabel: {
        ...typography.body,
        color: 'white',
        opacity: 0.9,
        marginBottom: spacing.xs,
    },
    summaryAmount: {
        ...typography.h1,
        fontSize: 36,
        color: 'white',
        marginBottom: spacing.xs,
    },
    summarySubtext: {
        ...typography.caption,
        color: 'white',
        opacity: 0.8,
    },
    filterContainer: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    filterButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
    },
    filterButtonActive: {
        backgroundColor: colors.primary[100],
    },
    filterText: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    filterTextActive: {
        fontWeight: '700',
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    transactionCard: {
        flexDirection: 'row',
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xs,
    },
    transactionTitle: {
        ...typography.bodySemiBold,
        fontSize: 15,
        flex: 1,
    },
    transactionAmount: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    transactionDescription: {
        ...typography.caption,
        color: colors.neutral[600],
        marginBottom: spacing.xs,
    },
    relatedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: spacing.sm,
    },
    relatedText: {
        ...typography.caption,
        color: colors.neutral[500],
        fontSize: 12,
    },
    transactionFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        ...typography.caption,
        color: colors.neutral[500],
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        ...typography.caption,
        fontSize: 10,
        fontWeight: '700',
    },
    transactionIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
        paddingTop: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    transactionIdLabel: {
        ...typography.caption,
        color: colors.neutral[500],
        fontSize: 11,
    },
    transactionId: {
        ...typography.caption,
        color: colors.neutral[600],
        fontSize: 11,
        fontFamily: 'monospace',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxxl,
    },
    emptyTitle: {
        ...typography.h3,
        marginTop: spacing.md,
    },
    emptySubtext: {
        ...typography.body,
        color: colors.neutral[500],
        textAlign: 'center',
        marginTop: spacing.xs,
    },
});

export default PaymentHistoryScreen;
