import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

type VerificationStep = 'intro' | 'id_front' | 'id_back' | 'selfie' | 'review' | 'submitted';

const VerificationScreen = () => {
    const { isDark } = useTheme();
    const { user, submitVerification, updateProfile } = useAuth();
    const toast = useToast();
    const navigation = useNavigation();

    const [step, setStep] = useState<VerificationStep>('intro');
    const [idFront, setIdFront] = useState<string | null>(null);
    const [idBack, setIdBack] = useState<string | null>(null);
    const [selfie, setSelfie] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Already verified
    if (user?.verificationStatus === 'verified') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <View style={styles.successContainer}>
                    <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
                        <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                    </View>
                    <Text style={[styles.successTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        You're Verified!
                    </Text>
                    <Text style={styles.successSubtitle}>
                        Your identity has been verified. You can now list properties and accept bookings.
                    </Text>
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: colors.primary[500] }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.primaryButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Pending verification
    if (user?.verificationStatus === 'pending') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <View style={styles.successContainer}>
                    <View style={[styles.successIcon, { backgroundColor: colors.warning + '20' }]}>
                        <Ionicons name="time" size={64} color={colors.warning} />
                    </View>
                    <Text style={[styles.successTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Verification Pending
                    </Text>
                    <Text style={styles.successSubtitle}>
                        Your documents are being reviewed. This usually takes 24-48 hours. We'll notify you once approved.
                    </Text>
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: colors.neutral[500] }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.primaryButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const pickImage = async (type: 'id_front' | 'id_back') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll access to upload documents.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 10],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            if (type === 'id_front') {
                setIdFront(result.assets[0].uri);
                setStep('id_back');
            } else {
                setIdBack(result.assets[0].uri);
                setStep('selfie');
            }
        }
    };

    const takeSelfie = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera access to take a selfie.');
            return;
        }

        // MUST use camera, not library
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            cameraType: ImagePicker.CameraType.front,
        });

        if (!result.canceled && result.assets[0]) {
            setSelfie(result.assets[0].uri);
            setStep('review');
        }
    };

    const handleSubmit = async () => {
        if (!idFront || !idBack || !selfie) {
            toast.error('Please complete all verification steps');
            return;
        }

        setLoading(true);
        try {
            const success = await submitVerification(idFront, idBack, selfie);
            if (success) {
                setStep('submitted');
                toast.success('Verification submitted successfully!');
            } else {
                toast.error('Submission failed. Please try again.');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderIntro = () => (
        <View style={styles.stepContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary[500] + '15' }]}>
                <Ionicons name="shield-checkmark" size={64} color={colors.primary[500]} />
            </View>
            <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                Verify Your Identity
            </Text>
            <Text style={styles.stepDescription}>
                To become a House Hunter, we need to verify your identity. This protects both you and tenants on our platform.
            </Text>

            <View style={styles.requirementsList}>
                <View style={styles.requirementItem}>
                    <Ionicons name="id-card" size={24} color={colors.primary[500]} />
                    <View style={styles.requirementText}>
                        <Text style={[styles.requirementTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            National ID
                        </Text>
                        <Text style={styles.requirementDesc}>Front and back of your ID</Text>
                    </View>
                </View>
                <View style={styles.requirementItem}>
                    <Ionicons name="camera" size={24} color={colors.primary[500]} />
                    <View style={styles.requirementText}>
                        <Text style={[styles.requirementTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Live Selfie
                        </Text>
                        <Text style={styles.requirementDesc}>Taken with our camera (no uploads)</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary[500] }]}
                onPress={() => setStep('id_front')}
            >
                <Text style={styles.primaryButtonText}>Start Verification</Text>
            </TouchableOpacity>
        </View>
    );

    const renderIdStep = (type: 'id_front' | 'id_back') => {
        const isFront = type === 'id_front';
        const currentImage = isFront ? idFront : idBack;

        return (
            <View style={styles.stepContent}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: isFront ? '33%' : '66%' }]} />
                </View>
                <Text style={[styles.stepLabel, { color: colors.primary[500] }]}>
                    Step {isFront ? '1' : '2'} of 3
                </Text>
                <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    {isFront ? 'ID Front Side' : 'ID Back Side'}
                </Text>
                <Text style={styles.stepDescription}>
                    {isFront
                        ? 'Take a clear photo of the front of your National ID'
                        : 'Now take a photo of the back of your National ID'
                    }
                </Text>

                <TouchableOpacity
                    style={[styles.uploadBox, currentImage && styles.uploadBoxFilled]}
                    onPress={() => pickImage(type)}
                >
                    {currentImage ? (
                        <Image source={{ uri: currentImage }} style={styles.uploadPreview} />
                    ) : (
                        <>
                            <Ionicons name="camera-outline" size={48} color={colors.neutral[400]} />
                            <Text style={styles.uploadText}>Tap to upload image</Text>
                        </>
                    )}
                </TouchableOpacity>

                {currentImage && (
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: colors.primary[500] }]}
                        onPress={() => isFront ? setStep('id_back') : setStep('selfie')}
                    >
                        <Text style={styles.primaryButtonText}>Continue</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setStep(isFront ? 'intro' : 'id_front')}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderSelfieStep = () => (
        <View style={styles.stepContent}>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
            <Text style={[styles.stepLabel, { color: colors.primary[500] }]}>Step 3 of 3</Text>
            <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                Take a Selfie
            </Text>
            <Text style={styles.stepDescription}>
                We need a live photo to match with your ID. This must be taken with your camera - no uploads allowed.
            </Text>

            <View style={[styles.selfieGuide, { borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}>
                {selfie ? (
                    <Image source={{ uri: selfie }} style={styles.selfiePreview} />
                ) : (
                    <>
                        <View style={styles.faceOutline} />
                        <Text style={styles.selfieHint}>Position your face here</Text>
                    </>
                )}
            </View>

            <View style={styles.selfieInstructions}>
                <View style={styles.instructionItem}>
                    <Ionicons name="sunny" size={18} color={colors.success} />
                    <Text style={styles.instructionText}>Good lighting</Text>
                </View>
                <View style={styles.instructionItem}>
                    <Ionicons name="eye" size={18} color={colors.success} />
                    <Text style={styles.instructionText}>Face the camera</Text>
                </View>
                <View style={styles.instructionItem}>
                    <Ionicons name="remove-circle" size={18} color={colors.error} />
                    <Text style={styles.instructionText}>No sunglasses</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary[500] }]}
                onPress={selfie ? () => setStep('review') : takeSelfie}
            >
                <Ionicons name="camera" size={20} color="white" />
                <Text style={styles.primaryButtonText}>
                    {selfie ? 'Continue' : 'Open Camera'}
                </Text>
            </TouchableOpacity>

            {selfie && (
                <TouchableOpacity style={styles.backButton} onPress={takeSelfie}>
                    <Text style={styles.backButtonText}>Retake Photo</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.backButton} onPress={() => setStep('id_back')}>
                <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );

    const renderReview = () => (
        <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                Review Your Documents
            </Text>
            <Text style={styles.stepDescription}>
                Please review your uploaded documents before submitting.
            </Text>

            <View style={styles.reviewGrid}>
                <View style={styles.reviewItem}>
                    <Text style={styles.reviewLabel}>ID Front</Text>
                    {idFront && <Image source={{ uri: idFront }} style={styles.reviewImage} />}
                    <TouchableOpacity onPress={() => setStep('id_front')}>
                        <Text style={[styles.editLink, { color: colors.primary[500] }]}>Change</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.reviewItem}>
                    <Text style={styles.reviewLabel}>ID Back</Text>
                    {idBack && <Image source={{ uri: idBack }} style={styles.reviewImage} />}
                    <TouchableOpacity onPress={() => setStep('id_back')}>
                        <Text style={[styles.editLink, { color: colors.primary[500] }]}>Change</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.reviewItem}>
                    <Text style={styles.reviewLabel}>Selfie</Text>
                    {selfie && <Image source={{ uri: selfie }} style={styles.reviewImageRound} />}
                    <TouchableOpacity onPress={() => setStep('selfie')}>
                        <Text style={[styles.editLink, { color: colors.primary[500] }]}>Retake</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary[500] }]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.primaryButtonText}>Submit for Verification</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => setStep('selfie')}>
                <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );

    const renderSubmitted = () => (
        <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="checkmark-done" size={64} color={colors.success} />
            </View>
            <Text style={[styles.successTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                Submitted!
            </Text>
            <Text style={styles.successSubtitle}>
                Your verification documents have been submitted. We'll review them within 24-48 hours and notify you once approved.
            </Text>
            <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary[500] }]}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Identity Verification
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {step === 'intro' && renderIntro()}
                {step === 'id_front' && renderIdStep('id_front')}
                {step === 'id_back' && renderIdStep('id_back')}
                {step === 'selfie' && renderSelfieStep()}
                {step === 'review' && renderReview()}
                {step === 'submitted' && renderSubmitted()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    headerBack: { padding: spacing.xs },
    headerTitle: { ...typography.h3, fontSize: 18 },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    stepContent: { alignItems: 'center' },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    stepLabel: { ...typography.caption, fontWeight: '700', marginBottom: spacing.xs },
    stepTitle: { ...typography.h2, textAlign: 'center', marginBottom: spacing.md },
    stepDescription: {
        ...typography.body,
        color: colors.neutral[500],
        textAlign: 'center',
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: colors.neutral[200],
        borderRadius: 2,
        marginBottom: spacing.lg,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary[500],
        borderRadius: 2,
    },
    requirementsList: { width: '100%', gap: spacing.md, marginBottom: spacing.xl },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.neutral[100],
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    requirementText: { flex: 1 },
    requirementTitle: { ...typography.bodySemiBold },
    requirementDesc: { ...typography.caption, color: colors.neutral[500] },
    uploadBox: {
        width: '100%',
        height: 200,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.neutral[300],
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    uploadBoxFilled: { borderStyle: 'solid', borderColor: colors.primary[500] },
    uploadPreview: { width: '100%', height: '100%', borderRadius: borderRadius.lg },
    uploadText: { ...typography.body, color: colors.neutral[500], marginTop: spacing.sm },
    selfieGuide: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        overflow: 'hidden',
    },
    selfiePreview: { width: '100%', height: '100%' },
    faceOutline: {
        width: 100,
        height: 130,
        borderWidth: 2,
        borderColor: colors.neutral[400],
        borderRadius: 50,
    },
    selfieHint: { ...typography.caption, color: colors.neutral[500], marginTop: spacing.sm },
    selfieInstructions: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginBottom: spacing.xl,
    },
    instructionItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    instructionText: { ...typography.caption, color: colors.neutral[600] },
    reviewGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
    reviewItem: { flex: 1, alignItems: 'center' },
    reviewLabel: { ...typography.caption, color: colors.neutral[500], marginBottom: spacing.sm },
    reviewImage: { width: 100, height: 70, borderRadius: borderRadius.sm },
    reviewImageRound: { width: 80, height: 80, borderRadius: 40 },
    editLink: { ...typography.caption, fontWeight: '700', marginTop: spacing.xs },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
        width: '100%',
        ...shadows.sm,
    },
    primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
    backButton: { marginTop: spacing.md },
    backButtonText: { color: colors.neutral[500], fontSize: 14, fontWeight: '600' },
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    successIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    successTitle: { ...typography.h2, marginBottom: spacing.md },
    successSubtitle: {
        ...typography.body,
        color: colors.neutral[500],
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
});

export default VerificationScreen;
