import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput as RNTextInput,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { MOCK_HUNTERS } from '../../services/mockData';
import { HomeStackParamList } from '../../types/navigation';
import HunterCard from '../../components/hunter/HunterCard';

type HunterListScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'HunterList'>;

const HunterListScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation<HunterListScreenNavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredHunters = MOCK_HUNTERS.filter(hunter => {
        const matchesSearch = hunter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hunter.areasOfOperation.some(area => area.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    House Hunters
                </Text>
            </View>

            <View style={styles.searchContainer}>
                <View
                    style={[
                        styles.searchBar,
                        {
                            backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                        },
                    ]}
                >
                    <Ionicons name="search-outline" size={20} color={colors.primary[600]} />
                    <RNTextInput
                        style={[styles.searchInput, { color: isDark ? colors.text.dark : colors.text.light }]}
                        placeholder="Search by name or area..."
                        placeholderTextColor={colors.neutral[400]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <FlatList
                data={filteredHunters}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <HunterCard
                        hunter={item}
                        onPress={() => navigation.navigate('HunterDetail', { hunterId: item.id.toString() })}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={64} color={colors.neutral[400]} />
                        <Text style={[styles.emptyText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                            No house hunters found
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    backButton: {
        padding: spacing.xs,
    },
    title: {
        ...typography.h2,
    },
    searchContainer: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        ...typography.body,
        paddingVertical: spacing.sm,
    },
    listContent: {
        padding: spacing.md,
        paddingTop: 0,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyText: {
        ...typography.body,
        marginTop: spacing.md,
    },
});

export default HunterListScreen;
