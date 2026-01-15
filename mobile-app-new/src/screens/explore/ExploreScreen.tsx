import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Dimensions,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useProperties } from '../../contexts/PropertyContext';
import { SearchStackParamList } from '../../types/navigation';
import PropertyCard from '../../components/property/PropertyCard';
import { useWishlist } from '../../contexts/WishlistContext';
import MapExploreScreen from './MapExploreScreen';

const { width } = Dimensions.get('window');

type ExploreScreenNavigationProp = StackNavigationProp<SearchStackParamList, 'Search'>;

const CATEGORIES = [
    { id: 'all', label: 'All', icon: 'apps-outline' },
    { id: 'Apartment', label: 'Apartments', icon: 'business-outline' },
    { id: 'House', label: 'Houses', icon: 'home-outline' },
    { id: 'Bedsitter', label: 'Bedsitters', icon: 'bed-outline' },
    { id: 'Bungalow', label: 'Bungalows', icon: 'leaf-outline' },
    { id: 'Condo', label: 'Condos', icon: 'grid-outline' },
];

import Animated, {
    FadeIn,
    FadeOut,
    Layout
} from 'react-native-reanimated';

const ExploreScreen = () => {
    const { isDark } = useTheme();
    const { properties } = useProperties();
    const navigation = useNavigation<ExploreScreenNavigationProp>();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [isMapView, setIsMapView] = useState(false);

    const filteredProperties = useMemo(() => {
        return properties.filter(prop => {
            const matchesCategory = selectedCategory === 'all' || prop.propertyType === selectedCategory;
            const matchesSearch = prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                prop.location.generalArea.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [properties, selectedCategory, searchQuery]);

    const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => {
        const isActive = selectedCategory === item.id;
        return (
            <TouchableOpacity
                style={[styles.categoryItem, isActive && styles.activeCategoryItem]}
                onPress={() => setSelectedCategory(item.id)}
            >
                <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={isActive ? colors.primary[500] : colors.neutral[500]}
                />
                <Text style={[
                    styles.categoryLabel,
                    { color: isActive ? colors.text.light : colors.neutral[500] },
                    isActive && styles.activeCategoryLabel
                ]}>
                    {item.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header / Search Bar */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity
                    style={[styles.searchBar, shadows.md, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                    onPress={() => navigation.navigate('Search')}
                >
                    <Ionicons name="search" size={20} color={colors.primary[500]} />
                    <View style={styles.searchPlaceholder}>
                        <Text style={[styles.searchText, { color: isDark ? colors.text.dark : colors.text.light }]}>Where to?</Text>
                        <Text style={styles.searchSubtext}>Anywhere • Any week • Add guests</Text>
                    </View>
                    <View style={styles.filterIcon}>
                        <Ionicons name="options-outline" size={20} color={colors.text.light} />
                    </View>
                </TouchableOpacity>
            </SafeAreaView>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
                <FlatList
                    data={CATEGORIES}
                    renderItem={renderCategory}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                />
            </View>

            {/* Content: List or Map with Animations */}
            <View style={{ flex: 1 }}>
                {isMapView ? (
                    <Animated.View
                        entering={FadeIn.duration(400)}
                        exiting={FadeOut.duration(400)}
                        style={{ flex: 1 }}
                    >
                        <MapExploreScreen />
                    </Animated.View>
                ) : (
                    <Animated.View
                        entering={FadeIn.duration(400)}
                        exiting={FadeOut.duration(400)}
                        style={{ flex: 1 }}
                    >
                        <FlatList
                            data={filteredProperties}
                            renderItem={({ item }) => (
                                <View style={styles.cardWrapper}>
                                    <PropertyCard
                                        property={item}
                                        onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id.toString() })}
                                        isSaved={isInWishlist(item.id)}
                                        onToggleSave={() => toggleWishlist(item.id)}
                                    />
                                </View>
                            )}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={styles.propertyList}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Ionicons name="search-outline" size={64} color={colors.neutral[300]} />
                                    <Text style={styles.emptyTitle}>No properties found</Text>
                                    <Text style={styles.emptySubtext}>Try adjusting your filters or search area</Text>
                                </View>
                            }
                        />
                    </Animated.View>
                )}
            </View>

            {/* Map Toggle Button */}
            <TouchableOpacity
                style={[styles.mapToggle, shadows.lg, { backgroundColor: isDark ? colors.neutral[800] : colors.text.light }]}
                onPress={() => setIsMapView(!isMapView)}
            >
                <Ionicons name={isMapView ? "list" : "map"} size={20} color="white" />
                <Text style={styles.mapToggleText}>{isMapView ? "List" : "Map"}</Text>
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
        paddingBottom: spacing.sm,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    searchPlaceholder: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    searchText: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    searchSubtext: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    filterIcon: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoriesContainer: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    categoriesList: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    categoryItem: {
        alignItems: 'center',
        marginRight: spacing.xl,
        paddingBottom: spacing.xs,
    },
    activeCategoryItem: {
        // No background for active category, just indicator
    },
    categoryLabel: {
        ...typography.caption,
        marginTop: 4,
        fontWeight: '600',
    },
    activeCategoryLabel: {
        color: colors.text.light,
    },
    activeIndicator: {
        position: 'absolute',
        bottom: -spacing.sm,
        width: '100%',
        height: 2,
        backgroundColor: colors.text.light,
    },
    propertyList: {
        paddingTop: spacing.md,
        paddingBottom: spacing.xxl,
    },
    cardWrapper: {
        marginBottom: spacing.lg,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.xxxl,
    },
    emptyTitle: {
        ...typography.h3,
        marginTop: spacing.md,
    },
    emptySubtext: {
        ...typography.bodySmall,
        color: colors.neutral[500],
        marginTop: spacing.xs,
    },
    mapToggle: {
        position: 'absolute',
        bottom: spacing.xl,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
    },
    mapToggleText: {
        ...typography.bodySemiBold,
        color: 'white',
    },
});

export default ExploreScreen;
