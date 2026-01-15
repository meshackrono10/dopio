import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Switch,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/common/Button';

const AdminSettingsScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();

    const [platformFee, setPlatformFee] = useState('10');
    const [hunterCommission, setHunterCommission] = useState('80');
    const [autoVerifyHunters, setAutoVerifyHunters] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [requirePropertyVerification, setRequirePropertyVerification] = useState(true);

    const handleSave = () => {
        Alert.alert('Success', 'Platform settings updated successfully!');
    };

    const SettingItem = ({ label, subtext, children }: { label: string, subtext?: string, children: React.ReactNode }) => (
        <View style={[styles.settingItem, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
            <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>{label}</Text>
                {subtext && <Text style={styles.settingSubtext}>{subtext}</Text>}
            </View>
            {children}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                    Platform Settings
                </Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Financials</Text>
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <SettingItem label="Platform Fee (%)" subtext="Percentage taken from each transaction">
                            <TextInput
                                style={[styles.input, { color: isDark ? colors.text.dark : colors.text.light }]}
                                value={platformFee}
                                onChangeText={setPlatformFee}
                                keyboardType="numeric"
                            />
                        </SettingItem>
                        <SettingItem label="Hunter Commission (%)" subtext="Percentage paid to hunters">
                            <TextInput
                                style={[styles.input, { color: isDark ? colors.text.dark : colors.text.light }]}
                                value={hunterCommission}
                                onChangeText={setHunterCommission}
                                keyboardType="numeric"
                            />
                        </SettingItem>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Verification Rules</Text>
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <SettingItem label="Auto-verify Hunters" subtext="Automatically verify hunters after ID upload">
                            <Switch
                                value={autoVerifyHunters}
                                onValueChange={setAutoVerifyHunters}
                                trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
                            />
                        </SettingItem>
                        <SettingItem label="Property Verification" subtext="Require verification before listing goes live">
                            <Switch
                                value={requirePropertyVerification}
                                onValueChange={setRequirePropertyVerification}
                                trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
                            />
                        </SettingItem>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>System</Text>
                    <View style={[styles.card, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                        <SettingItem label="Maintenance Mode" subtext="Disable all user interactions">
                            <Switch
                                value={maintenanceMode}
                                onValueChange={setMaintenanceMode}
                                trackColor={{ false: colors.neutral[300], true: colors.error[500] }}
                            />
                        </SettingItem>
                    </View>
                </View>

                <Button
                    variant="outline"
                    style={styles.dangerButton}
                    onPress={() => Alert.alert('Clear Cache', 'Are you sure you want to clear system cache?')}
                >
                    Clear System Cache
                </Button>
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
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
    },
    saveButton: {
        ...typography.bodySemiBold,
        color: colors.primary[500],
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.caption,
        fontWeight: '700',
        color: colors.neutral[500],
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    card: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        ...shadows.sm,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderBottomWidth: 1,
    },
    settingInfo: {
        flex: 1,
        marginRight: spacing.md,
    },
    settingLabel: {
        ...typography.bodySemiBold,
        fontSize: 15,
        marginBottom: 2,
    },
    settingSubtext: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    input: {
        ...typography.bodySemiBold,
        width: 60,
        textAlign: 'right',
        padding: 0,
    },
    dangerButton: {
        borderColor: colors.error[500],
        marginTop: spacing.md,
    },
});

export default AdminSettingsScreen;
