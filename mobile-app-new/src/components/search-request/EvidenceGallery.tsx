import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { EvidenceItem } from './EvidenceUpload';
import { colors, spacing, typography, borderRadius } from '../../theme';

const { width, height } = Dimensions.get('window');

interface EvidenceGalleryProps {
    items: EvidenceItem[];
    onApprove?: (itemId: string) => void;
    onReject?: (itemId: string) => void;
    showActions?: boolean;
}

export default function EvidenceGallery({ items, onApprove, onReject, showActions = false }: EvidenceGalleryProps) {
    const { isDark } = useTheme();
    const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleItemPress = (item: EvidenceItem, index: number) => {
        setSelectedItem(item);
        setCurrentIndex(index);
    };

    const handleClose = () => {
        setSelectedItem(null);
    };

    const handleNext = () => {
        if (currentIndex < items.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setSelectedItem(items[nextIndex]);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);
            setSelectedItem(items[prevIndex]);
        }
    };

    if (items.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <Ionicons name="images-outline" size={48} color={isDark ? colors.neutral[400] : colors.neutral[600]} />
                <Text style={[styles.emptyText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                    No evidence uploaded yet
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                Property Evidence ({items.length})
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.thumbnail, { backgroundColor: isDark ? colors.neutral[700] : 'white' }]}
                        onPress={() => handleItemPress(item, index)}
                    >
                        <View style={[styles.thumbnailImage, { backgroundColor: colors.neutral[200] }]}>
                            <Ionicons
                                name={item.type === 'video' ? 'play-circle' : 'image'}
                                size={32}
                                color={colors.neutral[500]}
                            />
                        </View>
                        {item.type === 'video' && (
                            <View style={[styles.playOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                                <Ionicons name="play" size={24} color={colors.neutral[50]} />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Full Screen Modal */}
            <Modal visible={!!selectedItem} transparent animationType="fade" onRequestClose={handleClose}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={[styles.modalHeader, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
                        <Text style={styles.modalTitle}>
                            {currentIndex + 1} of {items.length}
                        </Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color={colors.neutral[50]} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.modalContent}>
                        <View style={[styles.fullImage, { backgroundColor: colors.neutral[900] }]}>
                            <Ionicons
                                name={selectedItem?.type === 'video' ? 'play-circle' : 'image'}
                                size={64}
                                color={colors.neutral[300]}
                            />
                        </View>

                        {/* Navigation Arrows */}
                        {currentIndex > 0 && (
                            <TouchableOpacity style={[styles.navButton, styles.navButtonLeft]} onPress={handlePrevious}>
                                <Ionicons name="chevron-back" size={32} color={colors.neutral[50]} />
                            </TouchableOpacity>
                        )}
                        {currentIndex < items.length - 1 && (
                            <TouchableOpacity style={[styles.navButton, styles.navButtonRight]} onPress={handleNext}>
                                <Ionicons name="chevron-forward" size={32} color={colors.neutral[50]} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Footer with Actions */}
                    {showActions && selectedItem && (
                        <View style={[styles.modalFooter, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.error[500] }]}
                                onPress={() => {
                                    onReject?.(selectedItem.id);
                                    handleClose();
                                }}
                            >
                                <Ionicons name="close-circle" size={20} color={colors.neutral[50]} />
                                <Text style={styles.actionButtonText}>Reject</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.success[500] }]}
                                onPress={() => {
                                    onApprove?.(selectedItem.id);
                                    handleClose();
                                }}
                            >
                                <Ionicons name="checkmark-circle" size={20} color={colors.neutral[50]} />
                                <Text style={styles.actionButtonText}>Approve</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
    },
    title: {
        ...typography.h3,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: spacing.md,
    },
    gallery: {
        marginHorizontal: -spacing.md,
        paddingHorizontal: spacing.md,
    },
    thumbnail: {
        width: 100,
        height: 100,
        borderRadius: borderRadius.md,
        marginRight: spacing.sm,
        overflow: 'hidden',
        position: 'relative',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        margin: spacing.md,
    },
    emptyText: {
        ...typography.body,
        fontSize: 15,
        marginTop: spacing.md,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        paddingTop: spacing.xl,
    },
    modalTitle: {
        color: colors.neutral[50],
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        padding: spacing.xs,
    },
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: width,
        height: height * 0.6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navButton: {
        position: 'absolute',
        top: '50%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: borderRadius.full,
        padding: spacing.sm,
    },
    navButtonLeft: {
        left: spacing.md,
    },
    navButtonRight: {
        right: spacing.md,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.md,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    actionButtonText: {
        color: colors.neutral[50],
        fontSize: 16,
        fontWeight: '700',
    },
});
