import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface DatePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    label?: string;
}

export default function DatePicker({ value, onChange, minDate, maxDate, label }: DatePickerProps) {
    const { isDark } = useTheme();
    const [show, setShow] = useState(false);
    const [tempDate, setTempDate] = useState(value);

    const handleChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShow(false);
        }

        if (selectedDate) {
            setTempDate(selectedDate);
            if (Platform.OS === 'android') {
                onChange(selectedDate);
            }
        }
    };

    const handleConfirm = () => {
        onChange(tempDate);
        setShow(false);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-KE', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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
                <Ionicons name="calendar-outline" size={20} color={isDark ? colors.text.dark : colors.neutral[500]} />
                <Text style={[styles.value, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    {formatDate(value)}
                </Text>
                <Ionicons name="chevron-down" size={20} color={isDark ? colors.text.dark : colors.neutral[500]} />
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
                                    <Text style={[styles.modalButton, { color: isDark ? colors.text.dark : colors.neutral[500] }]}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <Text style={[styles.modalTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Select Date
                                </Text>
                                <TouchableOpacity onPress={handleConfirm}>
                                    <Text style={[styles.modalButton, { color: colors.primary[600] }]}>
                                        Done
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                display="spinner"
                                onChange={handleChange}
                                minimumDate={minDate}
                                maximumDate={maxDate}
                                textColor={isDark ? colors.text.dark : colors.text.light}
                            />
                        </View>
                    </View>
                </Modal>
            ) : (
                show && (
                    <DateTimePicker
                        value={value}
                        mode="date"
                        display="default"
                        onChange={handleChange}
                        minimumDate={minDate}
                        maximumDate={maxDate}
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
