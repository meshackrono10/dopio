import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const SectionOurFeatures = () => {
    const { isDark } = useTheme();

    const features = [
        {
            badge: 'Advertising',
            badgeColor: colors.primary[100],
            badgeTextColor: colors.primary[700],
            title: 'Cost-effective advertising',
            description: 'With a free listing, you can advertise your rental with no upfront costs',
        },
        {
            badge: 'Exposure',
            badgeColor: '#DCFCE7',
            badgeTextColor: '#15803D',
            title: 'Reach thousands of tenants',
            description: 'Thousands of people are searching for quality rental homes in Kenya every day',
        },
        {
            badge: 'Secure',
            badgeColor: '#FEE2E2',
            badgeTextColor: '#B91C1C',
            title: 'Secure and simple',
            description: 'Dapio gives you a secure and easy way to take bookings and payments online via M-Pesa',
        },
    ];

    return (
        <View style={styles.container}>
            <Image
                source={require('../../../assets/our-features.png')}
                style={styles.image}
                resizeMode="contain"
            />
            <View style={styles.content}>
                <Text style={styles.label}>BENEFITS</Text>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Why Choose Dapio?
                </Text>

                <View style={styles.featuresList}>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <View style={[styles.badge, { backgroundColor: feature.badgeColor }]}>
                                <Text style={[styles.badgeText, { color: feature.badgeTextColor }]}>
                                    {feature.badge}
                                </Text>
                            </View>
                            <Text style={[styles.featureTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {feature.title}
                            </Text>
                            <Text style={[styles.featureDescription, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                                {feature.description}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.xl,
    },
    image: {
        width: width,
        height: width * 0.7,
        marginBottom: spacing.xl,
    },
    content: {
        paddingHorizontal: spacing.md,
    },
    label: {
        ...typography.caption,
        fontWeight: '700',
        color: colors.neutral[400],
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    title: {
        ...typography.h2,
        fontSize: 32,
        marginTop: spacing.sm,
        marginBottom: spacing.xl,
    },
    featuresList: {
        gap: spacing.xl,
    },
    featureItem: {
        gap: spacing.sm,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    badgeText: {
        ...typography.caption,
        fontWeight: '700',
    },
    featureTitle: {
        ...typography.h4,
        fontWeight: '600',
    },
    featureDescription: {
        ...typography.bodySmall,
        lineHeight: 20,
    },
});

export default SectionOurFeatures;
