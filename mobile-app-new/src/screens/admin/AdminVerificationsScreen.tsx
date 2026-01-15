import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/common/Button';

const AdminVerificationsScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<'id-verifications' | 'hunters' | 'properties'>('id-verifications');

    // ID Verification requests (ID + Selfie)
    const [idVerifications, setIdVerifications] = useState([
        {
            id: 'v1',
            hunterName: 'John Kamau',
            hunterEmail: 'john.kamau@example.com',
            hunterPhone: '+254 712 345 678',
            hunterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            idImage: 'https://images.unsplash.com/photo-1569144157591-c60f3f82f137?w=400',
            selfieImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            submittedDate: '2025-01-09',
            status: 'pending'
        },
        {
            id: 'v2',
            hunterName: 'Mary Njeri',
            hunterEmail: 'mary.njeri@example.com',
            hunterPhone: '+254 798 765 432',
            hunterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
            idImage: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=400',
            selfieImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
            submittedDate: '2025-01-08',
            status: 'pending'
        },
    ]);

    const [hunters, setHunters] = useState([
        { id: 'h1', name: 'Peter Ochieng', type: 'Background Check', date: '2024-01-07', status: 'pending', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
    ]);

    const [properties, setProperties] = useState([
        { id: 'p1', title: 'Modern Apt in Westlands', type: 'Ownership Proof', date: '2024-01-08', status: 'pending', image: 'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=400' },
        { id: 'p2', title: 'Studio in Kasarani', type: 'Physical Inspection', date: '2024-01-06', status: 'pending', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400' },
    ]);

    const handleApproveIdVerification = (id: string) => {
        Alert.alert('Approve Verification', 'Are you sure this hunter\'s identity is verified?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Approve',
                style: 'default',
                onPress: () => {
                    setIdVerifications(prev => prev.filter(v => v.id !== id));
                    Alert.alert('Success', 'Hunter verified successfully!');
                }
            }
        ]);
    };

    const handleRejectIdVerification = (id: string) => {
        Alert.prompt('Reject Verification', 'Please provide a reason for rejection:', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reject',
                style: 'destructive',
                onPress: (reason: string | undefined) => {
                    setIdVerifications(prev => prev.filter(v => v.id !== id));
                    Alert.alert('Rejected', `Verification rejected${reason ? ': ' + reason : ''}`);
                }
            }
        ]);
    };

    const handleApprove = (id: string, type: 'hunter' | 'property') => {
        Alert.alert('Approve', 'Are you sure you want to approve this verification?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Approve',
                onPress: () => {
                    if (type === 'hunter') {
                        setHunters(prev => prev.filter(h => h.id !== id));
                    } else {
                        setProperties(prev => prev.filter(p => p.id !== id));
                    }
                    Alert.alert('Success', 'Verification approved!');
                }
            }
        ]);
    };

    const handleReject = (id: string, type: 'hunter' | 'property') => {
        Alert.prompt('Reject', 'Reason for rejection:', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reject',
                onPress: (reason: string | undefined) => {
                    if (type === 'hunter') {
                        setHunters(prev => prev.filter(h => h.id !== id));
                    } else {
                        setProperties(prev => prev.filter(p => p.id !== id));
                    }
                    Alert.alert('Success', 'Verification rejected.');
                }
            }
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Verifications
                </Text>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            <View style={[styles.tabBar, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'id-verifications' && styles.activeTabItem]}
                        onPress={() => setActiveTab('id-verifications')}
                    >
                        <Text style={[styles.tabText, activeTab === 'id-verifications' && styles.activeTabText]}>ID Verifications ({idVerifications.length})</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'hunters' && styles.activeTabItem]}
                        onPress={() => setActiveTab('hunters')}
                    >
                        <Text style={[styles.tabText, activeTab === 'hunters' && styles.activeTabText]}>Hunters ({hunters.length})</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabItem, activeTab === 'properties' && styles.activeTabItem]}
                        onPress={() => setActiveTab('properties')}
                    >
                        <Text style={[styles.tabText, activeTab === 'properties' && styles.activeTabText]}>Properties ({properties.length})</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {activeTab === 'id-verifications' ? (
                    idVerifications.map(verification => (
                        <View key={verification.id} style={[styles.idCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <View style={styles.idCardHeader}>
                                <Image source={{ uri: verification.hunterAvatar }} style={styles.avatar} />
                                <View style={styles.cardInfo}>
                                    <Text style={[styles.cardTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>{verification.hunterName}</Text>
                                    <Text style={styles.cardSubtitle}>{verification.hunterEmail}</Text>
                                    <Text style={styles.cardSubtitle}>{verification.hunterPhone}</Text>
                                    <Text style={[styles.dateText, { color: colors.neutral[400] }]}>Submitted: {verification.submittedDate}</Text>
                                </View>
                            </View>

                            <View style={styles.documentsGrid}>
                                <View style={styles.documentItem}>
                                    <Text style={[styles.documentLabel, { color: colors.neutral[500] }]}>ID Document</Text>
                                    <Image source={{ uri: verification.idImage }} style={styles.documentImage} />
                                </View>
                                <View style={styles.documentItem}>
                                    <Text style={[styles.documentLabel, { color: colors.neutral[500] }]}>Selfie</Text>
                                    <Image source={{ uri: verification.selfieImage }} style={styles.documentImage} />
                                </View>
                            </View>

                            <View style={styles.cardActions}>
                                <Button
                                    variant="outline"
                                    style={[styles.actionButton, { borderColor: colors.error }]}
                                    onPress={() => handleRejectIdVerification(verification.id)}
                                >
                                    <Text style={{ color: colors.error }}>Reject</Text>
                                </Button>
                                <Button
                                    style={[styles.actionButton, { backgroundColor: colors.success }]}
                                    onPress={() => handleApproveIdVerification(verification.id)}
                                >
                                    Verify Hunter
                                </Button>
                            </View>
                        </View>
                    ))
                ) : activeTab === 'hunters' ? (
                    hunters.map(hunter => (
                        <View key={hunter.id} style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <View style={styles.cardHeader}>
                                <Image source={{ uri: hunter.image }} style={styles.avatar} />
                                <View style={styles.cardInfo}>
                                    <Text style={[styles.cardTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>{hunter.name}</Text>
                                    <Text style={styles.cardSubtitle}>{hunter.type} • {hunter.date}</Text>
                                </View>
                                <TouchableOpacity style={styles.viewButton}>
                                    <Ionicons name="eye-outline" size={20} color={colors.primary[500]} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.cardActions}>
                                <Button
                                    variant="outline"
                                    style={styles.actionButton}
                                    onPress={() => handleReject(hunter.id, 'hunter')}
                                >
                                    Reject
                                </Button>
                                <Button
                                    style={[styles.actionButton, { backgroundColor: colors.success }]}
                                    onPress={() => handleApprove(hunter.id, 'hunter')}
                                >
                                    Approve
                                </Button>
                            </View>
                        </View>
                    ))
                ) : (
                    properties.map(prop => (
                        <View key={prop.id} style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <View style={styles.cardHeader}>
                                <Image source={{ uri: prop.image }} style={styles.propImage} />
                                <View style={styles.cardInfo}>
                                    <Text style={[styles.cardTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>{prop.title}</Text>
                                    <Text style={styles.cardSubtitle}>{prop.type} • {prop.date}</Text>
                                </View>
                                <TouchableOpacity style={styles.viewButton}>
                                    <Ionicons name="eye-outline" size={20} color={colors.primary[500]} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.cardActions}>
                                <Button
                                    variant="outline"
                                    style={styles.actionButton}
                                    onPress={() => handleReject(prop.id, 'property')}
                                >
                                    Reject
                                </Button>
                                <Button
                                    style={[styles.actionButton, { backgroundColor: colors.success }]}
                                    onPress={() => handleApprove(prop.id, 'property')}
                                >
                                    Approve
                                </Button>
                            </View>
                        </View>
                    ))
                )}

                {(activeTab === 'id-verifications' ? idVerifications.length : activeTab === 'hunters' ? hunters.length : properties.length) === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkmark-done-circle-outline" size={64} color={colors.neutral[300]} />
                        <Text style={[styles.emptyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>All Caught Up!</Text>
                        <Text style={styles.emptySubtext}>No pending verification requests at the moment.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
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
    tabBar: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
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
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    card: {
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    propImage: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.sm,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        ...typography.bodySemiBold,
        fontSize: 15,
    },
    cardSubtitle: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    viewButton: {
        padding: spacing.xs,
    },
    cardActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    actionButton: {
        flex: 1,
        height: 40,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxxl,
    },
    emptyTitle: {
        ...typography.h3,
        marginTop: spacing.md,
    },
    emptySubtext: {
        ...typography.body,
        color: colors.neutral[500],
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    idCard: {
        marginBottom: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.md,
    },
    idCardHeader: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    dateText: {
        ...typography.caption,
        fontSize: 11,
        marginTop: 2,
    },
    documentsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    documentItem: {
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
        height: 200,
        borderRadius: borderRadius.md,
        backgroundColor: colors.neutral[100],
    },
});

export default AdminVerificationsScreen;
