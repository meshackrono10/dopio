import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import Card from './Card';
import Button from './Button';

interface WalletCardProps {
    balance: number;
    escrow: number;
    pending: number;
    onDeposit?: () => void;
    onWithdraw?: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ balance, escrow, pending, onDeposit, onWithdraw }) => {
    const { isDark } = useTheme();

    return (
        <Card style={[styles.container, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.label, { color: colors.neutral[500] }]}>Available Balance</Text>
                    <Text style={[styles.balance, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        KES {balance.toLocaleString()}
                    </Text>
                </View>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary[600] + '20' }]}>
                    <Ionicons name="wallet" size={24} color={colors.primary[600]} />
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.neutral[500] }]}>In Escrow</Text>
                    <Text style={[styles.statValue, { color: colors.secondary[500] }]}>
                        KES {escrow.toLocaleString()}
                    </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.neutral[500] }]}>Pending</Text>
                    <Text style={[styles.statValue, { color: colors.warning }]}>
                        KES {pending.toLocaleString()}
                    </Text>
                </View>
            </View>

            <View style={styles.actions}>
                <Button variant="outline" size="sm" style={{ flex: 1 }} onPress={onDeposit || (() => { })}>Deposit</Button>
                <Button size="sm" style={{ flex: 1 }} onPress={onWithdraw || (() => { })}>Withdraw</Button>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
    },
    label: {
        ...typography.caption,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    balance: {
        ...typography.h1,
        fontWeight: '800',
        marginTop: 4,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        ...typography.caption,
        fontWeight: '500',
    },
    statValue: {
        ...typography.body,
        fontWeight: '700',
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 30,
        marginHorizontal: spacing.lg,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
});

export default WalletCard;
