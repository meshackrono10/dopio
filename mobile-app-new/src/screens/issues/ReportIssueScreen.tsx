import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useBookings } from '../../contexts/BookingContext';

type ReportIssueParams = {
    ReportIssue: {
        bookingId?: string;
        propertyId?: string;
    };
};

const ISSUE_CATEGORIES = [
    { id: 'property_condition', label: 'Property Condition', icon: 'home-outline' },
    { id: 'payment', label: 'Payment Issue', icon: 'cash-outline' },
    { id: 'safety', label: 'Safety Concern', icon: 'shield-outline' },
    { id: 'communication', label: 'Communication', icon: 'chatbubble-outline' },
    { id: 'viewing', label: 'Viewing Experience', icon: 'eye-outline' },
    { id: 'other', label: 'Other', icon: 'help-circle-outline' },
];

const PRIORITY_LEVELS = [
    { id: 'low', label: 'Low', color: colors.neutral[500] },
    { id: 'medium', label: 'Medium', color: colors.warning },
    { id: 'high', label: 'High', color: colors.error },
];

import { uploadImages } from '../../services/upload';

const ReportIssueScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<ReportIssueParams, 'ReportIssue'>>();
    const { getBookingById } = useBookings();

    // Get booking if bookingId is provided
    const bookingId = route.params?.bookingId;
    const booking = bookingId ? getBookingById(bookingId) : undefined;

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [attachments, setAttachments] = useState<{ id: string, uri: string, type: 'image' | 'video' }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddAttachment = async () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Take Photo', 'Choose from Library'],
                    cancelButtonIndex: 0,
                },
                async (buttonIndex) => {
                    if (buttonIndex === 1) {
                        await launchCamera();
                    } else if (buttonIndex === 2) {
                        await launchImageLibrary();
                    }
                }
            );
        } else {
            Alert.alert(
                'Add Evidence',
                'Choose how to add your evidence',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Take Photo', onPress: launchCamera },
                    { text: 'Choose from Library', onPress: launchImageLibrary },
                ]
            );
        }
    };

    const launchCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow camera access to take photos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const newAttachment = {
                id: Math.random().toString(36).substr(2, 9),
                uri: result.assets[0].uri,
                type: (result.assets[0].type === 'video' ? 'video' : 'image') as 'image' | 'video',
            };
            setAttachments(prev => [...prev, newAttachment]);
        }
    };

    const launchImageLibrary = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow access to your photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const newAttachment = {
                id: Math.random().toString(36).substr(2, 9),
                uri: result.assets[0].uri,
                type: (result.assets[0].type === 'video' ? 'video' : 'image') as 'image' | 'video',
            };
            setAttachments(prev => [...prev, newAttachment]);
        }
    };

    const handleRemoveAttachment = (id: string) => {
        setAttachments(attachments.filter(a => a.id !== id));
    };

    const handleSubmit = async () => {
        if (!selectedCategory) {
            Alert.alert('Required', 'Please select an issue category');
            return;
        }
        if (!title.trim()) {
            Alert.alert('Required', 'Please enter an issue title');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Required', 'Please describe the issue');
            return;
        }
        if (attachments.length === 0) {
            Alert.alert('Required', 'Please attach at least one image or video as evidence');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload images to Cloudinary
            const uris = attachments.map(a => a.uri);
            await uploadImages(uris);

            Alert.alert(
                'Issue Reported',
                'Your issue has been submitted successfully. Our team will review it shortly.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            Alert.alert('Error', 'Failed to upload images. Please try again.');
            console.error('Upload error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <SafeAreaView edges={['top']} style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Report an Issue
                    </Text>
                    <View style={{ width: 24 }} />
                </SafeAreaView>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Info Banner */}
                    <View style={[styles.infoBanner, { backgroundColor: colors.primary[50] }]}>
                        <Ionicons name="information-circle" size={20} color={colors.primary[500]} />
                        <Text style={[styles.infoText, { color: colors.primary[700] }]}>
                            We take all issues seriously. Please provide as much detail as possible.
                        </Text>
                    </View>

                    {/* Booking Context */}
                    {booking && (
                        <View style={[styles.bookingCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <View style={styles.bookingHeader}>
                                <Ionicons name="calendar" size={20} color={colors.primary[500]} />
                                <Text style={[styles.bookingLabel, { color: colors.neutral[500] }]}>
                                    Related Booking
                                </Text>
                            </View>
                            <Text style={[styles.bookingTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {booking.propertyTitle}
                            </Text>
                            <View style={styles.bookingMeta}>
                                <Text style={styles.bookingMetaText}>
                                    {booking.scheduledDate} at {booking.scheduledTime}
                                </Text>
                                <View style={[styles.statusBadge, { backgroundColor: colors.primary[100] }]}>
                                    <Text style={[styles.statusText, { color: colors.primary[700] }]}>
                                        {booking.status?.replace('_', ' ')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Category Selection */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Issue Category *
                        </Text>
                        <View style={styles.categoriesGrid}>
                            {ISSUE_CATEGORIES.map(category => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryCard,
                                        selectedCategory === category.id && styles.categoryCardActive,
                                        { borderColor: selectedCategory === category.id ? colors.primary[500] : colors.neutral[200] }
                                    ]}
                                    onPress={() => setSelectedCategory(category.id)}
                                >
                                    <Ionicons
                                        name={category.icon as any}
                                        size={24}
                                        color={selectedCategory === category.id ? colors.primary[500] : colors.neutral[500]}
                                    />
                                    <Text style={[
                                        styles.categoryLabel,
                                        { color: selectedCategory === category.id ? colors.primary[500] : (isDark ? colors.text.dark : colors.text.light) }
                                    ]}>
                                        {category.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Priority */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Priority Level
                        </Text>
                        <View style={styles.priorityButtons}>
                            {PRIORITY_LEVELS.map(level => (
                                <TouchableOpacity
                                    key={level.id}
                                    style={[
                                        styles.priorityButton,
                                        priority === level.id && { backgroundColor: level.color + '20', borderColor: level.color }
                                    ]}
                                    onPress={() => setPriority(level.id as 'low' | 'medium' | 'high')}
                                >
                                    <View style={[
                                        styles.priorityDot,
                                        { backgroundColor: level.color }
                                    ]} />
                                    <Text style={[
                                        styles.priorityLabel,
                                        { color: priority === level.id ? level.color : colors.neutral[600] }
                                    ]}>
                                        {level.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Title */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Issue Title *
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }
                            ]}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Brief summary of the issue"
                            placeholderTextColor={colors.neutral[400]}
                        />
                    </View>

                    {/* Description */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Description *
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                styles.textArea,
                                { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }
                            ]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Please provide detailed information about the issue..."
                            placeholderTextColor={colors.neutral[400]}
                            multiline
                            numberOfLines={8}
                            textAlignVertical="top"
                        />
                        <Text style={styles.charCount}>{description.length} / 1000</Text>
                    </View>

                    {/* Attachments */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Attachments (Required) *
                        </Text>
                        <Text style={[styles.attachmentSubtitle, { color: colors.neutral[500] }]}>
                            Please provide images or videos of the property to verify your claim.
                        </Text>

                        <View style={styles.attachmentsList}>
                            {attachments.map(item => (
                                <View key={item.id} style={styles.attachmentItem}>
                                    <Image source={{ uri: item.uri }} style={styles.attachmentPreview} />
                                    <TouchableOpacity
                                        style={styles.removeAttachment}
                                        onPress={() => handleRemoveAttachment(item.id)}
                                    >
                                        <Ionicons name="close-circle" size={20} color={colors.error} />
                                    </TouchableOpacity>
                                    {item.type === 'video' && (
                                        <View style={styles.videoBadge}>
                                            <Ionicons name="play" size={12} color="white" />
                                        </View>
                                    )}
                                </View>
                            ))}
                            <TouchableOpacity style={styles.uploadButton} onPress={handleAddAttachment}>
                                <Ionicons name="add" size={32} color={colors.primary[500]} />
                                <Text style={[styles.uploadText, { color: colors.primary[500] }]}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Guidelines */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50] }]}>
                        <View style={styles.guidelinesHeader}>
                            <Ionicons name="bulb-outline" size={20} color={colors.warning} />
                            <Text style={[styles.guidelinesTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                What happens next?
                            </Text>
                        </View>
                        <Text style={styles.guidelinesText}>
                            • Our support team will review your issue within 24 hours{'\n'}
                            • You'll receive updates via notifications and email{'\n'}
                            • You can track the status in the "My Issues" section{'\n'}
                            • We may contact you for additional information
                        </Text>
                    </View>
                </ScrollView>

                <SafeAreaView edges={['bottom']} style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: (!selectedCategory || !title || !description || attachments.length === 0 || isSubmitting) ? colors.neutral[300] : colors.primary[500] }
                        ]}
                        onPress={handleSubmit}
                        disabled={!selectedCategory || !title || !description || attachments.length === 0 || isSubmitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? 'Submitting...' : 'Submit Issue'}
                        </Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        </KeyboardAvoidingView>
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
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
        flex: 1,
        textAlign: 'center',
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    infoBanner: {
        flexDirection: 'row',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
    },
    infoText: {
        ...typography.caption,
        flex: 1,
        lineHeight: 18,
    },
    card: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.md,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    categoryCard: {
        width: '48%',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        alignItems: 'center',
        gap: spacing.xs,
    },
    categoryCardActive: {
        backgroundColor: colors.primary[50],
    },
    categoryLabel: {
        ...typography.caption,
        fontWeight: '600',
        textAlign: 'center',
    },
    priorityButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    priorityButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.neutral[200],
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    priorityLabel: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        ...typography.body,
    },
    textArea: {
        height: 150,
        paddingTop: spacing.md,
        marginBottom: spacing.xs,
    },
    charCount: {
        ...typography.caption,
        color: colors.neutral[400],
        textAlign: 'right',
    },
    uploadButton: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.primary[500],
        borderRadius: borderRadius.md,
        borderStyle: 'dashed',
    },
    uploadText: {
        ...typography.caption,
        fontWeight: '700',
        marginTop: -4,
    },
    attachmentSubtitle: {
        ...typography.caption,
        marginBottom: spacing.md,
    },
    attachmentsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    attachmentItem: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    attachmentPreview: {
        width: '100%',
        height: '100%',
    },
    removeAttachment: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    videoBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 2,
        borderRadius: 4,
    },
    guidelinesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    guidelinesTitle: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    guidelinesText: {
        ...typography.caption,
        color: colors.neutral[600],
        lineHeight: 20,
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    submitButton: {
        height: 52,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        ...typography.bodySemiBold,
        fontSize: 16,
        color: 'white',
    },
    // Booking Card Styles
    bookingCard: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    bookingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    bookingLabel: {
        ...typography.caption,
        fontSize: 12,
    },
    bookingTitle: {
        ...typography.bodySemiBold,
        marginBottom: spacing.xs,
    },
    bookingMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bookingMetaText: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        ...typography.caption,
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
});

export default ReportIssueScreen;
