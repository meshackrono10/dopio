import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface AutoReleaseTimerProps {
    evidenceSubmittedAt: string;
    autoReleaseDays: number;
    onAutoRelease?: () => void;
}

export default function AutoReleaseTimer({ evidenceSubmittedAt, autoReleaseDays, onAutoRelease }: AutoReleaseTimerProps) {
    const { isDark } = useTheme();
    const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const submitted = new Date(evidenceSubmittedAt);
            const releaseDate = new Date(submitted.getTime() + autoReleaseDays * 24 * 60 * 60 * 1000);
            const now = new Date();
            const diff = releaseDate.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                if (!isExpired) {
                    setIsExpired(true);
                    onAutoRelease?.();
                }
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining({ days, hours, minutes, seconds });
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [evidenceSubmittedAt, autoReleaseDays, isExpired, onAutoRelease]);

    const totalMinutes = autoReleaseDays * 24 * 60;
    const remainingMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes;
    const progress = Math.max(0, Math.min(100, ((totalMinutes - remainingMinutes) / totalMinutes) * 100));

    const getTimerColor = () => {
        if (isExpired) return colors.success[500];
        if (timeRemaining.days === 0 && timeRemaining.hours < 6) return colors.error[500];
        if (timeRemaining.days === 0) return colors.warning[500];
        return colors.info[500];
    };

    if (isExpired) {
        return (
            <View style={[styles.container, { backgroundColor: colors.success[50], borderColor: colors.success[300] }]}>
                <View style={[styles.iconContainer, { backgroundColor: colors.success[100] }]}>
                    <Ionicons name="checkmark-circle" size={32} color={colors.success[600]} />
                </View>
                <View style={styles.content}>
                    <Text style={[styles.title, { color: colors.success[900] }]}>
                        Payment Released
                    </Text>
                    <Text style={[styles.message, { color: colors.success[700] }]}>
                        Payment has been automatically released to the hunter
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[800] : 'white', borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: `${getTimerColor()}15` }]}>
                    <Ionicons name="time" size={24} color={getTimerColor()} />
                </View>
                <View style={styles.info}>
                    <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Auto-Release Timer
                    </Text>
                    <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        Payment will be released if no action taken
                    </Text>
                </View>
            </View>

            {/* Countdown Display */}
            <View style={styles.countdown}>
                <View style={styles.timeBox}>
                    <Text style={[styles.timeValue, { color: getTimerColor() }]}>
                        {String(timeRemaining.days).padStart(2, '0')}
                    </Text>
                    <Text style={[styles.timeLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        Days
                    </Text>
                </View>

                <Text style={[styles.timeSeparator, { color: getTimerColor() }]}>:</Text>

                <View style={styles.timeBox}>
                    <Text style={[styles.timeValue, { color: getTimerColor() }]}>
                        {String(timeRemaining.hours).padStart(2, '0')}
                    </Text>
                    <Text style={[styles.timeLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        Hours
                    </Text>
                </View>

                <Text style={[styles.timeSeparator, { color: getTimerColor() }]}>:</Text>

                <View style={styles.timeBox}>
                    <Text style={[styles.timeValue, { color: getTimerColor() }]}>
                        {String(timeRemaining.minutes).padStart(2, '0')}
                    </Text>
                    <Text style={[styles.timeLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        Mins
                    </Text>
                </View>

                <Text style={[styles.timeSeparator, { color: getTimerColor() }]}>:</Text>

                <View style={styles.timeBox}>
                    <Text style={[styles.timeValue, { color: getTimerColor() }]}>
                        {String(timeRemaining.seconds).padStart(2, '0')}
                    </Text>
                    <Text style={[styles.timeLabel, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                        Secs
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
                            backgroundColor: getTimerColor(),
                        },
                    ]}
                />
            </View>

            {/* Warning Message */}
            {timeRemaining.days === 0 && timeRemaining.hours < 24 && (
                <View style={[styles.warningBox, { backgroundColor: colors.warning[50] }]}>
                    <Ionicons name="warning" size={18} color={colors.warning[600]} />
                    <Text style={[styles.warningText, { color: colors.warning[700] }]}>
                        {timeRemaining.hours < 6
                            ? 'Urgent: Payment will be released soon!'
                            : 'Review and approve or reject evidence before auto-release'}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
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
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
    },
    content: {
        flex: 1,
    },
    countdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    timeBox: {
        alignItems: 'center',
    },
    timeValue: {
        ...typography.h1,
        fontSize: 28,
        fontWeight: '700',
    },
    timeLabel: {
        fontSize: 11,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    timeSeparator: {
        ...typography.h1,
        fontSize: 28,
        fontWeight: '700',
        marginHorizontal: spacing.xs,
    },
    progressContainer: {
        height: 6,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    progressBar: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    warningBox: {
        flexDirection: 'row',
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
        alignItems: 'center',
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
    },
});
