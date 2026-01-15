import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useComparison } from '../../contexts/ComparisonContext';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { PropertyListing } from '../../data/types';

interface CompareButtonProps {
    property: PropertyListing;
    variant?: 'icon' | 'button';
    onPress?: () => void;
}

export default function CompareButton({ property, variant = 'icon', onPress }: CompareButtonProps) {
    const { isDark } = useTheme();
    const { isInComparison, addToComparison, removeFromComparison, maxComparisonReached } = useComparison();

    const isAdded = isInComparison(property.id.toString());

    const handlePress = () => {
        if (isAdded) {
            removeFromComparison(property.id.toString());
            Alert.alert('Removed', 'Property removed from comparison');
        } else {
            if (maxComparisonReached) {
                Alert.alert('Limit Reached', 'You can compare up to 4 properties at once. Remove one to add another.');
                return;
            }
            const success = addToComparison(property);
            if (success) {
                Alert.alert('Added', 'Property added to comparison');
            }
        }
        onPress?.();
    };

    if (variant === 'icon') {
        return (
            <TouchableOpacity
                onPress={handlePress}
                style={[
                    styles.iconButton,
                    { backgroundColor: isDark ? colors.neutral[800] : 'white' },
                ]}
            >
                <Ionicons
                    name={isAdded ? 'git-compare' : 'git-compare-outline'}
                    size={20}
                    color={isAdded ? colors.primary[500] : isDark ? colors.text.dark : colors.text.light}
                />
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[
                styles.button,
                isAdded && styles.buttonActive,
                { backgroundColor: isAdded ? colors.primary[500] : isDark ? colors.neutral[800] : 'white' },
            ]}
        >
            <Ionicons
                name={isAdded ? 'git-compare' : 'git-compare-outline'}
                size={18}
                color={isAdded ? colors.neutral[50] : isDark ? colors.text.dark : colors.text.light}
            />
            <Text style={[styles.buttonText, isAdded && styles.buttonTextActive, { color: isAdded ? colors.neutral[50] : isDark ? colors.text.dark : colors.text.light }]}>
                {isAdded ? 'Remove from Compare' : 'Compare'}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    buttonActive: {
        backgroundColor: colors.primary[500],
    },
    buttonText: {
        ...typography.body,
        fontSize: 14,
        fontWeight: '600',
    },
    buttonTextActive: {
        color: colors.neutral[50],
    },
});
