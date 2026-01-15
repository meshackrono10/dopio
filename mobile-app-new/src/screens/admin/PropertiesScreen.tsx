import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ScrollView,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { PropertyListing } from '../../data/types';
import { useProperties } from '../../contexts/PropertyContext';

const PropertiesScreen = () => {
    const { isDark } = useTheme();
    const { properties, deleteProperty: deletePropertyFromContext } = useProperties();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProperties = properties.filter(prop =>
        prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.location.generalArea.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handlePropertyPress = (prop: PropertyListing) => {
        setSelectedProperty(prop);
        setShowModal(true);
    };

    const renderPropertyItem = ({ item }: { item: PropertyListing }) => (
        <TouchableOpacity style={styles.propertyItem} onPress={() => handlePropertyPress(item)}>
            <Image source={{ uri: item.images[0] as string }} style={styles.thumbnail} />
            <View style={styles.info}>
                <View style={styles.headerRow}>
                    <Text style={[styles.titleText, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <View style={styles.statusDot} />
                </View>
                <Text style={styles.locationText}>{item.location.generalArea}</Text>
                <Text style={styles.priceText}>KES {item.rent.toLocaleString()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <SafeAreaView edges={['top']} style={styles.header}>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>Properties</Text>

                <View style={[styles.searchBar, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                    <Ionicons name="search" size={20} color={colors.neutral[500]} />
                    <TextInput
                        style={[styles.searchInput, { color: isDark ? colors.text.dark : colors.text.light }]}
                        placeholder="Search by title or location"
                        placeholderTextColor={colors.neutral[400]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </SafeAreaView>

            <FlatList
                data={filteredProperties}
                renderItem={renderPropertyItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Ionicons name="close" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Property Details</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {selectedProperty && (
                            <ScrollView style={styles.modalBody}>
                                <Image source={{ uri: selectedProperty.images[0] as string }} style={styles.modalHeroImage} />
                                <View style={styles.modalInfoSection}>
                                    <Text style={[styles.modalPropTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>{selectedProperty.title}</Text>
                                    <Text style={styles.modalPropLocation}>{selectedProperty.location.generalArea}</Text>
                                    <Text style={styles.modalPropPrice}>KES {selectedProperty.rent.toLocaleString()} / month</Text>

                                    <View style={styles.divider} />

                                    <Text style={[styles.sectionSubtitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Description</Text>
                                    <Text style={styles.modalPropDesc}>{selectedProperty.description}</Text>

                                    <View style={styles.divider} />

                                    <View style={styles.infoGrid}>
                                        <View style={styles.infoGridItem}>
                                            <Text style={styles.infoLabel}>Type</Text>
                                            <Text style={[styles.infoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>{selectedProperty.propertyType}</Text>
                                        </View>
                                        <View style={styles.infoGridItem}>
                                            <Text style={styles.infoLabel}>Beds</Text>
                                            <Text style={[styles.infoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>{selectedProperty.beds}</Text>
                                        </View>
                                        <View style={styles.infoGridItem}>
                                            <Text style={styles.infoLabel}>Status</Text>
                                            <Text style={[styles.infoValue, { color: colors.success }]}>Approved</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.modalActions}>
                                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary[500] }]}>
                                        <Text style={styles.actionButtonText}>Edit Property</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.error }]}>
                                        <Text style={styles.actionButtonText}>Delete Property</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            <TouchableOpacity style={[styles.fab, shadows.lg]}>
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    title: {
        ...typography.h1,
        fontSize: 32,
        marginBottom: spacing.lg,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        height: 48,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        ...typography.body,
    },
    list: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 100,
    },
    propertyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    thumbnail: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.md,
    },
    info: {
        flex: 1,
        marginLeft: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    titleText: {
        ...typography.bodySemiBold,
        fontSize: 16,
        flex: 1,
        marginRight: spacing.sm,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.success,
    },
    locationText: {
        ...typography.caption,
        color: colors.neutral[500],
        marginBottom: 2,
    },
    priceText: {
        ...typography.caption,
        color: colors.neutral[400],
        fontWeight: '700',
    },
    separator: {
        height: 1,
        backgroundColor: colors.neutral[100],
    },
    fab: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '90%',
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        paddingTop: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    modalTitle: {
        ...typography.h3,
        fontSize: 18,
    },
    modalBody: {
        flex: 1,
    },
    modalHeroImage: {
        width: '100%',
        height: 250,
    },
    modalInfoSection: {
        padding: spacing.lg,
    },
    modalPropTitle: {
        ...typography.h2,
        fontSize: 24,
        marginBottom: 4,
    },
    modalPropLocation: {
        ...typography.body,
        color: colors.neutral[500],
        marginBottom: 8,
    },
    modalPropPrice: {
        ...typography.h3,
        color: colors.primary[500],
        fontSize: 20,
    },
    divider: {
        height: 1,
        backgroundColor: colors.neutral[100],
        marginVertical: spacing.lg,
    },
    sectionSubtitle: {
        ...typography.bodySemiBold,
        fontSize: 18,
        marginBottom: spacing.sm,
    },
    modalPropDesc: {
        ...typography.body,
        color: colors.neutral[600],
        lineHeight: 22,
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    infoGridItem: {
        flex: 1,
        backgroundColor: colors.neutral[50],
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    infoLabel: {
        ...typography.caption,
        color: colors.neutral[500],
        marginBottom: 2,
    },
    infoValue: {
        ...typography.bodySemiBold,
    },
    modalActions: {
        padding: spacing.lg,
        gap: spacing.md,
        paddingBottom: 40,
    },
    actionButton: {
        height: 52,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        ...typography.bodySemiBold,
        color: 'white',
    },
});

export default PropertiesScreen;
