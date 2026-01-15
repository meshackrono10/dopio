import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface TimeSlot {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    enabled: boolean;
}

interface AvailabilityManagerProps {
    onSave?: (slots: TimeSlot[]) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export default function AvailabilityManager({ onSave }: AvailabilityManagerProps) {
    const { isDark } = useTheme();
    const [availability, setAvailability] = useState<Record<string, { enabled: boolean; start: string; end: string }>>({
        Monday: { enabled: true, start: '09:00', end: '17:00' },
        Tuesday: { enabled: true, start: '09:00', end: '17:00' },
        Wednesday: { enabled: true, start: '09:00', end: '17:00' },
        Thursday: { enabled: true, start: '09:00', end: '17:00' },
        Friday: { enabled: true, start: '09:00', end: '17:00' },
        Saturday: { enabled: false, start: '10:00', end: '14:00' },
        Sunday: { enabled: false, start: '10:00', end: '14:00' },
    });

    const toggleDay = (day: string) => {
        setAvailability({
            ...availability,
            [day]: { ...availability[day], enabled: !availability[day].enabled },
        });
    };

    const updateTime = (day: string, type: 'start' | 'end', time: string) => {
        setAvailability({
            ...availability,
            [day]: { ...availability[day], [type]: time },
        });
    };

    const handleSave = () => {
        const slots: TimeSlot[] = Object.entries(availability)
            .filter(([_, data]) => data.enabled)
            .map(([day, data], index) => ({
                id: `${day}-${index}`,
                day,
                startTime: data.start,
                endTime: data.end,
                enabled: data.enabled,
            }));
        onSave?.(slots);
    };

    const copyToAll = (day: string) => {
        const template = availability[day];
        const newAvailability = { ...availability };
        DAYS_OF_WEEK.forEach(d => {
            newAvailability[d] = { ...template };
        });
        setAvailability(newAvailability);
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>Set Your Availability</Text>
                <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    Choose when you're available for property viewings
                </Text>

                {DAYS_OF_WEEK.map((day) => (
                    <View key={day} style={[styles.dayCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <View style={styles.dayHeader}>
                            <View style={styles.dayInfo}>
                                <Text style={[styles.dayName, { color: isDark ? colors.text.dark : colors.text.light }]}>{day}</Text>
                                {availability[day].enabled && (
                                    <Text style={[styles.dayTime, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                                        {availability[day].start} - {availability[day].end}
                                    </Text>
                                )}
                            </View>
                            <Switch
                                value={availability[day].enabled}
                                onValueChange={() => toggleDay(day)}
                                trackColor={{ false: colors.neutral[300], true: colors.primary[300] }}
                                thumbColor={availability[day].enabled ? colors.primary[500] : colors.neutral[50]}
                            />
                        </View>

                        {availability[day].enabled && (
                            <View style={styles.timeSelectors}>
                                <View style={styles.timeSelector}>
                                    <Text style={[styles.timeLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Start</Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.timeScroll}
                                    >
                                        {TIME_SLOTS.map((time) => (
                                            <TouchableOpacity
                                                key={`start-${time}`}
                                                style={[
                                                    styles.timeButton,
                                                    { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] },
                                                    availability[day].start === time && [
                                                        styles.timeButtonActive,
                                                        { backgroundColor: colors.primary[100], borderColor: colors.primary[500] },
                                                    ],
                                                ]}
                                                onPress={() => updateTime(day, 'start', time)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.timeText,
                                                        { color: isDark ? colors.text.dark : colors.text.light },
                                                        availability[day].start === time && { color: colors.primary[700] },
                                                    ]}
                                                >
                                                    {time}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.timeSelector}>
                                    <Text style={[styles.timeLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>End</Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.timeScroll}
                                    >
                                        {TIME_SLOTS.map((time) => (
                                            <TouchableOpacity
                                                key={`end-${time}`}
                                                style={[
                                                    styles.timeButton,
                                                    { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] },
                                                    availability[day].end === time && [
                                                        styles.timeButtonActive,
                                                        { backgroundColor: colors.primary[100], borderColor: colors.primary[500] },
                                                    ],
                                                ]}
                                                onPress={() => updateTime(day, 'end', time)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.timeText,
                                                        { color: isDark ? colors.text.dark : colors.text.light },
                                                        availability[day].end === time && { color: colors.primary[700] },
                                                    ]}
                                                >
                                                    {time}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <TouchableOpacity
                                    style={styles.copyButton}
                                    onPress={() => copyToAll(day)}
                                >
                                    <Ionicons name="copy-outline" size={16} color={colors.primary[600]} />
                                    <Text style={[styles.copyText, { color: colors.primary[600] }]}>
                                        Copy to all days
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: colors.primary[500] }]}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Save Availability</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
    },
    title: {
        ...typography.h2,
        fontSize: 24,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        fontSize: 14,
        marginBottom: spacing.lg,
    },
    dayCard: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dayInfo: {
        flex: 1,
    },
    dayName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    dayTime: {
        fontSize: 13,
    },
    timeSelectors: {
        marginTop: spacing.md,
    },
    timeSelector: {
        marginBottom: spacing.md,
    },
    timeLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    timeScroll: {
        marginHorizontal: -spacing.xs,
    },
    timeButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        marginHorizontal: spacing.xs,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    timeButtonActive: {
        borderWidth: 2,
    },
    timeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
    },
    copyText: {
        fontSize: 13,
        fontWeight: '600',
    },
    footer: {
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    saveButton: {
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    saveButtonText: {
        color: colors.neutral[50],
        fontSize: 16,
        fontWeight: '700',
    },
});
