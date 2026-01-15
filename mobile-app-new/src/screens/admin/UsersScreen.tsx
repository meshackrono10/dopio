import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ScrollView,
    Modal,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { MOCK_USERS } from '../../services/mockData';

const UsersScreen = () => {
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<'all' | 'tenant' | 'hunter' | 'unverified'>('all');
    const [selectedUser, setSelectedUser] = useState<typeof MOCK_USERS[0] | null>(null);
    const [showModal, setShowModal] = useState(false);

    const filteredUsers = MOCK_USERS.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        if (selectedRole === 'unverified') {
            // Check if hunter and has pending verification
            const isHunter = user.role === 'hunter';
            const isPending = user.id === 'user-2' || user.id === 'user-3'; // Based on usersWithVerification logic
            return matchesSearch && isHunter && isPending;
        }

        const matchesRole = selectedRole === 'all' || user.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    // Add verification data to hunters
    const usersWithVerification = filteredUsers.map(user => {
        if (user.role === 'hunter') {
            return {
                ...user,
                verificationStatus: user.id === 'user-2' ? 'pending' : user.id === 'user-3' ? 'pending' : 'verified',
                idImage: user.id === 'user-2' ? 'https://images.unsplash.com/photo-1569144157591-c60f3f82f137?w=400' :
                    user.id === 'user-3' ? 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=400' : undefined,
                selfieImage: user.id === 'user-2' ? user.avatar : user.id === 'user-3' ? user.avatar : undefined,
                verificationDate: user.id === 'user-2' ? '2025-01-09' : user.id === 'user-3' ? '2025-01-08' : undefined,
            };
        }
        return user;
    });

    const handleUserPress = (user: typeof MOCK_USERS[0] & { verificationStatus?: string, idImage?: string, selfieImage?: string, verificationDate?: string }) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleVerifyUser = () => {
        if (selectedUser) {
            Alert.alert('Success', `${selectedUser.name} has been verified!`);
            setShowModal(false);
        }
    };

    const handleRejectVerification = () => {
        Alert.prompt('Reject Verification', 'Please provide a reason:', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reject',
                style: 'destructive',
                onPress: (reason: string | undefined) => {
                    Alert.alert('Rejected', `Verification rejected${reason ? ': ' + reason : ''}`);
                    setShowModal(false);
                }
            }
        ]);
    };

    const renderUserItem = ({ item }: { item: typeof MOCK_USERS[0] & { verificationStatus?: string } }) => (
        <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(item)}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                    <Text style={[styles.userName, { color: isDark ? colors.text.dark : colors.text.light }]}>{item.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {item.verificationStatus === 'pending' && (
                            <View style={[styles.verificationBadge, { backgroundColor: colors.warning + '20' }]}>
                                <Text style={[styles.verificationText, { color: colors.warning }]}>Pending Verification</Text>
                            </View>
                        )}
                        <View style={[styles.statusDot, { backgroundColor: item.status === 'active' ? colors.success : colors.error }]} />
                    </View>
                </View>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userRole}>{item.role.charAt(0).toUpperCase() + item.role.slice(1)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <SafeAreaView edges={['top']} style={styles.header}>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>Users</Text>

                <View style={[styles.searchBar, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                    <Ionicons name="search" size={20} color={colors.neutral[500]} />
                    <TextInput
                        style={[styles.searchInput, { color: isDark ? colors.text.dark : colors.text.light }]}
                        placeholder="Search by name or email"
                        placeholderTextColor={colors.neutral[400]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={[styles.tabBar, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
                        {(['all', 'tenant', 'hunter', 'unverified'] as const).map((role) => (
                            <TouchableOpacity
                                key={role}
                                style={[
                                    styles.tabItem,
                                    selectedRole === role && styles.activeTabItem
                                ]}
                                onPress={() => setSelectedRole(role)}
                            >
                                <Text style={[
                                    styles.tabText,
                                    selectedRole === role && styles.activeTabText
                                ]}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                    {role === 'unverified' && ` (${MOCK_USERS.filter(u => u.role === 'hunter' && (u.id === 'user-2' || u.id === 'user-3')).length})`}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </SafeAreaView>

            <FlatList
                data={usersWithVerification}
                renderItem={renderUserItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Ionicons name="close" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>User Details</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {selectedUser && (
                            <ScrollView style={styles.modalBody}>
                                <View style={styles.modalProfile}>
                                    <Image source={{ uri: selectedUser.avatar }} style={styles.modalAvatar} />
                                    <Text style={[styles.modalName, { color: isDark ? colors.text.dark : colors.text.light }]}>{selectedUser.name}</Text>
                                    <Text style={styles.modalEmail}>{selectedUser.email}</Text>
                                    <View style={[styles.modalStatusBadge, { backgroundColor: selectedUser.status === 'active' ? colors.success + '20' : colors.error + '20' }]}>
                                        <Text style={[styles.modalStatusText, { color: selectedUser.status === 'active' ? colors.success : colors.error }]}>
                                            {selectedUser.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.modalInfoSection}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Role</Text>
                                        <Text style={[styles.infoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                            {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Joined Date</Text>
                                        <Text style={[styles.infoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>{selectedUser.joinedDate}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>User ID</Text>
                                        <Text style={[styles.infoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>{selectedUser.id}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Dispute History</Text>
                                        <Text style={[styles.infoValue, { color: selectedUser.role === 'hunter' ? colors.warning : colors.primary[500] }]}>
                                            {selectedUser.role === 'hunter' ? '3 Issues' : '1 Issue'}
                                        </Text>
                                    </View>
                                </View>

                                {selectedUser.role === 'hunter' && (selectedUser as any).verificationStatus === 'pending' && (
                                    <>
                                        <View style={styles.verificationSection}>
                                            <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                                📋 Verification Documents
                                            </Text>
                                            <Text style={[styles.verificationDate, { color: colors.neutral[500] }]}>
                                                Submitted: {(selectedUser as any).verificationDate}
                                            </Text>
                                        </View>

                                        <View style={styles.documentsGrid}>
                                            <View style={styles.documentColumn}>
                                                <Text style={[styles.documentLabel, { color: colors.neutral[500] }]}>ID Document</Text>
                                                <Image
                                                    source={{ uri: (selectedUser as any).idImage }}
                                                    style={styles.documentImage}
                                                />
                                            </View>
                                            <View style={styles.documentColumn}>
                                                <Text style={[styles.documentLabel, { color: colors.neutral[500] }]}>Live Selfie</Text>
                                                <Image
                                                    source={{ uri: (selectedUser as any).selfieImage }}
                                                    style={styles.documentImage}
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.verificationActions}>
                                            <TouchableOpacity
                                                style={[styles.verificationButton, { backgroundColor: colors.error, opacity: 0.9 }]}
                                                onPress={handleRejectVerification}
                                            >
                                                <Ionicons name="close-circle" size={20} color="white" />
                                                <Text style={styles.verificationButtonText}>Reject</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.verificationButton, { backgroundColor: colors.success }]}
                                                onPress={handleVerifyUser}
                                            >
                                                <Ionicons name="checkmark-circle" size={20} color="white" />
                                                <Text style={styles.verificationButtonText}>Verify Hunter</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}

                                <View style={styles.modalActions}>
                                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary[500] }]}>
                                        <Text style={styles.actionButtonText}>Edit User</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.error }]}>
                                        <Text style={styles.actionButtonText}>
                                            {selectedUser.status === 'active' ? 'Suspend User' : 'Activate User'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    title: {
        ...typography.h1,
        fontSize: 32,
        marginBottom: spacing.lg,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        height: 48,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        ...typography.body,
    },
    tabBar: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
        marginHorizontal: -spacing.lg,
        marginBottom: spacing.lg,
    },
    tabBarContent: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        gap: spacing.md,
    },
    tabItem: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
    },
    activeTabItem: {
        backgroundColor: colors.primary[500],
    },
    tabText: {
        ...typography.bodySemiBold,
        fontSize: 14,
        color: colors.neutral[500],
    },
    activeTabText: {
        color: 'white',
    },
    list: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 100,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    userInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
    },
    userName: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    userEmail: {
        ...typography.caption,
        color: colors.neutral[500],
        marginBottom: 2,
    },
    userRole: {
        ...typography.caption,
        color: colors.neutral[400],
    },
    verificationBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    verificationText: {
        ...typography.caption,
        fontSize: 10,
        fontWeight: '700',
    },
    separator: {
        height: 1,
        backgroundColor: colors.neutral[100],
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        paddingTop: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    modalTitle: {
        ...typography.h3,
        fontSize: 18,
    },
    modalBody: {
        flex: 1,
    },
    modalProfile: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    modalAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: spacing.md,
    },
    modalName: {
        ...typography.h2,
        fontSize: 24,
        marginBottom: 4,
    },
    modalEmail: {
        ...typography.body,
        color: colors.neutral[500],
        marginBottom: spacing.md,
    },
    modalStatusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
    },
    modalStatusText: {
        ...typography.caption,
        fontWeight: '700',
    },
    modalInfoSection: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    infoLabel: {
        ...typography.body,
        color: colors.neutral[500],
    },
    infoValue: {
        ...typography.bodySemiBold,
    },
    modalActions: {
        padding: spacing.lg,
        gap: spacing.md,
        paddingBottom: 40,
    },
    actionButton: {
        height: 52,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        ...typography.bodySemiBold,
        color: 'white',
    },
    verificationSection: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    sectionTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.xs,
    },
    verificationDate: {
        ...typography.caption,
        marginBottom: spacing.md,
    },
    documentsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    documentColumn: {
        flex: 1,
    },
    documentLabel: {
        ...typography.caption,
        fontWeight: '700',
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    documentImage: {
        width: '100%',
        height: 180,
        borderRadius: borderRadius.md,
        backgroundColor: colors.neutral[100],
    },
    verificationActions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    verificationButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
    },
    verificationButtonText: {
        ...typography.bodySemiBold,
        color: 'white',
        fontSize: 14,
    },
});

export default UsersScreen;
