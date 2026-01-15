import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, TextInput as RNTextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import PropertyCard from '../../components/property/PropertyCard';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { MOCK_PROPERTIES, MOCK_SEARCH_REQUESTS, getAvailableSearchRequests } from '../../services/mockData';
import { SearchStackParamList } from '../../types/navigation';

type SearchScreenNavigationProp = StackNavigationProp<SearchStackParamList, 'Search'>;

const SearchRequestItem = ({ item, isDark, onPress }: any) => (
    <Card style={[styles.requestCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
        <View style={styles.requestHeader}>
            <View style={styles.requestInfo}>
                <Text style={[styles.requestTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    {item.propertyType} in {item.preferredAreas.join(', ')}
                </Text>
                <Text style={[styles.requestBudget, { color: colors.primary[600] }]}>
                    Budget: KES {item.minRent.toLocaleString()} - {item.maxRent.toLocaleString()}
                </Text>
            </View>
            {item.serviceTier === 'urgent' && (
                <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>Urgent</Text>
                </View>
            )}
        </View>
        <Text style={[styles.requestDesc, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]} numberOfLines={2}>
            {item.additionalNotes}
        </Text>
        <View style={styles.requestFooter}>
            <View style={styles.footerDetail}>
                <Ionicons name="time-outline" size={14} color={colors.neutral[500]} />
                <Text style={[styles.footerText, { color: colors.neutral[500] }]}>
                    Deadline: {new Date(item.deadline).toLocaleDateString()}
                </Text>
            </View>
            <Button size="sm" onPress={onPress}>View & Bid</Button>
        </View>
    </Card>
);

const SearchScreen = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<SearchScreenNavigationProp>();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [showFilters, setShowFilters] = useState(false);
    const [selectedLayout, setSelectedLayout] = useState<string[]>([]);
    const [furnished, setFurnished] = useState<string[]>([]);
    const [amenities, setAmenities] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest');
    const [beds, setBeds] = useState(0);
    const [bedrooms, setBedrooms] = useState(0);
    const [bathrooms, setBathrooms] = useState(0);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);

    const filteredProperties = MOCK_PROPERTIES.filter((property) => {
        if (selectedLayout.length > 0 && !selectedLayout.includes(property.layout)) return false;
        if (furnished.length > 0 && property.furnished && !furnished.includes(property.furnished)) return false;
        if (amenities.length > 0 && !amenities.every(a => property.amenities.includes(a))) return false;
        if (beds > 0 && property.beds < beds) return false;
        if (bedrooms > 0 && property.bedrooms < bedrooms) return false;
        if (bathrooms > 0 && property.bathrooms < bathrooms) return false;
        if (minPrice && property.rent < parseInt(minPrice)) return false;
        if (maxPrice && property.rent > parseInt(maxPrice)) return false;
        if (selectedPropertyTypes.length > 0 && !selectedPropertyTypes.includes(property.propertyType)) return false;
        return true;
    }).sort((a, b) => {
        if (sortBy === 'price-asc') return a.rent - b.rent;
        if (sortBy === 'price-desc') return b.rent - a.rent;
        return 0;
    });

    const toggleLayout = (layout: string) => {
        setSelectedLayout(prev =>
            prev.includes(layout) ? prev.filter(l => l !== layout) : [...prev, layout]
        );
    };

    const toggleFurnished = (option: string) => {
        setFurnished(prev =>
            prev.includes(option) ? prev.filter(f => f !== option) : [...prev, option]
        );
    };

    const toggleAmenity = (amenity: string) => {
        setAmenities(prev =>
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
        );
    };

    const clearFilters = () => {
        setSelectedLayout([]);
        setFurnished([]);
        setAmenities([]);
        setSortBy('newest');
        setBeds(0);
        setBedrooms(0);
        setBathrooms(0);
        setMinPrice('');
        setMaxPrice('');
        setSelectedPropertyTypes([]);
    };

    if (user?.role === 'hunter') {
        const availableRequests = getAvailableSearchRequests();

        return (
            <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Search Requests
                    </Text>
                </View>
                <FlatList
                    data={availableRequests}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <SearchRequestItem
                            item={item}
                            isDark={isDark}
                            onPress={() => navigation.navigate('SearchRequestDetail', { requestId: item.id })}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <Text style={[styles.resultsText, { color: isDark ? colors.neutral[400] : colors.neutral[600], marginBottom: spacing.md }]}>
                            {availableRequests.length} requests available for bidding
                        </Text>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={64} color={colors.neutral[400]} />
                            <Text style={[styles.emptyText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                                No search requests found
                            </Text>
                        </View>
                    }
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Search Properties
                </Text>
                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
                    onPress={() => setShowFilters(true)}
                >
                    <Ionicons name="options-outline" size={20} color={colors.primary[600]} />
                    <Text style={[styles.filterButtonText, { color: colors.primary[600] }]}>
                        Filters
                    </Text>
                    {(selectedLayout.length > 0 || furnished.length > 0 || amenities.length > 0 || beds > 0 || bedrooms > 0 || bathrooms > 0) && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>
                                {selectedLayout.length + furnished.length + amenities.length + (beds > 0 ? 1 : 0) + (bedrooms > 0 ? 1 : 0) + (bathrooms > 0 ? 1 : 0)}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredProperties}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <PropertyCard
                        property={item}
                        onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id.toString() })}
                        isSaved={isInWishlist(item.id)}
                        onToggleSave={() => toggleWishlist(item.id)}
                        variant="list"
                        index={index}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View>
                        <TouchableOpacity
                            style={[styles.customSearchBanner, { backgroundColor: colors.primary[50] }]}
                            onPress={() => navigation.navigate('SearchRequestLanding')}
                        >
                            <View style={styles.bannerContent}>
                                <View style={styles.bannerText}>
                                    <Text style={[styles.bannerTitle, { color: colors.primary[700] }]}>
                                        Can't find what you need?
                                    </Text>
                                    <Text style={[styles.bannerDesc, { color: colors.primary[600] }]}>
                                        Request a custom search from our hunters
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color={colors.primary[600]} />
                            </View>
                        </TouchableOpacity>
                        <Text style={[styles.resultsText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                            {filteredProperties.length} properties found
                        </Text>
                    </View>
                }
            />

            <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowFilters(false)}>
                <View style={[styles.modalContainer, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Filters</Text>
                        <TouchableOpacity onPress={() => setShowFilters(false)}>
                            <Ionicons name="close" size={28} color={isDark ? colors.text.dark : colors.text.light} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.filterSection}>
                            <Text style={[styles.filterLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>Price Range (KES)</Text>
                            <View style={styles.priceRangeContainer}>
                                <View style={styles.priceInputContainer}>
                                    <Text style={[styles.priceInputLabel, { color: colors.neutral[500] }]}>Min</Text>
                                    <RNTextInput
                                        style={[styles.priceInput, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], color: isDark ? colors.text.dark : colors.text.light }]}
                                        placeholder="0"
                                        placeholderTextColor={colors.neutral[500]}
                                        keyboardType="numeric"
                                        value={minPrice}
                                        onChangeText={setMinPrice}
                                    />
                                </View>
                                <View style={styles.priceInputContainer}>
                                    <Text style={[styles.priceInputLabel, { color: colors.neutral[500] }]}>Max</Text>
                                    <RNTextInput
                                        style={[styles.priceInput, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], color: isDark ? colors.text.dark : colors.text.light }]}
                                        placeholder="Any"
                                        placeholderTextColor={colors.neutral[500]}
                                        keyboardType="numeric"
                                        value={maxPrice}
                                        onChangeText={setMaxPrice}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={[styles.filterLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>Property Type</Text>
                            <View style={styles.optionsGrid}>
                                {['Apartment', 'House', 'Bedsitter', 'Bungalow', 'Condo', 'Cottage'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.optionChip,
                                            {
                                                backgroundColor: selectedPropertyTypes.includes(type)
                                                    ? colors.primary[600]
                                                    : isDark ? colors.neutral[800] : colors.neutral[100],
                                            },
                                        ]}
                                        onPress={() => {
                                            if (selectedPropertyTypes.includes(type)) {
                                                setSelectedPropertyTypes(selectedPropertyTypes.filter(t => t !== type));
                                            } else {
                                                setSelectedPropertyTypes([...selectedPropertyTypes, type]);
                                            }
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                {
                                                    color: selectedPropertyTypes.includes(type)
                                                        ? 'white'
                                                        : isDark ? colors.text.dark : colors.text.light,
                                                },
                                            ]}
                                        >
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <View style={styles.filterSection}>
                            <Text style={[styles.filterLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>Layout</Text>
                            <View style={styles.optionsGrid}>
                                {['bedsitter', '1-bedroom', '2-bedroom', '3-bedroom'].map((layout) => (
                                    <TouchableOpacity
                                        key={layout}
                                        style={[
                                            styles.optionChip,
                                            {
                                                backgroundColor: selectedLayout.includes(layout)
                                                    ? colors.primary[600]
                                                    : isDark ? colors.neutral[800] : colors.neutral[100],
                                            },
                                        ]}
                                        onPress={() => toggleLayout(layout)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                {
                                                    color: selectedLayout.includes(layout)
                                                        ? 'white'
                                                        : isDark ? colors.text.dark : colors.text.light,
                                                },
                                            ]}
                                        >
                                            {layout}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={[styles.filterLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>Rooms and Beds</Text>
                            <View style={styles.counterRow}>
                                <Text style={[styles.counterLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>Beds</Text>
                                <View style={styles.counterControls}>
                                    <TouchableOpacity onPress={() => setBeds(Math.max(0, beds - 1))} style={styles.counterBtn}>
                                        <Ionicons name="remove" size={20} color={colors.primary[600]} />
                                    </TouchableOpacity>
                                    <Text style={[styles.counterValue, { color: isDark ? colors.text.dark : colors.text.light }]}>{beds}</Text>
                                    <TouchableOpacity onPress={() => setBeds(beds + 1)} style={styles.counterBtn}>
                                        <Ionicons name="add" size={20} color={colors.primary[600]} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.counterRow}>
                                <Text style={[styles.counterLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>Bedrooms</Text>
                                <View style={styles.counterControls}>
                                    <TouchableOpacity onPress={() => setBedrooms(Math.max(0, bedrooms - 1))} style={styles.counterBtn}>
                                        <Ionicons name="remove" size={20} color={colors.primary[600]} />
                                    </TouchableOpacity>
                                    <Text style={[styles.counterValue, { color: isDark ? colors.text.dark : colors.text.light }]}>{bedrooms}</Text>
                                    <TouchableOpacity onPress={() => setBedrooms(bedrooms + 1)} style={styles.counterBtn}>
                                        <Ionicons name="add" size={20} color={colors.primary[600]} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.counterRow}>
                                <Text style={[styles.counterLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>Bathrooms</Text>
                                <View style={styles.counterControls}>
                                    <TouchableOpacity onPress={() => setBathrooms(Math.max(0, bathrooms - 1))} style={styles.counterBtn}>
                                        <Ionicons name="remove" size={20} color={colors.primary[600]} />
                                    </TouchableOpacity>
                                    <Text style={[styles.counterValue, { color: isDark ? colors.text.dark : colors.text.light }]}>{bathrooms}</Text>
                                    <TouchableOpacity onPress={() => setBathrooms(bathrooms + 1)} style={styles.counterBtn}>
                                        <Ionicons name="add" size={20} color={colors.primary[600]} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={[styles.filterLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>Amenities</Text>
                            <View style={styles.optionsGrid}>
                                {['Wifi', 'Kitchen', 'Free parking', 'Air conditioning', 'Heating', 'Washer', 'Dryer', 'TV', 'Dedicated workspace'].map((amenity) => (
                                    <TouchableOpacity
                                        key={amenity}
                                        style={[
                                            styles.optionChip,
                                            {
                                                backgroundColor: amenities.includes(amenity)
                                                    ? colors.primary[600]
                                                    : isDark ? colors.neutral[800] : colors.neutral[100],
                                            },
                                        ]}
                                        onPress={() => toggleAmenity(amenity)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                {
                                                    color: amenities.includes(amenity)
                                                        ? 'white'
                                                        : isDark ? colors.text.dark : colors.text.light,
                                                },
                                            ]}
                                        >
                                            {amenity}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={[styles.filterLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>Furnished</Text>
                            <View style={styles.optionsGrid}>
                                {['yes', 'semi', 'no'].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.optionChip,
                                            {
                                                backgroundColor: furnished.includes(option)
                                                    ? colors.primary[600]
                                                    : isDark ? colors.neutral[800] : colors.neutral[100],
                                            },
                                        ]}
                                        onPress={() => toggleFurnished(option)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                {
                                                    color: furnished.includes(option)
                                                        ? 'white'
                                                        : isDark ? colors.text.dark : colors.text.light,
                                                },
                                            ]}
                                        >
                                            {option === 'yes' ? 'Furnished' : option === 'semi' ? 'Semi' : 'Unfurnished'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={[styles.filterLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>Sort By</Text>
                            <View style={styles.optionsGrid}>
                                {[
                                    { value: 'newest', label: 'Newest' },
                                    { value: 'price-asc', label: 'Low to High' },
                                    { value: 'price-desc', label: 'High to Low' },
                                ].map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.optionChip,
                                            {
                                                backgroundColor: sortBy === option.value
                                                    ? colors.primary[600]
                                                    : isDark ? colors.neutral[800] : colors.neutral[100],
                                            },
                                        ]}
                                        onPress={() => setSortBy(option.value as any)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                {
                                                    color: sortBy === option.value
                                                        ? 'white'
                                                        : isDark ? colors.text.dark : colors.text.light,
                                                },
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <Button onPress={clearFilters} variant="outline" style={{ flex: 1 }}>Clear All</Button>
                        <Button onPress={() => setShowFilters(false)} style={{ flex: 1 }}>Apply</Button>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        padding: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { ...typography.h2 },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
    },
    filterButtonText: { ...typography.bodySmall, fontWeight: '600' },
    filterBadge: {
        backgroundColor: colors.secondary[500],
        width: 20,
        height: 20,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBadgeText: { ...typography.caption, color: 'white', fontSize: 10, fontWeight: '700' },
    listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
    resultsText: { ...typography.bodySmall, marginBottom: spacing.md },
    customSearchBanner: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bannerText: {
        flex: 1,
        gap: 2,
    },
    bannerTitle: {
        ...typography.body,
        fontWeight: '700',
    },
    bannerDesc: {
        ...typography.caption,
        fontWeight: '500',
    },
    modalContainer: { flex: 1 },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
    },
    modalTitle: { ...typography.h3 },
    modalContent: { flex: 1, padding: spacing.md },
    filterSection: { marginBottom: spacing.lg },
    filterLabel: { ...typography.body, fontWeight: '600', marginBottom: spacing.md },
    optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    optionChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
    },
    optionText: { ...typography.bodySmall },
    modalFooter: {
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    counterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    counterLabel: {
        ...typography.body,
        fontWeight: '500',
    },
    counterControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    counterBtn: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterValue: {
        ...typography.body,
        fontWeight: '600',
        minWidth: 20,
        textAlign: 'center',
    },
    // Hunter Search Request Styles
    requestCard: {
        padding: spacing.md,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    requestInfo: {
        flex: 1,
    },
    requestTitle: {
        ...typography.body,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    requestBudget: {
        ...typography.caption,
        fontWeight: '600',
        marginTop: 2,
    },
    urgentBadge: {
        backgroundColor: colors.error + '20',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    urgentText: {
        color: colors.error,
        fontSize: 10,
        fontWeight: '700',
    },
    requestDesc: {
        ...typography.bodySmall,
        lineHeight: 20,
    },
    requestFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    footerDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        ...typography.caption,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyText: {
        ...typography.body,
        marginTop: spacing.md,
    },
    priceRangeContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    priceInputContainer: {
        flex: 1,
    },
    priceInputLabel: {
        ...typography.caption,
        marginBottom: 4,
    },
    priceInput: {
        height: 45,
        borderWidth: 1,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        ...typography.body,
    },
});

export default SearchScreen;
