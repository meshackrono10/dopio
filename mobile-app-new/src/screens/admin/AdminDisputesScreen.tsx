import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/common/Button';

type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed';
type DisputeType = 'payment' | 'booking' | 'property' | 'behavior' | 'other';

interface Dispute {
    id: string;
    type: DisputeType;
    status: DisputeStatus;
    title: string;
    description: string;
    reportedBy: string;
    reportedByAvatar: string;
    reportedAgainst: string;
    reportedAgainstAvatar: string;
    createdDate: string;
    priority: 'low' | 'medium' | 'high';
    attachments: { id: string, uri: string, type: 'image' | 'video' }[];
    responseStatus: 'pending' | 'accepted' | 'denied';
    responseNote?: string;
    counterEvidence: { id: string, uri: string, type: 'image' | 'video' }[];
}

const AdminDisputesScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const [filter, setFilter] = useState<'all' | DisputeStatus>('all');
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [resolutionNote, setResolutionNote] = useState('');
    const [newStatus, setNewStatus] = useState<DisputeStatus>('resolved');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showUserModal, setShowUserModal] = useState(false);

    // Mock disputes data
    const allDisputes: Dispute[] = [
        {
            id: '1',
            type: 'payment',
            status: 'open',
            title: 'Payment not received for completed viewing',
            description: 'Completed a viewing but payment is still pending after 5 days',
            reportedBy: 'John Kamau (Hunter)',
            reportedByAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            reportedAgainst: 'Sarah Wanjiku (Tenant)',
            reportedAgainstAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
            createdDate: '2025-01-05',
            priority: 'high',
            attachments: [
                { id: 'a1', uri: 'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=400', type: 'image' },
                { id: 'a2', uri: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=400', type: 'image' }
            ],
            responseStatus: 'pending',
            responseNote: undefined,
            counterEvidence: [],
        },
        {
            id: '2',
            type: 'booking',
            status: 'under_review',
            title: 'No-show for scheduled viewing',
            description: 'Hunter did not show up for the scheduled viewing without prior notice',
            reportedBy: 'Michael Otieno (Tenant)',
            reportedByAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
            reportedAgainst: 'Mary Njeri (Hunter)',
            reportedAgainstAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
            createdDate: '2025-01-04',
            priority: 'medium',
            attachments: [
                { id: 'a3', uri: 'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=400', type: 'image' }
            ],
            responseStatus: 'denied',
            responseNote: 'I was at the location but the tenant did not pick up my calls. I have evidence.',
            counterEvidence: [
                { id: 'ca1', uri: 'https://images.unsplash.com/photo-1560185031-2ee9b237ddc2?w=400', type: 'image' },
                { id: 'ca2', uri: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400', type: 'image' }
            ],
        },
        {
            id: '3',
            type: 'property',
            status: 'resolved',
            title: 'Property misrepresentation',
            description: 'Property shown did not match the listing description',
            reportedBy: 'Grace Muthoni (Tenant)',
            reportedByAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
            reportedAgainst: 'Peter Ochieng (Hunter)',
            reportedAgainstAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            createdDate: '2024-12-28',
            priority: 'high',
            attachments: [
                { id: 'a4', uri: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=400', type: 'image' },
                { id: 'a5', uri: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', type: 'video' }
            ],
            responseStatus: 'accepted',
            responseNote: 'I sincerely apologize for the property mismatch. The owner made last-minute changes that I failed to update in the listing. This was my mistake.',
            counterEvidence: [],
        },
    ];

    const [disputesList, setDisputesList] = useState<Dispute[]>(allDisputes);

    const disputes = filter === 'all'
        ? disputesList
        : disputesList.filter(d => d.status === filter);

    const handleResolve = () => {
        if (!selectedDispute || !resolutionNote.trim()) {
            Alert.alert('Required', 'Please provide a resolution note');
            return;
        }

        setDisputesList(prev => prev.map(d =>
            d.id === selectedDispute.id
                ? { ...d, status: newStatus }
                : d
        ));

        setShowResolveModal(false);
        setSelectedDispute(null);
        setResolutionNote('');
        Alert.alert('Success', 'Dispute has been updated.');
    };

    const handleUserPress = (userName: string, userAvatar: string, role: 'tenant' | 'hunter') => {
        // Create user object with mock data
        const user = {
            name: userName.split(' (')[0], // Remove role from name
            avatar: userAvatar,
            role,
            email: `${userName.split(' ')[0].toLowerCase()}@dapio.com`,
            phone: role === 'hunter' ? '+254 712 345 678' : '+254 798 765 432',
            id: `${role.toUpperCase()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            status: 'active',
            joinedDate: '2024-01-15',
            idNumber: role === 'hunter' ? '12345678' : undefined,
            rating: role === 'hunter' ? 4.8 : undefined,
            completedViewings: role === 'hunter' ? 47 : undefined,
            propertiesListed: role === 'hunter' ? 23 : undefined,
        };
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const getStatusColor = (status: DisputeStatus) => {
        switch (status) {
            case 'open': return colors.error;
            case 'under_review': return colors.warning;
            case 'resolved': return colors.success;
            case 'closed': return colors.neutral[500];
        }
    };

    const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
        switch (priority) {
            case 'low': return colors.neutral[500];
            case 'medium': return colors.warning;
            case 'high': return colors.error;
        }
    };

    const getTypeIcon = (type: DisputeType) => {
        switch (type) {
            case 'payment': return 'cash-outline';
            case 'booking': return 'calendar-outline';
            case 'property': return 'home-outline';
            case 'behavior': return 'people-outline';
            case 'other': return 'help-circle-outline';
        }
    };

    const filterButtons = [
        { id: 'all', label: 'All', count: allDisputes.length },
        { id: 'open', label: 'Open', count: allDisputes.filter(d => d.status === 'open').length },
        { id: 'under_review', label: 'Under Review', count: allDisputes.filter(d => d.status === 'under_review').length },
        { id: 'resolved', label: 'Resolved', count: allDisputes.filter(d => d.status === 'resolved').length },
    ];

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Disputes Management
                </Text>
            </SafeAreaView>

            {/* Filter Tabs */}
            <View style={[styles.tabBar, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
                    {filterButtons.map(btn => (
                        <TouchableOpacity
                            key={btn.id}
                            style={[
                                styles.tabItem,
                                filter === btn.id && styles.activeTabItem
                            ]}
                            onPress={() => setFilter(btn.id as any)}
                        >
                            <Text style={[
                                styles.tabText,
                                filter === btn.id && styles.activeTabText
                            ]}>
                                {btn.label}
                                {btn.count > 0 && ` (${btn.count})`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {disputes.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkmark-done-circle-outline" size={64} color={colors.neutral[300]} />
                        <Text style={[styles.emptyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            No Disputes
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {filter === 'all' ? 'No disputes to review' : `No ${filter.replace('_', ' ')} disputes`}
                        </Text>
                    </View>
                ) : (
                    disputes.map(dispute => (
                        <View
                            key={dispute.id}
                            style={[styles.disputeCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                        >
                            <View style={styles.disputeHeader}>
                                <View style={styles.typeContainer}>
                                    <View style={styles.typeIcon}>
                                        <Ionicons name={getTypeIcon(dispute.type) as any} size={20} color={colors.primary[500]} />
                                    </View>
                                    <Text style={[styles.typeLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        {dispute.type.toUpperCase()}
                                    </Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(dispute.status) + '20' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(dispute.status) }]}>
                                        {dispute.status.replace('_', ' ').toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <Text style={[styles.disputeTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {dispute.title}
                            </Text>

                            <Text style={styles.disputeDescription}>
                                {dispute.description}
                            </Text>

                            <View style={[styles.priorityRow, { backgroundColor: getPriorityColor(dispute.priority) + '10' }]}>
                                <Ionicons name="alert-circle" size={16} color={getPriorityColor(dispute.priority)} />
                                <Text style={[styles.priorityLabelText, { color: getPriorityColor(dispute.priority) }]}>
                                    {dispute.priority.toUpperCase()} PRIORITY
                                </Text>
                            </View>

                            <View style={[styles.partiesContainer, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50] }]}>
                                <TouchableOpacity
                                    style={styles.party}
                                    onPress={() => handleUserPress(dispute.reportedBy, dispute.reportedByAvatar, dispute.reportedBy.includes('Hunter') ? 'hunter' : 'tenant')}
                                    activeOpacity={0.7}
                                >
                                    <Image source={{ uri: dispute.reportedByAvatar }} style={styles.partyAvatar} />
                                    <View style={styles.partyInfo}>
                                        <Text style={styles.partyRole}>REPORTED BY</Text>
                                        <Text style={[styles.partyName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                            {dispute.reportedBy}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={colors.neutral[400]} />
                                </TouchableOpacity>
                                <View style={styles.vsContainer}>
                                    <View style={styles.vsLine} />
                                    <Text style={styles.vsText}>VS</Text>
                                    <View style={styles.vsLine} />
                                </View>
                                <TouchableOpacity
                                    style={styles.party}
                                    onPress={() => handleUserPress(dispute.reportedAgainst, dispute.reportedAgainstAvatar, dispute.reportedAgainst.includes('Hunter') ? 'hunter' : 'tenant')}
                                    activeOpacity={0.7}
                                >
                                    <Image source={{ uri: dispute.reportedAgainstAvatar }} style={styles.partyAvatar} />
                                    <View style={styles.partyInfo}>
                                        <Text style={styles.partyRole}>REPORTED AGAINST</Text>
                                        <Text style={[styles.partyName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                            {dispute.reportedAgainst}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={colors.neutral[400]} />
                                </TouchableOpacity>
                            </View>

                            {/* Evidence Section */}
                            {dispute.attachments.length > 0 && (
                                <View style={styles.evidenceSection}>
                                    <Text style={styles.evidenceSectionTitle}>EVIDENCE ({dispute.attachments.length})</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evidenceScroll}>
                                        {dispute.attachments.map(attachment => (
                                            <View key={attachment.id} style={styles.evidenceItem}>
                                                <Image source={{ uri: attachment.uri }} style={styles.evidenceImage} />
                                                {attachment.type === 'video' && (
                                                    <View style={styles.videoOverlay}>
                                                        <Ionicons name="play-circle" size={32} color="white" />
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {/* Response Section */}
                            {(dispute.responseNote || dispute.counterEvidence.length > 0) && (
                                <View style={[styles.responseContainer, {
                                    backgroundColor: isDark ? colors.neutral[700] : colors.primary[50],
                                    borderColor: isDark ? colors.neutral[600] : colors.primary[100]
                                }]}>
                                    <View style={styles.responseHeader}>
                                        <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary[500]} />
                                        <Text style={[styles.responseSectionTitle, { color: colors.primary[600] }]}>
                                            Defendant Response
                                        </Text>
                                        <View style={[styles.responseStatusBadge, {
                                            backgroundColor: dispute.responseStatus === 'pending' ? colors.warning + '20' :
                                                dispute.responseStatus === 'accepted' ? colors.success + '20' :
                                                    colors.error + '20'
                                        }]}>
                                            <Text style={[styles.responseStatusText, {
                                                color: dispute.responseStatus === 'pending' ? colors.warning :
                                                    dispute.responseStatus === 'accepted' ? colors.success :
                                                        colors.error
                                            }]}>
                                                {dispute.responseStatus.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    {dispute.responseNote && (
                                        <Text style={[styles.responseNote, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                                            "{dispute.responseNote}"
                                        </Text>
                                    )}

                                    {dispute.counterEvidence.length > 0 && (
                                        <View style={styles.counterEvidenceSection}>
                                            <Text style={[styles.evidenceSectionTitle, { color: colors.primary[600] }]}>
                                                Counter Evidence ({dispute.counterEvidence.length})
                                            </Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evidenceScroll}>
                                                {dispute.counterEvidence.map(item => (
                                                    <View key={item.id} style={styles.evidenceItem}>
                                                        <Image source={{ uri: item.uri }} style={styles.evidenceImage} />
                                                        {item.type === 'video' && (
                                                            <View style={styles.videoOverlay}>
                                                                <Ionicons name="play-circle" size={32} color="white" />
                                                            </View>
                                                        )}
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>
                            )}

                            <View style={styles.disputeFooter}>
                                <View style={styles.dateInfo}>
                                    <Ionicons name="calendar-outline" size={14} color={colors.neutral[500]} />
                                    <Text style={styles.dateText}>{dispute.createdDate}</Text>
                                </View>
                                {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                                    <TouchableOpacity
                                        style={[styles.resolveButton, { backgroundColor: colors.primary[500] }]}
                                        onPress={() => {
                                            setSelectedDispute(dispute);
                                            setNewStatus(dispute.status);
                                            setShowResolveModal(true);
                                        }}
                                    >
                                        <Text style={styles.resolveButtonText}>Manage Dispute</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Resolution Modal */}
            <Modal
                visible={showResolveModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowResolveModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Resolve Dispute
                            </Text>
                            <TouchableOpacity onPress={() => setShowResolveModal(false)}>
                                <Ionicons name="close" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            Update the status and provide a resolution note.
                        </Text>

                        <Text style={styles.inputLabel}>Update Status</Text>
                        <View style={styles.statusSelector}>
                            {(['open', 'under_review', 'resolved', 'closed'] as DisputeStatus[]).map(status => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.statusOption,
                                        newStatus === status && { backgroundColor: getStatusColor(status) + '20', borderColor: getStatusColor(status) }
                                    ]}
                                    onPress={() => setNewStatus(status)}
                                >
                                    <Text style={[
                                        styles.statusOptionText,
                                        { color: newStatus === status ? getStatusColor(status) : colors.neutral[500] }
                                    ]}>
                                        {status.replace('_', ' ').toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Resolution Note</Text>
                        <TextInput
                            style={[
                                styles.resolutionInput,
                                {
                                    backgroundColor: isDark ? colors.neutral[700] : colors.neutral[50],
                                    color: isDark ? colors.text.dark : colors.text.light,
                                    borderColor: isDark ? colors.neutral[600] : colors.neutral[200]
                                }
                            ]}
                            placeholder="Describe the resolution or next steps..."
                            placeholderTextColor={colors.neutral[400]}
                            multiline
                            numberOfLines={4}
                            value={resolutionNote}
                            onChangeText={setResolutionNote}
                            textAlignVertical="top"
                        />

                        <View style={styles.modalActions}>
                            <Button
                                variant="outline"
                                style={styles.modalButton}
                                onPress={() => setShowResolveModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                style={[styles.modalButton, { backgroundColor: colors.primary[500] }]}
                                onPress={handleResolve}
                            >
                                Update Dispute
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* User Detail Modal */}
            <Modal
                visible={showUserModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowUserModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.userModalContent, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <View style={styles.userModalHeader}>
                            <TouchableOpacity onPress={() => setShowUserModal(false)}>
                                <Ionicons name="close" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>User Details</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {selectedUser && (
                            <ScrollView style={styles.userModalBody}>
                                <View style={styles.userModalProfile}>
                                    <Image source={{ uri: selectedUser.avatar }} style={styles.userModalAvatar} />
                                    <Text style={[styles.userModalName, { color: isDark ? colors.text.dark : colors.text.light }]}>{selectedUser.name}</Text>
                                    <Text style={styles.userModalEmail}>{selectedUser.email}</Text>
                                    <View style={[styles.userModalRoleBadge, {
                                        backgroundColor: selectedUser.role === 'hunter' ? colors.primary[500] + '20' : colors.success + '20'
                                    }]}>
                                        <Text style={[styles.userModalRoleText, {
                                            color: selectedUser.role === 'hunter' ? colors.primary[600] : colors.success
                                        }]}>
                                            {selectedUser.role.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.userModalInfoSection}>
                                    <View style={styles.userInfoRow}>
                                        <Text style={styles.userInfoLabel}>Phone Number</Text>
                                        <Text style={[styles.userInfoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                            {selectedUser.phone}
                                        </Text>
                                    </View>
                                    <View style={styles.userInfoRow}>
                                        <Text style={styles.userInfoLabel}>User ID</Text>
                                        <Text style={[styles.userInfoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                            {selectedUser.id}
                                        </Text>
                                    </View>
                                    {selectedUser.idNumber && (
                                        <View style={styles.userInfoRow}>
                                            <Text style={styles.userInfoLabel}>ID Number</Text>
                                            <Text style={[styles.userInfoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                                {selectedUser.idNumber}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.userInfoRow}>
                                        <Text style={styles.userInfoLabel}>Joined Date</Text>
                                        <Text style={[styles.userInfoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                            {selectedUser.joinedDate}
                                        </Text>
                                    </View>
                                    <View style={styles.userInfoRow}>
                                        <Text style={styles.userInfoLabel}>Account Status</Text>
                                        <Text style={[styles.userInfoValue, { color: colors.success }]}>
                                            {selectedUser.status.toUpperCase()}
                                        </Text>
                                    </View>

                                    {selectedUser.role === 'hunter' && (
                                        <>
                                            <View style={styles.userInfoRow}>
                                                <Text style={styles.userInfoLabel}>Rating</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Ionicons name="star" size={16} color={colors.warning} />
                                                    <Text style={[styles.userInfoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                                        {selectedUser.rating}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.userInfoRow}>
                                                <Text style={styles.userInfoLabel}>Completed Viewings</Text>
                                                <Text style={[styles.userInfoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                                    {selectedUser.completedViewings}
                                                </Text>
                                            </View>
                                            <View style={styles.userInfoRow}>
                                                <Text style={styles.userInfoLabel}>Properties Listed</Text>
                                                <Text style={[styles.userInfoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                                    {selectedUser.propertiesListed}
                                                </Text>
                                            </View>
                                        </>
                                    )}
                                </View>

                                <View style={styles.userModalActions}>
                                    <TouchableOpacity style={[styles.userActionButton, { backgroundColor: colors.primary[500] }]}>
                                        <Ionicons name="mail-outline" size={18} color="white" />
                                        <Text style={styles.userActionButtonText}>Send Message</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.userActionButton, { backgroundColor: colors.error, opacity: 0.9 }]}>
                                        <Ionicons name="ban-outline" size={18} color="white" />
                                        <Text style={styles.userActionButtonText}>Suspend Account</Text>
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
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
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
    disputeCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    disputeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    typeIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeLabel: {
        ...typography.caption,
        fontWeight: '700',
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        ...typography.caption,
        fontSize: 10,
        fontWeight: '800',
    },
    priorityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        alignSelf: 'flex-start',
        marginBottom: spacing.md,
    },
    priorityLabelText: {
        ...typography.caption,
        fontSize: 10,
        fontWeight: '800',
    },
    disputeTitle: {
        ...typography.bodySemiBold,
        fontSize: 17,
        marginBottom: spacing.xs,
    },
    disputeDescription: {
        ...typography.body,
        color: colors.neutral[600],
        fontSize: 14,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    partiesContainer: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.neutral[50],
        marginBottom: spacing.md,
    },
    party: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    partyAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    partyInfo: {
        flex: 1,
    },
    partyRole: {
        ...typography.caption,
        color: colors.neutral[500],
        fontSize: 9,
        fontWeight: '700',
    },
    partyName: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    vsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginVertical: spacing.xs,
    },
    vsLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.neutral[200],
    },
    vsText: {
        ...typography.caption,
        color: colors.neutral[400],
        fontWeight: '700',
    },
    disputeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
        paddingTop: spacing.md,
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        ...typography.caption,
        color: colors.neutral[500],
        fontSize: 12,
    },
    resolveButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
    },
    resolveButtonText: {
        ...typography.bodySemiBold,
        color: 'white',
        fontSize: 13,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    modalContent: {
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        ...shadows.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    modalTitle: {
        ...typography.h3,
        fontSize: 20,
    },
    modalSubtitle: {
        ...typography.body,
        color: colors.neutral[500],
        fontSize: 14,
        marginBottom: spacing.lg,
    },
    resolutionInput: {
        borderWidth: 1,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        height: 120,
        ...typography.body,
        marginBottom: spacing.xl,
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    modalButton: {
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
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
    inputLabel: {
        ...typography.bodySemiBold,
        fontSize: 14,
        marginBottom: spacing.sm,
    },
    statusSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    statusOption: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    statusOptionText: {
        ...typography.caption,
        fontWeight: '700',
        fontSize: 10,
    },
    evidenceSection: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    evidenceSectionTitle: {
        ...typography.caption,
        fontWeight: '800',
        color: colors.neutral[500],
        marginBottom: spacing.sm,
        fontSize: 11,
    },
    evidenceScroll: {
        flexDirection: 'row',
    },
    evidenceItem: {
        width: 120,
        height: 120,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        marginRight: spacing.sm,
        position: 'relative',
    },
    evidenceImage: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    responseContainer: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
    },
    responseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    responseSectionTitle: {
        ...typography.bodySemiBold,
        fontSize: 13,
        flex: 1,
    },
    responseStatusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    responseStatusText: {
        ...typography.caption,
        fontSize: 10,
        fontWeight: '800',
    },
    responseNote: {
        ...typography.body,
        fontSize: 13,
        fontStyle: 'italic',
        marginBottom: spacing.sm,
        lineHeight: 18,
    },
    counterEvidenceSection: {
        marginTop: spacing.md,
    },
    userModalContent: {
        height: '90%',
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        paddingTop: spacing.lg,
    },
    userModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    userModalBody: {
        flex: 1,
    },
    userModalProfile: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    userModalAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: spacing.md,
    },
    userModalName: {
        ...typography.h2,
        fontSize: 24,
        marginBottom: 4,
    },
    userModalEmail: {
        ...typography.body,
        color: colors.neutral[500],
        marginBottom: spacing.md,
    },
    userModalRoleBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
    },
    userModalRoleText: {
        ...typography.caption,
        fontWeight: '700',
    },
    userModalInfoSection: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
    },
    userInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    userInfoLabel: {
        ...typography.body,
        color: colors.neutral[500],
    },
    userInfoValue: {
        ...typography.bodySemiBold,
    },
    userModalActions: {
        padding: spacing.lg,
        gap: spacing.md,
        paddingBottom: 40,
    },
    userActionButton: {
        height: 52,
        borderRadius: borderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    userActionButtonText: {
        ...typography.bodySemiBold,
        color: 'white',
    },
});

export default AdminDisputesScreen;
