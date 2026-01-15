import React from 'react';
import { View, Text, StyleSheet, Image, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types/navigation';
import Button from '../../components/common/Button';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

type WelcomeScreenProps = {
    navigation: StackNavigationProp<AuthStackParamList, 'Welcome'>;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
    const { isDark } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Image
                            source={require('../../../assets/hero-right.png')}
                            style={styles.heroImage}
                            resizeMode="contain"
                        />
                        <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Find Your Perfect Rental Home in Kenya
                        </Text>
                        <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                            Connect with verified House Hunters to discover quality rental properties.
                        </Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button
                            onPress={() => navigation.navigate('Register')}
                            size="lg"
                            fullWidth
                            style={styles.primaryButton}
                        >
                            Start Your Search
                        </Button>
                        <Button
                            onPress={() => navigation.navigate('Login')}
                            variant="outline"
                            size="lg"
                            fullWidth
                        >
                            Sign In
                        </Button>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: spacing.xl,
        justifyContent: 'space-between',
    },
    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroImage: {
        width: width * 0.9,
        height: height * 0.35,
        marginBottom: spacing.xxl,
    },
    title: {
        ...typography.h1,
        fontSize: 32,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    subtitle: {
        ...typography.body,
        textAlign: 'center',
        paddingHorizontal: spacing.md,
    },
    buttonContainer: {
        gap: spacing.md,
        paddingBottom: spacing.lg,
    },
    primaryButton: {
        backgroundColor: colors.primary[600],
    },
});

export default WelcomeScreen;
