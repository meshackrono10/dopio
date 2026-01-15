import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../types/navigation';
import { useRoute, RouteProp } from '@react-navigation/native';

type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface Issue {
    id: string;
    title: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    status: IssueStatus;
    createdDate: string;
    lastUpdate: string;
    description: string;
    propertyTitle?: string;
    propertyImage?: string;
}

const MyIssuesScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
    const route = useRoute<RouteProp<{ params: { initialTab?: string } }, 'params'>>();
    const [filter, setFilter] = useState<'all' | IssueStatus | 'against_me'>(
        (route.params?.initialTab as 'all' | IssueStatus | 'against_me') || 'all'
    );

    // Mock issues data
    const allIssues: Issue[] = [
        {
            id: '1',
            title: 'Water leakage in bathroom',
            category: 'Property Condition',
            priority: 'high',
            status: 'in_progress',
            createdDate: '2025-01-05',
            lastUpdate: '2 hours ago',
            description: 'Bathroom sink has been leaking for 3 days',
            propertyTitle: 'Modern 2-Bedroom Apartment',
            propertyImage: 'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=200',
        },
        {
            id: '2',
            title: 'Payment not reflected',
            category: 'Payment Issue',
            priority: 'high',
            status: 'open',
            createdDate: '2025-01-06',
            lastUpdate: '1 hour ago',
            description: 'Made payment 2 days ago but not showing in my account',
        },
        {
            id: '3',
            title: 'Security gate not working',
            category: 'Safety Concern',
            priority: 'medium',
            status: 'resolved',
            createdDate: '2024-12-28',
            lastUpdate: '3 days ago',
            description: 'Main security gate has been malfunctioning',
            propertyTitle: 'Spacious 3-Bedroom House',
            propertyImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200',
        },
    ];

    const issues = filter === 'all'
        ? allIssues
        : filter === 'against_me'
            ? [
                {
                    id: 'd1',
                    title: 'No-show for scheduled viewing',
                    category: 'Behavior',
                    priority: 'medium' as const,
                    status: 'open' as const,
                    createdDate: '2025-01-04',
                    lastUpdate: '1 day ago',
                    description: 'The hunter did not show up for the viewing.',
                    propertyTitle: 'Modern 2-Bedroom Apartment',
                }
            ]
            : allIssues.filter(issue => issue.status === filter);

    const getStatusColor = (status: IssueStatus) => {
        switch (status) {
            case 'open': return colors.warning;
            case 'in_progress': return colors.primary[500];
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

    const getStatusLabel = (status: IssueStatus) => {
        return status.replace('_', ' ').toUpperCase();
    };

    const filterButtons = [
        { id: 'all', label: 'All' },
        { id: 'open', label: 'Open' },
        { id: 'in_progress', label: 'In Progress' },
        { id: 'resolved', label: 'Resolved' },
        { id: 'against_me', label: 'Disputes Against Me' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                        My Issues
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('ReportIssue' as never)} style={styles.addButton}>
                        <Ionicons name="add-circle-outline" size={24} color={colors.primary[500]} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Tab Bar */}
            <View style={[styles.tabBar, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabBarContent}
                >
                    {filterButtons.map(btn => (
                        <TouchableOpacity
                            key={btn.id}
                            style={[styles.tabItem, filter === btn.id && styles.activeTabItem]}
                            onPress={() => setFilter(btn.id as any)}
                        >
                            <Text style={[styles.tabText, filter === btn.id && styles.activeTabText]}>{btn.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {issues.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkmark-done-circle-outline" size={64} color={colors.neutral[300]} />
                        <Text style={[styles.emptyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            No Issues Found
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {filter === 'all'
                                ? "You haven't reported any issues yet"
                                : `No ${filter.replace('_', ' ')} issues`}
                        </Text>
                    </View>
                ) : (
                    issues.map(issue => (
                        <TouchableOpacity
                            key={issue.id}
                            style={[styles.issueCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}
                        >
                            {issue.propertyImage && (
                                <Image source={{ uri: issue.propertyImage }} style={styles.propertyImage} />
                            )}
                            <View style={styles.issueContent}>
                                <View style={styles.issueHeader}>
                                    <View style={styles.badges}>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) + '20' }]}>
                                            <Text style={[styles.statusText, { color: getStatusColor(issue.status) }]}>
                                                {getStatusLabel(issue.status)}
                                            </Text>
                                        </View>
                                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issue.priority) + '20' }]}>
                                            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(issue.priority) }]} />
                                            <Text style={[styles.priorityText, { color: getPriorityColor(issue.priority) }]}>
                                                {issue.priority.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <Text style={[styles.issueTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    {issue.title}
                                </Text>

                                {issue.propertyTitle && (
                                    <View style={styles.propertyInfo}>
                                        <Ionicons name="home-outline" size={14} color={colors.neutral[500]} />
                                        <Text style={styles.propertyText}>{issue.propertyTitle}</Text>
                                    </View>
                                )}

                                <Text style={styles.issueCategory}>{issue.category}</Text>

                                <View style={styles.issueFooter}>
                                    <View style={styles.dateInfo}>
                                        <Ionicons name="calendar-outline" size={14} color={colors.neutral[500]} />
                                        <Text style={styles.dateText}>Created: {issue.createdDate}</Text>
                                    </View>
                                    <View style={styles.updateInfo}>
                                        <Ionicons name="time-outline" size={14} color={colors.neutral[500]} />
                                        <Text style={styles.updateText}>Updated {issue.lastUpdate}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.viewDetailsButton}
                                    onPress={() => {
                                        if (filter === 'against_me') {
                                            navigation.navigate('DisputeResponse', { disputeId: issue.id });
                                        }
                                    }}
                                >
                                    <Text style={[styles.viewDetailsText, { color: colors.primary[500] }]}>
                                        {filter === 'against_me' ? 'Respond Now' : 'View Details'}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={16} color={colors.primary[500]} />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary[500] }]}
                onPress={() => navigation.navigate('ReportIssue' as never)}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
        fontWeight: '700',
    },
    filterContainer: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    filterButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
    },
    filterButtonActive: {
        backgroundColor: colors.primary[100],
    },
    filterText: {
        ...typography.bodySemiBold,
        fontSize: 14,
    },
    filterTextActive: {
        fontWeight: '700',
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl * 2,
    },
    issueCard: {
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    propertyImage: {
        width: '100%',
        height: 120,
    },
    issueContent: {
        padding: spacing.lg,
    },
    issueHeader: {
        marginBottom: spacing.sm,
    },
    badges: {
        flexDirection: 'row',
        gap: spacing.sm,
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
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    priorityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    priorityText: {
        ...typography.caption,
        fontSize: 10,
        fontWeight: '700',
    },
    issueTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.xs,
    },
    propertyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    propertyText: {
        ...typography.caption,
        color: colors.neutral[600],
        fontSize: 13,
    },
    issueCategory: {
        ...typography.caption,
        color: colors.neutral[500],
        marginBottom: spacing.md,
    },
    issueFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
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
    updateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    updateText: {
        ...typography.caption,
        color: colors.neutral[500],
        fontSize: 12,
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
        marginTop: spacing.sm,
    },
    viewDetailsText: {
        ...typography.bodySemiBold,
        fontSize: 14,
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
    fab: {
        position: 'absolute',
        bottom: spacing.xxl,
        right: spacing.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    tabBar: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
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
});

export default MyIssuesScreen;
