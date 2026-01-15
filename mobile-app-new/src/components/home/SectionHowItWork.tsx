import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import SectionHeading from './SectionHeading';

const { width } = Dimensions.get('window');

const SectionHowItWork = () => {
    const { isDark } = useTheme();

    const steps = [
        {
            id: 1,
            image: require('../../../assets/HIW1.png'),
            title: 'Browse Properties',
            description: 'Search verified rental properties across Nairobi with transparent KES pricing',
        },
        {
            id: 2,
            image: require('../../../assets/HIW2.png'),
            title: 'Schedule Viewings',
            description: 'Book property viewings with verified house hunters at your convenience',
        },
        {
            id: 3,
            image: require('../../../assets/HIW3.png'),
            title: 'Secure Your Home',
            description: 'Pay securely via M-Pesa and move into your perfect Nairobi rental home',
        },
    ];

    return (
        <View style={styles.container}>
            <SectionHeading
                title="How House Hunters Works"
                subtitle="Finding your perfect rental home made simple"
                isCenter
            />
            <View style={styles.stepsContainer}>
                {steps.map((step, index) => (
                    <View key={step.id} style={styles.stepItem}>
                        <Image source={step.image} style={styles.image} resizeMode="contain" />
                        <View style={styles.stepContent}>
                            <Text style={[styles.stepTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {step.title}
                            </Text>
                            <Text style={[styles.stepDescription, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                                {step.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.xl,
    },
    stepsContainer: {
        paddingHorizontal: spacing.md,
        gap: spacing.xxl,
        marginTop: spacing.lg,
    },
    stepItem: {
        alignItems: 'center',
    },
    image: {
        width: 180,
        height: 180,
        marginBottom: spacing.lg,
    },
    stepContent: {
        alignItems: 'center',
    },
    stepTitle: {
        ...typography.h3,
        marginBottom: spacing.sm,
    },
    stepDescription: {
        ...typography.bodySmall,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default SectionHowItWork;
