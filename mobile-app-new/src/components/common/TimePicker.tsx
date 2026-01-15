import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface TimePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    label?: string;
}

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
    const { isDark } = useTheme();
    const [show, setShow] = useState(false);
    const [tempTime, setTempTime] = useState(value);

    const handleChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === 'android') {
            setShow(false);
        }

        if (selectedTime) {
            setTempTime(selectedTime);
            if (Platform.OS === 'android') {
                onChange(selectedTime);
            }
        }
    };

    const handleConfirm = () => {
        onChange(tempTime);
        setShow(false);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <View>
            {label && (
                <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>{label}</Text>
            )}

            <TouchableOpacity
                style={[styles.picker, { backgroundColor: isDark ? colors.neutral[800] : 'white', borderColor: colors.neutral[300] }]}
                onPress={() => setShow(true)}
            >
                <Ionicons name="time-outline" size={20} color={isDark ? colors.neutral[400] : colors.neutral[600]} />
                <Text style={[styles.value, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    {formatTime(value)}
                </Text>
                <Ionicons name="chevron-down" size={20} color={isDark ? colors.neutral[400] : colors.neutral[600]} />
            </TouchableOpacity>

            {Platform.OS === 'ios' ? (
                <Modal
                    visible={show}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShow(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={[styles.modalContent, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setShow(false)}>
                                    <Text style={[styles.modalButton, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <Text style={[styles.modalTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Select Time
                                </Text>
                                <TouchableOpacity onPress={handleConfirm}>
                                    <Text style={[styles.modalButton, { color: colors.primary[600] }]}>
                                        Done
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <DateTimePicker
                                value={tempTime}
                                mode="time"
                                display="spinner"
                                onChange={handleChange}
                                textColor={isDark ? colors.text.dark : colors.text.light}
                            />
                        </View>
                    </View>
                </Modal>
            ) : (
                show && (
                    <DateTimePicker
                        value={value}
                        mode="time"
                        display="default"
                        onChange={handleChange}
                    />
                )
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    picker: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        gap: spacing.sm,
    },
    value: {
        flex: 1,
        fontSize: 15,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        paddingBottom: spacing.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalButton: {
        fontSize: 16,
        fontWeight: '600',
    },
});
