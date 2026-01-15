import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { Notification } from '../../data/types';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
    notifications: Notification[];
    onMarkAsRead?: (id: string | number) => void;
    onDelete?: (id: string | number) => void;
    onClearAll?: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
    notifications,
    onMarkAsRead,
    onDelete,
    onClearAll,
}) => {
    const { isDark } = useTheme();

    if (notifications.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={64} color={colors.neutral[300]} />
                <Text style={[styles.emptyText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    No notifications yet
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Notifications ({notifications.length})
                </Text>
                {onClearAll && (
                    <TouchableOpacity onPress={onClearAll}>
                        <Text style={[styles.clearText, { color: colors.primary[500] }]}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <NotificationItem
                        notification={item}
                        onPress={() => onMarkAsRead?.(item.id)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    title: {
        ...typography.h3,
        fontSize: 18,
    },
    clearText: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    emptyText: {
        ...typography.body,
        marginTop: spacing.md,
        textAlign: 'center',
    },
});

export default NotificationList;
