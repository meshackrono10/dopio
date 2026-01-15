import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface RescheduleModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (newTime: string, reason: string) => void;
    currentDate: string;
    currentTime: string;
    isLoading?: boolean;
}

const TIME_SLOTS = [
    { label: '9:00 AM', value: '09:00' },
    { label: '10:00 AM', value: '10:00' },
    { label: '11:00 AM', value: '11:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '2:00 PM', value: '14:00' },
    { label: '3:00 PM', value: '15:00' },
    { label: '4:00 PM', value: '16:00' },
    { label: '5:00 PM', value: '17:00' },
];

const RESCHEDULE_REASONS = [
    { label: 'Running late', value: 'running_late', icon: 'time-outline' },
    { label: 'Traffic delay', value: 'traffic', icon: 'car-outline' },
    { label: 'Emergency', value: 'emergency', icon: 'medical-outline' },
    { label: 'Weather conditions', value: 'weather', icon: 'rainy-outline' },
    { label: 'Other', value: 'other', icon: 'chatbox-outline' },
];

const RescheduleModal: React.FC<RescheduleModalProps> = ({
    visible,
    onClose,
    onSubmit,
    currentDate,
    currentTime,
    isLoading = false,
}) => {
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedReason, setSelectedReason] = useState<string>('');

    const handleSubmit = () => {
        if (!selectedTime) {
            Alert.alert('Select Time', 'Please select a new time for the viewing.');
            return;
        }
        if (!selectedReason) {
            Alert.alert('Select Reason', 'Please select a reason for rescheduling.');
            return;
        }

        onSubmit(selectedTime, selectedReason);
    };

    const handleClose = () => {
        setSelectedTime('');
        setSelectedReason('');
        onClose();
    };

    // Filter out times that have already passed or are the current time
    const availableSlots = TIME_SLOTS.filter(slot => slot.value !== currentTime);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} disabled={isLoading}>
                        <Ionicons name="close" size={28} color={colors.neutral[700]} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Reschedule Viewing</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Current Info */}
                    <View style={styles.currentInfo}>
                        <Ionicons name="calendar" size={20} color={colors.neutral[500]} />
                        <Text style={styles.currentText}>
                            Current: {currentDate} at {currentTime}
                        </Text>
                    </View>

                    {/* Warning */}
                    <View style={styles.warningCard}>
                        <Ionicons name="warning" size={24} color={colors.warning} />
                        <View style={styles.warningContent}>
                            <Text style={styles.warningTitle}>Same-Day Reschedule Only</Text>
                            <Text style={styles.warningText}>
                                You can only reschedule to a different time on the same day.
                                The other party will need to approve your request.
                            </Text>
                        </View>
                    </View>

                    {/* Time Selection */}
                    <Text style={styles.sectionTitle}>Select New Time</Text>
                    <View style={styles.timeGrid}>
                        {availableSlots.map((slot) => (
                            <TouchableOpacity
                                key={slot.value}
                                style={[
                                    styles.timeSlot,
                                    selectedTime === slot.value && styles.timeSlotSelected,
                                ]}
                                onPress={() => setSelectedTime(slot.value)}
                            >
                                <Text style={[
                                    styles.timeSlotText,
                                    selectedTime === slot.value && styles.timeSlotTextSelected,
                                ]}>
                                    {slot.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Reason Selection */}
                    <Text style={styles.sectionTitle}>Reason for Reschedule</Text>
                    <View style={styles.reasonList}>
                        {RESCHEDULE_REASONS.map((reason) => (
                            <TouchableOpacity
                                key={reason.value}
                                style={[
                                    styles.reasonItem,
                                    selectedReason === reason.value && styles.reasonItemSelected,
                                ]}
                                onPress={() => setSelectedReason(reason.value)}
                            >
                                <View style={[
                                    styles.reasonIcon,
                                    selectedReason === reason.value && styles.reasonIconSelected,
                                ]}>
                                    <Ionicons
                                        name={reason.icon as any}
                                        size={20}
                                        color={selectedReason === reason.value ? 'white' : colors.neutral[600]}
                                    />
                                </View>
                                <Text style={[
                                    styles.reasonText,
                                    selectedReason === reason.value && styles.reasonTextSelected,
                                ]}>
                                    {reason.label}
                                </Text>
                                {selectedReason === reason.value && (
                                    <Ionicons name="checkmark-circle" size={24} color={colors.primary[500]} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleClose}
                        disabled={isLoading}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (!selectedTime || !selectedReason) && styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!selectedTime || !selectedReason || isLoading}
                    >
                        {isLoading ? (
                            <Text style={styles.submitButtonText}>Sending...</Text>
                        ) : (
                            <Text style={styles.submitButtonText}>Send Request</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral[50],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
        backgroundColor: 'white',
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    currentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    currentText: {
        ...typography.body,
        color: colors.neutral[600],
    },
    warningCard: {
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: colors.warning + '15',
        borderRadius: borderRadius.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.warning,
        marginBottom: spacing.xl,
        gap: spacing.md,
    },
    warningContent: {
        flex: 1,
    },
    warningTitle: {
        ...typography.bodySemiBold,
        color: colors.neutral[800],
        marginBottom: spacing.xs,
    },
    warningText: {
        ...typography.caption,
        color: colors.neutral[600],
        lineHeight: 18,
    },
    sectionTitle: {
        ...typography.bodySemiBold,
        marginBottom: spacing.md,
        color: colors.neutral[800],
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    timeSlot: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[300],
        backgroundColor: 'white',
    },
    timeSlotSelected: {
        borderColor: colors.primary[500],
        backgroundColor: colors.primary[500],
    },
    timeSlotText: {
        ...typography.body,
        color: colors.neutral[700],
    },
    timeSlotTextSelected: {
        color: 'white',
        fontWeight: '600',
    },
    reasonList: {
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: 'white',
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        gap: spacing.md,
    },
    reasonItemSelected: {
        borderColor: colors.primary[500],
        backgroundColor: colors.primary[50],
    },
    reasonIcon: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        backgroundColor: colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    reasonIconSelected: {
        backgroundColor: colors.primary[500],
    },
    reasonText: {
        ...typography.body,
        flex: 1,
        color: colors.neutral[700],
    },
    reasonTextSelected: {
        color: colors.primary[700],
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        padding: spacing.lg,
        gap: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
        backgroundColor: 'white',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[300],
    },
    cancelButtonText: {
        ...typography.bodySemiBold,
        color: colors.neutral[600],
    },
    submitButton: {
        flex: 2,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary[500],
        ...shadows.sm,
    },
    submitButtonDisabled: {
        backgroundColor: colors.neutral[300],
    },
    submitButtonText: {
        ...typography.bodySemiBold,
        color: 'white',
    },
});

export default RescheduleModal;
