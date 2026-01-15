import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { MOCK_SEARCH_REQUESTS, MOCK_PROPERTIES, MOCK_HUNTERS, getReviewsByHunterId } from '../../services/mockData';
import { SearchStackParamList } from '../../types/navigation';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import { StackNavigationProp } from '@react-navigation/stack';

type SearchRequestDetailRouteProp = RouteProp<SearchStackParamList, 'SearchRequestDetail'>;
type SearchRequestDetailNavigationProp = StackNavigationProp<SearchStackParamList>;

const SearchRequestDetailScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation<SearchRequestDetailNavigationProp>();
    const route = useRoute<SearchRequestDetailRouteProp>();
    const { requestId } = route.params;

    const request = MOCK_SEARCH_REQUESTS.find(r => r.id === requestId);

    if (!request) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending_assignment': return colors.warning;
            case 'in_progress': return colors.primary[600];
            case 'completed': return colors.success;
            default: return colors.neutral[500];
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                        {request.status.replace('_', ' ').toUpperCase()}
                    </Text>
                </View>
                <Text style={[styles.date, { color: colors.neutral[500] }]}>Posted on {request.createdAt}</Text>
            </View>

            <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                {request.propertyType} in {request.preferredAreas.join(', ')}
            </Text>

            <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={20} color={colors.primary[600]} />
                    <View>
                        <Text style={[styles.detailLabel, { color: colors.neutral[500] }]}>Budget</Text>
                        <Text style={[styles.detailValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            KES {request.minRent.toLocaleString()} - {request.maxRent.toLocaleString()}
                        </Text>
                    </View>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={20} color={colors.primary[600]} />
                    <View>
                        <Text style={[styles.detailLabel, { color: colors.neutral[500] }]}>Deadline</Text>
                        <Text style={[styles.detailValue, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {request.deadline}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Requirements</Text>
                <Text style={[styles.requirementsText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                    {request.additionalNotes || "No additional notes provided."}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    {request.status === 'pending_assignment' ? 'Active Bids' : 'Assigned Hunter'}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <View style={styles.navHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.navTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Request Details
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={request.status === 'pending_assignment' ? MOCK_HUNTERS.slice(0, 2) : [MOCK_HUNTERS.find(h => h.id === request.hunterId)]}
                keyExtractor={(item) => item?.id.toString() || 'empty'}
                ListHeaderComponent={renderHeader}
                renderItem={({ item }) => {
                    if (!item) return null;
                    return (
                        <Card style={styles.bidCard}>
                            <View style={styles.bidHeader}>
                                <Image source={{ uri: item.profilePhoto }} style={styles.bidAvatar} />
                                <View style={styles.bidInfo}>
                                    <Text style={[styles.bidName, { color: isDark ? colors.text.dark : colors.text.light }]}>{item.name}</Text>
                                    <View style={styles.bidRating}>
                                        <Ionicons name="star" size={14} color="#F59E0B" />
                                        <Text style={[styles.bidRatingText, { color: isDark ? colors.text.dark : colors.text.light }]}>{item.rating}</Text>
                                        <Text style={[styles.bidReviewCount, { color: colors.neutral[500] }]}>({item.reviewCount} reviews)</Text>
                                    </View>
                                </View>
                                {request.status === 'pending_assignment' && (
                                    <Button size="sm" onPress={() => navigation.navigate('BidReview', { requestId, bids: [item] })}>View Bid</Button>
                                )}
                            </View>
                            {request.status === 'in_progress' && (
                                <View style={styles.progressSection}>
                                    <Text style={[styles.progressTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Evidence Progress</Text>
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { width: '66%', backgroundColor: colors.primary[600] }]} />
                                    </View>
                                    <Text style={[styles.progressText, { color: colors.neutral[500] }]}>2 of 3 properties found</Text>
                                    <Button
                                        variant="outline"
                                        style={styles.chatButton}
                                        onPress={() => navigation.navigate('EvidenceReview', { requestId, evidence: [] })}
                                        leftIcon={<Ionicons name="eye-outline" size={18} color={colors.primary[600]} />}
                                    >
                                        Review Evidence
                                    </Button>
                                </View>
                            )}
                        </Card>
                    );
                }}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyBids}>
                        <Ionicons name="hourglass-outline" size={48} color={colors.neutral[400]} />
                        <Text style={[styles.emptyBidsText, { color: colors.neutral[500] }]}>Waiting for hunters to bid...</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    backButton: { padding: spacing.xs },
    navTitle: { ...typography.h4 },
    header: { padding: spacing.md },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
    },
    date: { ...typography.caption },
    title: { ...typography.h2, marginBottom: spacing.lg },
    detailsGrid: {
        flexDirection: 'row',
        gap: spacing.xl,
        marginBottom: spacing.xl,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    detailLabel: { ...typography.caption },
    detailValue: { ...typography.bodySmall, fontWeight: '700' },
    section: { marginBottom: spacing.xl },
    sectionTitle: { ...typography.h3, marginBottom: spacing.md },
    requirementsText: { ...typography.bodySmall, lineHeight: 20 },
    listContent: { padding: spacing.md, paddingTop: 0 },
    bidCard: { padding: spacing.md, marginBottom: spacing.md },
    bidHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    bidAvatar: { width: 48, height: 48, borderRadius: borderRadius.full },
    bidInfo: { flex: 1, gap: 2 },
    bidName: { ...typography.body, fontWeight: '700' },
    bidRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    bidRatingText: { ...typography.caption, fontWeight: '700' },
    bidReviewCount: { ...typography.caption },
    progressSection: { marginTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.neutral[100], paddingTop: spacing.md },
    progressTitle: { ...typography.bodySmall, fontWeight: '700', marginBottom: spacing.sm },
    progressBar: { height: 8, backgroundColor: colors.neutral[100], borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
    progressFill: { height: '100%' },
    progressText: { ...typography.caption, marginBottom: spacing.md },
    chatButton: { marginTop: spacing.sm },
    emptyBids: { alignItems: 'center', paddingVertical: spacing.xl },
    emptyBidsText: { ...typography.bodySmall, marginTop: spacing.md },
});

export default SearchRequestDetailScreen;
