import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useWallet } from '../../contexts/WalletContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface WalletBalanceProps {
    onPress?: () => void;
    variant?: 'default' | 'compact';
}

export default function WalletBalance({ onPress, variant = 'default' }: WalletBalanceProps) {
    const { isDark } = useTheme();
    const { balance, loading } = useWallet();

    const formatCurrency = (amount: number) => {
        return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    if (variant === 'compact') {
        return (
            <TouchableOpacity onPress={onPress} style={styles.compactContainer}>
                <Ionicons name="wallet-outline" size={18} color={colors.primary[500]} />
                <Text style={[styles.compactBalance, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    {loading ? '...' : formatCurrency(balance)}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.container,
                { backgroundColor: isDark ? colors.neutral[800] : 'white' },
            ]}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="wallet" size={24} color={colors.primary[500]} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.label, { color: colors.neutral[500] }]}>
                    Wallet Balance
                </Text>
                <Text style={[styles.balance, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    {loading ? 'Loading...' : formatCurrency(balance)}
                </Text>
            </View>
            <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.neutral[500]}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    content: {
        flex: 1,
    },
    label: {
        ...typography.body,
        fontSize: 14,
        marginBottom: 4,
    },
    balance: {
        ...typography.h3,
        fontSize: 20,
        fontWeight: '700',
    },
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    compactBalance: {
        ...typography.body,
        fontSize: 14,
        fontWeight: '600',
    },
});
