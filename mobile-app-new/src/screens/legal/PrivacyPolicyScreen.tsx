import React from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

const PrivacyPolicyScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Privacy Policy
                </Text>
                <View style={{ width: 24 }} />
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.lastUpdated, { color: colors.neutral[500] }]}>Last Updated: January 12, 2026</Text>

                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>1. Introduction</Text>
                <Text style={[styles.paragraph, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                    Welcome to House Haunters. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>2. Information We Collect</Text>
                <Text style={[styles.paragraph, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                    We collect personal information that you provide to us such as name, address, contact information, passwords and security data, and payment information.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>3. How We Use Your Information</Text>
                <Text style={[styles.paragraph, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                    We use personal information collected via our App for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>4. Sharing Your Information</Text>
                <Text style={[styles.paragraph, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                    We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>5. Your Privacy Rights</Text>
                <Text style={[styles.paragraph, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                    In some regions, such as the European Economic Area, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>6. Contact Us</Text>
                <Text style={[styles.paragraph, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                    If you have questions or comments about this policy, you may email us at support@househaunters.app.
                </Text>
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
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
    },
    content: {
        padding: spacing.lg,
    },
    lastUpdated: {
        ...typography.caption,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    paragraph: {
        ...typography.body,
        lineHeight: 24,
    },
});

export default PrivacyPolicyScreen;
