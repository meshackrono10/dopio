import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

interface WalletCardProps {
    balance: number;
    onDeposit?: () => void;
    onWithdraw?: () => void;
    onViewHistory?: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({
    balance,
    onDeposit,
    onWithdraw,
    onViewHistory,
}) => {
    const { isDark } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.primary[600] }]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.label}>Available Balance</Text>
                    <Text style={styles.balance}>KES {balance.toLocaleString()}</Text>
                </View>
                <View style={styles.iconContainer}>
                    <Ionicons name="wallet" size={32} color="rgba(255, 255, 255, 0.3)" />
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={onDeposit}>
                    <View style={styles.actionIcon}>
                        <Ionicons name="add" size={20} color={colors.primary[600]} />
                    </View>
                    <Text style={styles.actionText}>Deposit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={onWithdraw}>
                    <View style={styles.actionIcon}>
                        <Ionicons name="arrow-up" size={20} color={colors.primary[600]} />
                    </View>
                    <Text style={styles.actionText}>Withdraw</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={onViewHistory}>
                    <View style={styles.actionIcon}>
                        <Ionicons name="list" size={20} color={colors.primary[600]} />
                    </View>
                    <Text style={styles.actionText}>History</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.xl,
        borderRadius: borderRadius.xl,
        ...shadows.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
    },
    label: {
        ...typography.body,
        color: 'white',
        opacity: 0.9,
        marginBottom: spacing.xs,
    },
    balance: {
        ...typography.h1,
        fontSize: 32,
        color: 'white',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    actionButton: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    actionIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        ...typography.bodySemiBold,
        fontSize: 12,
        color: 'white',
    },
});

export default WalletCard;
