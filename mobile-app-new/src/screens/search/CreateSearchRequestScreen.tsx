import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useSearchRequests } from '../../contexts/SearchRequestContext';
import { useAuth } from '../../contexts/AuthContext';
import { SearchRequest, PropertyLayout } from '../../data/types';

const CreateSearchRequestScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const { addSearchRequest } = useSearchRequests();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    // Form State
    const [formData, setFormData] = useState({
        preferredAreas: '',
        minRent: '',
        maxRent: '',
        propertyType: '' as PropertyLayout,
        bathrooms: '',
        furnished: '',
        petFriendly: false,
        mustHaveFeatures: '',
        serviceTier: 'premium' as 'standard' | 'premium' | 'urgent',
    });

    const updateFormData = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
        else navigation.goBack();
    };

    const handleSubmit = () => {
        if (!user) {
            Alert.alert('Error', 'You must be logged in to create a request');
            return;
        }

        const newRequest: SearchRequest = {
            id: `req-${Date.now()}`,
            tenantId: user.id,
            tenantName: user.name,
            tenantPhone: user.phoneNumber || '',
            status: 'pending_assignment',

            // Location & Budget
            preferredAreas: formData.preferredAreas.split(',').map(a => a.trim()),
            minRent: parseInt(formData.minRent) || 0,
            maxRent: parseInt(formData.maxRent) || 0,
            moveInDate: new Date().toISOString(), // Default to now for mock
            leaseDuration: 'yearly',

            // Property Requirements
            propertyType: formData.propertyType || '1-bedroom',
            beds: 1, // Default
            bedrooms: 1, // Default
            bathrooms: parseInt(formData.bathrooms) || 1,
            furnished: formData.furnished === 'Furnished' ? 'yes' : formData.furnished === 'Semi' ? 'semi' : 'no',
            petFriendly: formData.petFriendly,

            // Amenities
            parkingRequired: false,
            securityFeatures: [],
            utilitiesIncluded: [],
            amenities: [],

            // Additional
            mustHaveFeatures: formData.mustHaveFeatures.split(',').map(f => f.trim()).filter(f => f),
            niceToHaveFeatures: [],
            dealBreakers: [],
            additionalNotes: '',

            // Service
            serviceTier: formData.serviceTier,
            numberOfOptions: formData.serviceTier === 'standard' ? 1 : formData.serviceTier === 'premium' ? 3 : 5,
            depositAmount: formData.serviceTier === 'standard' ? 5000 : formData.serviceTier === 'premium' ? 10000 : 15000,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),

            // Assignment
            hunterId: '',

            // Bidding
            bidsOpen: true,
            bidsCloseAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            bids: [],
            timeframeExtensions: [],

            // Delivery
            uploadedEvidence: [],

            // Meeting & Viewing
            viewingConfirmed: false,

            // Refund/Dispute
            refundRequested: false,

            // Payment
            depositPaid: true, // Simulating immediate payment
            depositPaidAt: new Date().toISOString(),
            paymentReleased: false,

            // Timestamps
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            submittedProperties: [],
        };

        addSearchRequest(newRequest);

        Alert.alert(
            'Request Created',
            'Your search request has been posted! Hunters will start bidding soon.',
            [{
                text: 'View Request',
                onPress: () => {
                    // Navigate to the detail screen of the new request
                    // We need to ensure the navigation stack is correct
                    navigation.goBack();
                    (navigation as any).navigate('SearchRequestDetail', { requestId: newRequest.id });
                }
            }]
        );
    };

    const renderStepIndicator = () => (
        <View style={styles.indicatorContainer}>
            {[1, 2, 3, 4].map((i) => (
                <View
                    key={i}
                    style={[
                        styles.indicator,
                        { backgroundColor: i <= step ? colors.text.light : colors.neutral[200] }
                    ]}
                />
            ))}
        </View>
    );

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                Where and how much?
            </Text>
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Location</Text>
                <TextInput
                    style={[styles.input, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], color: isDark ? colors.text.dark : colors.text.light }]}
                    placeholder="e.g. Westlands, Kilimani"
                    placeholderTextColor={colors.neutral[400]}
                    value={formData.preferredAreas}
                    onChangeText={(val) => updateFormData('preferredAreas', val)}
                />
            </View>
            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Min Rent</Text>
                    <TextInput
                        style={[styles.input, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], color: isDark ? colors.text.dark : colors.text.light }]}
                        placeholder="20,000"
                        placeholderTextColor={colors.neutral[400]}
                        keyboardType="numeric"
                        value={formData.minRent}
                        onChangeText={(val) => updateFormData('minRent', val)}
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Max Rent</Text>
                    <TextInput
                        style={[styles.input, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], color: isDark ? colors.text.dark : colors.text.light }]}
                        placeholder="40,000"
                        placeholderTextColor={colors.neutral[400]}
                        keyboardType="numeric"
                        value={formData.maxRent}
                        onChangeText={(val) => updateFormData('maxRent', val)}
                    />
                </View>
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                What kind of place?
            </Text>
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Property Type</Text>
                <View style={styles.optionsGrid}>
                    {['Bedsitter', '1-Bedroom', '2-Bedroom', '3-Bedroom'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.optionChip,
                                { borderColor: isDark ? colors.neutral[700] : colors.neutral[200] },
                                formData.propertyType === type && { borderColor: colors.text.light, borderWidth: 2 }
                            ]}
                            onPress={() => updateFormData('propertyType', type)}
                        >
                            <Text style={[styles.optionText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Furnishing</Text>
                <View style={styles.optionsGrid}>
                    {['Furnished', 'Semi', 'Unfurnished'].map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.optionChip,
                                { borderColor: isDark ? colors.neutral[700] : colors.neutral[200] },
                                formData.furnished === option && { borderColor: colors.text.light, borderWidth: 2 }
                            ]}
                            onPress={() => updateFormData('furnished', option)}
                        >
                            <Text style={[styles.optionText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                Any must-haves?
            </Text>
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Features</Text>
                <TextInput
                    style={[styles.textArea, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], color: isDark ? colors.text.dark : colors.text.light }]}
                    placeholder="e.g. Balcony, Natural lighting, High floor..."
                    placeholderTextColor={colors.neutral[400]}
                    multiline
                    numberOfLines={4}
                    value={formData.mustHaveFeatures}
                    onChangeText={(val) => updateFormData('mustHaveFeatures', val)}
                />
            </View>
            <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => updateFormData('petFriendly', !formData.petFriendly)}
            >
                <View style={[styles.checkbox, formData.petFriendly && { backgroundColor: colors.text.light, borderColor: colors.text.light }]}>
                    {formData.petFriendly && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text style={[styles.checkboxLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>Pet Friendly</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                Choose your service
            </Text>
            <View style={styles.tiersContainer}>
                {[
                    { id: 'standard', name: 'Standard', price: '5,000', delivery: '7 days' },
                    { id: 'premium', name: 'Premium', price: '8,000', delivery: '5 days' },
                    { id: 'urgent', name: 'Urgent', price: '12,000', delivery: '3 days' },
                ].map((tier) => (
                    <TouchableOpacity
                        key={tier.id}
                        style={[
                            styles.tierCard,
                            { borderColor: isDark ? colors.neutral[700] : colors.neutral[200] },
                            formData.serviceTier === tier.id && { borderColor: colors.text.light, borderWidth: 2 }
                        ]}
                        onPress={() => updateFormData('serviceTier', tier.id)}
                    >
                        <View style={styles.tierInfo}>
                            <Text style={[styles.tierName, { color: isDark ? colors.text.dark : colors.text.light }]}>{tier.name}</Text>
                            <Text style={styles.tierDelivery}>{tier.delivery} delivery</Text>
                        </View>
                        <Text style={styles.tierPrice}>KES {tier.price}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={prevStep} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                {renderStepIndicator()}
                <View style={{ width: 40 }} />
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={step === totalSteps ? handleSubmit : nextStep}
                    >
                        <Text style={styles.nextButtonText}>
                            {step === totalSteps ? 'Pay & Submit' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    indicatorContainer: {
        flexDirection: 'row',
        gap: 6,
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    indicator: {
        width: 30,
        height: 4,
        borderRadius: 2,
    },
    scrollContent: { padding: spacing.lg },
    stepContainer: { gap: spacing.xl },
    stepTitle: {
        ...typography.h1,
        fontSize: 28,
        marginBottom: spacing.md,
    },
    inputGroup: { gap: spacing.xs },
    label: {
        ...typography.bodySemiBold,
        fontSize: 14,
        color: colors.neutral[500],
    },
    input: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        ...typography.body,
        fontSize: 16,
    },
    textArea: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        ...typography.body,
        fontSize: 16,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    row: { flexDirection: 'row', gap: spacing.md },
    optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    optionChip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
    },
    optionText: { ...typography.bodySemiBold },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.neutral[300],
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxLabel: { ...typography.body },
    tiersContainer: { gap: spacing.md },
    tierCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
    },
    tierInfo: { gap: 2 },
    tierName: { ...typography.bodySemiBold, fontSize: 18 },
    tierDelivery: { ...typography.caption, color: colors.neutral[500] },
    tierPrice: { ...typography.bodySemiBold, fontSize: 18, color: colors.primary[500] },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    nextButton: {
        backgroundColor: colors.text.light,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    nextButtonText: {
        ...typography.bodySemiBold,
        color: 'white',
        fontSize: 16,
    },
});

export default CreateSearchRequestScreen;
