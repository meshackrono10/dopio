import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface TimeframeTrackerProps {
    startDate: string;
    estimatedDays: number;
    status: 'active' | 'completed' | 'expired';
}

export default function TimeframeTracker({ startDate, estimatedDays, status }: TimeframeTrackerProps) {
    const { isDark } = useTheme();
    const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0 });

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const start = new Date(startDate);
            const deadline = new Date(start.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
            const now = new Date();
            const diff = deadline.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0 });
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeRemaining({ days, hours, minutes });
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [startDate, estimatedDays]);

    const progress = status === 'completed' ? 100 :
        status === 'expired' ? 100 :
            Math.max(0, Math.min(100, ((estimatedDays * 24 * 60 - (timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes)) / (estimatedDays * 24 * 60)) * 100));

    const getStatusColor = () => {
        if (status === 'completed') return colors.success[500];
        if (status === 'expired') return colors.error[500];
        if (timeRemaining.days <= 1) return colors.warning[500];
        return colors.primary[500];
    };

    const getStatusIcon = () => {
        if (status === 'completed') return 'checkmark-circle';
        if (status === 'expired') return 'close-circle';
        return 'time';
    };

    const getStatusText = () => {
        if (status === 'completed') return 'Completed';
        if (status === 'expired') return 'Expired';
        if (timeRemaining.days === 0 && timeRemaining.hours === 0) return 'Less than 1 hour remaining';
        if (timeRemaining.days === 0) return `${timeRemaining.hours}h ${timeRemaining.minutes}m remaining`;
        return `${timeRemaining.days}d ${timeRemaining.hours}h remaining`;
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: `${getStatusColor()}15` }]}>
                    <Ionicons name={getStatusIcon()} size={24} color={getStatusColor()} />
                </View>
                <View style={styles.info}>
                    <Text style={[styles.label, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        Search Timeframe
                    </Text>
                    <Text style={[styles.value, { color: getStatusColor() }]}>
                        {getStatusText()}
                    </Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressContainer, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100] }]}>
                <View
                    style={[
                        styles.progressBar,
                        {
                            width: `${progress}%`,
                            backgroundColor: getStatusColor(),
                        },
                    ]}
                />
            </View>

            {/* Timeline Info */}
            <View style={styles.timeline}>
                <View style={styles.timelineItem}>
                    <Text style={[styles.timelineLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        Started
                    </Text>
                    <Text style={[styles.timelineValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        {new Date(startDate).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                    </Text>
                </View>

                <View style={styles.timelineItem}>
                    <Text style={[styles.timelineLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        Estimated Duration
                    </Text>
                    <Text style={[styles.timelineValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        {estimatedDays} {estimatedDays === 1 ? 'day' : 'days'}
                    </Text>
                </View>

                <View style={styles.timelineItem}>
                    <Text style={[styles.timelineLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        Deadline
                    </Text>
                    <Text style={[styles.timelineValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        {new Date(new Date(startDate).getTime() + estimatedDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    info: {
        flex: 1,
    },
    label: {
        fontSize: 13,
        marginBottom: 2,
    },
    value: {
        fontSize: 16,
        fontWeight: '700',
    },
    progressContainer: {
        height: 8,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    progressBar: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    timeline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timelineItem: {
        flex: 1,
        alignItems: 'center',
    },
    timelineLabel: {
        fontSize: 12,
        marginBottom: 4,
        textAlign: 'center',
    },
    timelineValue: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});
