import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types/navigation';
import Button from '../../components/common/Button';
import TextInput from '../../components/common/TextInput';
import { colors, spacing, typography } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { validation } from '../../utils/validation';

type LoginScreenProps = {
    navigation: StackNavigationProp<AuthStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const { isDark } = useTheme();
    const { login } = useAuth();
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateForm = (): boolean => {
        let isValid = true;

        // Validate email
        const emailErr = validation.validateEmail(email);
        setEmailError(emailErr || '');
        if (emailErr) isValid = false;

        // Validate password
        const passwordErr = validation.validateRequired(password, 'Password');
        setPasswordError(passwordErr || '');
        if (passwordErr) isValid = false;

        return isValid;
    };

    const handleLogin = async () => {
        // Clear previous errors
        setEmailError('');
        setPasswordError('');

        // Validate form
        if (!validateForm()) {
            toast.error('Please fix the errors before continuing');
            return;
        }

        setLoading(true);
        try {
            const success = await login(email, password);

            if (success) {
                toast.success('Welcome back!');
            } else {
                toast.error('Invalid email or password');
            }
        } catch (error: any) {
            toast.error(error.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Welcome Back
                        </Text>
                        <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                            Sign in to continue
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <TextInput
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setEmailError('');
                            }}
                            error={emailError}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon="mail-outline"
                            editable={!loading}
                        />

                        <TextInput
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setPasswordError('');
                            }}
                            error={passwordError}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            editable={!loading}
                        />

                        <Button
                            onPress={handleLogin}
                            loading={loading}
                            disabled={loading}
                            size="lg"
                            fullWidth
                            style={styles.button}
                        >
                            Sign In
                        </Button>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                                Don't have an account?{' '}
                            </Text>
                            <Text
                                style={[styles.link, { color: colors.primary[600] }]}
                                onPress={() => navigation.navigate('Register')}
                            >
                                Sign Up
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.xl,
        paddingTop: spacing.lg,
    },
    header: {
        marginBottom: spacing.xxl,
    },
    title: {
        ...typography.h1,
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
    },
    form: {
        flex: 1,
    },
    button: {
        marginTop: spacing.lg,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.xl,
    },
    footerText: {
        ...typography.body,
    },
    link: {
        ...typography.body,
        fontWeight: '600',
    },
});

export default LoginScreen;
