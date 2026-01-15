import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import BidCard from '../../components/search-request/BidCard';
import { SearchStackParamList } from '../../types/navigation';

type BidReviewScreenRouteProp = RouteProp<SearchStackParamList, 'BidReview'>;

const BidReviewScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<BidReviewScreenRouteProp>();
    const { requestId, bids: initialBids } = route.params as any;

    const [bids, setBids] = useState(initialBids);
    const [sortBy, setSortBy] = useState<'price' | 'rating' | 'timeframe'>('rating');

    const sortedBids = [...bids].sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'rating') return b.hunterRating - a.hunterRating;
        if (sortBy === 'timeframe') return a.timeframe - b.timeframe;
        return 0;
    });

    const handleAcceptBid = (bidId: string) => {
        Alert.alert(
            'Accept Bid?',
            'This will notify the hunter and start the search process.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Accept',
                    onPress: () => {
                        setBids((prev: any[]) => prev.map((b: any) => ({
                            ...b,
                            status: b.id === bidId ? 'accepted' : 'rejected'
                        })));
                        Alert.alert('Success', 'Bid accepted! You can now chat with the hunter.');
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Review Bids
                </Text>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            <View style={styles.filterBar}>
                <Text style={[styles.filterLabel, { color: colors.neutral[500] }]}>Sort by:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                    {(['rating', 'price', 'timeframe'] as const).map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.filterChip,
                                sortBy === option && styles.activeFilterChip,
                                { backgroundColor: sortBy === option ? colors.primary[500] : (isDark ? colors.neutral[800] : 'white') }
                            ]}
                            onPress={() => setSortBy(option)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: sortBy === option ? 'white' : (isDark ? colors.text.dark : colors.text.light) }
                            ]}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                {sortedBids.map((bid) => (
                    <BidCard
                        key={bid.id}
                        bid={bid}
                        showActions={bid.status === 'pending'}
                        onAccept={handleAcceptBid}
                        onReject={(id: string) => setBids((prev: any[]) => prev.filter((b: any) => b.id !== id))}
                        onViewProfile={(id: string) => (navigation as any).navigate('HunterProfile', { hunterId: id })}
                    />
                ))}

                {sortedBids.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={64} color={colors.neutral[300]} />
                        <Text style={[styles.emptyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            No Bids Found
                        </Text>
                        <Text style={styles.emptySubtext}>
                            There are no bids matching your criteria at the moment.
                        </Text>
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
        fontWeight: '700',
    },
    filterBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.md,
    },
    filterLabel: {
        ...typography.caption,
        fontSize: 12,
        fontWeight: '600',
    },
    filterContent: {
        gap: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    activeFilterChip: {
        borderColor: colors.primary[500],
    },
    filterText: {
        ...typography.caption,
        fontSize: 12,
        fontWeight: '600',
    },
    listContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
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
        paddingHorizontal: spacing.xl,
    },
});

export default BidReviewScreen;
