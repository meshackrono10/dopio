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
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';

type VerificationStep = 'upload-id' | 'take-selfie' | 'review';
type VerificationStatusType = 'not-started' | 'pending' | 'approved' | 'rejected';

const HunterVerificationScreen = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation();

    const [currentStep, setCurrentStep] = useState<VerificationStep>('upload-id');
    const [idImage, setIdImage] = useState<string | null>(null);
    const [selfieImage, setSelfieImage] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const cameraRef = React.useRef<any>(null);

    // Mock verification status - in real app, fetch from backend
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatusType>('not-started');

    const pickIdImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow access to your photos to upload your ID');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setIdImage(result.assets[0].uri);
        }
    };

    const openCamera = async () => {
        if (!cameraPermission?.granted) {
            const permission = await requestCameraPermission();
            if (!permission.granted) {
                Alert.alert('Permission needed', 'Please allow camera access to take your selfie');
                return;
            }
        }
        setShowCamera(true);
    };

    const takeSelfie = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
                setSelfieImage(photo.uri);
                setShowCamera(false);
            } catch (error) {
                Alert.alert('Error', 'Failed to take photo. Please try again.');
            }
        }
    };

    const handleNextStep = () => {
        if (currentStep === 'upload-id') {
            if (!idImage) {
                Alert.alert('ID Required', 'Please upload your ID document first');
                return;
            }
            setCurrentStep('take-selfie');
        } else if (currentStep === 'take-selfie') {
            if (!selfieImage) {
                Alert.alert('Selfie Required', 'Please take a selfie for verification');
                return;
            }
            setCurrentStep('review');
        }
    };

    const handleSubmit = () => {
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setVerificationStatus('pending');
            Alert.alert(
                'Submitted Successfully!',
                'Your verification request has been submitted. We\'ll review it within 24-48 hours.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        }, 2000);
    };

    const renderStepIndicator = () => {
        const steps = [
            { id: 'upload-id', label: 'Upload ID', icon: 'card-outline' },
            { id: 'take-selfie', label: 'Take Selfie', icon: 'camera-outline' },
            { id: 'review', label: 'Review', icon: 'checkmark-circle-outline' },
        ];

        const currentIndex = steps.findIndex(s => s.id === currentStep);

        return (
            <View style={styles.stepIndicator}>
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <View style={styles.stepItem}>
                            <View style={[
                                styles.stepCircle,
                                index <= currentIndex && styles.stepCircleActive,
                                { backgroundColor: index <= currentIndex ? colors.primary[500] : (isDark ? colors.neutral[700] : colors.neutral[200]) }
                            ]}>
                                <Ionicons
                                    name={step.icon as any}
                                    size={20}
                                    color={index <= currentIndex ? 'white' : colors.neutral[400]}
                                />
                            </View>
                            <Text style={[
                                styles.stepLabel,
                                { color: index <= currentIndex ? (isDark ? colors.text.dark : colors.text.light) : colors.neutral[400] }
                            ]}>
                                {step.label}
                            </Text>
                        </View>
                        {index < steps.length - 1 && (
                            <View style={[
                                styles.stepLine,
                                index < currentIndex && styles.stepLineActive,
                                { backgroundColor: index < currentIndex ? colors.primary[500] : (isDark ? colors.neutral[700] : colors.neutral[200]) }
                            ]} />
                        )}
                    </React.Fragment>
                ))}
            </View>
        );
    };

    if (showCamera) {
        return (
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing="front"
                    ref={cameraRef}
                >
                    <View style={styles.cameraOverlay}>
                        <View style={styles.cameraGuide} />
                        <Text style={styles.cameraInstruction}>
                            Position your face within the circle
                        </Text>
                    </View>
                </CameraView>
                <View style={styles.cameraControls}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setShowCamera(false)}
                    >
                        <Ionicons name="close" size={24} color="white" />
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={takeSelfie}
                    >
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>
                    <View style={{ width: 80 }} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Verify Your Identity
                </Text>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            {renderStepIndicator()}

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {currentStep === 'upload-id' && (
                    <View style={styles.stepContent}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="card" size={60} color={colors.primary[500]} />
                        </View>
                        <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Upload Your ID
                        </Text>
                        <Text style={[styles.stepDescription, { color: colors.neutral[500] }]}>
                            Please upload a clear photo of your national ID, passport, or driver's license
                        </Text>

                        {idImage ? (
                            <View style={styles.imagePreview}>
                                <Image source={{ uri: idImage }} style={styles.previewImage} />
                                <TouchableOpacity
                                    style={styles.changeImageButton}
                                    onPress={pickIdImage}
                                >
                                    <Ionicons name="refresh" size={20} color={colors.primary[500]} />
                                    <Text style={[styles.changeImageText, { color: colors.primary[500] }]}>
                                        Change Image
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[styles.uploadButton, { borderColor: isDark ? colors.neutral[600] : colors.neutral[300] }]}
                                onPress={pickIdImage}
                            >
                                <Ionicons name="cloud-upload-outline" size={40} color={colors.primary[500]} />
                                <Text style={[styles.uploadButtonText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Tap to Upload ID
                                </Text>
                                <Text style={[styles.uploadButtonHint, { color: colors.neutral[500] }]}>
                                    JPG, PNG up to 10MB
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View style={[styles.tipsCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <Text style={[styles.tipsTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                📸 Tips for a good photo:
                            </Text>
                            <Text style={[styles.tipText, { color: colors.neutral[500] }]}>
                                • Ensure all text is clearly visible
                            </Text>
                            <Text style={[styles.tipText, { color: colors.neutral[500] }]}>
                                • Avoid glare and shadows
                            </Text>
                            <Text style={[styles.tipText, { color: colors.neutral[500] }]}>
                                • Capture the entire document
                            </Text>
                        </View>
                    </View>
                )}

                {currentStep === 'take-selfie' && (
                    <View style={styles.stepContent}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="camera" size={60} color={colors.primary[500]} />
                        </View>
                        <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Take a Selfie
                        </Text>
                        <Text style={[styles.stepDescription, { color: colors.neutral[500] }]}>
                            We need a live selfie to verify your identity matches your ID
                        </Text>

                        {selfieImage ? (
                            <View style={styles.imagePreview}>
                                <Image source={{ uri: selfieImage }} style={styles.previewImage} />
                                <TouchableOpacity
                                    style={styles.changeImageButton}
                                    onPress={openCamera}
                                >
                                    <Ionicons name="refresh" size={20} color={colors.primary[500]} />
                                    <Text style={[styles.changeImageText, { color: colors.primary[500] }]}>
                                        Retake Selfie
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[styles.selfieButton, { backgroundColor: colors.primary[500] }]}
                                onPress={openCamera}
                            >
                                <Ionicons name="camera" size={32} color="white" />
                                <Text style={styles.selfieButtonText}>Open Camera</Text>
                            </TouchableOpacity>
                        )}

                        <View style={[styles.tipsCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <Text style={[styles.tipsTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                🤳 Selfie Guidelines:
                            </Text>
                            <Text style={[styles.tipText, { color: colors.neutral[500] }]}>
                                • Face the camera directly
                            </Text>
                            <Text style={[styles.tipText, { color: colors.neutral[500] }]}>
                                • Remove glasses and hats
                            </Text>
                            <Text style={[styles.tipText, { color: colors.neutral[500] }]}>
                                • Use good lighting
                            </Text>
                            <Text style={[styles.tipText, { color: colors.neutral[500] }]}>
                                • No filters or editing
                            </Text>
                        </View>
                    </View>
                )}

                {currentStep === 'review' && (
                    <View style={styles.stepContent}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="checkmark-circle" size={60} color={colors.success} />
                        </View>
                        <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Review & Submit
                        </Text>
                        <Text style={[styles.stepDescription, { color: colors.neutral[500] }]}>
                            Please review your documents before submitting
                        </Text>

                        <View style={styles.reviewGrid}>
                            <View style={styles.reviewItem}>
                                <Text style={[styles.reviewLabel, { color: colors.neutral[500] }]}>ID Document</Text>
                                {idImage && (
                                    <Image source={{ uri: idImage }} style={styles.reviewImage} />
                                )}
                            </View>
                            <View style={styles.reviewItem}>
                                <Text style={[styles.reviewLabel, { color: colors.neutral[500] }]}>Your Selfie</Text>
                                {selfieImage && (
                                    <Image source={{ uri: selfieImage }} style={styles.reviewImage} />
                                )}
                            </View>
                        </View>

                        <View style={[styles.infoCard, { backgroundColor: isDark ? colors.neutral[800] : colors.primary[50] }]}>
                            <Ionicons name="information-circle" size={20} color={colors.primary[500]} />
                            <Text style={[styles.infoText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                                Your documents will be reviewed within 24-48 hours. You'll be notified once verified.
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                {currentStep !== 'review' ? (
                    <Button
                        onPress={handleNextStep}
                        style={styles.footerButton}
                    >
                        Continue
                    </Button>
                ) : (
                    <Button
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        style={styles.footerButton}
                    >
                        {isSubmitting ? "Submitting..." : "Submit for Verification"}
                    </Button>
                )}
            </View>
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
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    stepItem: {
        alignItems: 'center',
    },
    stepCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    stepCircleActive: {
        ...shadows.md,
    },
    stepLabel: {
        ...typography.caption,
        fontSize: 11,
    },
    stepLine: {
        width: 40,
        height: 2,
        marginHorizontal: 4,
        marginBottom: 20,
    },
    stepLineActive: {},
    content: {
        padding: spacing.lg,
        paddingBottom: 100,
    },
    stepContent: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.primary[500] + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    stepTitle: {
        ...typography.h2,
        fontSize: 24,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    stepDescription: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    uploadButton: {
        width: '100%',
        height: 200,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    uploadButtonText: {
        ...typography.bodySemiBold,
        marginTop: spacing.sm,
    },
    uploadButtonHint: {
        ...typography.caption,
        marginTop: spacing.xs,
    },
    imagePreview: {
        width: '100%',
        marginBottom: spacing.lg,
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: 250,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },
    changeImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
    },
    changeImageText: {
        ...typography.bodySemiBold,
    },
    selfieButton: {
        width: '100%',
        height: 120,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    selfieButtonText: {
        ...typography.h3,
        color: 'white',
        fontSize: 20,
    },
    tipsCard: {
        width: '100%',
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        ...shadows.sm,
    },
    tipsTitle: {
        ...typography.bodySemiBold,
        marginBottom: spacing.sm,
    },
    tipText: {
        ...typography.body,
        fontSize: 14,
        marginBottom: 4,
    },
    reviewGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
        marginBottom: spacing.lg,
    },
    reviewItem: {
        flex: 1,
    },
    reviewLabel: {
        ...typography.caption,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    reviewImage: {
        width: '100%',
        height: 200,
        borderRadius: borderRadius.md,
    },
    infoCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
        width: '100%',
    },
    infoText: {
        ...typography.body,
        flex: 1,
        fontSize: 13,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
        ...shadows.lg,
    },
    footerButton: {
        width: '100%',
    },
    // Camera styles
    cameraContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraGuide: {
        width: 250,
        height: 250,
        borderRadius: 125,
        borderWidth: 3,
        borderColor: colors.primary[500],
        backgroundColor: 'transparent',
    },
    cameraInstruction: {
        ...typography.body,
        color: 'white',
        marginTop: spacing.xl,
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    cameraControls: {
        height: 120,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        backgroundColor: 'black',
    },
    cancelButton: {
        alignItems: 'center',
        gap: 4,
    },
    cancelButtonText: {
        ...typography.caption,
        color: 'white',
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary[500],
    },
});

export default HunterVerificationScreen;
