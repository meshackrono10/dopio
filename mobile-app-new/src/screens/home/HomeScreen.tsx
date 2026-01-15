import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput as RNTextInput,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
    LayoutAnimation,
    Platform,
    UIManager,
    Image,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import PropertyCard from '../../components/property/PropertyCard';
import HunterCard from '../../components/hunter/HunterCard';
import HunterDashboard from '../../components/hunter/HunterDashboard';
import { MOCK_PROPERTIES, MOCK_HUNTERS, DEMO_CATS, DEMO_CATS_2 } from '../../services/mockData';
import { HomeStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';

// New Components
import SectionHero from '../../components/home/SectionHero';
import SectionSlider from '../../components/home/SectionSlider';
import SectionOurFeatures from '../../components/home/SectionOurFeatures';
import SectionHowItWork from '../../components/home/SectionHowItWork';
import SectionSubscribe from '../../components/home/SectionSubscribe';
import SectionBecomeAnAuthor from '../../components/home/SectionBecomeAnAuthor';
import SectionHeading from '../../components/home/SectionHeading';

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Home'>;

const HomeScreen = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const { isInWishlist, toggleWishlist } = useWishlist();

    const featuredProperties = MOCK_PROPERTIES.filter(p => p.featured).slice(0, 4);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    if (user?.role === 'hunter') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <HunterDashboard
                    onNavigateToRequests={() => (navigation as any).navigate('SearchTab')}
                    onNavigateToBookings={() => (navigation as any).navigate('BookingsTab')}
                    onNavigateToChat={() => (navigation as any).navigate('MessagesTab')}
                />
            </SafeAreaView>
        );
    }

    const handlePropertyPress = (propertyId: string | number) => {
        navigation.navigate('PropertyDetail', { propertyId: propertyId.toString() });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary[600]}
                    />
                }
            >
                {/* 1. HERO SECTION */}
                <SectionHero />

                {/* 2. POPULAR CITIES */}
                <SectionSlider
                    title="Explore Properties by City"
                    subtitle="Find rental homes in Kenya's major cities"
                    data={DEMO_CATS}
                />

                {/* 3. OUR FEATURES */}
                <SectionOurFeatures />

                {/* 4. FEATURED PLACES */}
                <View style={styles.section}>
                    <SectionHeading
                        title="Featured Properties"
                        subtitle="Hand-picked properties for you"
                    />
                    <View style={styles.propertyGrid}>
                        {featuredProperties.map((item, index) => (
                            <PropertyCard
                                key={item.id}
                                property={item}
                                onPress={() => handlePropertyPress(item.id)}
                                isSaved={isInWishlist(item.id)}
                                onToggleSave={() => toggleWishlist(item.id)}
                                variant="grid"
                                index={index}
                            />
                        ))}
                    </View>
                    <TouchableOpacity
                        style={[styles.viewAllButton, { borderColor: colors.primary[600] }]}
                        onPress={() => navigation.navigate('SearchTab' as any)}
                    >
                        <Text style={[styles.viewAllText, { color: colors.primary[600] }]}>Show all properties</Text>
                    </TouchableOpacity>
                </View>

                {/* 5. HOW IT WORKS */}
                <SectionHowItWork />

                {/* 6. PROPERTY TYPES */}
                <View style={{ backgroundColor: isDark ? colors.neutral[800] : colors.primary[50], paddingVertical: spacing.xl }}>
                    <SectionSlider
                        title="Browse by Property Type"
                        subtitle="From bedsitters to luxury apartments"
                        data={DEMO_CATS_2}
                    />
                </View>

                {/* 7. SUBSCRIBE */}
                <SectionSubscribe />

                {/* 8. HUNTERS BOX */}
                <View style={styles.section}>
                    <SectionHeading
                        title="Our Top House Hunters"
                        subtitle="Connect with verified agents to find your home"
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalPadding}>
                        {MOCK_HUNTERS.map((hunter) => (
                            <TouchableOpacity
                                key={hunter.id}
                                style={styles.hunterCard}
                                onPress={() => navigation.navigate('HunterDetail', { hunterId: hunter.id.toString() })}
                            >
                                <Image source={{ uri: hunter.profilePhoto }} style={styles.hunterAvatar} />
                                <Text style={[styles.hunterName, { color: isDark ? colors.text.dark : colors.text.light }]}>{hunter.name}</Text>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={12} color="#F59E0B" />
                                    <Text style={[styles.ratingText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{hunter.rating}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* 9. BECOME AN AUTHOR */}
                <SectionBecomeAnAuthor />

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        paddingVertical: spacing.xl,
    },
    propertyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing.sm,
    },
    viewAllButton: {
        marginHorizontal: spacing.md,
        marginTop: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        alignItems: 'center',
    },
    viewAllText: {
        ...typography.button,
    },
    horizontalPadding: {
        paddingHorizontal: spacing.md,
        gap: spacing.md,
    },
    hunterCard: {
        alignItems: 'center',
        width: 100,
    },
    hunterAvatar: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.full,
        marginBottom: spacing.sm,
    },
    hunterName: {
        ...typography.bodySmall,
        fontWeight: '600',
        textAlign: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    ratingText: {
        ...typography.caption,
    },
});

export default HomeScreen;
