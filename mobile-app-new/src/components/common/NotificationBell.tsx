import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { colors, spacing, borderRadius } from '../../theme';

interface NotificationBellProps {
    onPress: () => void;
    size?: number;
}

export default function NotificationBell({ onPress, size = 24 }: NotificationBellProps) {
    const { isDark } = useTheme();
    const { unreadCount } = useNotifications();

    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <Ionicons
                name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
                size={size}
                color={isDark ? colors.text.dark : colors.text.light}
            />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        padding: spacing.xs,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: colors.error[500],
        borderRadius: borderRadius.full,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: colors.neutral[50],
        fontSize: 10,
        fontWeight: '700',
    },
});
