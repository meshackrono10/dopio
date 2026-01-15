import React from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

const TermsOfServiceScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Terms of Service
                </Text>
                <View style={{ width: 24 }} />
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.lastUpdated, { color: colors.neutral[500] }]}>Last Updated: January 12, 2026</Text>

                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>1. Agreement to Terms</Text>
                <Text style={[styles.paragraph, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                    By accessing or using House Haunters, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>2. Use of Service</Text>
                <Text style={[styles.paragraph, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                    You agree to use the service only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the service.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>3. Escrow & Payments</Text>
                <Text style={[styles.paragraph, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                    House Haunters acts as an escrow service for viewing fees. Fees are held until the viewing is completed or a dispute is resolved. We are not responsible for the condition of properties or the behavior of users.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>4. User Accounts</Text>
                <Text style={[styles.paragraph, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                    When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>5. Limitation of Liability</Text>
                <Text style={[styles.paragraph, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                    In no event shall House Haunters, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.
                </Text>

                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>6. Changes to Terms</Text>
                <Text style={[styles.paragraph, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
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

export default TermsOfServiceScreen;
