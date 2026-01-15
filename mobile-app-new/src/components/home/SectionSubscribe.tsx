import React from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SectionSubscribe = () => {
    const { isDark } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Join our newsletter 🎉
                </Text>
                <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    Get the latest property listings and rental tips delivered to your inbox.
                </Text>

                <View style={styles.benefits}>
                    <View style={styles.benefitItem}>
                        <View style={[styles.badge, { backgroundColor: colors.primary[100] }]}>
                            <Text style={[styles.badgeText, { color: colors.primary[700] }]}>01</Text>
                        </View>
                        <Text style={[styles.benefitText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                            Get exclusive rental deals
                        </Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <View style={[styles.badge, { backgroundColor: '#FEE2E2' }]}>
                            <Text style={[styles.badgeText, { color: '#B91C1C' }]}>02</Text>
                        </View>
                        <Text style={[styles.benefitText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                            Early access to new listings
                        </Text>
                    </View>
                </View>

                <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                    <TextInput
                        placeholder="Enter your email"
                        placeholderTextColor={colors.neutral[400]}
                        style={[styles.input, { color: isDark ? colors.text.dark : colors.text.light }]}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity style={styles.button}>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
            <Image
                source={require('../../../assets/SVG-subcribe2.png')}
                style={styles.image}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.xl,
    },
    content: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h2,
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        marginBottom: spacing.xl,
    },
    benefits: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    badge: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        ...typography.caption,
        fontWeight: '700',
    },
    benefitText: {
        ...typography.bodySmall,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.full,
        paddingLeft: spacing.md,
        paddingRight: 4,
        height: 56,
    },
    input: {
        flex: 1,
        ...typography.body,
    },
    button: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary[600],
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: width,
        height: width * 0.6,
    },
});

export default SectionSubscribe;
