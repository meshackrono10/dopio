import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isAvailable: boolean;
    bookings: number;
}

interface SchedulingCalendarProps {
    onDateSelect?: (date: Date) => void;
    availableDates?: Date[];
    bookedDates?: { date: Date; count: number }[];
}

export default function SchedulingCalendar({ onDateSelect, availableDates = [], bookedDates = [] }: SchedulingCalendarProps) {
    const { isDark } = useTheme();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const getDaysInMonth = (date: Date): CalendarDay[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: CalendarDay[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Previous month days
        const prevMonthDays = startingDayOfWeek;
        const prevMonth = new Date(year, month, 0);
        for (let i = prevMonthDays - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, prevMonth.getDate() - i);
            days.push({
                date,
                isCurrentMonth: false,
                isToday: false,
                isSelected: false,
                isAvailable: false,
                bookings: 0,
            });
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.getTime() === today.getTime();
            const isSelected = selectedDate ? date.getTime() === selectedDate.getTime() : false;
            const isAvailable = availableDates.some(d => d.getTime() === date.getTime());
            const booking = bookedDates.find(b => b.date.getTime() === date.getTime());

            days.push({
                date,
                isCurrentMonth: true,
                isToday,
                isSelected,
                isAvailable,
                bookings: booking?.count || 0,
            });
        }

        // Next month days
        const remainingDays = 42 - days.length; // 6 rows * 7 days
        for (let day = 1; day <= remainingDays; day++) {
            const date = new Date(year, month + 1, day);
            days.push({
                date,
                isCurrentMonth: false,
                isToday: false,
                isSelected: false,
                isAvailable: false,
                bookings: 0,
            });
        }

        return days;
    };

    const handlePreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleDatePress = (day: CalendarDay) => {
        if (!day.isCurrentMonth) return;
        setSelectedDate(day.date);
        onDateSelect?.(day.date);
    };

    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const calendarDays = getDaysInMonth(currentMonth);

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
                    <Ionicons name="chevron-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.monthText, { color: isDark ? colors.text.dark : colors.text.light }]}>{monthName}</Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                    <Ionicons name="chevron-forward" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
            </View>

            {/* Week days */}
            <View style={styles.weekDaysContainer}>
                {weekDays.map((day) => (
                    <View key={day} style={styles.weekDayCell}>
                        <Text style={[styles.weekDayText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{day}</Text>
                    </View>
                ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
                {calendarDays.map((day, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.dayCell,
                            day.isSelected && [styles.selectedDay, { backgroundColor: colors.primary[500] }],
                            day.isToday && !day.isSelected && [styles.todayDay, { borderColor: colors.primary[500] }],
                        ]}
                        onPress={() => handleDatePress(day)}
                        disabled={!day.isCurrentMonth}
                    >
                        <Text
                            style={[
                                styles.dayText,
                                { color: day.isCurrentMonth ? (isDark ? colors.text.dark : colors.text.light) : (isDark ? colors.neutral[600] : colors.neutral[300]) },
                                day.isSelected && { color: colors.neutral[50] },
                                !day.isCurrentMonth && styles.otherMonthText,
                            ]}
                        >
                            {day.date.getDate()}
                        </Text>

                        {day.bookings > 0 && (
                            <View style={[styles.bookingBadge, { backgroundColor: colors.warning[500] }]}>
                                <Text style={styles.bookingText}>{day.bookings}</Text>
                            </View>
                        )}

                        {day.isAvailable && day.bookings === 0 && (
                            <View style={[styles.availableDot, { backgroundColor: colors.success[500] }]} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.success[500] }]} />
                    <Text style={[styles.legendText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Available</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.warning[500] }]} />
                    <Text style={[styles.legendText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Booked</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.primary[500] }]} />
                    <Text style={[styles.legendText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Selected</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    navButton: {
        padding: spacing.xs,
    },
    monthText: {
        ...typography.h3,
        fontSize: 18,
        fontWeight: '700',
    },
    weekDaysContainer: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    weekDayCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.xs,
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '600',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xs,
        position: 'relative',
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
    },
    otherMonthText: {
        opacity: 0.3,
    },
    selectedDay: {
        borderRadius: borderRadius.full,
    },
    todayDay: {
        borderWidth: 2,
        borderRadius: borderRadius.full,
    },
    bookingBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookingText: {
        color: colors.neutral[50],
        fontSize: 10,
        fontWeight: '700',
    },
    availableDot: {
        position: 'absolute',
        bottom: 6,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
    },
});
