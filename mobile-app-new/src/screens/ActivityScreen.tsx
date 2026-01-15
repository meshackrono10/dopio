import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { useTheme } from '../contexts/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../theme';
import BookingsScreen from './bookings/BookingsScreen';
import SavedScreen from './saved/SavedScreen';
import PropertyComparisonScreen from './properties/PropertyComparisonScreen';

const ActivityScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
    const [activeTab, setActiveTab] = useState<'bookings' | 'saved' | 'comparison' | 'searches'>('bookings');

    const tabs = [
        { id: 'bookings', label: 'Bookings', icon: 'calendar' },
        { id: 'saved', label: 'Saved', icon: 'heart' },
        { id: 'searches', label: 'Searches', icon: 'search' },
        { id: 'comparison', label: 'Compare', icon: 'git-compare' },
    ];

    const activeSearchRequests = [
        {
            id: '1',
            title: '2-Bedroom Apartment in Kasarani',
            budget: '25000-35000',
            bidsReceived: 5,
            status: 'active',
            deadline: '2025-01-20',
        },
        {
            id: '2',
            title: 'Spacious Bedsitter in CBD',
            budget: '15000-20000',
            bidsReceived: 3,
            status: 'active',
            deadline: '2025-01-25',
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>My Activity</Text>
                    <TouchableOpacity
                        style={styles.reportButton}
                        onPress={() => (navigation as any).navigate('ProfileTab', { screen: 'ReportIssue' })}
                    >
                        <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
                        <Text style={[styles.reportButtonText, { color: colors.error }]}>Report Issue</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View style={[styles.tabBar, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[
                                styles.tabItem,
                                activeTab === tab.id && styles.activeTabItem,
                                activeTab === tab.id && { borderBottomColor: colors.primary[500] }
                            ]}
                            onPress={() => setActiveTab(tab.id as any)}
                        >
                            <Ionicons
                                name={(activeTab === tab.id ? tab.icon : `${tab.icon}-outline`) as any}
                                size={20}
                                color={activeTab === tab.id ? colors.primary[500] : colors.neutral[500]}
                            />
                            <Text
                                style={[
                                    styles.tabLabel,
                                    { color: activeTab === tab.id ? colors.primary[500] : colors.neutral[500] }
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.content}>
                {activeTab === 'bookings' && <BookingsScreen hideHeader={true} />}
                {activeTab === 'saved' && <SavedScreen hideHeader={true} />}
                {activeTab === 'comparison' && <PropertyComparisonScreen navigation={navigation as any} route={{} as any} hideHeader={true} />}
                {activeTab === 'searches' && (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.searchesContent}>
                        <View style={[styles.section, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    My Search Requests
                                </Text>
                            </View>
                            {activeSearchRequests.map(request => (
                                <TouchableOpacity
                                    key={request.id}
                                    style={styles.requestCard}
                                    onPress={() => (navigation as any).navigate('SearchRequestDetail', { requestId: request.id })}
                                >
                                    <View style={styles.requestHeader}>
                                        <Text style={[styles.requestTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                            {request.title}
                                        </Text>
                                        <View style={[styles.statusBadge, { backgroundColor: colors.success[500] + '20' }]}>
                                            <Text style={[styles.statusText, { color: colors.success[500] }]}>ACTIVE</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.requestBudget}>Budget: KES {request.budget}</Text>
                                    <View style={styles.requestFooter}>
                                        <View style={styles.bidsInfo}>
                                            <Ionicons name="people" size={14} color={colors.primary[500]} />
                                            <Text style={styles.bidsText}>{request.bidsReceived} bids</Text>
                                        </View>
                                        <Text style={styles.deadlineText}>Due: {request.deadline}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={styles.createNewButton}
                                onPress={() => (navigation as any).navigate('CreateSearchRequest' as any)}
                            >
                                <Ionicons name="add-circle-outline" size={20} color={colors.primary[500]} />
                                <Text style={[styles.createNewText, { color: colors.primary[500] }]}>
                                    Create New Search Request
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}
            </View>
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
        borderBottomColor: 'transparent',
    },
    headerTitle: {
        ...typography.h2,
        fontSize: 24,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.error,
    },
    reportButtonText: {
        ...typography.bodySemiBold,
        fontSize: 12,
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    tabBarContent: {
        paddingHorizontal: spacing.lg,
    },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTabItem: {
        borderBottomWidth: 2,
    },
    tabLabel: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    content: {
        flex: 1,
    },
    searchesContent: {
        paddingBottom: spacing.xxl,
    },
    section: {
        marginHorizontal: spacing.lg,
        marginTop: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.neutral[100],
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    requestCard: {
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xs,
    },
    requestTitle: {
        ...typography.bodySemiBold,
        fontSize: 15,
        flex: 1,
        marginRight: spacing.sm,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        ...typography.caption,
        fontSize: 10,
        fontWeight: '700',
    },
    requestBudget: {
        ...typography.caption,
        color: colors.neutral[600],
        marginBottom: spacing.sm,
    },
    requestFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bidsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    bidsText: {
        ...typography.caption,
        color: colors.primary[500],
        fontWeight: '600',
    },
    deadlineText: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    createNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.md,
        marginTop: spacing.sm,
        borderWidth: 1,
        borderColor: colors.primary[500],
        borderRadius: borderRadius.md,
        borderStyle: 'dashed',
    },
    createNewText: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
});

export default ActivityScreen;
