import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../common/Button';

const { width } = Dimensions.get('window');

const SectionHero = () => {
    const { isDark } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Find Your Perfect Rental Home in Kenya
                </Text>
                <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    Connect with verified House Hunters to discover quality rental properties.
                    Transparent pricing, guaranteed viewings, and secure payments.
                </Text>
                <Button
                    onPress={() => { }}
                    size="lg"
                    style={styles.button}
                >
                    Start Your Search
                </Button>
            </View>
            <Image
                source={require('../../../assets/hero-right.png')}
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
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h1,
        fontSize: 36,
        lineHeight: 44,
        marginBottom: spacing.md,
    },
    subtitle: {
        ...typography.body,
        fontSize: 18,
        lineHeight: 28,
        marginBottom: spacing.xl,
    },
    button: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.xl,
    },
    image: {
        width: width,
        height: width * 0.8,
    },
});

export default SectionHero;
