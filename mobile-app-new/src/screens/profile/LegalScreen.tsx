import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

type LegalScreenParams = {
    Legal: {
        type: 'faq' | 'terms' | 'privacy';
    };
};

const LegalScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<LegalScreenParams, 'Legal'>>();
    const type = route.params?.type || 'faq';

    const getTitle = () => {
        switch (type) {
            case 'faq': return 'Frequently Asked Questions';
            case 'terms': return 'Terms of Service';
            case 'privacy': return 'Privacy Policy';
            default: return 'Information';
        }
    };

    const getContent = () => {
        switch (type) {
            case 'faq':
                return [
                    {
                        question: 'How do I book a property viewing?',
                        answer: 'Browse properties in the Explore tab, select a property you like, and choose a viewing package that suits your needs. Complete the payment and the house hunter will contact you to schedule the viewing.'
                    },
                    {
                        question: 'What is a House Hunter?',
                        answer: 'A House Hunter is a verified property expert who helps you find and view rental properties. They save you time by showing you multiple properties in one trip and providing honest insights about each location.'
                    },
                    {
                        question: 'How does payment work?',
                        answer: 'Payments are held securely in escrow until the viewing is completed. You only pay for what you get, and our platform ensures transparency and safety for both tenants and hunters.'
                    },
                    {
                        question: 'Can I cancel a booking?',
                        answer: 'Yes, you can cancel a booking before it is confirmed. Once confirmed, cancellations may incur a fee depending on the timing. Check our Terms of Service for more details.'
                    },
                    {
                        question: 'How do I become a House Hunter?',
                        answer: 'Visit the "For Hunters" section in the app menu and apply to become a verified House Hunter. You\'ll need to provide identification, references, and complete our verification process.'
                    }
                ];
            case 'terms':
                return [
                    {
                        question: '1. Acceptance of Terms',
                        answer: 'By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.'
                    },
                    {
                        question: '2. Use License',
                        answer: 'Permission is granted to temporarily download one copy of the materials on our platform for personal, non-commercial transitory viewing only.'
                    },
                    {
                        question: '3. Disclaimer',
                        answer: 'The materials on our platform are provided on an \'as is\' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.'
                    },
                    {
                        question: '4. Limitations',
                        answer: 'In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our platform.'
                    }
                ];
            case 'privacy':
                return [
                    {
                        question: 'Information We Collect',
                        answer: 'We collect information you provide directly to us, such as when you create an account, make a booking, or communicate with us. This includes your name, email address, phone number, and payment information.'
                    },
                    {
                        question: 'How We Use Your Information',
                        answer: 'We use the information we collect to provide, maintain, and improve our services, to process transactions, to send you technical notices and support messages, and to communicate with you about products, services, and events.'
                    },
                    {
                        question: 'Information Sharing',
                        answer: 'We do not share your personal information with third parties except as described in this policy. We may share information with service providers who perform services on our behalf, and as required by law.'
                    },
                    {
                        question: 'Data Security',
                        answer: 'We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.'
                    },
                    {
                        question: 'Your Rights',
                        answer: 'You have the right to access, update, or delete your personal information at any time. You can also opt out of receiving promotional communications from us.'
                    }
                ];
            default:
                return [];
        }
    };

    const content = getContent();

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    {getTitle()}
                </Text>
                <View style={{ width: 24 }} />
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {content.map((item, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={[styles.question, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {item.question}
                        </Text>
                        <Text style={[styles.answer, { color: colors.neutral[600] }]}>
                            {item.answer}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
        flex: 1,
        textAlign: 'center',
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    section: {
        marginBottom: spacing.xl,
    },
    question: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.sm,
    },
    answer: {
        ...typography.body,
        lineHeight: 22,
    },
});

export default LegalScreen;
