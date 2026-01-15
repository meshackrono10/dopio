import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useProperties } from '../../contexts/PropertyContext';
import PropertyCard from '../../components/property/PropertyCard';
import { SearchStackParamList } from '../../types/navigation';

type SavedScreenNavigationProp = StackNavigationProp<SearchStackParamList, 'Explore'>;

const SavedScreen = ({ hideHeader = false }: { hideHeader?: boolean }) => {
    const { isDark } = useTheme();
    const navigation = useNavigation<SavedScreenNavigationProp>();
    const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
    const { properties } = useProperties();

    const savedProperties = properties.filter(p => wishlist.includes(p.id));

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {!hideHeader && (
                <SafeAreaView edges={['top']} style={styles.header}>
                    <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>Wishlists</Text>
                </SafeAreaView>
            )}

            {savedProperties.length > 0 ? (
                <FlatList
                    data={savedProperties}
                    renderItem={({ item }) => (
                        <PropertyCard
                            property={item}
                            isSaved={isInWishlist(item.id)}
                            onToggleSave={() => toggleWishlist(item.id)}
                            onPress={() => (navigation as any).navigate('ExploreTab', { screen: 'PropertyDetail', params: { propertyId: item.id.toString() } })}
                        />
                    )}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>No wishlists yet</Text>
                    <Text style={styles.emptySubtext}>As you explore, tap the heart icon to save your favorite places.</Text>
                    <TouchableOpacity
                        style={styles.exploreButton}
                        onPress={() => navigation.navigate('Explore')}
                    >
                        <Text style={styles.exploreButtonText}>Start exploring</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
    },
    title: {
        ...typography.h1,
        fontSize: 32,
    },
    list: {
        paddingBottom: spacing.xxl,
    },
    emptyState: {
        flex: 1,
        paddingHorizontal: spacing.xxl,
        justifyContent: 'center',
    },
    emptyTitle: {
        ...typography.h3,
        marginBottom: spacing.sm,
    },
    emptySubtext: {
        ...typography.body,
        color: colors.neutral[500],
        marginBottom: spacing.xl,
    },
    exploreButton: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.text.light,
        alignSelf: 'flex-start',
    },
    exploreButtonText: {
        ...typography.bodySemiBold,
    },
});

export default SavedScreen;
