import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../common/Button';

const { width } = Dimensions.get('window');

const SectionBecomeAnAuthor = () => {
    const { isDark } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Become a Verified Hunter
                </Text>
                <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    Join our network of professional house hunters. Help tenants find their dream homes and earn commissions for every successful viewing.
                </Text>
                <Button
                    onPress={() => { }}
                    size="lg"
                    style={styles.button}
                >
                    Get Started
                </Button>
            </View>
            <Image
                source={require('../../../assets/BecomeAnAuthorImg.png')}
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
        marginBottom: spacing.md,
    },
    subtitle: {
        ...typography.body,
        lineHeight: 26,
        marginBottom: spacing.xl,
    },
    button: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.xl,
    },
    image: {
        width: width,
        height: width * 0.7,
    },
});

export default SectionBecomeAnAuthor;
