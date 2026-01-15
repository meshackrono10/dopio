import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types/navigation';
import Button from '../../components/common/Button';
import TextInput from '../../components/common/TextInput';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { validation } from '../../utils/validation';

type RegisterScreenProps = {
    navigation: StackNavigationProp<AuthStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
    const { isDark } = useTheme();
    const { signup, signupWithGoogle } = useAuth();
    const toast = useToast();

    // Form State
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole>('tenant');

    // Error State
    const [nameError, setNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const passwordStrength = validation.getPasswordStrength(password);
    const passwordStrengthLabel = validation.getPasswordStrengthLabel(password);

    const getPasswordStrengthColor = () => {
        if (passwordStrength === 0) return colors.neutral[300];
        if (passwordStrength <= 1) return colors.error;
        if (passwordStrength === 2) return colors.warning;
        if (passwordStrength === 3) return colors.info;
        return colors.success;
    };

    const validateForm = (): boolean => {
        let isValid = true;

        // Validate name
        const nameErr = validation.validateRequired(name, 'Full name');
        setNameError(nameErr || '');
        if (nameErr) isValid = false;

        // Validate phone (MANDATORY)
        const phoneErr = validation.validatePhone(phoneNumber);
        setPhoneError(phoneErr || '');
        if (phoneErr) isValid = false;

        // Email is optional now
        if (email.trim()) {
            const emailErr = validation.validateEmail(email);
            setEmailError(emailErr || '');
            if (emailErr) isValid = false;
        }

        // Validate password
        const passwordErr = validation.validatePassword(password);
        setPasswordError(passwordErr || '');
        if (passwordErr) isValid = false;

        // Validate password confirmation
        const confirmErr = validation.validatePasswordMatch(password, confirmPassword);
        setConfirmPasswordError(confirmErr || '');
        if (confirmErr) isValid = false;

        return isValid;
    };

    const handleRegister = async () => {
        // Clear previous errors
        setNameError('');
        setPhoneError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        // Validate form
        if (!validateForm()) {
            toast.error('Please fix the errors before continuing');
            return;
        }

        setLoading(true);
        try {
            const success = await signup({
                email: email.trim() || undefined,
                phoneNumber,
                password,
                name,
                role,
            });

            if (success) {
                toast.success('Account created successfully!');
                if (role === 'hunter') {
                    Alert.alert(
                        'Verification Required',
                        'As a House Hunter, you need to verify your identity before you can list properties. Please complete your profile.',
                        [{ text: 'OK' }]
                    );
                }
            } else {
                toast.error('Registration failed. Please try again.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        // Mock Google Sign-In flow
        // In real app, this would open Google OAuth
        Alert.prompt(
            'Google Sign-In (Mock)',
            'For testing, enter your phone number to continue:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Continue',
                    onPress: async (phone: string | undefined) => {
                        if (!phone || !validation.validatePhone(phone)) {
                            toast.error('Please enter a valid phone number');
                            return;
                        }
                        setLoading(true);
                        try {
                            const success = await signupWithGoogle(
                                'mock-google-token-' + Date.now(),
                                phone,
                                'Google User',
                                role
                            );
                            if (success) {
                                toast.success('Signed in with Google!');
                            }
                        } catch (error) {
                            toast.error('Google sign-in failed');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ],
            'plain-text',
            '',
            'phone-pad'
        );
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
                            Create Account
                        </Text>
                        <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                            Join House Haunters today
                        </Text>
                    </View>

                    {/* Role Selection */}
                    <View style={styles.roleSection}>
                        <Text style={[styles.roleLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            I am...
                        </Text>
                        <View style={styles.roleOptions}>
                            <TouchableOpacity
                                style={[
                                    styles.roleOption,
                                    { borderColor: role === 'tenant' ? colors.primary[500] : colors.neutral[300] },
                                    role === 'tenant' && { backgroundColor: colors.primary[50] }
                                ]}
                                onPress={() => setRole('tenant')}
                            >
                                <Ionicons
                                    name="search"
                                    size={28}
                                    color={role === 'tenant' ? colors.primary[500] : colors.neutral[500]}
                                />
                                <Text style={[
                                    styles.roleTitle,
                                    { color: role === 'tenant' ? colors.primary[500] : (isDark ? colors.text.dark : colors.text.light) }
                                ]}>
                                    Looking for a House
                                </Text>
                                <Text style={styles.roleDesc}>
                                    I want to find and rent a property
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.roleOption,
                                    { borderColor: role === 'hunter' ? colors.primary[500] : colors.neutral[300] },
                                    role === 'hunter' && { backgroundColor: colors.primary[50] }
                                ]}
                                onPress={() => setRole('hunter')}
                            >
                                <Ionicons
                                    name="briefcase"
                                    size={28}
                                    color={role === 'hunter' ? colors.primary[500] : colors.neutral[500]}
                                />
                                <Text style={[
                                    styles.roleTitle,
                                    { color: role === 'hunter' ? colors.primary[500] : (isDark ? colors.text.dark : colors.text.light) }
                                ]}>
                                    House Hunter
                                </Text>
                                <Text style={styles.roleDesc}>
                                    I want to list properties and earn
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {role === 'hunter' && (
                            <View style={[styles.hunterNote, { backgroundColor: colors.warning + '15' }]}>
                                <Ionicons name="information-circle" size={18} color={colors.warning} />
                                <Text style={[styles.hunterNoteText, { color: colors.warning }]}>
                                    Hunters must verify their ID before listing properties
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Google Sign-In */}
                    <TouchableOpacity
                        style={[styles.googleButton, { borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                        onPress={handleGoogleSignIn}
                        disabled={loading}
                    >
                        <Image
                            source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                            style={styles.googleIcon}
                        />
                        <Text style={[styles.googleText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Continue with Google
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={[styles.dividerLine, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[300] }]} />
                        <Text style={[styles.dividerText, { color: colors.neutral[500] }]}>or</Text>
                        <View style={[styles.dividerLine, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[300] }]} />
                    </View>

                    <View style={styles.form}>
                        <TextInput
                            label="Full Name"
                            placeholder={role === 'hunter' ? 'As shown on your ID' : 'Enter your name'}
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                setNameError('');
                            }}
                            error={nameError}
                            leftIcon="person-outline"
                            editable={!loading}
                        />

                        <TextInput
                            label="Phone Number *"
                            placeholder="e.g. 0712345678"
                            value={phoneNumber}
                            onChangeText={(text) => {
                                setPhoneNumber(text);
                                setPhoneError('');
                            }}
                            error={phoneError}
                            keyboardType="phone-pad"
                            leftIcon="call-outline"
                            editable={!loading}
                        />

                        <TextInput
                            label="Email (Optional)"
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

                        {password.length > 0 && (
                            <View style={styles.passwordStrength}>
                                <View style={styles.strengthBars}>
                                    {[...Array(4)].map((_, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.strengthBar,
                                                {
                                                    backgroundColor:
                                                        index < passwordStrength
                                                            ? getPasswordStrengthColor()
                                                            : colors.neutral[200],
                                                },
                                            ]}
                                        />
                                    ))}
                                </View>
                                <Text
                                    style={[
                                        styles.strengthLabel,
                                        { color: getPasswordStrengthColor() },
                                    ]}
                                >
                                    {passwordStrengthLabel}
                                </Text>
                            </View>
                        )}

                        <TextInput
                            label="Confirm Password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                setConfirmPasswordError('');
                            }}
                            error={confirmPasswordError}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            editable={!loading}
                        />

                        <Button
                            onPress={handleRegister}
                            loading={loading}
                            disabled={loading}
                            size="lg"
                            fullWidth
                            style={styles.button}
                        >
                            Create Account
                        </Button>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                                Already have an account?{' '}
                            </Text>
                            <Text
                                style={[styles.link, { color: colors.primary[600] }]}
                                onPress={() => navigation.navigate('Login')}
                            >
                                Sign In
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
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h1,
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
    },
    roleSection: {
        marginBottom: spacing.lg,
    },
    roleLabel: {
        ...typography.bodySemiBold,
        marginBottom: spacing.md,
    },
    roleOptions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    roleOption: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        alignItems: 'center',
        gap: spacing.xs,
    },
    roleTitle: {
        ...typography.bodySemiBold,
        fontSize: 14,
        textAlign: 'center',
    },
    roleDesc: {
        ...typography.caption,
        color: colors.neutral[500],
        textAlign: 'center',
        fontSize: 11,
    },
    hunterNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.md,
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    hunterNoteText: {
        ...typography.caption,
        flex: 1,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        gap: spacing.md,
    },
    googleIcon: {
        width: 20,
        height: 20,
    },
    googleText: {
        ...typography.bodySemiBold,
        fontSize: 15,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        ...typography.caption,
        marginHorizontal: spacing.md,
    },
    form: {
        flex: 1,
    },
    passwordStrength: {
        marginTop: -spacing.sm,
        marginBottom: spacing.md,
    },
    strengthBars: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    strengthLabel: {
        ...typography.caption,
        fontSize: 11,
        fontWeight: '600',
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

export default RegisterScreen;
