import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

interface CardCategoryProps {
    item: {
        name: string;
        count: number;
        thumbnail: string;
    };
    onPress?: () => void;
}

const CardCategory: React.FC<CardCategoryProps> = ({ item, onPress }) => {
    const { isDark } = useTheme();

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.thumbnail }} style={styles.image} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.name, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={[styles.count, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    {item.count.toLocaleString()} properties
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 200,
        marginRight: spacing.md,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        backgroundColor: colors.neutral[200],
    },
    image: {
        width: '100%',
        height: '100%',
    },
    content: {
        marginTop: spacing.sm,
    },
    name: {
        ...typography.h4,
        fontWeight: '600',
    },
    count: {
        ...typography.bodySmall,
        marginTop: 2,
    },
});

export default CardCategory;
