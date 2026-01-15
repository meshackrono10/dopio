import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput as RNTextInput,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { MessagesStackParamList } from '../../types/navigation';

import ChatBubble from '../../components/chat/ChatBubble';
import ImageMessage from '../../components/chat/ImageMessage';
import LocationMessage from '../../components/chat/LocationMessage';

// Mock messages with rich media
const MOCK_MESSAGES = [
    { id: '1', senderId: 'tenant-1', text: 'Hi, is this property still available?', timestamp: '10:00 AM', type: 'text', status: 'read' },
    {
        id: '2',
        senderId: 'hunter-1',
        text: '',
        timestamp: '10:02 AM',
        type: 'image',
        images: ['https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=400']
    },
    { id: '3', senderId: 'hunter-1', text: "Yes, it is! Here's a photo. Would you like to schedule a viewing?", timestamp: '10:05 AM', type: 'text' },
    {
        id: '4',
        senderId: 'tenant-1',
        text: '',
        timestamp: '10:08 AM',
        type: 'call',
        callType: 'missed',
        callDuration: '0:00',
        status: 'read'
    },
    { id: '5', senderId: 'tenant-1', text: 'Sorry I missed your call. Yes please, when can we do the viewing?', timestamp: '10:10 AM', type: 'text', status: 'read' },
    {
        id: '6',
        senderId: 'hunter-1',
        text: '',
        timestamp: '10:12 AM',
        type: 'location',
        latitude: -1.2189,
        longitude: 36.8885,
        address: 'Kasarani, Nairobi'
    },
    {
        id: '7',
        senderId: 'hunter-1',
        text: '',
        timestamp: '10:13 AM',
        type: 'video',
        thumbnailUri: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
        duration: '0:45'
    },
    {
        id: '8',
        senderId: 'hunter-1',
        text: '',
        timestamp: '10:14 AM',
        type: 'call',
        callType: 'completed',
        callDuration: '5:24'
    },
    {
        id: '9',
        senderId: 'hunter-1',
        text: '',
        timestamp: '10:15 AM',
        type: 'document',
        fileName: 'Lease_Agreement_Draft.pdf',
        fileSize: '2.3 MB',
        fileType: 'pdf'
    },
    { id: '10', senderId: 'hunter-1', text: "I've shared the location and the lease draft. See you tomorrow!", timestamp: '10:16 AM', type: 'text' },
];

type ChatScreenRouteProp = RouteProp<MessagesStackParamList, 'Chat'>;

import { useChat } from '../../contexts/ChatContext';

const ChatScreen = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation();
    const route = useRoute<ChatScreenRouteProp>();
    const { conversationId, otherPartyName, propertyTitle } = route.params as any;
    const [messageText, setMessageText] = useState('');
    const flatListRef = useRef<FlatList>(null);
    const { messages: allMessages, sendMessage, joinRoom } = useChat();

    const roomMessages = allMessages[conversationId] || [];
    const displayMessages = [...MOCK_MESSAGES, ...roomMessages];

    useEffect(() => {
        joinRoom(conversationId);
    }, [conversationId, joinRoom]);

    const renderMessage = ({ item }: any) => {
        const isMe = item.senderId === user?.id;

        return (
            <ChatBubble
                isMe={isMe}
                timestamp={item.timestamp}
                status={item.status}
            >
                {item.type === 'text' && (
                    <Text style={[styles.messageText, { color: isMe ? 'white' : (isDark ? colors.text.dark : colors.text.light) }]}>
                        {item.text}
                    </Text>
                )}

                {item.type === 'image' && (
                    <ImageMessage
                        images={item.images || [item.imageUri]}
                        onPress={(index) => Alert.alert('Image', `Viewing image ${index + 1}`)}
                    />
                )}

                {item.type === 'location' && (
                    <LocationMessage
                        latitude={item.latitude}
                        longitude={item.longitude}
                        address={item.address}
                        isMe={isMe}
                    />
                )}

                {item.type === 'video' && (
                    <TouchableOpacity
                        style={styles.videoMessage}
                        onPress={() => Alert.alert('Video', 'Playing video...')}
                    >
                        <Image
                            source={{ uri: item.thumbnailUri }}
                            style={styles.chatImage}
                            resizeMode="cover"
                        />
                        <View style={styles.videoOverlay}>
                            <View style={styles.playButton}>
                                <Ionicons name="play" size={32} color="white" />
                            </View>
                            <View style={styles.durationBadge}>
                                <Text style={styles.durationText}>{item.duration}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}

                {(item.type === 'call' || item.type === 'video-call') && (
                    <View style={styles.callMessage}>
                        <View style={[
                            styles.callIconContainer,
                            { backgroundColor: item.callType === 'missed' ? colors.error + '15' : colors.success + '15' }
                        ]}>
                            <Ionicons
                                name={item.type === 'video-call' ? 'videocam' : 'call'}
                                size={20}
                                color={item.callType === 'missed' ? colors.error : colors.success}
                            />
                        </View>
                        <View style={styles.callInfo}>
                            <Text style={[styles.callText, { color: isMe ? 'white' : (isDark ? colors.text.dark : colors.text.light) }]}>
                                {item.callType === 'missed' ? 'Missed ' : ''}{item.type === 'video-call' ? 'Video' : 'Voice'} Call
                            </Text>
                            <Text style={[styles.callDuration, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.neutral[500] }]}>
                                {item.callType === 'missed' ? 'No answer' : item.callDuration}
                            </Text>
                        </View>
                    </View>
                )}

                {item.type === 'document' && (
                    <TouchableOpacity
                        style={styles.documentMessage}
                        onPress={() => Alert.alert('Document', `Opening ${item.fileName}`)}
                    >
                        <View style={[
                            styles.documentIcon,
                            { backgroundColor: item.fileType === 'pdf' ? colors.error + '15' : colors.primary[500] + '15' }
                        ]}>
                            <Ionicons
                                name={item.fileType === 'pdf' ? 'document-text' : 'document'}
                                size={28}
                                color={item.fileType === 'pdf' ? colors.error : colors.primary[500]}
                            />
                        </View>
                        <View style={styles.documentInfo}>
                            <Text style={[styles.documentName, { color: isMe ? 'white' : (isDark ? colors.text.dark : colors.text.light) }]} numberOfLines={1}>
                                {item.fileName}
                            </Text>
                            <Text style={[styles.documentSize, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.neutral[500] }]}>
                                {item.fileSize}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            </ChatBubble>
        );
    };

    const handleSendMessage = () => {
        if (messageText.trim()) {
            sendMessage(conversationId, messageText.trim());
            setMessageText('');
        }
    };

    const showAttachmentOptions = () => {
        Alert.alert(
            'Attach File',
            'Choose attachment type',
            [
                { text: 'Photo', onPress: () => Alert.alert('Photo', 'Camera/Gallery picker coming soon') },
                { text: 'Location', onPress: () => Alert.alert('Location', 'Sharing current location...') },
                { text: 'Document', onPress: () => Alert.alert('Document', 'Document picker coming soon') },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <SafeAreaView edges={['top']} style={[styles.header, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={[styles.headerName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        {otherPartyName}
                    </Text>
                    <Text style={styles.headerProperty} numberOfLines={1}>
                        {propertyTitle}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.headerAction}
                    onPress={() => Alert.alert('Call', 'Voice call feature coming soon')}
                >
                    <Ionicons name="call-outline" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.headerAction}
                    onPress={() => Alert.alert('Video Call', 'Video call feature coming soon')}
                >
                    <Ionicons name="videocam-outline" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Contextual Booking/Property Banner */}
            <TouchableOpacity
                style={[styles.contextBanner, { backgroundColor: colors.primary[500] + '15' }]}
                onPress={() => {
                    // Navigate to property or booking based on context
                    Alert.alert(
                        'View Details',
                        'Would you like to view the property or your booking?',
                        [
                            { text: 'View Property', onPress: () => (navigation as any).navigate('PropertyDetail', { propertyId: conversationId }) },
                            { text: 'View Booking', onPress: () => (navigation as any).navigate('Bookings') },
                            { text: 'Cancel', style: 'cancel' },
                        ]
                    );
                }}
            >
                <Ionicons name="home" size={18} color={colors.primary[500]} />
                <Text style={[styles.contextText, { color: colors.primary[500] }]}>
                    Re: {propertyTitle}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary[500]} />
            </TouchableOpacity>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={displayMessages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                />

                <SafeAreaView edges={['bottom']} style={[styles.inputWrapper, { borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
                    <View style={styles.inputOuter}>
                        <TouchableOpacity
                            style={styles.attachButton}
                            onPress={showAttachmentOptions}
                        >
                            <Ionicons name="add-circle-outline" size={28} color={isDark ? colors.text.dark : colors.text.light} />
                        </TouchableOpacity>
                        <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                            <RNTextInput
                                style={[styles.input, { color: isDark ? colors.text.dark : colors.text.light }]}
                                placeholder="Type a message..."
                                placeholderTextColor={colors.neutral[400]}
                                value={messageText}
                                onChangeText={setMessageText}
                                multiline
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    { backgroundColor: messageText.trim() ? colors.primary[500] : 'transparent' }
                                ]}
                                onPress={handleSendMessage}
                                disabled={!messageText.trim()}
                            >
                                <Ionicons
                                    name="arrow-up"
                                    size={24}
                                    color={messageText.trim() ? 'white' : colors.neutral[400]}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
    },
    headerName: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    headerProperty: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    headerAction: {
        padding: spacing.xs,
        marginLeft: spacing.xs,
    },
    messagesList: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    messageContainer: {
        marginBottom: spacing.lg,
        maxWidth: '80%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    otherMessage: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    messageText: {
        ...typography.body,
        lineHeight: 22,
    },
    imageMessage: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    videoMessage: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        position: 'relative',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    durationBadge: {
        position: 'absolute',
        bottom: spacing.sm,
        right: spacing.sm,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    durationText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    },
    chatImage: {
        width: 200,
        height: 200,
        borderRadius: borderRadius.lg,
    },
    callMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minWidth: 180,
    },
    callIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    callInfo: {
        flex: 1,
    },
    callText: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    callDuration: {
        ...typography.caption,
        fontSize: 12,
    },
    callBackButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    documentMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minWidth: 200,
    },
    documentIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    documentInfo: {
        flex: 1,
    },
    documentName: {
        ...typography.bodySemiBold,
        fontSize: 14,
        marginBottom: 2,
    },
    documentSize: {
        ...typography.caption,
        fontSize: 12,
    },
    inputWrapper: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderTopWidth: 1,
    },
    inputOuter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    attachButton: {
        padding: 4,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 28,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
    },
    input: {
        flex: 1,
        ...typography.body,
        maxHeight: 100,
        paddingHorizontal: spacing.sm,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contextBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    contextText: {
        ...typography.caption,
        fontWeight: '600',
        flex: 1,
    },
});

export default ChatScreen;
