import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

export interface Bid {
    id: string;
    hunterId: string;
    hunterName: string;
    hunterRating: number;
    hunterAvatar?: string;
    price: number;
    timeframe: number;
    message?: string;
    createdAt: string;
    status: 'pending' | 'accepted' | 'rejected';
}

interface BidCardProps {
    bid: Bid;
    onAccept?: (bidId: string) => void;
    onReject?: (bidId: string) => void;
    onViewProfile?: (hunterId: string) => void;
    showActions?: boolean;
}

export default function BidCard({ bid, onAccept, onReject, onViewProfile, showActions = true }: BidCardProps) {
    const { isDark } = useTheme();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = () => {
        switch (bid.status) {
            case 'accepted': return colors.success[500];
            case 'rejected': return colors.error[500];
            default: return colors.warning[500];
        }
    };

    const getStatusText = () => {
        switch (bid.status) {
            case 'accepted': return 'Accepted';
            case 'rejected': return 'Rejected';
            default: return 'Pending';
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
            {/* Hunter Info */}
            <TouchableOpacity
                style={styles.header}
                onPress={() => onViewProfile?.(bid.hunterId)}
                disabled={!onViewProfile}
            >
                <View style={[styles.avatar, { backgroundColor: colors.primary[100] }]}>
                    <Ionicons name="person" size={24} color={colors.primary[600]} />
                </View>
                <View style={styles.hunterInfo}>
                    <Text style={[styles.hunterName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        {bid.hunterName}
                    </Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color={colors.warning[500]} />
                        <Text style={[styles.rating, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                            {bid.hunterRating.toFixed(1)}
                        </Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}15` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor() }]}>
                        {getStatusText()}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Bid Details */}
            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                        <Ionicons name="cash-outline" size={18} color={colors.primary[500]} />
                        <View>
                            <Text style={[styles.detailLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                                Service Fee
                            </Text>
                            <Text style={[styles.detailValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                KES {bid.price.toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={18} color={colors.info[500]} />
                        <View>
                            <Text style={[styles.detailLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                                Timeframe
                            </Text>
                            <Text style={[styles.detailValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {bid.timeframe} days
                            </Text>
                        </View>
                    </View>
                </View>

                {bid.message && (
                    <View style={[styles.messageContainer, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                        <Text style={[styles.messageLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                            Cover Message:
                        </Text>
                        <Text style={[styles.messageText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {bid.message}
                        </Text>
                    </View>
                )}

                <Text style={[styles.timestamp, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
                    Submitted {formatDate(bid.createdAt)}
                </Text>
            </View>

            {/* Actions */}
            {showActions && bid.status === 'pending' && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.rejectButton, { backgroundColor: colors.error[100], borderColor: colors.error[300] }]}
                        onPress={() => onReject?.(bid.id)}
                    >
                        <Ionicons name="close-circle-outline" size={20} color={colors.error[700]} />
                        <Text style={[styles.buttonText, { color: colors.error[700] }]}>
                            Reject
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.acceptButton, { backgroundColor: colors.success[500] }]}
                        onPress={() => onAccept?.(bid.id)}
                    >
                        <Ionicons name="checkmark-circle-outline" size={20} color={colors.neutral[50]} />
                        <Text style={[styles.buttonText, { color: colors.neutral[50] }]}>
                            Accept
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    hunterInfo: {
        flex: 1,
    },
    hunterName: {
        ...typography.body,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 13,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    details: {},
    detailRow: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginBottom: spacing.md,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    messageContainer: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    messageLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    timestamp: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    rejectButton: {
        borderWidth: 1,
    },
    acceptButton: {},
    buttonText: {
        fontSize: 15,
        fontWeight: '700',
    },
});
