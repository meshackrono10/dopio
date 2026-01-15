import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

interface Notification {
    id: string;
    type: 'booking' | 'payment' | 'review' | 'listing' | 'message' | 'system';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    icon: string;
    iconColor: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'booking',
        title: 'Booking Confirmed',
        message: 'Your viewing for Modern 2-Bedroom Apartment has been confirmed for Jan 15, 2025',
        timestamp: '2 hours ago',
        read: false,
        icon: 'calendar',
        iconColor: colors.success
    },
    {
        id: '2',
        type: 'payment',
        title: 'Payment Received',
        message: 'Your payment of KES 2,500 has been received and is being held in escrow',
        timestamp: '5 hours ago',
        read: false,
        icon: 'card',
        iconColor: colors.primary[500]
    },
    {
        id: '3',
        type: 'review',
        title: 'New Review',
        message: 'John Kamau left you a 5-star review',
        timestamp: '1 day ago',
        read: true,
        icon: 'star',
        iconColor: colors.warning
    },
    {
        id: '4',
        type: 'message',
        title: 'New Message',
        message: 'Mary Njeri sent you a message about the Westlands property',
        timestamp: '2 days ago',
        read: true,
        icon: 'chatbubble',
        iconColor: colors.primary[500]
    },
    {
        id: '5',
        type: 'listing',
        title: 'Listing Approved',
        message: 'Your property listing "Spacious Studio in Kilimani" has been approved',
        timestamp: '3 days ago',
        read: true,
        icon: 'checkmark-circle',
        iconColor: colors.success
    },
];

const NotificationsScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                !item.read && styles.unreadItem,
                { backgroundColor: isDark ? colors.neutral[800] : (item.read ? 'white' : colors.primary[50]) }
            ]}
            onPress={() => markAsRead(item.id)}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.iconColor + '20' }]}>
                <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
            </View>
            <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                    <Text style={[
                        styles.notificationTitle,
                        { color: isDark ? colors.text.dark : colors.text.light }
                    ]}>
                        {item.title}
                    </Text>
                    {!item.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={[styles.notificationMessage, { color: colors.neutral[600] }]}>
                    {item.message}
                </Text>
                <Text style={styles.notificationTime}>{item.timestamp}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Notifications
                    </Text>
                    <TouchableOpacity onPress={markAllAsRead}>
                        <Text style={[styles.markAllButton, { color: colors.primary[500] }]}>Mark all</Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
                        onPress={() => setFilter('all')}
                    >
                        <Text style={[
                            styles.filterText,
                            filter === 'all' && styles.activeFilterText,
                            { color: filter === 'all' ? colors.primary[500] : colors.neutral[500] }
                        ]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, filter === 'unread' && styles.activeFilterTab]}
                        onPress={() => setFilter('unread')}
                    >
                        <Text style={[
                            styles.filterText,
                            filter === 'unread' && styles.activeFilterText,
                            { color: filter === 'unread' ? colors.primary[500] : colors.neutral[500] }
                        ]}>
                            Unread {unreadCount > 0 && `(${unreadCount})`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <FlatList
                data={filteredNotifications}
                renderItem={renderNotification}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={64} color={colors.neutral[300]} />
                        <Text style={[styles.emptyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            No notifications
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet"}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
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
    markAllButton: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        gap: spacing.md,
    },
    filterTab: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
    },
    activeFilterTab: {
        backgroundColor: colors.primary[100],
    },
    filterText: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    activeFilterText: {
        fontWeight: '700',
    },
    list: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    unreadItem: {
        borderWidth: 1,
        borderColor: colors.primary[200],
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    notificationTitle: {
        ...typography.bodySemiBold,
        fontSize: 15,
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary[500],
    },
    notificationMessage: {
        ...typography.body,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 4,
    },
    notificationTime: {
        ...typography.caption,
        color: colors.neutral[400],
        fontSize: 12,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.xxxl,
    },
    emptyTitle: {
        ...typography.h3,
        marginTop: spacing.md,
    },
    emptySubtext: {
        ...typography.bodySmall,
        color: colors.neutral[500],
        marginTop: spacing.xs,
    },
});

export default NotificationsScreen;
