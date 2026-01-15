import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useComparison } from '../../contexts/ComparisonContext';
import EmptyState from '../../components/common/EmptyState';
import { HomeStackParamList } from '../../types/navigation';
import { colors, spacing, typography, borderRadius } from '../../theme';



const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.md * 2;

export default function PropertyComparisonScreen({ navigation, hideHeader = false }: StackScreenProps<any> & { hideHeader?: boolean }) {
    const { isDark } = useTheme();
    const { comparisonList, removeFromComparison, clearComparison } = useComparison();

    if (comparisonList.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <EmptyState
                    icon="📊"
                    title="No Properties to Compare"
                    message="Add properties to your comparison list to see them side-by-side"
                    action={
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.primary[500] }]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.buttonText}>Browse Properties</Text>
                        </TouchableOpacity>
                    }
                />
            </View>
        );
    }

    const comparisonFields = [
        { key: 'rent', label: 'Monthly Rent', format: (value: number) => `KES ${value.toLocaleString()}` },
        { key: 'propertyType', label: 'Property Type', format: (value: string) => value },
        { key: 'bedrooms', label: 'Bedrooms', format: (value: number) => `${value} ${value === 1 ? 'bedroom' : 'bedrooms'}` },
        { key: 'bathrooms', label: 'Bathrooms', format: (value: number) => `${value}` },
        { key: 'area', label: 'Area', format: (value: number) => `${value} sq ft` },
        { key: 'location', label: 'Location', format: (value: { city: string; neighbourhood: string }) => `${value.neighbourhood}, ${value.city}` },
        { key: 'furnished', label: 'Furnished', format: (value: boolean) => value ? 'Yes' : 'No' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            {/* Header */}
            {!hideHeader && (
                <View style={[styles.header, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Comparing {comparisonList.length} {comparisonList.length === 1 ? 'Property' : 'Properties'}
                    </Text>
                    {comparisonList.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                Alert.alert(
                                    'Clear All',
                                    'Remove all properties from comparison?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Clear',
                                            style: 'destructive',
                                            onPress: () => clearComparison(),
                                        },
                                    ]
                                );
                            }}
                        >
                            <Text style={[styles.clearButton, { color: colors.error[500] }]}>Clear All</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.scrollView}>
                {comparisonList.map((property, index) => (
                    <View key={property.id} style={[styles.propertyCard, { width: CARD_WIDTH }]}>
                        {/* Property Image */}
                        <View style={styles.imageContainer}>
                            <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary[100] }]}>
                                <Ionicons name="home" size={64} color={colors.primary[300]} />
                            </View>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeFromComparison(property.id.toString())}
                            >
                                <Ionicons name="close-circle" size={28} color={colors.error[500]} />
                            </TouchableOpacity>
                        </View>

                        {/* Property Title */}
                        <View style={[styles.titleContainer, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <Text style={[styles.propertyTitle, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={2}>
                                {property.title}
                            </Text>
                        </View>

                        {/* Comparison Fields */}
                        <ScrollView style={styles.fieldsContainer} contentContainerStyle={styles.fieldsContent}>
                            {comparisonFields.map((field, fieldIndex) => {
                                const value = (property as any)[field.key];
                                const formattedValue = value !== undefined && value !== null
                                    ? (field.format as any)(value)
                                    : 'N/A';

                                return (
                                    <View
                                        key={field.key}
                                        style={[
                                            styles.fieldRow,
                                            { backgroundColor: fieldIndex % 2 === 0 ? isDark ? colors.neutral[800] : 'white' : isDark ? colors.neutral[900] : colors.neutral[50] },
                                        ]}
                                    >
                                        <Text style={[styles.fieldLabel, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                            {field.label}
                                        </Text>
                                        <Text style={[styles.fieldValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                            {formattedValue}
                                        </Text>
                                    </View>
                                );
                            })}

                            {/* Amenities */}
                            <View style={[styles.fieldRow, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                <Text style={[styles.fieldLabel, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                    Amenities
                                </Text>
                                <View style={styles.amenitiesContainer}>
                                    {property.amenities?.slice(0, 4).map((amenity, i) => (
                                        <View key={i} style={[styles.amenityTag, { backgroundColor: colors.primary[100] }]}>
                                            <Text style={[styles.amenityText, { color: colors.primary[700] }]}>
                                                {amenity}
                                            </Text>
                                        </View>
                                    ))}
                                    {(property.amenities?.length || 0) > 4 && (
                                        <Text style={[styles.moreAmenities, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                            +{property.amenities!.length - 4} more
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* View Details Button */}
                            <TouchableOpacity
                                style={[styles.viewButton, { backgroundColor: colors.primary[500] }]}
                                onPress={() => navigation.navigate('PropertyDetail', { propertyId: property.id.toString() })}
                            >
                                <Text style={styles.viewButtonText}>View Full Details</Text>
                                <Ionicons name="arrow-forward" size={18} color={colors.neutral[50]} />
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                ))}
            </ScrollView>

            {/* Page Indicator */}
            {comparisonList.length > 1 && (
                <View style={styles.pageIndicator}>
                    {comparisonList.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                { backgroundColor: index === 0 ? colors.primary[500] : colors.neutral[300] },
                            ]}
                        />
                    ))}
                </View>
            )}

            {/* Swipe Hint */}
            {comparisonList.length > 1 && (
                <View style={styles.swipeHint}>
                    <Ionicons name="swap-horizontal" size={20} color={isDark ? colors.text.dark : colors.neutral[500]} />
                    <Text style={[styles.swipeText, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                        Swipe to compare properties
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
        fontWeight: '700',
    },
    clearButton: {
        ...typography.body,
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    propertyCard: {
        padding: spacing.md,
    },
    imageContainer: {
        position: 'relative',
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    imagePlaceholder: {
        width: '100%',
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButton: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.full,
    },
    titleContainer: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
    },
    propertyTitle: {
        ...typography.h3,
        fontSize: 16,
        fontWeight: '700',
    },
    fieldsContainer: {
        flex: 1,
    },
    fieldsContent: {
        paddingBottom: spacing.xl,
    },
    fieldRow: {
        padding: spacing.md,
        marginBottom: 1,
    },
    fieldLabel: {
        ...typography.body,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    fieldValue: {
        ...typography.body,
        fontSize: 15,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    amenityTag: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    amenityText: {
        fontSize: 12,
        fontWeight: '600',
    },
    moreAmenities: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
        gap: spacing.xs,
    },
    viewButtonText: {
        color: colors.neutral[50],
        fontSize: 15,
        fontWeight: '600',
    },
    pageIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.xs,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: borderRadius.full,
    },
    swipeHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.sm,
        gap: spacing.xs,
    },
    swipeText: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    button: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
    },
    buttonText: {
        color: colors.neutral[50],
        fontSize: 15,
        fontWeight: '600',
    },
});
