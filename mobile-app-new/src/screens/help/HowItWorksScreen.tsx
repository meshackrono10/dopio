import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ProfileStackParamList } from '../../types/navigation';
import { colors, spacing, typography, borderRadius } from '../../theme';

type Props = StackScreenProps<ProfileStackParamList, 'HowItWorks'>;

const steps = {
    tenant: [
        {
            id: 1,
            icon: 'search',
            title: 'Search Properties',
            description: 'Browse our extensive list of verified properties in your preferred area.',
        },
        {
            id: 2,
            icon: 'options',
            title: 'Filter & Compare',
            description: 'Use advanced filters to narrow down your search and compare properties side-by-side.',
        },
        {
            id: 3,
            icon: 'calendar',
            title: 'Schedule Viewings',
            description: 'Once you find a property you like, book a viewing at your convenience.',
        },
        {
            id: 4,
            icon: 'chatbubbles',
            title: 'Chat with Hunters',
            description: 'Connect directly with professional hunters to ask questions and get more details.',
        },
        {
            id: 5,
            icon: 'home',
            title: 'Secure Your Home',
            description: 'Pay the viewing or commission fee securely through the app to proceed.',
        },
    ],
    hunter: [
        {
            id: 1,
            icon: 'person-add',
            title: 'Get Verified',
            description: 'Complete the verification process with your ID and proof of address to become a professional hunter.',
        },
        {
            id: 2,
            icon: 'add-circle',
            title: 'List Properties',
            description: 'Upload high-quality photos, videos, and details of properties available for rent.',
        },
        {
            id: 3,
            icon: 'calendar',
            title: 'Manage Viewings',
            description: 'Receive and manage viewing requests from interested tenants.',
        },
        {
            id: 4,
            icon: 'chatbubbles',
            title: 'Interact with Tenants',
            description: 'Communicate with potential tenants to provide property details and schedule visits.',
        },
        {
            id: 5,
            icon: 'cash',
            title: 'Earn & Withdraw',
            description: 'Once services are rendered, payment is released to your wallet. Withdraw via M-Pesa anytime.',
        },
    ],
};

export default function HowItWorksScreen({ navigation }: Props) {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = React.useState<'tenant' | 'hunter'>('tenant');

    const currentSteps = steps[activeTab];

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            {/* Tabs */}
            <View style={[styles.tabs, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'tenant' && styles.tabActive]}
                    onPress={() => setActiveTab('tenant')}
                >
                    <Ionicons
                        name="home"
                        size={20}
                        color={activeTab === 'tenant' ? colors.primary[600] : isDark ? colors.text.dark : colors.neutral[500]}
                    />
                    <Text style={[styles.tabText, activeTab === 'tenant' && styles.tabTextActive, { color: activeTab === 'tenant' ? colors.primary[700] : isDark ? colors.text.dark : colors.neutral[500] }]}>
                        For Tenants
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'hunter' && styles.tabActive]}
                    onPress={() => setActiveTab('hunter')}
                >
                    <Ionicons
                        name="search"
                        size={20}
                        color={activeTab === 'hunter' ? colors.primary[600] : isDark ? colors.text.dark : colors.neutral[500]}
                    />
                    <Text style={[styles.tabText, activeTab === 'hunter' && styles.tabTextActive, { color: activeTab === 'hunter' ? colors.primary[700] : isDark ? colors.text.dark : colors.neutral[500] }]}>
                        For Hunters
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Steps */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {currentSteps.map((step, index) => (
                    <View key={step.id} style={styles.stepContainer}>
                        <View style={styles.stepLine}>
                            <View style={[styles.stepNumber, { backgroundColor: colors.primary[500] }]}>
                                <Text style={styles.stepNumberText}>{step.id}</Text>
                            </View>
                            {index < currentSteps.length - 1 && (
                                <View style={[styles.connector, { backgroundColor: colors.primary[200] }]} />
                            )}
                        </View>

                        <View style={[styles.stepCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <View style={[styles.stepIcon, { backgroundColor: colors.primary[100] }]}>
                                <Ionicons name={step.icon as any} size={28} color={colors.primary[600]} />
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    {step.title}
                                </Text>
                                <Text style={[styles.stepDescription, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                    {step.description}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}

                {/* CTA */}
                <View style={[styles.ctaCard, { backgroundColor: colors.primary[50] }]}>
                    <Text style={[styles.ctaTitle, { color: colors.primary[900] }]}>
                        {activeTab === 'tenant' ? 'Ready to Find Your Perfect Home?' : 'Ready to Start Earning?'}
                    </Text>
                    <Text style={[styles.ctaDescription, { color: colors.primary[700] }]}>
                        {activeTab === 'tenant'
                            ? 'Post your first search request and let professional hunters help you find the perfect property.'
                            : 'Complete verification and start bidding on search requests in your area.'}
                    </Text>
                    <TouchableOpacity
                        style={[styles.ctaButton, { backgroundColor: colors.primary[500] }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.ctaButtonText}>
                            {activeTab === 'tenant' ? 'Get Started' : 'Apply as Hunter'}
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color={colors.neutral[50]} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const TouchableOpacity = require('react-native').TouchableOpacity;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabs: {
        flexDirection: 'row',
        padding: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    tabActive: {
        backgroundColor: colors.primary[100],
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
    },
    tabTextActive: {},
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl * 2,
    },
    stepContainer: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
    },
    stepLine: {
        alignItems: 'center',
        marginRight: spacing.md,
    },
    stepNumber: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    stepNumberText: {
        color: colors.neutral[50],
        fontSize: 18,
        fontWeight: '700',
    },
    connector: {
        width: 2,
        flex: 1,
        marginTop: spacing.xs,
    },
    stepCard: {
        flex: 1,
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    stepIcon: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        ...typography.body,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    stepDescription: {
        ...typography.body,
        fontSize: 14,
        lineHeight: 20,
    },
    ctaCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginTop: spacing.md,
    },
    ctaTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    ctaDescription: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: spacing.lg,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    ctaButtonText: {
        color: colors.neutral[50],
        fontSize: 16,
        fontWeight: '700',
    },
});
