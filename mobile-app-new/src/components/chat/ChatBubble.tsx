import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ChatBubbleProps {
    isMe: boolean;
    timestamp: string;
    children: React.ReactNode;
    status?: 'sent' | 'delivered' | 'read';
    style?: ViewStyle;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
    isMe,
    timestamp,
    children,
    status,
    style,
}) => {
    const { isDark } = useTheme();

    return (
        <View style={[
            styles.container,
            isMe ? styles.userContainer : styles.otherContainer,
            style
        ]}>
            <View style={[
                styles.bubble,
                {
                    backgroundColor: isMe
                        ? colors.primary[500]
                        : (isDark ? colors.neutral[800] : colors.neutral[100]),
                },
                isMe ? styles.userBubble : styles.otherBubble,
            ]}>
                {children}
            </View>
            <View style={[styles.footer, isMe ? styles.userFooter : styles.otherFooter]}>
                <Text style={[styles.timestamp, { color: colors.neutral[500] }]}>
                    {timestamp}
                </Text>
                {isMe && status && (
                    <Text style={[styles.status, { color: colors.primary[500] }]}>
                        {status === 'read' ? 'Read' : status === 'delivered' ? 'Delivered' : 'Sent'}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
        maxWidth: '85%',
    },
    userContainer: {
        alignSelf: 'flex-end',
    },
    otherContainer: {
        alignSelf: 'flex-start',
    },
    bubble: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 18,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        borderBottomLeftRadius: 4,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: spacing.xs,
    },
    userFooter: {
        justifyContent: 'flex-end',
    },
    otherFooter: {
        justifyContent: 'flex-start',
    },
    timestamp: {
        ...typography.caption,
        fontSize: 10,
    },
    status: {
        ...typography.caption,
        fontSize: 10,
        fontWeight: '600',
    },
});

export default ChatBubble;
