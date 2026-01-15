import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image, Platform } from 'react-native';
import MapView, { Marker, Circle, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useProperties } from '../../contexts/PropertyContext';
import { PropertyListing } from '../../data/types';

const { width, height } = Dimensions.get('window');

const MapExploreScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const { filteredProperties } = useProperties();
    const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);

    // Default region (Nairobi)
    const [region, setRegion] = useState({
        latitude: -1.2921,
        longitude: 36.8219,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const handleMarkerPress = (property: PropertyListing) => {
        setSelectedProperty(property);
    };

    const handleCalloutPress = (property: PropertyListing) => {
        // Navigate to property detail
        (navigation as any).navigate('PropertyDetail', { propertyId: property.id });
    };

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={region}
                customMapStyle={isDark ? mapDarkStyle : []}
                onRegionChangeComplete={setRegion}
            >
                {filteredProperties.map((property) => {
                    const isExact = property.isExactLocation;
                    const lat = property.map?.lat || -1.2921;
                    const lng = property.map?.lng || 36.8219;

                    return (
                        <React.Fragment key={property.id}>
                            {/* Approximate Location Circle - Only show if not exact */}
                            {!isExact && (
                                <Circle
                                    center={{ latitude: lat, longitude: lng }}
                                    radius={500} // 500m radius
                                    fillColor={colors.primary[500] + '40'} // Transparent primary
                                    strokeColor={colors.primary[500]}
                                    strokeWidth={1}
                                />
                            )}

                            {/* Marker */}
                            <Marker
                                coordinate={{ latitude: lat, longitude: lng }}
                                onPress={() => handleMarkerPress(property)}
                            >
                                <View style={styles.markerContainer}>
                                    <View style={[
                                        styles.markerBubble,
                                        { backgroundColor: isExact ? colors.success : colors.primary[500] }
                                    ]}>
                                        <Text style={styles.markerText}>
                                            {isExact ? (
                                                <Ionicons name="location" size={12} color="white" />
                                            ) : (
                                                property.rent >= 1000000
                                                    ? `${(property.rent / 1000000).toFixed(1)}M`
                                                    : `${(property.rent / 1000).toFixed(0)}k`
                                            )}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.markerArrow,
                                        { borderTopColor: isExact ? colors.success : colors.primary[500] }
                                    ]} />
                                </View>

                                <Callout tooltip onPress={() => handleCalloutPress(property)}>
                                    <View style={styles.calloutContainer}>
                                        <View style={styles.calloutBubble}>
                                            <Text style={styles.calloutTitle}>{property.title}</Text>
                                            <Text style={styles.calloutPrice}>KES {property.rent.toLocaleString()}/mo</Text>
                                            <Text style={styles.calloutInfo}>
                                                {property.bedrooms} Bed • {property.propertyType}
                                            </Text>
                                            {!isExact && (
                                                <Text style={[styles.calloutInfo, { color: colors.warning, marginTop: 4 }]}>
                                                    Approximate location
                                                </Text>
                                            )}
                                        </View>
                                        <View style={styles.calloutArrow} />
                                    </View>
                                </Callout>
                            </Marker>
                        </React.Fragment>
                    );
                })}
            </MapView>

            {/* Floating Property Card (Bottom) */}
            {selectedProperty && (
                <View style={styles.cardContainer}>
                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                        onPress={() => handleCalloutPress(selectedProperty)}
                    >
                        <Image
                            source={typeof selectedProperty.images[0] === 'string' ? { uri: selectedProperty.images[0] } : selectedProperty.images[0]}
                            style={styles.cardImage}
                        />
                        <View style={styles.cardContent}>
                            <Text style={[styles.cardTitle, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                                {selectedProperty.title}
                            </Text>
                            <Text style={[styles.cardPrice, { color: colors.primary[500] }]}>
                                KES {selectedProperty.rent.toLocaleString()}/mo
                            </Text>
                            <View style={styles.cardMeta}>
                                <Ionicons name="location-outline" size={14} color={colors.neutral[500]} />
                                <Text style={styles.cardLocation} numberOfLines={1}>
                                    {selectedProperty.location.generalArea}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setSelectedProperty(null)}
                        >
                            <Ionicons name="close-circle" size={24} color={colors.neutral[400]} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const mapDarkStyle = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#242f3e" }]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#746855" }]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#242f3e" }]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#d59563" }]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#d59563" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#263c3f" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#6b9a76" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{ "color": "#38414e" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#212a37" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#9ca5b3" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [{ "color": "#746855" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#1f2835" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#f3d19c" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#17263c" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#515c6d" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#17263c" }]
    }
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerBubble: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'white',
    },
    markerText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    markerArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -1,
    },
    calloutContainer: {
        width: 200,
        alignItems: 'center',
    },
    calloutBubble: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        width: '100%',
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 2,
    },
    calloutPrice: {
        color: colors.primary[500],
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    calloutInfo: {
        fontSize: 10,
        color: '#666',
    },
    calloutArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'white',
        marginTop: -1,
    },
    cardContainer: {
        position: 'absolute',
        bottom: 100, // Above bottom tab bar
        left: spacing.lg,
        right: spacing.lg,
    },
    card: {
        flexDirection: 'row',
        padding: spacing.sm,
        borderRadius: borderRadius.lg,
        ...shadows.md,
        alignItems: 'center',
    },
    cardImage: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.md,
    },
    cardContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    cardTitle: {
        ...typography.bodySemiBold,
        fontSize: 15,
    },
    cardPrice: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        gap: 4,
    },
    cardLocation: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    closeButton: {
        padding: spacing.sm,
    },
});

export default MapExploreScreen;
