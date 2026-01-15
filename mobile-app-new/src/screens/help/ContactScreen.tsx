import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileStackParamList } from '../../types/navigation';
import { colors, spacing, typography, borderRadius } from '../../theme';

type Props = StackScreenProps<ProfileStackParamList, 'Contact'>;

export default function ContactScreen({ navigation }: Props) {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const categories = [
        { id: 'general', label: 'General Inquiry', icon: 'help-circle' },
        { id: 'technical', label: 'Technical Issue', icon: 'bug' },
        { id: 'payment', label: 'Payment Issue', icon: 'card' },
        { id: 'dispute', label: 'Dispute Resolution', icon: 'alert-circle' },
        { id: 'feedback', label: 'Feedback', icon: 'star' },
    ];

    const handleSubmit = () => {
        if (!selectedCategory) {
            Alert.alert('Error', 'Please select a category');
            return;
        }
        if (!subject.trim()) {
            Alert.alert('Error', 'Please enter a subject');
            return;
        }
        if (!message.trim()) {
            Alert.alert('Error', 'Please enter your message');
            return;
        }

        Alert.alert(
            'Message Sent',
            'Thank you for contacting us. We will respond to your inquiry within 24 hours.',
            [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            {/* Contact Methods */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Get in Touch</Text>

                <TouchableOpacity style={[styles.contactCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <View style={[styles.contactIcon, { backgroundColor: colors.primary[100] }]}>
                        <Ionicons name="mail" size={24} color={colors.primary[600]} />
                    </View>
                    <View style={styles.contactInfo}>
                        <Text style={[styles.contactLabel, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                            Email
                        </Text>
                        <Text style={[styles.contactValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            support@dapio.co.ke
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDark ? colors.text.dark : colors.neutral[500]} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.contactCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <View style={[styles.contactIcon, { backgroundColor: colors.success[100] }]}>
                        <Ionicons name="call" size={24} color={colors.success[600]} />
                    </View>
                    <View style={styles.contactInfo}>
                        <Text style={[styles.contactLabel, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                            Phone
                        </Text>
                        <Text style={[styles.contactValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            +254 700 123 456
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDark ? colors.text.dark : colors.neutral[500]} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.contactCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <View style={[styles.contactIcon, { backgroundColor: colors.info[100] }]}>
                        <Ionicons name="logo-whatsapp" size={24} color={colors.info[600]} />
                    </View>
                    <View style={styles.contactInfo}>
                        <Text style={[styles.contactLabel, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                            WhatsApp
                        </Text>
                        <Text style={[styles.contactValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Message us
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDark ? colors.text.dark : colors.neutral[500]} />
                </TouchableOpacity>
            </View>

            {/* Contact Form */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Send a Message</Text>

                {/* Category Selection */}
                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Category</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryChip,
                                selectedCategory === category.id && styles.categoryChipActive,
                                {
                                    backgroundColor: selectedCategory === category.id
                                        ? colors.primary[500]
                                        : isDark ? colors.neutral[800] : 'white',
                                },
                            ]}
                            onPress={() => setSelectedCategory(category.id)}
                        >
                            <Ionicons
                                name={category.icon as any}
                                size={18}
                                color={selectedCategory === category.id ? colors.neutral[50] : isDark ? colors.text.dark : colors.text.light}
                            />
                            <Text
                                style={[
                                    styles.categoryText,
                                    {
                                        color: selectedCategory === category.id
                                            ? colors.neutral[50]
                                            : isDark ? colors.text.dark : colors.text.light,
                                    },
                                ]}
                            >
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Subject Input */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Subject</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: isDark ? colors.neutral[800] : 'white', color: isDark ? colors.text.dark : colors.text.light }]}
                        placeholder="Brief description of your issue"
                        placeholderTextColor={isDark ? colors.text.dark : colors.neutral[500]}
                        value={subject}
                        onChangeText={setSubject}
                    />
                </View>

                {/* Message Input */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Message</Text>
                    <TextInput
                        style={[styles.textArea, { backgroundColor: isDark ? colors.neutral[800] : 'white', color: isDark ? colors.text.dark : colors.text.light }]}
                        placeholder="Describe your issue or inquiry in detail..."
                        placeholderTextColor={isDark ? colors.text.dark : colors.neutral[500]}
                        multiline
                        numberOfLines={6}
                        value={message}
                        onChangeText={setMessage}
                        textAlignVertical="top"
                    />
                    <Text style={[styles.charCount, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                        {message.length}/500
                    </Text>
                </View>

                {/* User Info Display */}
                <View style={[styles.infoBox, { backgroundColor: colors.info[50] }]}>
                    <Ionicons name="information-circle" size={18} color={colors.info[600]} />
                    <Text style={[styles.infoText, { color: colors.info[700] }]}>
                        We'll respond to {user?.email || 'your email'} within 24 hours
                    </Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.primary[500] }]}
                    onPress={handleSubmit}
                >
                    <Ionicons name="send" size={18} color={colors.neutral[50]} />
                    <Text style={styles.submitButtonText}>Send Message</Text>
                </TouchableOpacity>
            </View>

            {/* Business Hours */}
            <View style={[styles.section, styles.lastSection]}>
                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Business Hours</Text>
                <View style={[styles.hoursCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <View style={styles.hoursRow}>
                        <Text style={[styles.hoursLabel, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                            Monday - Friday
                        </Text>
                        <Text style={[styles.hoursValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            8:00 AM - 6:00 PM
                        </Text>
                    </View>
                    <View style={styles.hoursRow}>
                        <Text style={[styles.hoursLabel, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                            Saturday
                        </Text>
                        <Text style={[styles.hoursValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            9:00 AM - 2:00 PM
                        </Text>
                    </View>
                    <View style={styles.hoursRow}>
                        <Text style={[styles.hoursLabel, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                            Sunday
                        </Text>
                        <Text style={[styles.hoursValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Closed
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        padding: spacing.md,
    },
    lastSection: {
        paddingBottom: spacing.xl * 2,
    },
    sectionTitle: {
        ...typography.h3,
        fontSize: 20,
        fontWeight: '700',
        marginBottom: spacing.md,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
    },
    contactIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 13,
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    categoriesContainer: {
        marginBottom: spacing.lg,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
        gap: spacing.xs,
    },
    categoryChipActive: {},
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    input: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        fontSize: 15,
    },
    textArea: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        fontSize: 15,
        minHeight: 120,
    },
    charCount: {
        fontSize: 12,
        textAlign: 'right',
        marginTop: spacing.xs,
    },
    infoBox: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    submitButtonText: {
        color: colors.neutral[50],
        fontSize: 16,
        fontWeight: '700',
    },
    hoursCard: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    hoursRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    hoursLabel: {
        fontSize: 14,
    },
    hoursValue: {
        fontSize: 14,
        fontWeight: '600',
    },
});
