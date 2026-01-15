import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Notification } from '../../data/types';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface NotificationItemProps {
    notification: Notification;
    onPress: () => void;
    onDelete?: () => void;
}

export default function NotificationItem({ notification, onPress, onDelete }: NotificationItemProps) {
    const { isDark } = useTheme();
    const { markAsRead } = useNotifications();

    const handlePress = () => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        onPress();
    };

    const getIcon = () => {
        switch (notification.type) {
            case 'booking_confirmed':
                return 'calendar';
            case 'booking_cancelled':
                return 'close-circle';
            case 'payment_received':
                return 'cash';
            case 'payment_pending':
                return 'time';
            case 'review_received':
                return 'star';
            case 'message_received':
                return 'chatbubble';
            case 'dispute_filed':
                return 'alert-circle';
            default:
                return 'notifications';
        }
    };

    const getIconColor = () => {
        switch (notification.type) {
            case 'booking_confirmed':
            case 'payment_received':
                return colors.success[500];
            case 'booking_cancelled':
            case 'dispute_filed':
                return colors.error[500];
            case 'payment_pending':
                return colors.warning[500];
            default:
                return colors.primary[500];
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[
                styles.container,
                { backgroundColor: isDark ? colors.neutral[800] : 'white' },
                !notification.read && styles.unread,
            ]}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}15` }]}>
                <Ionicons name={getIcon()} size={24} color={getIconColor()} />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                        {notification.title}
                    </Text>
                    <Text style={[styles.time, { color: colors.neutral[500] }]}>
                        {formatTime(notification.createdAt)}
                    </Text>
                </View>
                <Text style={[styles.message, { color: colors.neutral[500] }]} numberOfLines={2}>
                    {notification.message}
                </Text>
            </View>

            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                <Ionicons name="close" size={20} color={colors.neutral[500]} />
            </TouchableOpacity>

            {!notification.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        position: 'relative',
    },
    unread: {
        borderLeftWidth: 3,
        borderLeftColor: colors.primary[500],
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    title: {
        ...typography.body,
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    time: {
        fontSize: 12,
        marginLeft: spacing.sm,
    },
    message: {
        ...typography.body,
        fontSize: 14,
    },
    deleteButton: {
        padding: spacing.xs,
        marginLeft: spacing.sm,
    },
    unreadDot: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        width: 8,
        height: 8,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary[500],
    },
});
