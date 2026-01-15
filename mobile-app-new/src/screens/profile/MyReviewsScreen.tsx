import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_REVIEWS } from '../../services/mockData';
import HunterReviewCard from '../../components/review/HunterReviewCard';

const MyReviewsScreen = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();

    const myReviews = MOCK_REVIEWS.filter(
        review => review.tenantId === user?.id || review.hunterId === user?.id
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    My Reviews
                </Text>
                <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                    {myReviews.length} {myReviews.length === 1 ? 'review' : 'reviews'}
                </Text>
            </View>

            <FlatList
                data={myReviews}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.reviewWrapper}>
                        <HunterReviewCard review={item} />
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="star-outline" size={64} color={colors.neutral[400]} />
                        <Text style={[styles.emptyText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                            You haven't left or received any reviews yet.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        padding: spacing.md,
    },
    title: { ...typography.h2, marginBottom: spacing.xs },
    subtitle: { ...typography.bodySmall },
    listContent: { padding: spacing.md },
    reviewWrapper: {
        marginBottom: spacing.md,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl * 2,
        paddingHorizontal: spacing.xl,
    },
    emptyText: { ...typography.body, marginTop: spacing.md, textAlign: 'center' },
});

export default MyReviewsScreen;
