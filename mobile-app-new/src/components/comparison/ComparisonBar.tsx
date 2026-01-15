import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useComparison } from '../../contexts/ComparisonContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

export default function ComparisonBar() {
    const navigation = useNavigation();
    const { isDark } = useTheme();
    const { comparisonList, clearComparison } = useComparison();

    if (comparisonList.length === 0) return null;

    return (
        <View style={[styles.container, { backgroundColor: colors.primary[500] }]}>
            <View style={styles.content}>
                <Ionicons name="git-compare" size={24} color={colors.neutral[50]} />
                <Text style={styles.text}>
                    {comparisonList.length} {comparisonList.length === 1 ? 'property' : 'properties'} selected
                </Text>
            </View>
            <View style={styles.actions}>
                {comparisonList.length >= 2 && (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.neutral[50] }]}
                        onPress={() => (navigation as any).navigate('PropertyComparison')}
                    >
                        <Text style={[styles.buttonText, { color: colors.primary[700] }]}>
                            Compare
                        </Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={clearComparison} style={styles.iconButton}>
                    <Ionicons name="close" size={24} color={colors.neutral[50]} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    text: {
        color: colors.neutral[50],
        fontSize: 16,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    button: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '700',
    },
    iconButton: {
        padding: spacing.xs,
    },
});
