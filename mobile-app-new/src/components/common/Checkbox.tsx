import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    subLabel?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, subLabel }) => {
    const { isDark } = useTheme();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onChange(!checked)}
            activeOpacity={0.7}
        >
            <View style={[
                styles.checkbox,
                {
                    borderColor: checked ? colors.primary[600] : colors.neutral[300],
                    backgroundColor: checked ? colors.primary[600] : 'transparent'
                }
            ]}>
                {checked && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <View style={styles.textContainer}>
                <Text style={[
                    styles.label,
                    { color: isDark ? colors.text.dark : colors.text.light }
                ]}>
                    {label}
                </Text>
                {subLabel && (
                    <Text style={[
                        styles.subLabel,
                        { color: colors.neutral[500] }
                    ]}>
                        {subLabel}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: borderRadius.sm,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
        marginTop: 2,
    },
    textContainer: {
        flex: 1,
    },
    label: {
        ...typography.body,
        fontWeight: '500',
    },
    subLabel: {
        ...typography.caption,
        marginTop: 2,
    },
});

export default Checkbox;
