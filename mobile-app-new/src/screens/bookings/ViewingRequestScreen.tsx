import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput as RNTextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useInvoices } from '../../contexts/InvoiceContext';
import { ViewingRequest } from '../../data/types';

type FilterType = 'all' | 'pending' | 'countered' | 'accepted';

const ViewingRequestScreen = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation();
    const {
        viewingRequests,
        acceptRequest,
        counterRequest,
        rejectRequest,
        createInvoice
    } = useInvoices();

    const [filter, setFilter] = useState<FilterType>('all');
    const [selectedRequest, setSelectedRequest] = useState<ViewingRequest | null>(null);
    const [counterModalVisible, setCounterModalVisible] = useState(false);
    const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
    const [counterDate, setCounterDate] = useState('');
    const [counterTime, setCounterTime] = useState<'morning' | 'afternoon' | 'evening'>('morning');
    const [counterMessage, setCounterMessage] = useState('');
    const [viewingFee, setViewingFee] = useState('500');
    const [loading, setLoading] = useState(false);

    // Get requests for current hunter
    const myRequests = viewingRequests.filter(vr =>
        vr.hunterId === user?.id &&
        (filter === 'all' || vr.status === filter)
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return colors.warning;
            case 'countered': return colors.info;
            case 'accepted': return colors.success;
            case 'rejected': return colors.error;
            case 'invoiced': return colors.primary[500];
            case 'paid': return colors.success;
            default: return colors.neutral[500];
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Awaiting Response';
            case 'countered': return 'Counter Sent';
            case 'accepted': return 'Accepted - Create Invoice';
            case 'rejected': return 'Declined';
            case 'invoiced': return 'Invoice Sent';
            case 'paid': return 'Paid';
            default: return status;
        }
    };

    const formatTimeSlot = (slot: 'morning' | 'afternoon' | 'evening') => {
        switch (slot) {
            case 'morning': return '9 AM - 12 PM';
            case 'afternoon': return '12 PM - 5 PM';
            case 'evening': return '5 PM - 8 PM';
        }
    };

    const handleAccept = (request: ViewingRequest) => {
        if (request.proposedDates.length === 0) return;

        // Accept first proposed date (in real app, let hunter choose)
        const agreed = request.proposedDates[0];
        const timeStr = agreed.timeSlot === 'morning' ? '10:00 AM' :
            agreed.timeSlot === 'afternoon' ? '2:00 PM' : '6:00 PM';

        acceptRequest(request.id, agreed.date, timeStr);
        setSelectedRequest({ ...request, status: 'accepted', agreedDate: agreed.date, agreedTime: timeStr });
        setInvoiceModalVisible(true);
    };

    const handleCounter = () => {
        if (!selectedRequest || !counterDate) {
            Alert.alert('Error', 'Please enter a date');
            return;
        }

        counterRequest(selectedRequest.id, counterDate, counterTime, counterMessage);
        setCounterModalVisible(false);
        setCounterDate('');
        setCounterMessage('');
        Alert.alert('Counter Sent', 'Your counter proposal has been sent to the tenant.');
    };

    const handleReject = (request: ViewingRequest) => {
        Alert.alert(
            'Decline Request?',
            'Are you sure you want to decline this viewing request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Decline',
                    style: 'destructive',
                    onPress: () => rejectRequest(request.id),
                },
            ]
        );
    };

    const handleCreateInvoice = () => {
        if (!selectedRequest) return;

        setLoading(true);
        try {
            const fee = parseInt(viewingFee) || 500;
            createInvoice(
                selectedRequest.id,
                fee,
                {
                    address: 'Exact address revealed after payment',
                    lat: -1.2189,
                    lng: 36.8885,
                    directions: 'Directions will be shown after payment',
                }
            );
            setInvoiceModalVisible(false);
            Alert.alert('Invoice Created', 'The invoice has been sent to the tenant for payment.');
        } catch (error) {
            Alert.alert('Error', 'Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    const renderRequest = ({ item }: { item: ViewingRequest }) => (
        <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
            <View style={styles.cardHeader}>
                <Text style={[styles.propertyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    {item.propertyTitle}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {getStatusLabel(item.status)}
                    </Text>
                </View>
            </View>

            <View style={styles.tenantInfo}>
                <Ionicons name="person" size={16} color={colors.neutral[500]} />
                <Text style={styles.tenantName}>{item.tenantName}</Text>
                <Text style={styles.tenantPhone}>{item.tenantPhone}</Text>
            </View>

            <View style={styles.datesSection}>
                <Text style={styles.datesLabel}>Proposed Dates:</Text>
                {item.proposedDates.map((pd, idx) => (
                    <View key={idx} style={styles.dateOption}>
                        <Ionicons name="calendar" size={14} color={colors.primary[500]} />
                        <Text style={styles.dateText}>{pd.date}</Text>
                        <Text style={styles.timeSlot}>{formatTimeSlot(pd.timeSlot)}</Text>
                    </View>
                ))}
            </View>

            {item.message && (
                <View style={styles.messageBox}>
                    <Text style={styles.messageLabel}>Message:</Text>
                    <Text style={styles.messageText}>"{item.message}"</Text>
                </View>
            )}

            {item.status === 'pending' && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.success }]}
                        onPress={() => handleAccept(item)}
                    >
                        <Ionicons name="checkmark" size={18} color="white" />
                        <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.info }]}
                        onPress={() => {
                            setSelectedRequest(item);
                            setCounterModalVisible(true);
                        }}
                    >
                        <Ionicons name="swap-horizontal" size={18} color="white" />
                        <Text style={styles.actionButtonText}>Counter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.error }]}
                        onPress={() => handleReject(item)}
                    >
                        <Ionicons name="close" size={18} color="white" />
                        <Text style={styles.actionButtonText}>Decline</Text>
                    </TouchableOpacity>
                </View>
            )}

            {item.status === 'accepted' && (
                <TouchableOpacity
                    style={[styles.primaryActionButton, { backgroundColor: colors.primary[500] }]}
                    onPress={() => {
                        setSelectedRequest(item);
                        setInvoiceModalVisible(true);
                    }}
                >
                    <Ionicons name="receipt" size={18} color="white" />
                    <Text style={styles.primaryActionText}>Create Invoice</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Viewing Requests
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Filter Tabs */}
            <View style={styles.filters}>
                {(['all', 'pending', 'countered', 'accepted'] as FilterType[]).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[
                            styles.filterTab,
                            filter === f && { backgroundColor: colors.primary[500] },
                        ]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[
                            styles.filterText,
                            { color: filter === f ? 'white' : colors.neutral[500] },
                        ]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Request List */}
            <FlatList
                data={myRequests}
                keyExtractor={(item) => item.id}
                renderItem={renderRequest}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="file-tray-outline" size={64} color={colors.neutral[300]} />
                        <Text style={styles.emptyText}>No viewing requests</Text>
                    </View>
                }
            />

            {/* Counter Modal */}
            <Modal visible={counterModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modal, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.modalTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Counter Proposal
                        </Text>

                        <Text style={styles.inputLabel}>Proposed Date (YYYY-MM-DD)</Text>
                        <RNTextInput
                            style={[styles.input, { color: isDark ? colors.text.dark : colors.text.light }]}
                            placeholder="2026-01-20"
                            placeholderTextColor={colors.neutral[400]}
                            value={counterDate}
                            onChangeText={setCounterDate}
                        />

                        <Text style={styles.inputLabel}>Time Slot</Text>
                        <View style={styles.timeSlots}>
                            {(['morning', 'afternoon', 'evening'] as const).map((slot) => (
                                <TouchableOpacity
                                    key={slot}
                                    style={[
                                        styles.timeSlotButton,
                                        counterTime === slot && { backgroundColor: colors.primary[500] },
                                    ]}
                                    onPress={() => setCounterTime(slot)}
                                >
                                    <Text style={[
                                        styles.timeSlotText,
                                        { color: counterTime === slot ? 'white' : colors.neutral[600] },
                                    ]}>
                                        {slot.charAt(0).toUpperCase() + slot.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Message (Optional)</Text>
                        <RNTextInput
                            style={[styles.input, styles.multilineInput, { color: isDark ? colors.text.dark : colors.text.light }]}
                            placeholder="Suggest why this time works better..."
                            placeholderTextColor={colors.neutral[400]}
                            value={counterMessage}
                            onChangeText={setCounterMessage}
                            multiline
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.neutral[200] }]}
                                onPress={() => setCounterModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.primary[500] }]}
                                onPress={handleCounter}
                            >
                                <Text style={[styles.modalButtonText, { color: 'white' }]}>Send Counter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Invoice Modal */}
            <Modal visible={invoiceModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modal, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <Text style={[styles.modalTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Create Invoice
                        </Text>

                        <View style={styles.invoiceSummary}>
                            <Text style={styles.invoiceLabel}>Property</Text>
                            <Text style={[styles.invoiceValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {selectedRequest?.propertyTitle}
                            </Text>

                            <Text style={styles.invoiceLabel}>Tenant</Text>
                            <Text style={[styles.invoiceValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {selectedRequest?.tenantName}
                            </Text>

                            <Text style={styles.invoiceLabel}>Meetup Date & Time</Text>
                            <Text style={[styles.invoiceValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {selectedRequest?.agreedDate} at {selectedRequest?.agreedTime}
                            </Text>
                        </View>

                        <Text style={styles.inputLabel}>Viewing Fee (KES)</Text>
                        <RNTextInput
                            style={[styles.input, { color: isDark ? colors.text.dark : colors.text.light }]}
                            placeholder="500"
                            placeholderTextColor={colors.neutral[400]}
                            value={viewingFee}
                            onChangeText={setViewingFee}
                            keyboardType="numeric"
                        />

                        <View style={styles.feeBreakdown}>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Viewing Fee</Text>
                                <Text style={styles.feeValue}>KES {viewingFee || '0'}</Text>
                            </View>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Service Fee (15%)</Text>
                                <Text style={styles.feeValue}>KES {Math.round((parseInt(viewingFee) || 0) * 0.15)}</Text>
                            </View>
                            <View style={[styles.feeRow, styles.totalRow]}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>
                                    KES {(parseInt(viewingFee) || 0) + Math.round((parseInt(viewingFee) || 0) * 0.15)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.neutral[200] }]}
                                onPress={() => setInvoiceModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.primary[500] }]}
                                onPress={handleCreateInvoice}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text style={[styles.modalButtonText, { color: 'white' }]}>Create & Send</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
    },
    headerBack: { padding: spacing.xs },
    headerTitle: { ...typography.h3, fontSize: 18 },
    filters: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        gap: spacing.sm,
    },
    filterTab: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.neutral[200],
    },
    filterText: { ...typography.caption, fontWeight: '600' },
    list: { padding: spacing.lg, gap: spacing.md },
    card: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    propertyTitle: { ...typography.bodySemiBold, flex: 1, marginRight: spacing.sm },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    statusText: { ...typography.caption, fontWeight: '700', fontSize: 10 },
    tenantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    tenantName: { ...typography.body, color: colors.neutral[600] },
    tenantPhone: { ...typography.caption, color: colors.neutral[400] },
    datesSection: { marginBottom: spacing.md },
    datesLabel: { ...typography.caption, color: colors.neutral[500], marginBottom: spacing.xs },
    dateOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.xs,
    },
    dateText: { ...typography.body, color: colors.neutral[700] },
    timeSlot: { ...typography.caption, color: colors.neutral[400] },
    messageBox: {
        backgroundColor: colors.neutral[100],
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    messageLabel: { ...typography.caption, color: colors.neutral[500], marginBottom: spacing.xs },
    messageText: { ...typography.body, color: colors.neutral[700], fontStyle: 'italic' },
    actions: { flexDirection: 'row', gap: spacing.sm },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
    },
    actionButtonText: { color: 'white', fontWeight: '600', fontSize: 12 },
    primaryActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    primaryActionText: { color: 'white', fontWeight: '700', fontSize: 14 },
    empty: { alignItems: 'center', paddingTop: spacing.xxl },
    emptyText: { ...typography.body, color: colors.neutral[400], marginTop: spacing.md },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        padding: spacing.xl,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '80%',
    },
    modalTitle: { ...typography.h3, marginBottom: spacing.lg },
    inputLabel: { ...typography.caption, color: colors.neutral[500], marginBottom: spacing.xs },
    input: {
        borderWidth: 1,
        borderColor: colors.neutral[300],
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    multilineInput: { height: 80, textAlignVertical: 'top' },
    timeSlots: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    timeSlotButton: {
        flex: 1,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.neutral[100],
        alignItems: 'center',
    },
    timeSlotText: { ...typography.caption, fontWeight: '600' },
    invoiceSummary: { marginBottom: spacing.lg },
    invoiceLabel: { ...typography.caption, color: colors.neutral[400] },
    invoiceValue: { ...typography.body, marginBottom: spacing.sm },
    feeBreakdown: {
        backgroundColor: colors.neutral[100],
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
    },
    feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
    feeLabel: { ...typography.body, color: colors.neutral[600] },
    feeValue: { ...typography.body, color: colors.neutral[700] },
    totalRow: { borderTopWidth: 1, borderTopColor: colors.neutral[300], marginTop: spacing.sm, paddingTop: spacing.sm },
    totalLabel: { ...typography.bodySemiBold, color: colors.neutral[800] },
    totalValue: { ...typography.bodySemiBold, color: colors.primary[500] },
    modalActions: { flexDirection: 'row', gap: spacing.md },
    modalButton: {
        flex: 1,
        height: 48,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonText: { fontWeight: '700', fontSize: 14, color: colors.neutral[700] },
});

export default ViewingRequestScreen;
