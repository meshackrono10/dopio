import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

interface LocationMessageProps {
    latitude: number;
    longitude: number;
    address?: string;
    isMe: boolean;
}

const LocationMessage: React.FC<LocationMessageProps> = ({ latitude, longitude, address, isMe }) => {
    const { isDark } = useTheme();

    const openMaps = () => {
        const url = Platform.select({
            ios: `maps:0,0?q=${latitude},${longitude}`,
            android: `geo:0,0?q=${latitude},${longitude}`,
        });

        if (url) {
            Linking.openURL(url);
        }
    };

    // Using a static map placeholder since we don't have a real map library configured here
    const mapPreviewUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=400x200&markers=color:red%7C${latitude},${longitude}&key=YOUR_API_KEY`;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={openMaps}
            style={styles.container}
        >
            <View style={styles.mapContainer}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400' }} // Placeholder map image
                    style={styles.mapImage}
                />
                <View style={styles.markerOverlay}>
                    <Ionicons name="location" size={32} color={colors.error[500]} />
                </View>
            </View>
            <View style={[
                styles.infoContainer,
                { backgroundColor: isMe ? 'rgba(255,255,255,0.1)' : (isDark ? colors.neutral[700] : colors.neutral[50]) }
            ]}>
                <View style={styles.addressRow}>
                    <Ionicons name="navigate-circle" size={20} color={isMe ? 'white' : colors.primary[500]} />
                    <Text
                        style={[
                            styles.addressText,
                            { color: isMe ? 'white' : (isDark ? colors.text.dark : colors.text.light) }
                        ]}
                        numberOfLines={2}
                    >
                        {address || 'Shared Location'}
                    </Text>
                </View>
                <Text style={[styles.actionText, { color: isMe ? 'rgba(255,255,255,0.8)' : colors.neutral[500] }]}>
                    Tap to open in Maps
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 220,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    mapContainer: {
        height: 120,
        width: '100%',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    markerOverlay: {
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    infoContainer: {
        padding: spacing.sm,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: 2,
    },
    addressText: {
        ...typography.bodySemiBold,
        fontSize: 13,
        flex: 1,
    },
    actionText: {
        ...typography.caption,
        fontSize: 11,
        marginLeft: 24,
    },
});

export default LocationMessage;
