import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface Document {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadedAt: string;
    url?: string;
}

interface DocumentManagerProps {
    documents?: Document[];
    onUpload?: () => void;
    onDelete?: (id: string) => void;
    onView?: (doc: Document) => void;
}

export default function DocumentManager({ documents = [], onUpload, onDelete, onView }: DocumentManagerProps) {
    const { isDark } = useTheme();

    const getDocumentIcon = (type: string) => {
        if (type.includes('pdf')) return 'document-text';
        if (type.includes('image')) return 'image';
        if (type.includes('word') || type.includes('doc')) return 'document';
        return 'document-attach';
    };

    const getDocumentColor = (type: string) => {
        if (type.includes('pdf')) return colors.error[500];
        if (type.includes('image')) return colors.success[500];
        if (type.includes('word')) return colors.primary[500];
        return colors.neutral[500];
    };

    const handleDelete = (doc: Document) => {
        Alert.alert(
            'Delete Document',
            `Are you sure you want to delete "${doc.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => onDelete?.(doc.id),
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>Documents</Text>
                <TouchableOpacity
                    style={[styles.uploadButton, { backgroundColor: colors.primary[500] }]}
                    onPress={onUpload}
                >
                    <Ionicons name="cloud-upload" size={18} color={colors.neutral[50]} />
                    <Text style={styles.uploadText}>Upload</Text>
                </TouchableOpacity>
            </View>

            {documents.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="folder-open-outline" size={64} color={colors.neutral[500]} />
                    <Text style={[styles.emptyText, { color: colors.neutral[500] }]}>
                        No documents uploaded yet
                    </Text>
                    <Text style={[styles.emptyHint, { color: colors.neutral[500] }]}>
                        Upload lease agreements, ID copies, or other property documents
                    </Text>
                </View>
            ) : (
                <ScrollView style={styles.documentList}>
                    {documents.map((doc) => (
                        <TouchableOpacity
                            key={doc.id}
                            style={[styles.documentCard, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}
                            onPress={() => onView?.(doc)}
                        >
                            <View style={[styles.documentIcon, { backgroundColor: `${getDocumentColor(doc.type)}15` }]}>
                                <Ionicons name={getDocumentIcon(doc.type) as any} size={24} color={getDocumentColor(doc.type)} />
                            </View>

                            <View style={styles.documentInfo}>
                                <Text style={[styles.documentName, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                                    {doc.name}
                                </Text>
                                <View style={styles.documentMeta}>
                                    <Text style={[styles.metaText, { color: colors.neutral[500] }]}>
                                        {doc.size}
                                    </Text>
                                    <Text style={[styles.separator, { color: colors.neutral[500] }]}>•</Text>
                                    <Text style={[styles.metaText, { color: colors.neutral[500] }]}>
                                        {new Date(doc.uploadedAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDelete(doc)}
                            >
                                <Ionicons name="trash-outline" size={20} color={colors.error[500]} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Document Types Info */}
            <View style={[styles.infoBox, { backgroundColor: colors.info[50] }]}>
                <Ionicons name="information-circle" size={18} color={colors.info[600]} />
                <Text style={[styles.infoText, { color: colors.info[700] }]}>
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max: 10MB per file)
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        ...typography.h3,
        fontSize: 18,
        fontWeight: '700',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    uploadText: {
        color: colors.neutral[50],
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xl * 2,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: spacing.md,
    },
    emptyHint: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: spacing.xs,
        paddingHorizontal: spacing.xl,
    },
    documentList: {
        maxHeight: 400,
    },
    documentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
    },
    documentIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    documentInfo: {
        flex: 1,
    },
    documentName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    documentMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
    },
    separator: {
        marginHorizontal: spacing.xs,
        fontSize: 12,
    },
    deleteButton: {
        padding: spacing.sm,
    },
    infoBox: {
        flexDirection: 'row',
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
        gap: spacing.sm,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 16,
    },
});
