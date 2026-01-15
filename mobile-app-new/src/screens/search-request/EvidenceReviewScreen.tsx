import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    Alert,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { SearchStackParamList } from '../../types/navigation';
import Button from '../../components/common/Button';

const { width } = Dimensions.get('window');

type EvidenceReviewScreenRouteProp = RouteProp<SearchStackParamList, 'EvidenceReview'>;

const EvidenceReviewScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<EvidenceReviewScreenRouteProp>();
    const { requestId, evidence: initialEvidence } = route.params as any;

    const [evidence, setEvidence] = useState(initialEvidence);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleApprove = (id: string) => {
        setEvidence((prev: any[]) => prev.map((item: any) =>
            item.id === id ? { ...item, status: 'approved' } : item
        ));
        if (currentIndex < evidence.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            Alert.alert('Done', 'All evidence reviewed!');
            navigation.goBack();
        }
    };

    const handleReject = (id: string) => {
        Alert.prompt(
            'Reject Evidence',
            'Please provide a reason for rejection:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    onPress: (reason: string | undefined) => {
                        setEvidence((prev: any[]) => prev.map((item: any) =>
                            item.id === id ? { ...item, status: 'rejected', rejectionReason: reason } : item
                        ));
                        if (currentIndex < evidence.length - 1) {
                            setCurrentIndex(currentIndex + 1);
                        } else {
                            navigation.goBack();
                        }
                    }
                }
            ]
        );
    };

    const currentItem = evidence[currentIndex];

    if (!currentItem) return null;

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : 'black' }]}>
            <StatusBar barStyle="light-content" />

            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Review Evidence</Text>
                    <Text style={styles.headerSubtitle}>{currentIndex + 1} of {evidence.length}</Text>
                </View>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            <View style={styles.content}>
                <View style={styles.mediaContainer}>
                    {currentItem.type === 'image' ? (
                        <Image
                            source={{ uri: currentItem.uri }}
                            style={styles.media}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={styles.videoPlaceholder}>
                            <Image
                                source={{ uri: currentItem.thumbnailUri }}
                                style={[styles.media, { opacity: 0.6 }]}
                                resizeMode="contain"
                            />
                            <TouchableOpacity style={styles.playButton}>
                                <Ionicons name="play" size={48} color="white" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={[styles.details, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        {currentItem.title || 'Property Evidence'}
                    </Text>
                    <Text style={[styles.description, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        {currentItem.description || 'No description provided.'}
                    </Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={16} color={colors.neutral[500]} />
                            <Text style={styles.metaText}>{new Date(currentItem.uploadedAt).toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="location-outline" size={16} color={colors.neutral[500]} />
                            <Text style={styles.metaText}>Verified Location</Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <Button
                            variant="outline"
                            style={styles.rejectButton}
                            onPress={() => handleReject(currentItem.id)}
                            leftIcon={<Ionicons name="close-circle-outline" size={20} color={colors.error[500]} />}
                        >
                            Reject
                        </Button>
                        <Button
                            style={styles.approveButton}
                            onPress={() => handleApprove(currentItem.id)}
                            leftIcon={<Ionicons name="checkmark-circle-outline" size={20} color="white" />}
                        >
                            Approve
                        </Button>
                    </View>
                </View>
            </View>

            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailList}>
                    {evidence.map((item: any, index: number) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => setCurrentIndex(index)}
                            style={[
                                styles.thumbnailContainer,
                                currentIndex === index && styles.activeThumbnail
                            ]}
                        >
                            <Image
                                source={{ uri: item.type === 'image' ? item.uri : item.thumbnailUri }}
                                style={styles.thumbnail}
                            />
                            {item.status === 'approved' && (
                                <View style={styles.statusBadge}>
                                    <Ionicons name="checkmark-circle" size={12} color={colors.success[500]} />
                                </View>
                            )}
                            {item.status === 'rejected' && (
                                <View style={styles.statusBadge}>
                                    <Ionicons name="close-circle" size={12} color={colors.error[500]} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </SafeAreaView>
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
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        zIndex: 10,
    },
    closeButton: {
        padding: spacing.xs,
    },
    headerInfo: {
        alignItems: 'center',
    },
    headerTitle: {
        ...typography.bodySemiBold,
        color: 'white',
        fontSize: 16,
    },
    headerSubtitle: {
        ...typography.caption,
        color: 'rgba(255,255,255,0.6)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    mediaContainer: {
        flex: 1,
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    media: {
        width: width,
        height: '100%',
    },
    videoPlaceholder: {
        width: width,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    details: {
        padding: spacing.xl,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        ...shadows.lg,
    },
    title: {
        ...typography.h3,
        marginBottom: spacing.xs,
    },
    description: {
        ...typography.body,
        lineHeight: 22,
        marginBottom: spacing.lg,
    },
    metaRow: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginBottom: spacing.xl,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    metaText: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    rejectButton: {
        flex: 1,
        borderColor: colors.error[500],
    },
    approveButton: {
        flex: 1,
        backgroundColor: colors.success[500],
    },
    footer: {
        paddingVertical: spacing.md,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    thumbnailList: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    thumbnailContainer: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    activeThumbnail: {
        borderColor: colors.primary[500],
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    statusBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 1,
    },
});

export default EvidenceReviewScreen;
