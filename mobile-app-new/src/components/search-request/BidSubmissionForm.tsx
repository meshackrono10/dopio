import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { SearchRequest } from '../../data/types';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface BidSubmissionFormProps {
    searchRequest: SearchRequest;
    onSubmit: (bid: { price: number; timeframe: number; message: string }) => void;
    onCancel: () => void;
}

export default function BidSubmissionForm({ searchRequest, onSubmit, onCancel }: BidSubmissionFormProps) {
    const { isDark } = useTheme();
    const [price, setPrice] = useState('');
    const [timeframe, setTimeframe] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<{ price?: string; timeframe?: string }>({});

    const validateForm = () => {
        const newErrors: { price?: string; timeframe?: string } = {};

        if (!price || parseInt(price) <= 0) {
            newErrors.price = 'Please enter a valid price';
        }

        if (!timeframe || parseInt(timeframe) <= 0) {
            newErrors.timeframe = 'Please enter a valid timeframe';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const bidData = {
            price: parseInt(price),
            timeframe: parseInt(timeframe),
            message: message.trim(),
        };

        Alert.alert(
            'Submit Bid',
            `Submit bid for KES ${bidData.price}?\n\nYou commit to find a property within ${bidData.timeframe} days.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Submit',
                    onPress: () => onSubmit(bidData),
                },
            ]
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>Submit Your Bid</Text>
                <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                    Bid for: {searchRequest.preferredAreas.join(', ')}
                </Text>

                {/* Price Input */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Service Fee (KES) <Text style={{ color: colors.error[500] }}>*</Text>
                    </Text>
                    <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.neutral[900] : 'white', borderColor: errors.price ? colors.error[500] : colors.neutral[300] }]}>
                        <Ionicons name="cash-outline" size={20} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
                        <TextInput
                            style={[styles.input, { color: isDark ? colors.text.dark : colors.text.light }]}
                            placeholder="Enter your service fee"
                            placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                            keyboardType="numeric"
                            value={price}
                            onChangeText={(text) => {
                                setPrice(text);
                                setErrors({ ...errors, price: undefined });
                            }}
                        />
                    </View>
                    {errors.price && (
                        <Text style={[styles.errorText, { color: colors.error[500] }]}>
                            {errors.price}
                        </Text>
                    )}
                    <Text style={[styles.helperText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        Suggested: KES {searchRequest.minRent.toLocaleString()} - {searchRequest.maxRent.toLocaleString()}
                    </Text>
                </View>

                {/* Timeframe Input */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Completion Timeframe (days) <Text style={{ color: colors.error[500] }}>*</Text>
                    </Text>
                    <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.neutral[900] : 'white', borderColor: errors.timeframe ? colors.error[500] : colors.neutral[300] }]}>
                        <Ionicons name="calendar-outline" size={20} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
                        <TextInput
                            style={[styles.input, { color: isDark ? colors.text.dark : colors.text.light }]}
                            placeholder="Number of days to find property"
                            placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                            keyboardType="numeric"
                            value={timeframe}
                            onChangeText={(text) => {
                                setTimeframe(text);
                                setErrors({ ...errors, timeframe: undefined });
                            }}
                        />
                    </View>
                    {errors.timeframe && (
                        <Text style={[styles.errorText, { color: colors.error[500] }]}>
                            {errors.timeframe}
                        </Text>
                    )}
                    <Text style={[styles.helperText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        How many days will it take to find a suitable property?
                    </Text>
                </View>

                {/* Message Input */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Cover Message (Optional)
                    </Text>
                    <TextInput
                        style={[styles.textArea, { backgroundColor: isDark ? colors.neutral[900] : 'white', color: isDark ? colors.text.dark : colors.text.light, borderColor: colors.neutral[300] }]}
                        placeholder="Explain why you're the best choice for this request..."
                        placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                        multiline
                        numberOfLines={4}
                        value={message}
                        onChangeText={setMessage}
                        textAlignVertical="top"
                    />
                </View>

                {/* Request Details Summary */}
                <View style={[styles.summaryCard, { backgroundColor: isDark ? colors.neutral[700] : colors.primary[50] }]}>
                    <Ionicons name="information-circle" size={20} color={colors.primary[500]} />
                    <View style={styles.summaryContent}>
                        <Text style={[styles.summaryTitle, { color: isDark ? colors.text.dark : colors.primary[900] }]}>
                            Request Details
                        </Text>
                        <Text style={[styles.summaryText, { color: isDark ? colors.neutral[300] : colors.primary[700] }]}>
                            Budget: KES {searchRequest.minRent.toLocaleString()} - {searchRequest.maxRent.toLocaleString()}
                        </Text>
                        <Text style={[styles.summaryText, { color: isDark ? colors.neutral[300] : colors.primary[700] }]}>
                            Location: {searchRequest.preferredAreas.join(', ')}
                        </Text>
                        <Text style={[styles.summaryText, { color: isDark ? colors.neutral[300] : colors.primary[700] }]}>
                            {searchRequest.propertyType} • {searchRequest.bedrooms} bed
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                        onPress={onCancel}
                    >
                        <Text style={[styles.buttonText, { color: isDark ? colors.text.dark : colors.neutral[700] }]}>
                            Cancel
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.submitButton, { backgroundColor: colors.primary[500] }]}
                        onPress={handleSubmit}
                    >
                        <Text style={[styles.buttonText, { color: 'white' }]}>
                            Submit Bid
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        padding: spacing.lg,
        margin: spacing.md,
        borderRadius: borderRadius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        ...typography.h2,
        fontSize: 22,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        fontSize: 14,
        marginBottom: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.body,
        fontSize: 15,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.md,
        borderWidth: 1,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: spacing.md,
        ...typography.body,
        fontSize: 15,
    },
    textArea: {
        borderRadius: borderRadius.md,
        borderWidth: 1,
        padding: spacing.md,
        ...typography.body,
        fontSize: 15,
        minHeight: 100,
    },
    helperText: {
        ...typography.body,
        fontSize: 13,
        marginTop: spacing.xs,
    },
    errorText: {
        fontSize: 13,
        marginTop: spacing.xs,
    },
    summaryCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    summaryContent: {
        flex: 1,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    summaryText: {
        fontSize: 13,
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    button: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {},
    submitButton: {},
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
