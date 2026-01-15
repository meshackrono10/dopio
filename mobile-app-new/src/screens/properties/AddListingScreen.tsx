import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useProperties } from '../../contexts/PropertyContext';
import { PropertyListing } from '../../data/types';
import Button from '../../components/common/Button';

const AMENITIES = [
    'Parking', 'Balcony', 'Security', 'Water Tank', 'Spacious Kitchen',
    'Gym', 'Swimming Pool', 'Backup Generator', 'CCTV', 'Elevator'
];

const PROPERTY_TYPES = ['Apartment', 'House', 'Bedsitter', 'Bungalow', 'Condo', 'Studio'];
const COUNTIES = ['Nairobi', 'Kiambu', 'Kajiado', 'Machakos', 'Mombasa', 'Nakuru'];

const AddListingScreen = () => {
    const { isDark } = useTheme();
    const { addProperty } = useProperties();
    const navigation = useNavigation();

    const [step, setStep] = useState(1);
    const totalSteps = 10;

    // Form state
    const [title, setTitle] = useState('');
    const [propertyType, setPropertyType] = useState('Apartment');
    const [rent, setRent] = useState('');
    const [deposit, setDeposit] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [size, setSize] = useState('');
    const [generalArea, setGeneralArea] = useState('');
    const [county, setCounty] = useState('Nairobi');
    const [directions, setDirections] = useState('');
    const [description, setDescription] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [waterIncluded, setWaterIncluded] = useState(false);
    const [electricityType, setElectricityType] = useState<'prepaid' | 'postpaid'>('prepaid');
    const [images, setImages] = useState<string[]>([]);
    const [videoUrl, setVideoUrl] = useState('');

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step === 1) {
            navigation.goBack();
        } else {
            setStep(step - 1);
        }
    };

    const validateStep = () => {
        switch (step) {
            case 1:
                if (!title || !propertyType) {
                    Alert.alert('Required', 'Please enter title and property type');
                    return false;
                }
                return true;
            case 2:
                if (!rent || !deposit) {
                    Alert.alert('Required', 'Please enter rent and deposit amount');
                    return false;
                }
                return true;
            case 3:
                if (!generalArea || !county) {
                    Alert.alert('Required', 'Please enter area and county');
                    return false;
                }
                return true;
            case 4:
                if (!bedrooms || !bathrooms) {
                    Alert.alert('Required', 'Please enter bedrooms and bathrooms');
                    return false;
                }
                return true;
            case 7:
                if (!description || description.length < 50) {
                    Alert.alert('Required', 'Please provide a detailed description (min 50 chars)');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleSubmit = () => {
        const newProperty: PropertyListing = {
            id: `prop-${Date.now()}`,
            title,
            description,
            rent: parseInt(rent),
            deposit: parseInt(deposit),
            propertyType,
            layout: `${bedrooms}-bedroom` as any,
            beds: parseInt(bedrooms),
            bedrooms: parseInt(bedrooms),
            bathrooms: parseInt(bathrooms),
            location: {
                generalArea,
                county,
                directions,
            },
            amenities: selectedAmenities,
            utilities: {
                waterIncluded,
                electricityType,
            },
            images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800'],
            videoUrl,
            houseHunter: {
                id: 'hunter-1',
                name: 'John Kamau',
                phone: '+254 712 345 678',
                profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                isVerified: true,
                rating: 4.8,
                reviewCount: 234,
                successfulViewings: 234,
                bio: '',
                areasOfOperation: [county],
                joinedDate: new Date().toISOString(),
            },
            viewingPackages: [],
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            viewCount: 0,
            bookingCount: 0,
        };

        addProperty(newProperty);
        Alert.alert('Success', 'Property listing submitted for review!', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Basic Info</Text>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Property Title *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[800] : 'white', color: isDark ? colors.text.dark : colors.text.light }]}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="e.g., Modern 2-Bedroom in Westlands"
                                placeholderTextColor={colors.neutral[400]}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Property Type *</Text>
                            <View style={styles.chipGrid}>
                                {PROPERTY_TYPES.map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.chip, propertyType === type && styles.chipActive]}
                                        onPress={() => setPropertyType(type)}
                                    >
                                        <Text style={[styles.chipText, propertyType === type && styles.chipTextActive]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                );
            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Pricing</Text>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Monthly Rent (KES) *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[800] : 'white', color: isDark ? colors.text.dark : colors.text.light }]}
                                value={rent}
                                onChangeText={setRent}
                                keyboardType="numeric"
                                placeholder="35000"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Security Deposit (KES) *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[800] : 'white', color: isDark ? colors.text.dark : colors.text.light }]}
                                value={deposit}
                                onChangeText={setDeposit}
                                keyboardType="numeric"
                                placeholder="35000"
                            />
                        </View>
                    </View>
                );
            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Location</Text>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>County *</Text>
                            <View style={styles.chipGrid}>
                                {COUNTIES.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        style={[styles.chip, county === c && styles.chipActive]}
                                        onPress={() => setCounty(c)}
                                    >
                                        <Text style={[styles.chipText, county === c && styles.chipTextActive]}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>General Area *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[800] : 'white', color: isDark ? colors.text.dark : colors.text.light }]}
                                value={generalArea}
                                onChangeText={setGeneralArea}
                                placeholder="e.g., Kileleshwa"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Directions</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: isDark ? colors.neutral[800] : 'white', color: isDark ? colors.text.dark : colors.text.light }]}
                                value={directions}
                                onChangeText={setDirections}
                                multiline
                                placeholder="e.g., Near Kileleshwa Police Station"
                            />
                        </View>
                    </View>
                );
            case 4:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Property Details</Text>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Bedrooms *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDark ? colors.neutral[800] : 'white', color: isDark ? colors.text.dark : colors.text.light }]}
                                    value={bedrooms}
                                    onChangeText={setBedrooms}
                                    keyboardType="numeric"
                                    placeholder="2"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Bathrooms *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDark ? colors.neutral[800] : 'white', color: isDark ? colors.text.dark : colors.text.light }]}
                                    value={bathrooms}
                                    onChangeText={setBathrooms}
                                    keyboardType="numeric"
                                    placeholder="2"
                                />
                            </View>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Size (sq ft)</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[800] : 'white', color: isDark ? colors.text.dark : colors.text.light }]}
                                value={size}
                                onChangeText={setSize}
                                keyboardType="numeric"
                                placeholder="1200"
                            />
                        </View>
                    </View>
                );
            case 5:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Amenities</Text>
                        <View style={styles.amenitiesGrid}>
                            {AMENITIES.map(amenity => (
                                <TouchableOpacity
                                    key={amenity}
                                    style={[styles.amenityChip, selectedAmenities.includes(amenity) && styles.amenityChipActive]}
                                    onPress={() => toggleAmenity(amenity)}
                                >
                                    <Ionicons
                                        name={selectedAmenities.includes(amenity) ? "checkmark-circle" : "add-circle-outline"}
                                        size={20}
                                        color={selectedAmenities.includes(amenity) ? colors.primary[500] : colors.neutral[400]}
                                    />
                                    <Text style={[styles.amenityText, selectedAmenities.includes(amenity) && styles.amenityTextActive]}>{amenity}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );
            case 6:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Utilities</Text>
                        <TouchableOpacity
                            style={[styles.toggleRow, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                            onPress={() => setWaterIncluded(!waterIncluded)}
                        >
                            <View>
                                <Text style={[styles.toggleLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>Water Included in Rent</Text>
                                <Text style={styles.toggleSubtext}>Check if water bill is covered by rent</Text>
                            </View>
                            <Ionicons
                                name={waterIncluded ? "checkbox" : "square-outline"}
                                size={24}
                                color={waterIncluded ? colors.primary[500] : colors.neutral[400]}
                            />
                        </TouchableOpacity>

                        <Text style={[styles.label, { marginTop: spacing.xl, color: isDark ? colors.text.dark : colors.text.light }]}>Electricity Type</Text>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[styles.radioOption, electricityType === 'prepaid' && styles.radioActive]}
                                onPress={() => setElectricityType('prepaid')}
                            >
                                <Ionicons name={electricityType === 'prepaid' ? "radio-button-on" : "radio-button-off"} size={20} color={electricityType === 'prepaid' ? colors.primary[500] : colors.neutral[400]} />
                                <Text style={[styles.radioText, electricityType === 'prepaid' && styles.radioTextActive]}>Prepaid (Token)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.radioOption, electricityType === 'postpaid' && styles.radioActive]}
                                onPress={() => setElectricityType('postpaid')}
                            >
                                <Ionicons name={electricityType === 'postpaid' ? "radio-button-on" : "radio-button-off"} size={20} color={electricityType === 'postpaid' ? colors.primary[500] : colors.neutral[400]} />
                                <Text style={[styles.radioText, electricityType === 'postpaid' && styles.radioTextActive]}>Postpaid</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 7:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Description</Text>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Property Description *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: isDark ? colors.neutral[800] : 'white', color: isDark ? colors.text.dark : colors.text.light }]}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={10}
                                placeholder="Describe the property's best features, the neighborhood, and any other important details..."
                            />
                            <Text style={styles.charCount}>{description.length} / 50 characters min</Text>
                        </View>
                    </View>
                );
            case 8:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Photos</Text>
                        <TouchableOpacity
                            style={styles.uploadBox}
                            onPress={() => Alert.alert('Upload', 'Image picker coming soon')}
                        >
                            <Ionicons name="camera-outline" size={48} color={colors.primary[500]} />
                            <Text style={styles.uploadText}>Add Property Photos</Text>
                            <Text style={styles.uploadSubtext}>Add at least 5 high-quality photos</Text>
                        </TouchableOpacity>
                        <View style={styles.imageGrid}>
                            {images.map((img, i) => (
                                <View key={i} style={styles.imagePreview}>
                                    <Image source={{ uri: img }} style={styles.previewImg} />
                                    <TouchableOpacity style={styles.removeImg}>
                                        <Ionicons name="close-circle" size={20} color={colors.error[500]} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                );
            case 9:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Video Tour</Text>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Video URL (Optional)</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[800] : 'white', color: isDark ? colors.text.dark : colors.text.light }]}
                                value={videoUrl}
                                onChangeText={setVideoUrl}
                                placeholder="YouTube or Vimeo link"
                            />
                        </View>
                        <View style={styles.videoTip}>
                            <Ionicons name="bulb-outline" size={24} color={colors.warning} />
                            <Text style={styles.tipText}>Listings with video tours get 3x more inquiries!</Text>
                        </View>
                    </View>
                );
            case 10:
                return (
                    <View style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Review</Text>
                        <View style={[styles.reviewCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <Text style={[styles.reviewTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>{title || 'Untitled Property'}</Text>
                            <Text style={styles.reviewPrice}>KES {rent}/month</Text>
                            <View style={styles.reviewRow}>
                                <Ionicons name="location-outline" size={16} color={colors.neutral[500]} />
                                <Text style={styles.reviewText}>{generalArea}, {county}</Text>
                            </View>
                            <View style={styles.reviewRow}>
                                <Ionicons name="bed-outline" size={16} color={colors.neutral[500]} />
                                <Text style={styles.reviewText}>{bedrooms} Bedrooms • {bathrooms} Bathrooms</Text>
                            </View>
                            <View style={styles.divider} />
                            <Text style={[styles.reviewLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>Amenities</Text>
                            <Text style={styles.reviewText}>{selectedAmenities.join(', ') || 'None selected'}</Text>
                        </View>
                        <Text style={styles.submitDisclaimer}>
                            By submitting, you agree to our Terms of Service and confirm that all information provided is accurate.
                        </Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Add Listing</Text>
                        <Text style={styles.headerSubtitle}>Step {step} of {totalSteps}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                    </TouchableOpacity>
                </SafeAreaView>

                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${(step / totalSteps) * 100}%` }]} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {renderStepContent()}
                </ScrollView>

                <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                    <View style={styles.footerActions}>
                        {step > 1 && (
                            <Button
                                variant="outline"
                                style={styles.footerButton}
                                onPress={handleBack}
                            >
                                Back
                            </Button>
                        )}
                        <Button
                            style={[styles.footerButton, { flex: 2 }]}
                            onPress={step === totalSteps ? handleSubmit : handleNext}
                        >
                            {step === totalSteps ? 'Submit Listing' : 'Next'}
                        </Button>
                    </View>
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
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    headerSubtitle: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    closeButton: {
        padding: spacing.xs,
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: colors.neutral[100],
        width: '100%',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.primary[500],
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    stepContainer: {
        flex: 1,
    },
    stepTitle: {
        ...typography.h2,
        fontSize: 24,
        marginBottom: spacing.xl,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.bodySemiBold,
        fontSize: 14,
        marginBottom: spacing.sm,
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
        height: 100,
        paddingTop: spacing.md,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    chipActive: {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[500],
    },
    chipText: {
        ...typography.caption,
        fontWeight: '600',
        color: colors.neutral[600],
    },
    chipTextActive: {
        color: 'white',
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    amenityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        width: (Dimensions.get('window').width - spacing.lg * 2 - spacing.md) / 2,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    amenityChipActive: {
        backgroundColor: colors.primary[50],
        borderColor: colors.primary[500],
    },
    amenityText: {
        ...typography.caption,
        color: colors.neutral[600],
    },
    amenityTextActive: {
        color: colors.primary[500],
        fontWeight: '600',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    toggleLabel: {
        ...typography.bodySemiBold,
    },
    toggleSubtext: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    radioOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    radioActive: {
        borderColor: colors.primary[500],
        backgroundColor: colors.primary[50],
    },
    radioText: {
        ...typography.caption,
        color: colors.neutral[600],
    },
    radioTextActive: {
        color: colors.primary[500],
        fontWeight: '600',
    },
    charCount: {
        ...typography.caption,
        textAlign: 'right',
        marginTop: 4,
        color: colors.neutral[400],
    },
    uploadBox: {
        height: 200,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.neutral[200],
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    uploadText: {
        ...typography.bodySemiBold,
        color: colors.primary[500],
    },
    uploadSubtext: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.lg,
    },
    imagePreview: {
        width: (Dimensions.get('window').width - spacing.lg * 2 - spacing.sm * 2) / 3,
        height: 100,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    previewImg: {
        width: '100%',
        height: '100%',
    },
    removeImg: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    videoTip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.lg,
        backgroundColor: colors.warning + '15',
        borderRadius: borderRadius.lg,
        marginTop: spacing.xl,
    },
    tipText: {
        ...typography.caption,
        color: colors.warning,
        flex: 1,
        fontWeight: '600',
    },
    reviewCard: {
        padding: spacing.xl,
        borderRadius: borderRadius.xl,
        ...shadows.md,
    },
    reviewTitle: {
        ...typography.h3,
        marginBottom: 4,
    },
    reviewPrice: {
        ...typography.h2,
        color: colors.primary[500],
        marginBottom: spacing.md,
    },
    reviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: 4,
    },
    reviewText: {
        ...typography.body,
        color: colors.neutral[600],
    },
    divider: {
        height: 1,
        backgroundColor: colors.neutral[100],
        marginVertical: spacing.lg,
    },
    reviewLabel: {
        ...typography.bodySemiBold,
        marginBottom: spacing.xs,
    },
    submitDisclaimer: {
        ...typography.caption,
        color: colors.neutral[500],
        textAlign: 'center',
        marginTop: spacing.xl,
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    footerActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    footerButton: {
        flex: 1,
    },
});

export default AddListingScreen;
