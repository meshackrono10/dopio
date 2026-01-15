import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { spacing } from '../../theme';
import SectionHeading from './SectionHeading';
import CardCategory from './CardCategory';

interface SectionSliderProps {
    title: string;
    subtitle?: string;
    data: any[];
    renderItem?: ({ item }: { item: any }) => React.ReactElement;
}

const SectionSlider: React.FC<SectionSliderProps> = ({ title, subtitle, data, renderItem }) => {
    return (
        <View style={styles.container}>
            <SectionHeading title={title} subtitle={subtitle} />
            <FlatList
                data={data}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                renderItem={renderItem || (({ item }) => <CardCategory item={item} />)}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.lg,
    },
    listContent: {
        paddingHorizontal: spacing.md,
    },
});

export default SectionSlider;
