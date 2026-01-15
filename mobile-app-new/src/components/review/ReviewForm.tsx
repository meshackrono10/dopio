import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../common/Button';

interface ReviewFormProps {
    hunterName: string;
    propertyTitle: string;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
    hunterName,
    propertyTitle,
    onSubmit,
    onCancel,
}) => {
    const { isDark } = useTheme();
    const [rating, setRating] = useState(0);
    const [professionalism, setProfessionalism] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [comment, setComment] = useState('');
    const [errors, setErrors] = useState<any>({});

    const handleSubmit = () => {
        const newErrors: any = {};
        if (rating === 0) newErrors.rating = 'Please select an overall rating';
        if (professionalism === 0) newErrors.professionalism = 'Please rate professionalism';
        if (accuracy === 0) newErrors.accuracy = 'Please rate accuracy';
        if (!comment.trim()) newErrors.comment = 'Please write a review';
        else if (comment.trim().length < 20) newErrors.comment = 'Review must be at least 20 characters';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            rating,
            professionalism,
            accuracy,
            comment: comment.trim(),
        });
    };

    const renderStars = (current: number, setter: (val: number) => void, label: string, error?: string) => (
        <View style={styles.starSection}>
            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>{label}</Text>
            <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setter(star)}>
                        <Ionicons
                            name={star <= current ? "star" : "star-outline"}
                            size={32}
                            color={star <= current ? "#F59E0B" : colors.neutral[300]}
                        />
                    </TouchableOpacity>
                ))}
                <Text style={[styles.starValue, { color: colors.neutral[500] }]}>
                    {current > 0 ? `${current}/5` : 'Rate'}
                </Text>
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={[styles.content, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Review {hunterName}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.neutral[500] }]}>
                        Viewing: {propertyTitle}
                    </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {renderStars(rating, setRating, "Overall Rating *", errors.rating)}
                    {renderStars(professionalism, setProfessionalism, "Professionalism *", errors.professionalism)}
                    {renderStars(accuracy, setAccuracy, "Property Accuracy *", errors.accuracy)}

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Your Review *</Text>
                        <TextInput
                            style={[
                                styles.textArea,
                                {
                                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                                    color: isDark ? colors.text.dark : colors.text.light,
                                    borderColor: errors.comment ? colors.error : 'transparent',
                                    borderWidth: 1,
                                }
                            ]}
                            placeholder="Share your experience..."
                            placeholderTextColor={colors.neutral[500]}
                            multiline
                            numberOfLines={5}
                            value={comment}
                            onChangeText={setComment}
                        />
                        <View style={styles.charCountRow}>
                            <Text style={[styles.charCount, { color: colors.neutral[500] }]}>Min 20 characters</Text>
                            <Text style={[styles.charCount, { color: colors.neutral[500] }]}>{comment.length} chars</Text>
                        </View>
                        {errors.comment && <Text style={styles.errorText}>{errors.comment}</Text>}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Button variant="outline" style={{ flex: 1 }} onPress={onCancel}>Cancel</Button>
                    <Button style={{ flex: 1 }} onPress={handleSubmit}>Submit</Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    content: {
        borderTopLeftRadius: borderRadius.xxl,
        borderTopRightRadius: borderRadius.xxl,
        padding: spacing.xl,
        maxHeight: '90%',
    },
    header: {
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h3,
        marginBottom: 4,
    },
    subtitle: {
        ...typography.caption,
    },
    scrollContent: {
        gap: spacing.xl,
        paddingBottom: spacing.xl,
    },
    starSection: {
        gap: spacing.sm,
    },
    label: {
        ...typography.bodySmall,
        fontWeight: '700',
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    starValue: {
        ...typography.caption,
        fontWeight: '600',
        marginLeft: spacing.sm,
    },
    inputGroup: {
        gap: spacing.sm,
    },
    textArea: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        ...typography.bodySmall,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    charCountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    charCount: {
        fontSize: 10,
    },
    errorText: {
        color: colors.error,
        fontSize: 10,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingTop: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
});

export default ReviewForm;
