import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput as RNTextInput,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { MessagesStackParamList } from '../../types/navigation';

type MessagesScreenNavigationProp = StackNavigationProp<MessagesStackParamList, 'Messages'>;

const MOCK_CONVERSATIONS = [
    {
        id: 'conv-1',
        hunterName: 'John Smith',
        hunterId: 'hunter-1',
        tenantName: 'Jane Doe',
        tenantId: 'tenant-1',
        lastMessage: "Sent a video",
        timestamp: '2 mins ago',
        unread: 1,
        propertyTitle: 'Modern 2-Bedroom Apartment',
    },
    {
        id: 'conv-2',
        hunterName: 'John Smith',
        hunterId: 'hunter-1',
        tenantName: 'Jane Doe',
        tenantId: 'tenant-1',
        lastMessage: 'Missed Video Call',
        timestamp: '1 hour ago',
        unread: 2,
        propertyTitle: 'Luxury 3-Bedroom',
    },
    {
        id: 'conv-3',
        hunterName: 'John Smith',
        hunterId: 'hunter-1',
        tenantName: 'Jane Doe',
        tenantId: 'tenant-1',
        lastMessage: 'Shared a document: Lease_Agreement.pdf',
        timestamp: '3 hours ago',
        unread: 0,
        propertyTitle: '1-Bedroom Apartment',
    },
    {
        id: 'conv-4',
        hunterName: 'John Smith',
        hunterId: 'hunter-1',
        tenantName: 'Jane Doe',
        tenantId: 'tenant-1',
        lastMessage: 'Great! I\'ll see you tomorrow at 10 AM',
        timestamp: '1 day ago',
        unread: 0,
        propertyTitle: 'Studio Apartment in Kilimani',
    },
];

const MOCK_MESSAGES = [
    { id: '1', senderId: 'user', text: 'Hi, is this property still available?', timestamp: '10:00 AM' },
    { id: '2', senderId: 'hunter', text: "Yes, it is! Would you like to schedule a viewing?", timestamp: '10:05 AM' },
    { id: '3', senderId: 'user', text: 'Yes please. When can we do the viewing?', timestamp: '10:10 AM' },
    { id: '4', senderId: 'hunter', text: "Great! I'll see you tomorrow at 10 AM", timestamp: '10:15 AM' },
];

const MessagesScreen = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<MessagesScreenNavigationProp>();

    const renderConversation = ({ item }: any) => {
        const otherPartyName = user?.role === 'hunter' ? item.tenantName : item.hunterName;

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => navigation.navigate('Chat', {
                    conversationId: item.id,
                    otherPartyName: otherPartyName,
                    propertyTitle: item.propertyTitle,
                })}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{otherPartyName.charAt(0)}</Text>
                </View>
                <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                        <Text style={[styles.otherName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {otherPartyName}
                        </Text>
                        <Text style={[styles.timestamp, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                            {item.timestamp}
                        </Text>
                    </View>
                    <Text style={[styles.lastMessage, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]} numberOfLines={2}>
                        {item.lastMessage}
                    </Text>
                    <Text style={[styles.propertyTitle, { color: colors.neutral[400] }]}>
                        Listing: {item.propertyTitle}
                    </Text>
                </View>
                {item.unread > 0 && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    const filteredConversations = MOCK_CONVERSATIONS.filter(conv =>
        user?.role === 'hunter' ? conv.hunterId === user.id : conv.tenantId === user?.id
    );

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <SafeAreaView edges={['top']} style={styles.header}>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>Messages</Text>
            </SafeAreaView>

            <FlatList
                data={filteredConversations}
                keyExtractor={(item) => item.id}
                renderItem={renderConversation}
                contentContainerStyle={styles.list}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>No messages yet</Text>
                        <Text style={styles.emptySubtext}>When you contact a host or receive a message, it will appear here.</Text>
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
    },
    title: {
        ...typography.h1,
        fontSize: 32,
    },
    list: {
        paddingBottom: 100,
    },
    conversationItem: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        gap: spacing.md,
        position: 'relative',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.neutral[800],
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        ...typography.h4,
        color: 'white',
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    otherName: {
        ...typography.bodySemiBold,
    },
    timestamp: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    lastMessage: {
        ...typography.bodySmall,
        lineHeight: 18,
        marginBottom: 4,
    },
    propertyTitle: {
        ...typography.caption,
    },
    unreadDot: {
        position: 'absolute',
        top: spacing.lg,
        right: spacing.lg,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary[500],
    },
    separator: {
        height: 1,
        backgroundColor: colors.neutral[100],
        marginLeft: spacing.lg + 56 + spacing.md,
    },
    emptyState: {
        flex: 1,
        paddingHorizontal: spacing.xxl,
        paddingTop: 100,
    },
    emptyTitle: {
        ...typography.h3,
        marginBottom: spacing.sm,
    },
    emptySubtext: {
        ...typography.body,
        color: colors.neutral[500],
    },
});

export default MessagesScreen;
