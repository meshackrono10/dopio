import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

export interface EvidenceItem {
    id: string;
    uri: string;
    type: 'image' | 'video';
    caption?: string;
    uploadedAt: string;
}

interface EvidenceUploadProps {
    onUpload: (items: EvidenceItem[]) => void;
    maxItems?: number;
    existingItems?: EvidenceItem[];
}

export default function EvidenceUpload({ onUpload, maxItems = 10, existingItems = [] }: EvidenceUploadProps) {
    const { isDark } = useTheme();
    const [items, setItems] = useState<EvidenceItem[]>(existingItems);

    const handleAddPhoto = () => {
        // Simulate image picker
        Alert.alert(
            'Add Photo',
            'Choose photo source',
            [
                {
                    text: 'Camera',
                    onPress: () => {
                        // Simulate camera capture
                        const newItem: EvidenceItem = {
                            id: `img-${Date.now()}`,
                            uri: 'https://via.placeholder.com/400',
                            type: 'image',
                            uploadedAt: new Date().toISOString(),
                        };
                        const updatedItems = [...items, newItem];
                        setItems(updatedItems);
                        onUpload(updatedItems);
                    },
                },
                {
                    text: 'Gallery',
                    onPress: () => {
                        // Simulate gallery picker
                        const newItem: EvidenceItem = {
                            id: `img-${Date.now()}`,
                            uri: 'https://via.placeholder.com/400',
                            type: 'image',
                            uploadedAt: new Date().toISOString(),
                        };
                        const updatedItems = [...items, newItem];
                        setItems(updatedItems);
                        onUpload(updatedItems);
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handleAddVideo = () => {
        Alert.alert('Add Video', 'Video upload functionality', [
            {
                text: 'OK',
                onPress: () => {
                    const newItem: EvidenceItem = {
                        id: `vid-${Date.now()}`,
                        uri: 'https://via.placeholder.com/400',
                        type: 'video',
                        uploadedAt: new Date().toISOString(),
                    };
                    const updatedItems = [...items, newItem];
                    setItems(updatedItems);
                    onUpload(updatedItems);
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const handleRemoveItem = (id: string) => {
        Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                    const updatedItems = items.filter((item) => item.id !== id);
                    setItems(updatedItems);
                    onUpload(updatedItems);
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const canAddMore = items.length < maxItems;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>Property Evidence</Text>
                <Text style={[styles.count, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                    {items.length}/{maxItems}
                </Text>
            </View>

            <Text style={[styles.description, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                Upload photos and videos of properties you've found
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsContainer}>
                {items.map((item) => (
                    <View key={item.id} style={[styles.item, { backgroundColor: isDark ? colors.neutral[700] : 'white' }]}>
                        <View style={styles.imageContainer}>
                            <View style={[styles.imagePlaceholder, { backgroundColor: colors.neutral[200] }]}>
                                <Ionicons
                                    name={item.type === 'video' ? 'play-circle' : 'image'}
                                    size={32}
                                    color={colors.neutral[500]}
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => handleRemoveItem(item.id)}
                            >
                                <Ionicons name="close-circle" size={24} color={colors.error[500]} />
                            </TouchableOpacity>
                        </View>
                        {item.type === 'video' && (
                            <View style={[styles.videoBadge, { backgroundColor: colors.primary[500] }]}>
                                <Ionicons name="videocam" size={12} color={colors.neutral[50]} />
                                <Text style={styles.videoBadgeText}>Video</Text>
                            </View>
                        )}
                    </View>
                ))}

                {canAddMore && (
                    <>
                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: isDark ? colors.neutral[800] : 'white', borderColor: colors.primary[300] }]}
                            onPress={handleAddPhoto}
                        >
                            <Ionicons name="camera" size={28} color={colors.primary[500]} />
                            <Text style={[styles.addButtonText, { color: colors.primary[600] }]}>
                                Add Photo
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: isDark ? colors.neutral[800] : 'white', borderColor: colors.secondary[300] }]}
                            onPress={handleAddVideo}
                        >
                            <Ionicons name="videocam" size={28} color={colors.secondary[500]} />
                            <Text style={[styles.addButtonText, { color: colors.secondary[600] }]}>
                                Add Video
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            {items.length > 0 && (
                <View style={[styles.tipBox, { backgroundColor: colors.info[50] }]}>
                    <Ionicons name="information-circle" size={18} color={colors.info[600]} />
                    <Text style={[styles.tipText, { color: colors.info[700] }]}>
                        Make sure photos are clear and show property features, location, and condition
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    title: {
        ...typography.h3,
        fontSize: 18,
        fontWeight: '700',
    },
    count: {
        ...typography.body,
        fontSize: 14,
        fontWeight: '600',
    },
    description: {
        ...typography.body,
        fontSize: 14,
        marginBottom: spacing.md,
    },
    itemsContainer: {
        marginBottom: spacing.md,
    },
    item: {
        width: 120,
        marginRight: spacing.md,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButton: {
        position: 'absolute',
        top: spacing.xs,
        right: spacing.xs,
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.full,
    },
    videoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xs,
        gap: 4,
    },
    videoBadgeText: {
        color: colors.neutral[50],
        fontSize: 11,
        fontWeight: '700',
    },
    addButton: {
        width: 120,
        height: 120,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    addButtonText: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: spacing.xs,
    },
    tipBox: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
});
