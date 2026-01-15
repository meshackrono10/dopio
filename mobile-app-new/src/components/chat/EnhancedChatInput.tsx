import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, spacing, borderRadius } from '../../theme';

interface EnhancedChatInputProps {
    onSendMessage: (message: string) => void;
    onSendImage?: () => void;
    onSendLocation?: () => void;
    onSendFile?: () => void;
    placeholder?: string;
}

export default function EnhancedChatInput({
    onSendMessage,
    onSendImage,
    onSendLocation,
    onSendFile,
    placeholder = 'Type a message...',
}: EnhancedChatInputProps) {
    const { isDark } = useTheme();
    const [message, setMessage] = useState('');
    const [showActions, setShowActions] = useState(false);

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleImagePress = () => {
        setShowActions(false);
        if (onSendImage) {
            onSendImage();
        } else {
            Alert.alert('Send Image', 'Image picker functionality');
        }
    };

    const handleLocationPress = () => {
        setShowActions(false);
        if (onSendLocation) {
            onSendLocation();
        } else {
            Alert.alert('Share Location', 'Location sharing functionality');
        }
    };

    const handleFilePress = () => {
        setShowActions(false);
        if (onSendFile) {
            onSendFile();
        } else {
            Alert.alert('Send File', 'File picker functionality');
        }
    };

    return (
        <View style={styles.container}>
            {/* Attachment Actions */}
            {showActions && (
                <View style={[styles.actionsContainer, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleImagePress}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.primary[100] }]}>
                            <Ionicons name="image" size={24} color={colors.primary[600]} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleLocationPress}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.success[100] }]}>
                            <Ionicons name="location" size={24} color={colors.success[600]} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleFilePress}>
                        <View style={[styles.actionIcon, { backgroundColor: colors.info[100] }]}>
                            <Ionicons name="document" size={24} color={colors.info[600]} />
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Input Row */}
            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setShowActions(!showActions)}
                >
                    <Ionicons
                        name={showActions ? 'close' : 'add-circle'}
                        size={28}
                        color={showActions ? colors.error[500] : colors.primary[500]}
                    />
                </TouchableOpacity>

                <TextInput
                    style={[styles.input, { color: isDark ? colors.text.dark : colors.text.light, backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}
                    placeholder={placeholder}
                    placeholderTextColor={isDark ? colors.neutral[400] : colors.neutral[500]}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    maxLength={1000}
                />

                {message.trim() ? (
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <View style={[styles.sendIcon, { backgroundColor: colors.primary[500] }]}>
                            <Ionicons name="send" size={20} color={colors.neutral[50]} />
                        </View>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="happy-outline" size={26} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    actionsContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    actionButton: {
        alignItems: 'center',
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: spacing.sm,
        gap: spacing.sm,
    },
    iconButton: {
        padding: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        maxHeight: 100,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        fontSize: 15,
    },
    sendButton: {
        padding: spacing.xs,
    },
    sendIcon: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
