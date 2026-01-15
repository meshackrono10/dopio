import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { SearchStackParamList } from '../../types/navigation';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

type SearchRequestLandingNavigationProp = StackNavigationProp<SearchStackParamList, 'SearchRequestLanding'>;

const SearchRequestLandingScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation<SearchRequestLandingNavigationProp>();

    const steps = [
        {
            id: '1',
            title: 'Tell us what you need',
            desc: 'Location, budget, and must-have features. The more detail, the better.',
            icon: 'list',
        },
        {
            id: '2',
            title: 'Hunters bid for you',
            desc: 'Verified local experts will submit competitive offers to find your home.',
            icon: 'people',
        },
        {
            id: '3',
            title: 'Pick your expert',
            desc: 'Review ratings and past success to choose the best hunter for the job.',
            icon: 'star',
        },
        {
            id: '4',
            title: 'Get matched',
            desc: 'Receive 3 curated options with full photo and video evidence.',
            icon: 'home',
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <SafeAreaView edges={['top']} style={styles.safeArea} />

                <View style={styles.hero}>
                    <Text style={[styles.heroTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Find your perfect home with a personal hunter
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        Can't find what you're looking for? Let professional house hunters do the hard work for you.
                    </Text>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('CreateSearchRequest')}
                    >
                        <Text style={styles.primaryButtonText}>Start Custom Search</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.secondaryButton, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                        onPress={() => (navigation as any).navigate('ProfileTab', {
                            screen: 'TenantDashboard',
                            params: { initialTab: 'searches' }
                        })}
                    >
                        <Text style={[styles.secondaryButtonText, { color: isDark ? colors.text.dark : colors.text.light }]}>View My Requests</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>How it works</Text>
                    {steps.map((step) => (
                        <View key={step.id} style={styles.stepItem}>
                            <View style={styles.stepIcon}>
                                <Ionicons name={step.icon as any} size={24} color={colors.text.light} />
                            </View>
                            <View style={styles.stepInfo}>
                                <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>{step.title}</Text>
                                <Text style={styles.stepDesc}>{step.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.pricingSection}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Simple pricing</Text>
                    <View style={[styles.pricingCard, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50] }]}>
                        <View style={styles.pricingHeader}>
                            <Text style={[styles.pricingTier, { color: isDark ? colors.text.dark : colors.text.light }]}>Premium Search</Text>
                            <Text style={styles.pricingValue}>KES 8,000</Text>
                        </View>
                        <Text style={styles.pricingDesc}>Our most popular choice. Includes 3 property options with video evidence and priority matching.</Text>
                        <View style={styles.divider} />
                        <View style={styles.featureRow}>
                            <Ionicons name="checkmark" size={20} color={colors.success} />
                            <Text style={[styles.featureText, { color: isDark ? colors.text.dark : colors.text.light }]}>3 Curated property options</Text>
                        </View>
                        <View style={styles.featureRow}>
                            <Ionicons name="checkmark" size={20} color={colors.success} />
                            <Text style={[styles.featureText, { color: isDark ? colors.text.dark : colors.text.light }]}>Photo & Video evidence</Text>
                        </View>
                        <View style={styles.featureRow}>
                            <Ionicons name="checkmark" size={20} color={colors.success} />
                            <Text style={[styles.featureText, { color: isDark ? colors.text.dark : colors.text.light }]}>Escrow protection</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        paddingTop: spacing.sm,
    },
    scrollContent: {
        paddingBottom: spacing.xxl,
    },
    hero: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
    },
    heroTitle: {
        ...typography.h1,
        fontSize: 32,
        lineHeight: 38,
        marginBottom: spacing.md,
    },
    heroSubtitle: {
        ...typography.body,
        fontSize: 18,
        color: colors.neutral[500],
        lineHeight: 26,
        marginBottom: spacing.xl,
    },
    primaryButton: {
        backgroundColor: colors.primary[500],
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    primaryButtonText: {
        ...typography.bodySemiBold,
        color: 'white',
        fontSize: 16,
    },
    secondaryButton: {
        marginTop: spacing.md,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
    },
    secondaryButtonText: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    section: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
    },
    sectionTitle: {
        ...typography.h2,
        fontSize: 24,
        marginBottom: spacing.xl,
    },
    stepItem: {
        flexDirection: 'row',
        marginBottom: spacing.xl,
        gap: spacing.lg,
    },
    stepIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepInfo: {
        flex: 1,
    },
    stepTitle: {
        ...typography.bodySemiBold,
        fontSize: 18,
        marginBottom: 4,
    },
    stepDesc: {
        ...typography.body,
        color: colors.neutral[500],
        lineHeight: 22,
    },
    pricingSection: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
    },
    pricingCard: {
        padding: spacing.xl,
        borderRadius: borderRadius.xl,
        ...shadows.sm,
    },
    pricingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    pricingTier: {
        ...typography.h3,
        fontSize: 20,
    },
    pricingValue: {
        ...typography.h3,
        fontSize: 20,
        color: colors.primary[500],
    },
    pricingDesc: {
        ...typography.body,
        color: colors.neutral[500],
        marginBottom: spacing.lg,
        lineHeight: 22,
    },
    divider: {
        height: 1,
        backgroundColor: colors.neutral[200],
        marginBottom: spacing.lg,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    featureText: {
        ...typography.body,
    },
});

export default SearchRequestLandingScreen;

