import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const EditProfileScreen = () => {
    const { isDark } = useTheme();
    const { user, updateProfile } = useAuth();
    const navigation = useNavigation();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile({ name, email });
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangeAvatar = () => {
        Alert.alert('Change Photo', 'Photo picker will be available soon.');
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <SafeAreaView edges={['top']} style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Edit Profile
                    </Text>
                    <TouchableOpacity onPress={handleSave}>
                        <Text style={[styles.saveButton, { color: colors.primary[500] }]}>Save</Text>
                    </TouchableOpacity>
                </SafeAreaView>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <Image
                            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400' }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity onPress={handleChangeAvatar} style={styles.changePhotoButton}>
                            <Ionicons name="camera" size={20} color={colors.primary[500]} />
                            <Text style={[styles.changePhotoText, { color: colors.primary[500] }]}>Change Photo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Full Name</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: isDark ? colors.neutral[800] : 'white',
                                        color: isDark ? colors.text.dark : colors.text.light,
                                        borderColor: colors.neutral[200]
                                    }
                                ]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                                placeholderTextColor={colors.neutral[400]}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Email</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: isDark ? colors.neutral[800] : 'white',
                                        color: isDark ? colors.text.dark : colors.text.light,
                                        borderColor: colors.neutral[200]
                                    }
                                ]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor={colors.neutral[400]}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Phone Number</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: isDark ? colors.neutral[800] : 'white',
                                        color: isDark ? colors.text.dark : colors.text.light,
                                        borderColor: colors.neutral[200]
                                    }
                                ]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="+254 712 345 678"
                                placeholderTextColor={colors.neutral[400]}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>Bio</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.textArea,
                                    {
                                        backgroundColor: isDark ? colors.neutral[800] : 'white',
                                        color: isDark ? colors.text.dark : colors.text.light,
                                        borderColor: colors.neutral[200]
                                    }
                                ]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about yourself"
                                placeholderTextColor={colors.neutral[400]}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
    },
    saveButton: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    content: {
        paddingBottom: spacing.xxl,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: spacing.md,
    },
    changePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    changePhotoText: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    formSection: {
        paddingHorizontal: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.bodySemiBold,
        fontSize: 14,
        marginBottom: spacing.sm,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        ...typography.body,
    },
    textArea: {
        height: 120,
        paddingTop: spacing.md,
    },
});

export default EditProfileScreen;
