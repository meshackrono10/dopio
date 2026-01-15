import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchRequests } from '../../contexts/SearchRequestContext';
import BidCard from '../../components/search-request/BidCard';
import BidSubmissionForm from '../../components/search-request/BidSubmissionForm';
import EvidenceUpload, { EvidenceItem } from '../../components/search-request/EvidenceUpload';
import EvidenceGallery from '../../components/search-request/EvidenceGallery';
import TimeframeTracker from '../../components/search-request/TimeframeTracker';
import AutoReleaseTimer from '../../components/search-request/AutoReleaseTimer';
import { SearchRequest, Bid as DataBid } from '../../data/types';
import { Bid as CardBid } from '../../components/search-request/BidCard';

type SearchRequestDetailParams = {
    SearchRequestDetail: {
        requestId: string;
    };
};

const SearchRequestDetailScreen = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation() as any;
    const route = useRoute<RouteProp<SearchRequestDetailParams, 'SearchRequestDetail'>>();
    const { getSearchRequestById, updateSearchRequest } = useSearchRequests();

    const [activeTab, setActiveTab] = useState<'details' | 'bids' | 'evidence'>('details');
    const [showBidForm, setShowBidForm] = useState(false);
    const [evidence, setEvidence] = useState<EvidenceItem[]>([]);

    const requestId = route.params?.requestId;
    const searchRequest = getSearchRequestById(requestId);

    if (!searchRequest) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <Text style={{ color: isDark ? colors.text.dark : colors.text.light }}>Request not found</Text>
            </View>
        );
    }

    const bids = searchRequest.bids || [];
    const isHunter = user?.role === 'hunter';
    const hasBid = bids.some(bid => bid.hunterId === user?.id);
    const acceptedBid = bids.find(bid => bid.status === 'selected');
    const isMyAcceptedBid = acceptedBid?.hunterId === user?.id;

    // Simulate incoming bid (for demo purposes)
    const simulateIncomingBid = () => {
        const newBid: DataBid = {
            id: `bid-${Date.now()}`,
            hunterId: `hunter-${Date.now()}`,
            hunterName: 'Simulated Hunter',
            hunterRating: 4.5,
            hunterSuccessRate: 95,
            price: searchRequest.depositAmount * 0.8, // Example price
            timeframe: 48,
            bonuses: ['Video Tour'],
            message: 'I have great properties matching your criteria!',
            status: 'pending',
            submittedAt: new Date().toISOString(),
        };

        updateSearchRequest(searchRequest.id, {
            bids: [newBid, ...bids]
        });

        Alert.alert('New Bid', 'You have received a new bid!');
    };

    const handleAcceptBid = (bidId: string | number) => {
        Alert.alert(
            'Accept Bid?',
            'This will notify the hunter and generate an invoice. You will be charged the bid amount.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Accept & Pay',
                    onPress: () => {
                        // Update request status and bids
                        const updatedBids = bids.map(b => ({
                            ...b,
                            status: b.id === bidId ? 'selected' : 'rejected'
                        })) as DataBid[]; // Cast to ensure type compatibility

                        const selectedBid = bids.find(b => b.id === bidId);

                        updateSearchRequest(searchRequest.id, {
                            status: 'in_progress',
                            bids: updatedBids,
                            hunterId: selectedBid?.hunterId,
                            hunterName: selectedBid?.hunterName,
                            selectedBidId: bidId,
                            agreedTimeframe: selectedBid?.timeframe,
                            timeframeStartedAt: new Date().toISOString(),
                        });

                        Alert.alert('Success', 'Bid accepted! The hunt has begun.');
                    }
                }
            ]
        );
    };

    const handleRejectBid = (bidId: string | number) => {
        const updatedBids = bids.map(b => ({
            ...b,
            status: b.id === bidId ? 'rejected' : b.status
        })) as DataBid[];

        updateSearchRequest(searchRequest.id, {
            bids: updatedBids
        });
    };

    const handleBidSubmit = (bidData: any) => {
        const newBid: DataBid = {
            id: `bid-${Date.now()}`,
            hunterId: user?.id || 'hunter-1',
            hunterName: user?.name || 'Current Hunter',
            hunterRating: 4.8,
            hunterSuccessRate: 98,
            price: parseInt(bidData.price),
            timeframe: parseInt(bidData.timeframe),
            bonuses: [],
            message: bidData.message,
            status: 'pending',
            submittedAt: new Date().toISOString(),
        };

        updateSearchRequest(searchRequest.id, {
            bids: [newBid, ...bids]
        });

        setShowBidForm(false);
        Alert.alert('Success', 'Your bid has been submitted!');
    };

    // Convert DataBid to CardBid for display
    const displayBids: CardBid[] = bids.map(b => ({
        id: b.id.toString(),
        hunterId: b.hunterId.toString(),
        hunterName: b.hunterName,
        hunterRating: b.hunterRating,
        price: b.price,
        timeframe: b.timeframe,
        message: b.message || '',
        createdAt: b.submittedAt,
        status: b.status === 'selected' ? 'accepted' : b.status,
    }));

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Search Request
                </Text>
                {/* Demo Button to Simulate Bid */}
                {!isHunter && !acceptedBid && (
                    <TouchableOpacity onPress={simulateIncomingBid}>
                        <Ionicons name="add-circle" size={24} color={colors.primary[500]} />
                    </TouchableOpacity>
                )}
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Status Banner */}
                <View style={[styles.statusBanner, { backgroundColor: colors.primary[500] + '20' }]}>
                    <Ionicons name="information-circle" size={20} color={colors.primary[500]} />
                    <Text style={[styles.statusText, { color: colors.primary[500] }]}>
                        {searchRequest.status.toUpperCase().replace('_', ' ')} • {bids.length} bids received
                    </Text>
                </View>

                {/* Request Title */}
                <View style={styles.titleSection}>
                    <Text style={[styles.requestTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        {searchRequest.bedrooms} Bed {searchRequest.propertyType} in {searchRequest.preferredAreas[0]}
                    </Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={16} color={colors.neutral[500]} />
                            <Text style={styles.metaText}>Created: {new Date(searchRequest.createdAt).toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={16} color={colors.neutral[500]} />
                            <Text style={styles.metaText}>Due: {new Date(searchRequest.deadline).toLocaleDateString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Tracking Components */}
                {acceptedBid && (
                    <View style={styles.trackingSection}>
                        <TimeframeTracker
                            startDate={searchRequest.timeframeStartedAt || new Date().toISOString()}
                            estimatedDays={acceptedBid.timeframe}
                            status={searchRequest.status === 'completed' ? 'completed' : 'active'}
                        />
                        {evidence.length > 0 && (
                            <View style={{ marginTop: spacing.md }}>
                                <AutoReleaseTimer
                                    evidenceSubmittedAt={evidence[0].uploadedAt}
                                    autoReleaseDays={3}
                                />
                            </View>
                        )}
                    </View>
                )}

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'details' && styles.activeTab]}
                        onPress={() => setActiveTab('details')}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === 'details' && styles.activeTabText,
                            { color: activeTab === 'details' ? colors.primary[500] : colors.neutral[500] }
                        ]}>
                            Details
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'bids' && styles.activeTab]}
                        onPress={() => setActiveTab('bids')}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === 'bids' && styles.activeTabText,
                            { color: activeTab === 'bids' ? colors.primary[500] : colors.neutral[500] }
                        ]}>
                            Bids ({bids.length})
                        </Text>
                    </TouchableOpacity>
                    {(acceptedBid || isHunter) && (
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'evidence' && styles.activeTab]}
                            onPress={() => setActiveTab('evidence')}
                        >
                            <Text style={[
                                styles.tabText,
                                activeTab === 'evidence' && styles.activeTabText,
                                { color: activeTab === 'evidence' ? colors.primary[500] : colors.neutral[500] }
                            ]}>
                                Evidence
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {activeTab === 'details' ? (
                        <>
                            {/* Budget */}
                            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                <Text style={[styles.cardTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Budget Range
                                </Text>
                                <Text style={[styles.budgetText, { color: colors.primary[500] }]}>
                                    KES {searchRequest.minRent.toLocaleString()} - {searchRequest.maxRent.toLocaleString()}/month
                                </Text>
                            </View>

                            {/* Preferred Areas */}
                            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                <Text style={[styles.cardTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Preferred Areas
                                </Text>
                                <View style={styles.areasList}>
                                    {searchRequest.preferredAreas.map((area, index) => (
                                        <View key={index} style={styles.areaChip}>
                                            <Ionicons name="location" size={14} color={colors.primary[500]} />
                                            <Text style={[styles.areaText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                                {area}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Requirements */}
                            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                <Text style={[styles.cardTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Requirements
                                </Text>
                                <View style={styles.requirementRow}>
                                    <Ionicons name="bed-outline" size={20} color={colors.neutral[600]} />
                                    <Text style={[styles.requirementText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        {searchRequest.bedrooms} Bedrooms
                                    </Text>
                                </View>
                                <View style={styles.requirementRow}>
                                    <Ionicons name="water-outline" size={20} color={colors.neutral[600]} />
                                    <Text style={[styles.requirementText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        {searchRequest.bathrooms} Bathrooms
                                    </Text>
                                </View>
                                {searchRequest.parkingRequired && (
                                    <View style={styles.requirementRow}>
                                        <Ionicons name="car-outline" size={20} color={colors.neutral[600]} />
                                        <Text style={[styles.requirementText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                            Parking Required
                                        </Text>
                                    </View>
                                )}
                                {searchRequest.securityFeatures.length > 0 && (
                                    <View style={styles.requirementRow}>
                                        <Ionicons name="shield-checkmark-outline" size={20} color={colors.neutral[600]} />
                                        <Text style={[styles.requirementText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                            24/7 Security
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Amenities */}
                            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                <Text style={[styles.cardTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Preferred Amenities
                                </Text>
                                <View style={styles.amenitiesList}>
                                    {searchRequest.amenities.map((amenity, index) => (
                                        <View key={index} style={styles.amenityChip}>
                                            <Ionicons name="checkmark-circle" size={14} color={colors.success[500]} />
                                            <Text style={[styles.amenityText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>{amenity}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Additional Notes */}
                            {searchRequest.additionalNotes && (
                                <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                    <Text style={[styles.cardTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        Additional Notes
                                    </Text>
                                    <Text style={[styles.notesText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                                        {searchRequest.additionalNotes}
                                    </Text>
                                </View>
                            )}

                            {/* Service Details */}
                            <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                                <Text style={[styles.cardTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Service Details
                                </Text>
                                <View style={styles.serviceRow}>
                                    <Text style={styles.serviceLabel}>Service Tier:</Text>
                                    <Text style={[styles.serviceValue, { color: colors.primary[500] }]}>
                                        {searchRequest.serviceTier.toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.serviceRow}>
                                    <Text style={styles.serviceLabel}>Properties to View:</Text>
                                    <Text style={[styles.serviceValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        {searchRequest.numberOfOptions}
                                    </Text>
                                </View>
                            </View>
                        </>
                    ) : activeTab === 'bids' ? (
                        <>
                            {isHunter && !hasBid && !acceptedBid && (
                                <View style={{ marginBottom: spacing.lg }}>
                                    {!showBidForm ? (
                                        <TouchableOpacity
                                            style={[styles.primaryButton, { backgroundColor: colors.primary[500] }]}
                                            onPress={() => setShowBidForm(true)}
                                        >
                                            <Ionicons name="add-circle-outline" size={20} color="white" />
                                            <Text style={styles.primaryButtonText}>Submit a Bid</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <BidSubmissionForm
                                            searchRequest={searchRequest}
                                            onSubmit={handleBidSubmit}
                                            onCancel={() => setShowBidForm(false)}
                                        />
                                    )}
                                </View>
                            )}

                            {bids.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="hourglass-outline" size={64} color={colors.neutral[300]} />
                                    <Text style={[styles.emptyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                        No Bids Yet
                                    </Text>
                                    <Text style={styles.emptySubtext}>
                                        Hunters will start bidding soon. You'll be notified when you receive bids.
                                    </Text>
                                </View>
                            ) : (
                                <View>
                                    {displayBids.map(bid => (
                                        <BidCard
                                            key={bid.id}
                                            bid={bid}
                                            showActions={!isHunter && !acceptedBid}
                                            onAccept={(id) => handleAcceptBid(id)}
                                            onReject={(id) => handleRejectBid(id)}
                                            onViewProfile={(id) => navigation.navigate('HunterProfile', { hunterId: id })}
                                        />
                                    ))}
                                </View>
                            )}
                        </>
                    ) : (
                        <View>
                            {isHunter ? (
                                <EvidenceUpload
                                    onUpload={(items) => setEvidence(items)}
                                    existingItems={evidence}
                                />
                            ) : (
                                <EvidenceGallery
                                    items={evidence}
                                    showActions={true}
                                    onApprove={(id) => navigation.navigate('EvidenceReview', { requestId: searchRequest.id, evidence })}
                                    onReject={(id) => navigation.navigate('EvidenceReview', { requestId: searchRequest.id, evidence })}
                                />
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
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
        flex: 1,
        textAlign: 'center',
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
    },
    statusText: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    titleSection: {
        padding: spacing.lg,
    },
    requestTitle: {
        ...typography.h2,
        fontSize: 22,
        marginBottom: spacing.md,
    },
    metaRow: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    metaText: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: colors.primary[500],
    },
    tabText: {
        ...typography.bodySemiBold,
        fontSize: 15,
    },
    activeTabText: {
        fontWeight: '700',
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    card: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    cardTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.md,
    },
    budgetText: {
        ...typography.h3,
        fontSize: 20,
    },
    areasList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    areaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary[50],
    },
    areaText: {
        ...typography.bodySemiBold,
        fontSize: 13,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
    },
    requirementText: {
        ...typography.body,
    },
    amenitiesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    amenityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.success + '10',
    },
    amenityText: {
        ...typography.caption,
        color: colors.neutral[600],
    },
    notesText: {
        ...typography.body,
        lineHeight: 22,
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
    },
    serviceLabel: {
        ...typography.body,
        color: colors.neutral[600],
    },
    serviceValue: {
        ...typography.bodySemiBold,
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
        paddingHorizontal: spacing.xl,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
        ...shadows.sm,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    trackingSection: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
});

export default SearchRequestDetailScreen;
