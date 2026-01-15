import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

interface Tab {
    id: string;
    label: string;
    icon: string;
}

interface DashboardTabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ tabs, activeTab, onTabChange }) => {
    const { isDark } = useTheme();

    return (
        <View style={[styles.container, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200] }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={[
                                styles.tab,
                                isActive && { borderBottomColor: colors.primary[600] }
                            ]}
                            onPress={() => onTabChange(tab.id)}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: isActive ? colors.primary[600] : (isDark ? colors.neutral[400] : colors.neutral[500]) },
                                isActive && styles.activeTabText
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        marginBottom: spacing.md,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
    },
    tab: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        ...typography.bodySmall,
        fontWeight: '500',
    },
    activeTabText: {
        fontWeight: '700',
    },
});

export default DashboardTabs;
