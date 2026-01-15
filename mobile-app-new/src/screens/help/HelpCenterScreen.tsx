import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ProfileStackParamList } from '../../types/navigation';
import { colors, spacing, typography, borderRadius } from '../../theme';

type Props = StackScreenProps<ProfileStackParamList, 'HelpCenter'>;

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: 'general' | 'tenant' | 'hunter' | 'payment';
}

const FAQ_DATA: FAQItem[] = [
    {
        id: '1',
        question: 'How does Dapio work?',
        answer: 'Dapio connects tenants looking for houses with professional house hunters who help find the perfect property. Tenants post their requirements, hunters bid on requests, and once accepted, hunters search for suitable properties and share evidence.',
        category: 'general',
    },
    {
        id: '2',
        question: 'How much does the service cost?',
        answer: 'Service fees vary based on the hunter and package selected. Prices typically range from KES 500 to KES 3,000. You can view all bids and choose the best offer for your budget.',
        category: 'payment',
    },
    {
        id: '3',
        question: 'How do I create a search request?',
        answer: 'Go to the Search tab, tap "Create Request", fill in your requirements (location, budget, bedrooms, etc.), and submit. Hunters will then bid on your request.',
        category: 'tenant',
    },
    {
        id: '4',
        question: 'How do I become a house hunter?',
        answer: 'Go to your Profile, tap "Become a House Hunter", complete the verification process with your ID and proof of address, and start bidding on search requests once approved.',
        category: 'hunter',
    },
    {
        id: '5',
        question: 'What payment methods are supported?',
        answer: 'We support M-Pesa for all transactions. You can deposit to your wallet via M-Pesa and withdraw your earnings directly to your M-Pesa account.',
        category: 'payment',
    },
    {
        id: '6',
        question: 'How do escrow payments work?',
        answer: 'When you accept a hunter\'s bid, payment is held in escrow. The hunter searches for properties and uploads evidence. Once you approve the evidence, payment is released to the hunter automatically.',
        category: 'payment',
    },
    {
        id: '7',
        question: 'Can I cancel a search request?',
        answer: 'Yes, you can cancel a request before accepting any bids. After accepting a bid, cancellation is subject to refund policies and may incur fees.',
        category: 'tenant',
    },
    {
        id: '8',
        question: 'How long does it take to find a property?',
        answer: 'This depends on your requirements and the hunter you choose. Most hunters complete searches within 3-7 days. The timeframe is specified in each hunter\'s bid.',
        category: 'general',
    },
];

export default function HelpCenterScreen({ navigation }: Props) {
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = [
        { id: 'all', label: 'All', icon: 'apps' },
        { id: 'general', label: 'General', icon: 'information-circle' },
        { id: 'tenant', label: 'For Tenants', icon: 'home' },
        { id: 'hunter', label: 'For Hunters', icon: 'search' },
        { id: 'payment', label: 'Payment', icon: 'card' },
    ];

    const filteredFAQs = FAQ_DATA.filter((faq) => {
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Help Center
                    </Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <Ionicons name="search" size={20} color={isDark ? colors.text.dark : colors.neutral[500]} />
                <TextInput
                    style={[styles.searchInput, { color: isDark ? colors.text.dark : colors.text.light }]}
                    placeholder="Search help articles..."
                    placeholderTextColor={isDark ? colors.text.dark : colors.neutral[500]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={isDark ? colors.text.dark : colors.neutral[500]} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Tab Bar Style Category Filters */}
            <View style={[styles.tabBar, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.tabItem,
                                selectedCategory === category.id && styles.activeTabItem,
                            ]}
                            onPress={() => setSelectedCategory(category.id)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    selectedCategory === category.id && styles.activeTabText,
                                ]}
                            >
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* FAQ List */}
            <ScrollView style={styles.faqContainer} contentContainerStyle={styles.faqContent}>
                {filteredFAQs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={64} color={isDark ? colors.text.dark : colors.neutral[500]} />
                        <Text style={[styles.emptyText, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                            No articles found
                        </Text>
                    </View>
                ) : (
                    filteredFAQs.map((faq) => (
                        <TouchableOpacity
                            key={faq.id}
                            style={[styles.faqItem, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                            onPress={() => toggleExpand(faq.id)}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={[styles.faqQuestion, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    {faq.question}
                                </Text>
                                <Ionicons
                                    name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={isDark ? colors.text.dark : colors.neutral[500]}
                                />
                            </View>
                            {expandedId === faq.id && (
                                <Text style={[styles.faqAnswer, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                    {faq.answer}
                                </Text>
                            )}
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Contact Support Button */}
            <View style={[styles.footer, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <Text style={[styles.footerText, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                    Can't find what you're looking for?
                </Text>
                <TouchableOpacity
                    style={[styles.contactButton, { backgroundColor: colors.primary[500] }]}
                    onPress={() => navigation.navigate('Contact' as any)}
                >
                    <Ionicons name="chatbubble-ellipses" size={18} color={colors.neutral[50]} />
                    <Text style={styles.contactButtonText}>Contact Support</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
        fontWeight: '700',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: spacing.md,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    tabBar: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    tabBarContent: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        gap: spacing.md,
    },
    tabItem: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
    },
    activeTabItem: {
        backgroundColor: colors.primary[500],
    },
    tabText: {
        ...typography.bodySemiBold,
        fontSize: 14,
        color: colors.neutral[500],
    },
    activeTabText: {
        color: 'white',
    },
    faqContainer: {
        flex: 1,
    },
    faqContent: {
        padding: spacing.md,
    },
    faqItem: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    faqQuestion: {
        ...typography.body,
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
        marginRight: spacing.sm,
    },
    faqAnswer: {
        ...typography.body,
        fontSize: 14,
        lineHeight: 20,
        marginTop: spacing.md,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl * 2,
    },
    emptyText: {
        ...typography.body,
        fontSize: 16,
        marginTop: spacing.md,
    },
    footer: {
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    footerText: {
        ...typography.body,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    contactButtonText: {
        color: colors.neutral[50],
        fontSize: 15,
        fontWeight: '700',
    },
});
