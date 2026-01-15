import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useProperties } from '../../contexts/PropertyContext';
import { PropertyLayout, ListingStatus } from '../../data/types';

type EditPropertyParams = {
    EditProperty: {
        propertyId: string;
    };
};

const PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Bedsitter', 'Townhouse', 'Villa'];
const PROPERTY_LAYOUTS: PropertyLayout[] = ['bedsitter', 'studio', '1-bedroom', '2-bedroom', '3-bedroom', '4-bedroom+'];

const AMENITIES = [
    'Parking', 'Balcony', 'Security', 'Water Tank', 'Spacious Kitchen',
    'Gym', 'Swimming Pool', 'Backup Generator', 'CCTV', 'Elevator'
];

const PROPERTY_STATUS = ['pending', 'approved', 'rejected', 'inactive'] as const;

const EditPropertyScreen = () => {
    const { isDark } = useTheme();
    const { updateProperty, getPropertyById, deleteProperty, isPropertyLocked } = useProperties();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<EditPropertyParams, 'EditProperty'>>();

    const propertyId = route.params?.propertyId;
    const property = getPropertyById(propertyId);
    const isLocked = isPropertyLocked(propertyId);

    if (!property) {
        Alert.alert('Error', 'Property not found');
        navigation.goBack();
        return null;
    }

    // Check if property is locked (active booking)
    if (isLocked) {
        return (
            <SafeAreaView style={[{ flex: 1, backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
                    <Ionicons name="lock-closed" size={64} color={colors.warning} />
                    <Text style={[typography.h3, { color: isDark ? colors.text.dark : colors.text.light, marginTop: spacing.lg, textAlign: 'center' }]}>
                        Property Locked
                    </Text>
                    <Text style={[typography.body, { color: colors.neutral[500], textAlign: 'center', marginTop: spacing.sm }]}>
                        This property cannot be edited because it has an active booking.
                        Please wait for the booking to complete or be cancelled.
                    </Text>
                    <TouchableOpacity
                        style={{
                            backgroundColor: colors.primary[500],
                            paddingHorizontal: spacing.xl,
                            paddingVertical: spacing.md,
                            borderRadius: borderRadius.md,
                            marginTop: spacing.xl,
                        }}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={{ color: 'white', fontWeight: '700' }}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const [title, setTitle] = useState(property.title);
    const [rent, setRent] = useState(property.rent.toString());
    const [deposit, setDeposit] = useState(property.deposit.toString());
    const [description, setDescription] = useState(property.description);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(property.amenities || []);
    const [status, setStatus] = useState<ListingStatus>(property.status || 'pending');
    const [images, setImages] = useState<string[]>(property.images as string[]);

    // Location State
    const [generalArea, setGeneralArea] = useState(property.location.generalArea);
    const [county, setCounty] = useState(property.location.county);
    const [directions, setDirections] = useState(property.location.directions);

    // Property Specs State
    const [propertyType, setPropertyType] = useState(property.propertyType);
    const [layout, setLayout] = useState<PropertyLayout>(property.layout);
    const [bedrooms, setBedrooms] = useState(property.bedrooms.toString());
    const [bathrooms, setBathrooms] = useState(property.bathrooms.toString());

    // Additional Specs
    const [petFriendly, setPetFriendly] = useState(property.petFriendly || false);
    const [videoUrl, setVideoUrl] = useState(property.videoUrl || '');

    // Utilities State
    const [waterPaymentType, setWaterPaymentType] = useState<'included' | 'flat' | 'meter'>(
        property.utilities?.waterCost?.includes('meter') ? 'meter' :
            property.utilities?.waterIncluded ? 'included' : 'flat'
    );
    const [waterCostPerMeter, setWaterCostPerMeter] = useState(property.utilities?.waterCost?.match(/\d+/)?.[0] || '');
    const [electricityType, setElectricityType] = useState<'included' | 'prepaid' | 'postpaid'>(property.utilities?.electricityType || 'prepaid');

    // Kenyan Specific Features
    const [hasBorehole, setHasBorehole] = useState(property.amenities?.includes('Borehole') || false);
    const [isGatedCommunity, setIsGatedCommunity] = useState(property.amenities?.includes('Gated Community') || false);
    const [garbageFee, setGarbageFee] = useState('');
    const [securityFee, setSecurityFee] = useState('');

    // Parking State
    const [parkingAvailable, setParkingAvailable] = useState(property.parking?.available || false);

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleSave = () => {
        if (!title || !rent || !deposit) {
            Alert.alert('Required Fields', 'Please fill all required fields');
            return;
        }

        updateProperty(propertyId, {
            title,
            rent: parseInt(rent),
            deposit: parseInt(deposit),
            description,
            amenities: [
                ...selectedAmenities.filter(a => a !== 'Borehole' && a !== 'Gated Community'),
                ...(hasBorehole ? ['Borehole'] : []),
                ...(isGatedCommunity ? ['Gated Community'] : []),
            ],
            status,
            images,
            location: {
                ...property.location,
                generalArea,
                county,
                directions,
            },
            propertyType,
            layout: propertyType === 'Bedsitter' ? 'bedsitter' : layout,
            bedrooms: propertyType === 'Bedsitter' ? 0 : parseInt(bedrooms),
            bathrooms: parseInt(bathrooms),
            petFriendly,
            videoUrl,
            utilities: {
                ...property.utilities,
                waterIncluded: waterPaymentType === 'included',
                electricityType: electricityType as any,
                waterCost: waterPaymentType === 'meter' ? `KES ${waterCostPerMeter}/meter` : waterPaymentType === 'flat' ? 'Monthly Flat Rate' : 'Included in Rent',
            },
            parking: {
                ...property.parking,
                available: parkingAvailable,
            },
            updatedAt: new Date().toISOString(),
        });

        Alert.alert('Success', 'Property updated successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Property',
            'Are you sure you want to delete this property? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteProperty(propertyId);
                        Alert.alert('Deleted', 'Property has been deleted', [
                            { text: 'OK', onPress: () => navigation.goBack() }
                        ]);
                    }
                }
            ]
        );
    };

    const getStatusColor = (st: string) => {
        switch (st) {
            case 'approved': return colors.success[500];
            case 'inactive': return colors.error[500];
            case 'pending': return colors.warning[500];
            case 'rejected': return colors.error[600];
            default: return colors.neutral[500];
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const addImage = () => {
        // Mock adding an image
        setImages(prev => [...prev, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? colors.neutral[900] : 'white'} />
                <SafeAreaView edges={['top']} style={{ backgroundColor: isDark ? colors.neutral[900] : 'white' }}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Edit Property
                        </Text>
                        <TouchableOpacity onPress={handleDelete}>
                            <Ionicons name="trash-outline" size={24} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Property Images */}
                    <View style={styles.imageSectionContainer}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light, marginLeft: spacing.lg }]}>
                            Property Images ({images.length})
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScroll}>
                            {images.map((img, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image source={{ uri: img }} style={styles.propertyImageThumbnail} />
                                    <TouchableOpacity
                                        style={styles.removeImageBadge}
                                        onPress={() => removeImage(index)}
                                    >
                                        <Ionicons name="close" size={16} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity style={styles.addImageButton} onPress={addImage}>
                                <Ionicons name="add" size={32} color={colors.neutral[400]} />
                                <Text style={styles.addImageText}>Add Photo</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    {/* Status Selector */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Property Status
                        </Text>
                        <View style={styles.statusGrid}>
                            {PROPERTY_STATUS.map(st => (
                                <TouchableOpacity
                                    key={st}
                                    style={[
                                        styles.statusButton,
                                        status === st && { backgroundColor: getStatusColor(st) + '15', borderColor: getStatusColor(st) }
                                    ]}
                                    onPress={() => setStatus(st)}
                                >
                                    <Ionicons
                                        name={status === st ? 'checkmark-circle' : 'ellipse-outline'}
                                        size={18}
                                        color={status === st ? getStatusColor(st) : colors.neutral[400]}
                                    />
                                    <Text style={[
                                        styles.statusButtonText,
                                        { color: status === st ? getStatusColor(st) : colors.neutral[600] }
                                    ]}>
                                        {st === 'approved' ? 'Active' : st.charAt(0).toUpperCase() + st.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Location Details */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Location Details
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>General Area *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                value={generalArea}
                                onChangeText={setGeneralArea}
                                placeholder="e.g., Kasarani Seasons, Roysambu TRM Drive"
                                placeholderTextColor={colors.neutral[400]}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>County *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                value={county}
                                onChangeText={setCounty}
                                placeholder="Nairobi"
                                placeholderTextColor={colors.neutral[400]}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Directions</Text>
                            <TextInput
                                style={[styles.input, styles.textAreaSmall, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                value={directions}
                                onChangeText={setDirections}
                                placeholder="e.g., 500m from main stage, near Equity Bank"
                                placeholderTextColor={colors.neutral[400]}
                                multiline
                            />
                        </View>
                    </View>

                    {/* Property Specs */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Property Specifications
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Property Type</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
                                {PROPERTY_TYPES.map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.pill, propertyType === type && styles.pillActive]}
                                        onPress={() => setPropertyType(type)}
                                    >
                                        <Text style={[styles.pillText, propertyType === type && styles.pillTextActive]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {propertyType !== 'Bedsitter' && (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Layout</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
                                        {PROPERTY_LAYOUTS.map(l => (
                                            <TouchableOpacity
                                                key={l}
                                                style={[styles.pill, layout === l && styles.pillActive]}
                                                onPress={() => setLayout(l)}
                                            >
                                                <Text style={[styles.pillText, layout === l && styles.pillTextActive]}>
                                                    {l.charAt(0).toUpperCase() + l.slice(1)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, styles.halfWidth]}>
                                        <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Bedrooms</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                            value={bedrooms}
                                            onChangeText={setBedrooms}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, styles.halfWidth]}>
                                        <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Bathrooms</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                            value={bathrooms}
                                            onChangeText={setBathrooms}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                        {propertyType === 'Bedsitter' && (
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, styles.halfWidth]}>
                                    <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Bathrooms</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                        value={bathrooms}
                                        onChangeText={setBathrooms}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Description */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Description
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                styles.textArea,
                                { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }
                            ]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe the property..."
                            placeholderTextColor={colors.neutral[400]}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Amenities */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Amenities
                        </Text>
                        <View style={styles.amenitiesGrid}>
                            {AMENITIES.map(amenity => (
                                <TouchableOpacity
                                    key={amenity}
                                    style={[
                                        styles.amenityChip,
                                        selectedAmenities.includes(amenity) && styles.amenityChipActive
                                    ]}
                                    onPress={() => toggleAmenity(amenity)}
                                >
                                    <Text style={[
                                        styles.amenityText,
                                        selectedAmenities.includes(amenity) && styles.amenityTextActive
                                    ]}>
                                        {amenity}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Additional Features */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Additional Features
                        </Text>

                        <View style={styles.switchRow}>
                            <View>
                                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light, marginBottom: 0 }]}>Pet Friendly</Text>
                                <Text style={styles.caption}>Are pets allowed?</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.switch, petFriendly && styles.switchActive]}
                                onPress={() => setPetFriendly(!petFriendly)}
                            >
                                <View style={[styles.switchKnob, petFriendly && styles.switchKnobActive]} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.switchRow}>
                            <View>
                                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light, marginBottom: 0 }]}>Parking Available</Text>
                                <Text style={styles.caption}>Is there parking space?</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.switch, parkingAvailable && styles.switchActive]}
                                onPress={() => setParkingAvailable(!parkingAvailable)}
                            >
                                <View style={[styles.switchKnob, parkingAvailable && styles.switchKnobActive]} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.switchRow}>
                            <View>
                                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light, marginBottom: 0 }]}>Borehole Water</Text>
                                <Text style={styles.caption}>Reliable water source?</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.switch, hasBorehole && styles.switchActive]}
                                onPress={() => setHasBorehole(!hasBorehole)}
                            >
                                <View style={[styles.switchKnob, hasBorehole && styles.switchKnobActive]} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.switchRow}>
                            <View>
                                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light, marginBottom: 0 }]}>Gated Community</Text>
                                <Text style={styles.caption}>Is it in a gated estate?</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.switch, isGatedCommunity && styles.switchActive]}
                                onPress={() => setIsGatedCommunity(!isGatedCommunity)}
                            >
                                <View style={[styles.switchKnob, isGatedCommunity && styles.switchKnobActive]} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Garbage Fee (KES)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                    value={garbageFee}
                                    onChangeText={setGarbageFee}
                                    placeholder="e.g., 500"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Security Fee (KES)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                    value={securityFee}
                                    onChangeText={setSecurityFee}
                                    placeholder="e.g., 1000"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Video Tour URL</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                value={videoUrl}
                                onChangeText={setVideoUrl}
                                placeholder="https://youtube.com/..."
                                placeholderTextColor={colors.neutral[400]}
                            />
                        </View>
                    </View>

                    {/* Utilities */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Utilities & Bills
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Electricity Payment</Text>
                            <View style={styles.pillScroll}>
                                {[
                                    { id: 'included', label: 'Included in Rent' },
                                    { id: 'prepaid', label: 'Tokens (Prepaid)' },
                                    { id: 'postpaid', label: 'Monthly Bill' }
                                ].map(e => (
                                    <TouchableOpacity
                                        key={e.id}
                                        style={[styles.pill, electricityType === e.id && styles.pillActive]}
                                        onPress={() => setElectricityType(e.id as any)}
                                    >
                                        <Text style={[styles.pillText, electricityType === e.id && styles.pillTextActive]}>
                                            {e.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Water Payment</Text>
                            <View style={styles.pillScroll}>
                                {[
                                    { id: 'included', label: 'Included in Rent' },
                                    { id: 'flat', label: 'Monthly Flat Rate' },
                                    { id: 'meter', label: 'Per Meter' }
                                ].map(w => (
                                    <TouchableOpacity
                                        key={w.id}
                                        style={[styles.pill, waterPaymentType === w.id && styles.pillActive]}
                                        onPress={() => setWaterPaymentType(w.id as any)}
                                    >
                                        <Text style={[styles.pillText, waterPaymentType === w.id && styles.pillTextActive]}>
                                            {w.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {waterPaymentType === 'meter' && (
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Cost per Meter (KES)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50], color: isDark ? colors.text.dark : colors.text.light }]}
                                    value={waterCostPerMeter}
                                    onChangeText={setWaterCostPerMeter}
                                    placeholder="e.g., 150"
                                    keyboardType="numeric"
                                />
                            </View>
                        )}
                    </View>

                    {/* Property Stats */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Statistics
                        </Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Ionicons name="eye-outline" size={20} color={colors.primary[500]} />
                                <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    {property.viewCount || 0}
                                </Text>
                                <Text style={styles.statLabel}>Views</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="calendar-outline" size={20} color={colors.success} />
                                <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    {property.bookingCount || 0}
                                </Text>
                                <Text style={styles.statLabel}>Bookings</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="time-outline" size={20} color={colors.neutral[500]} />
                                <Text style={[styles.statValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    {new Date(property.createdAt).toLocaleDateString()}
                                </Text>
                                <Text style={styles.statLabel}>Listed</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <SafeAreaView edges={['bottom']} style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: colors.primary[500] }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>Save Changes</Text>
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
        paddingVertical: spacing.sm,
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
        paddingBottom: spacing.xxl,
    },
    imageSectionContainer: {
        marginBottom: spacing.lg,
    },
    imageScroll: {
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
        paddingBottom: spacing.sm,
    },
    imageWrapper: {
        position: 'relative',
    },
    propertyImageThumbnail: {
        width: 150,
        height: 100,
        borderRadius: borderRadius.md,
    },
    removeImageBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: colors.error[500],
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    addImageButton: {
        width: 150,
        height: 100,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.neutral[200],
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
    },
    addImageText: {
        ...typography.caption,
        color: colors.neutral[500],
        fontWeight: '600',
    },
    card: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
    },
    sectionTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.md,
    },
    statusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1.5,
        borderColor: colors.neutral[200],
        minWidth: '47%',
    },
    statusButtonText: {
        ...typography.bodySemiBold,
        fontSize: 15,
    },
    inputGroup: {
        marginBottom: spacing.md,
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
    },
    textAreaSmall: {
        height: 80,
        paddingTop: spacing.md,
    },
    pillScroll: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        paddingBottom: spacing.xs,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    switch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.neutral[200],
        padding: 2,
    },
    switchActive: {
        backgroundColor: colors.success[500],
    },
    switchKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'white',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    switchKnobActive: {
        transform: [{ translateX: 22 }],
    },
    caption: {
        ...typography.caption,
        color: colors.neutral[500],
        marginTop: 2,
    },
    pill: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.neutral[100],
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    pillActive: {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[500],
    },
    pillText: {
        ...typography.caption,
        color: colors.neutral[600],
        fontWeight: '600',
    },
    pillTextActive: {
        color: 'white',
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    halfWidth: {
        flex: 1,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    amenityChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        backgroundColor: 'transparent',
    },
    amenityChipActive: {
        backgroundColor: colors.primary[100],
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
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    statValue: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    statLabel: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    saveButton: {
        height: 52,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        ...typography.bodySemiBold,
        fontSize: 16,
        color: 'white',
    },
});

export default EditPropertyScreen;
