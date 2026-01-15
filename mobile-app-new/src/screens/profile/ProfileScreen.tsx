import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../types/navigation';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen = () => {
    const { isDark, toggleTheme } = useTheme();
    const { user, logout, switchRole } = useAuth();
    const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout },
            ]
        );
    };

    const QuickAccessButton = ({ icon, label, onPress, badge }: any) => (
        <TouchableOpacity
            style={[styles.quickAccessButton, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
            onPress={onPress}
        >
            <View style={styles.quickAccessContent}>
                <Ionicons name={icon} size={24} color={isDark ? colors.text.dark : colors.primary[500]} />
                <Text numberOfLines={1} style={[styles.quickAccessLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>{label}</Text>
                {badge !== undefined && badge > 0 && (
                    <View style={styles.quickAccessBadge}>
                        <Text style={styles.quickAccessBadgeText}>{badge}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const InfoCard = ({ icon, title, subtitle, onPress, rightIcon }: any) => (
        <TouchableOpacity
            style={[styles.infoCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
            onPress={onPress}
        >
            <View style={styles.infoCardLeft}>
                <Ionicons name={icon} size={24} color={colors.primary[400]} />
                <View style={styles.infoCardText}>
                    <Text style={[styles.infoCardTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>{title}</Text>
                    {subtitle && <Text style={styles.infoCardSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {rightIcon && <Ionicons name={rightIcon} size={20} color={colors.neutral[500]} />}
        </TouchableOpacity>
    );

    const MenuButton = ({ icon, label, onPress, showChevron = true }: any) => (
        <TouchableOpacity
            style={styles.menuButton}
            onPress={onPress}
        >
            <View style={styles.menuButtonLeft}>
                <Ionicons name={icon} size={22} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
                <Text style={[styles.menuButtonLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>{label}</Text>
            </View>
            {showChevron && <Ionicons name="chevron-forward" size={20} color={colors.neutral[600]} />}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <SafeAreaView edges={['top']}>
                    {/* Profile Header */}
                    <View style={styles.profileHeader}>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.userName, { color: isDark ? colors.text.dark : colors.text.light }]}>{user?.name || 'User'}</Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={16} color={colors.warning} />
                                <Text style={[styles.ratingText, { color: isDark ? colors.text.dark : colors.text.light }]}>4.8</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.avatar, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <Text style={[styles.avatarText, { color: isDark ? colors.text.dark : colors.text.light }]}>{user?.name?.charAt(0) || 'U'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Quick Access Grid */}
                    <View style={styles.quickAccessGrid}>
                        <QuickAccessButton
                            icon="help-circle-outline"
                            label="Help"
                            onPress={() => navigation.navigate('HelpCenter')}
                        />
                        <QuickAccessButton
                            icon="wallet-outline"
                            label="Wallet"
                            onPress={() => navigation.navigate('Wallet')}
                        />
                        <QuickAccessButton
                            icon="alert-circle-outline"
                            label="Disputes"
                            badge={1}
                            onPress={() => navigation.navigate('MyIssues', { initialTab: 'against_me' })}
                        />
                        <QuickAccessButton
                            icon="mail-outline"
                            label="Issues"
                            onPress={() => navigation.navigate('MyIssues' as any)}
                        />
                    </View>

                    {/* Role Switcher Card */}
                    <TouchableOpacity
                        style={[styles.promoCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                        onPress={() => {
                            const newRole = user?.role === 'tenant' ? 'hunter' : 'tenant';
                            switchRole(newRole);
                        }}
                    >
                        <View style={styles.promoContent}>
                            <Text style={[styles.promoTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {user?.role === 'tenant' ? 'Become a House Hunter' : 'Switch to Tenant'}
                            </Text>
                            <Text style={styles.promoSubtitle}>
                                {user?.role === 'tenant'
                                    ? 'Earn money by helping others find homes'
                                    : 'Find your next home with ease'}
                            </Text>
                        </View>
                        <Ionicons name="business" size={40} color={colors.primary[500]} />
                    </TouchableOpacity>

                    {/* Developer Mode Card */}
                    <View style={[styles.devCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <View style={styles.devHeader}>
                            <Ionicons name="code-slash" size={18} color={colors.primary[400]} />
                            <Text style={[styles.devTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Developer Mode</Text>
                        </View>
                        <Text style={styles.devSubtitle}>Current: {user?.role?.toUpperCase()}</Text>
                        <View style={styles.roleButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.roleButton,
                                    user?.role === 'tenant' && { backgroundColor: colors.primary[500] }
                                ]}
                                onPress={() => switchRole('tenant')}
                            >
                                <Ionicons
                                    name="person"
                                    size={16}
                                    color={user?.role === 'tenant' ? 'white' : (isDark ? colors.neutral[400] : colors.neutral[600])}
                                />
                                <Text style={[
                                    styles.roleButtonText,
                                    { color: user?.role === 'tenant' ? 'white' : (isDark ? colors.neutral[400] : colors.neutral[600]) }
                                ]}>Tenant</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.roleButton,
                                    user?.role === 'hunter' && { backgroundColor: colors.primary[500] }
                                ]}
                                onPress={() => switchRole('hunter')}
                            >
                                <Ionicons
                                    name="search"
                                    size={16}
                                    color={user?.role === 'hunter' ? 'white' : (isDark ? colors.neutral[400] : colors.neutral[600])}
                                />
                                <Text style={[
                                    styles.roleButtonText,
                                    { color: user?.role === 'hunter' ? 'white' : (isDark ? colors.neutral[400] : colors.neutral[600]) }
                                ]}>Hunter</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.roleButton,
                                    user?.role === 'admin' && { backgroundColor: colors.primary[500] }
                                ]}
                                onPress={() => switchRole('admin')}
                            >
                                <Ionicons
                                    name="shield-checkmark"
                                    size={16}
                                    color={user?.role === 'admin' ? 'white' : (isDark ? colors.neutral[400] : colors.neutral[600])}
                                />
                                <Text style={[
                                    styles.roleButtonText,
                                    { color: user?.role === 'admin' ? 'white' : (isDark ? colors.neutral[400] : colors.neutral[600]) }
                                ]}>Admin</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Menu Items */}
                    <View style={styles.menuSection}>
                        <MenuButton
                            icon="notifications-outline"
                            label="Notifications"
                            onPress={() => navigation.navigate('Notifications' as any)}
                        />
                        {user?.role === 'hunter' && (
                            <>
                                <MenuButton
                                    icon="bar-chart-outline"
                                    label="My Stats"
                                    onPress={() => navigation.navigate('Earnings' as any)}
                                />
                                <MenuButton
                                    icon="star-outline"
                                    label="My Reviews"
                                    onPress={() => navigation.navigate('Reviews' as any)}
                                />
                            </>
                        )}
                        <MenuButton
                            icon="shield-checkmark-outline"
                            label="How Dapio works"
                            onPress={() => navigation.navigate('HowItWorks' as any)}
                        />
                        <MenuButton
                            icon="people-outline"
                            label="Manage accounts"
                            onPress={() => Alert.alert('Coming Soon')}
                        />
                        <MenuButton
                            icon="settings-outline"
                            label="Settings"
                            onPress={() => Alert.alert('Settings', 'Feature coming soon')}
                        />
                        <MenuButton
                            icon="document-text-outline"
                            label="Privacy Policy"
                            onPress={() => navigation.navigate('PrivacyPolicy')}
                        />
                        <MenuButton
                            icon="document-lock-outline"
                            label="Terms of Service"
                            onPress={() => navigation.navigate('TermsOfService')}
                        />
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={[styles.logoutText, { color: isDark ? colors.text.dark : colors.text.light }]}>Log out</Text>
                    </TouchableOpacity>

                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </SafeAreaView>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.xl * 2,
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        ...typography.h2,
        fontSize: 24,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    ratingText: {
        ...typography.body,
        fontSize: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        ...typography.h2,
        fontSize: 24,
        fontWeight: '700',
    },
    quickAccessGrid: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    quickAccessButton: {
        flex: 1,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xs,
        ...shadows.sm,
    },
    quickAccessContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickAccessLabel: {
        ...typography.caption,
        fontWeight: '600',
        fontSize: 12,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    quickAccessBadge: {
        position: 'absolute',
        top: -8,
        right: 0,
        backgroundColor: colors.error,
        borderRadius: 10,
        paddingHorizontal: 4,
        paddingVertical: 2,
        minWidth: 18,
        alignItems: 'center',
    },
    quickAccessBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
    },
    promoCard: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
    },
    promoContent: {
        flex: 1,
    },
    promoTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.xs,
    },
    promoSubtitle: {
        ...typography.caption,
        color: colors.neutral[400],
        lineHeight: 18,
    },
    devCard: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.primary[500],
    },
    devHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    devTitle: {
        ...typography.bodySemiBold,
        fontSize: 15,
    },
    devSubtitle: {
        ...typography.caption,
        color: colors.neutral[400],
        marginBottom: spacing.md,
    },
    roleButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    roleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.neutral[600],
    },
    roleButtonText: {
        ...typography.bodySemiBold,
        fontSize: 12,
    },
    infoCard: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1,
    },
    infoCardText: {
        flex: 1,
    },
    infoCardTitle: {
        ...typography.bodySemiBold,
        fontSize: 15,
        marginBottom: spacing.xs / 2,
    },
    infoCardSubtitle: {
        ...typography.caption,
        color: colors.neutral[400],
        lineHeight: 16,
    },
    menuSection: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
    },
    menuButtonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    menuButtonLabel: {
        ...typography.body,
        fontSize: 16,
    },
    logoutButton: {
        marginHorizontal: spacing.lg,
        marginTop: spacing.xl,
        paddingVertical: spacing.md,
    },
    logoutText: {
        ...typography.bodySemiBold,
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    versionText: {
        ...typography.caption,
        textAlign: 'center',
        color: colors.neutral[600],
        marginTop: spacing.lg,
    },
});

export default ProfileScreen;
