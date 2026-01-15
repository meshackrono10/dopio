import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import PropertyAnalytics from '../../components/analytics/PropertyAnalytics';
import { ProfileStackParamList } from '../../types/navigation';

type PropertyAnalyticsScreenRouteProp = RouteProp<ProfileStackParamList, 'PropertyAnalytics'>;

const PropertyAnalyticsScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<PropertyAnalyticsScreenRouteProp>();
    const { propertyId, propertyTitle } = route.params as any;

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Property Insights
                    </Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>
                        {propertyTitle || 'Property Performance'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.headerAction}>
                    <Ionicons name="share-outline" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Performance Overview
                    </Text>
                    <PropertyAnalytics
                        views={1250}
                        inquiries={45}
                        bookings={12}
                        revenue={450000}
                    />
                </View>

                <View style={[styles.chartCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <View style={styles.chartHeader}>
                        <Text style={[styles.chartTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Views Trend
                        </Text>
                        <TouchableOpacity style={styles.timeframeButton}>
                            <Text style={styles.timeframeText}>Last 30 Days</Text>
                            <Ionicons name="chevron-down" size={14} color={colors.primary[500]} />
                        </TouchableOpacity>
                    </View>

                    {/* Placeholder for actual chart */}
                    <View style={styles.chartPlaceholder}>
                        <View style={styles.chartBars}>
                            {[40, 60, 45, 80, 55, 70, 90].map((height, i) => (
                                <View key={i} style={styles.barContainer}>
                                    <View style={[styles.bar, { height: `${height}%`, backgroundColor: colors.primary[500] }]} />
                                    <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        Guest Insights
                    </Text>
                    <View style={[styles.insightCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <View style={styles.insightItem}>
                            <View style={[styles.insightIcon, { backgroundColor: colors.primary[50] }]}>
                                <Ionicons name="people-outline" size={20} color={colors.primary[500]} />
                            </View>
                            <View style={styles.insightInfo}>
                                <Text style={[styles.insightLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Top Guest Type
                                </Text>
                                <Text style={styles.insightValue}>Young Professionals</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.insightItem}>
                            <View style={[styles.insightIcon, { backgroundColor: colors.success + '15' }]}>
                                <Ionicons name="time-outline" size={20} color={colors.success} />
                            </View>
                            <View style={styles.insightInfo}>
                                <Text style={[styles.insightLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Avg. Stay Duration
                                </Text>
                                <Text style={styles.insightValue}>12 Months</Text>
                            </View>
                        </View>
                    </View>
                </View>
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
    headerTitleContainer: {
        alignItems: 'center',
        flex: 1,
    },
    headerTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    headerSubtitle: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    headerAction: {
        padding: spacing.xs,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.h3,
        fontSize: 18,
        marginBottom: spacing.md,
    },
    chartCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.xl,
        ...shadows.sm,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    chartTitle: {
        ...typography.bodySemiBold,
    },
    timeframeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeframeText: {
        ...typography.caption,
        color: colors.primary[500],
        fontWeight: '600',
    },
    chartPlaceholder: {
        height: 150,
        justifyContent: 'flex-end',
    },
    chartBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '100%',
    },
    barContainer: {
        alignItems: 'center',
        gap: spacing.xs,
        flex: 1,
    },
    bar: {
        width: 12,
        borderRadius: 6,
    },
    barLabel: {
        ...typography.caption,
        fontSize: 10,
        color: colors.neutral[400],
    },
    insightCard: {
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    insightItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        gap: spacing.md,
    },
    insightIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    insightInfo: {
        flex: 1,
    },
    insightLabel: {
        ...typography.caption,
        fontWeight: '600',
        marginBottom: 2,
    },
    insightValue: {
        ...typography.bodySemiBold,
        color: colors.primary[500],
    },
    divider: {
        height: 1,
        backgroundColor: colors.neutral[100],
        marginHorizontal: spacing.lg,
    },
});

export default PropertyAnalyticsScreen;
