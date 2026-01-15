import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/common/Button';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../types/navigation';

type DisputeResponseParams = {
    DisputeResponse: {
        disputeId: string;
    };
};

const DisputeResponseScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
    const route = useRoute<RouteProp<DisputeResponseParams, 'DisputeResponse'>>();
    const [responseType, setResponseType] = useState<'accept' | 'deny' | null>(null);
    const [note, setNote] = useState('');
    const [evidence, setEvidence] = useState<{ id: string, uri: string, type: 'image' | 'video' }[]>([]);

    // Mock dispute details
    const dispute = {
        id: route.params?.disputeId || 'd1',
        title: 'No-show for scheduled viewing',
        description: 'The hunter did not show up for the viewing at 10:00 AM on Jan 4th.',
        reportedBy: 'Michael Otieno (Tenant)',
        propertyTitle: 'Modern 2-Bedroom Apartment',
        createdDate: '2025-01-04',
    };

    const handleAddEvidence = () => {
        // Mock adding evidence
        const newEvidence = {
            id: Math.random().toString(),
            uri: 'https://images.unsplash.com/photo-1560185031-2ee9b237ddc2?w=400',
            type: 'image' as const,
        };
        setEvidence([...evidence, newEvidence]);
    };

    const handleSubmit = () => {
        if (!responseType) {
            Alert.alert('Selection Required', 'Please choose to either accept or deny the claim.');
            return;
        }

        if (responseType === 'deny' && evidence.length === 0) {
            Alert.alert('Evidence Required', 'Please provide at least one piece of evidence to support your denial.');
            return;
        }

        Alert.alert(
            'Confirm Submission',
            `Are you sure you want to ${responseType} this claim?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Submit',
                    onPress: () => {
                        Alert.alert('Success', 'Your response has been submitted for review.');
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Respond to Dispute</Text>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.disputeCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.primary[500] }]}>DISPUTE DETAILS</Text>
                    <Text style={[styles.disputeTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>{dispute.title}</Text>
                    <Text style={[styles.disputeDescription, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>{dispute.description}</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Reported By:</Text>
                        <Text style={[styles.infoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>{dispute.reportedBy}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Property:</Text>
                        <Text style={[styles.infoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>{dispute.propertyTitle}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Date:</Text>
                        <Text style={[styles.infoValue, { color: isDark ? colors.text.dark : colors.text.light }]}>{dispute.createdDate}</Text>
                    </View>
                </View>

                <Text style={[styles.mainSectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Your Response</Text>

                <View style={styles.optionsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.optionCard,
                            { backgroundColor: isDark ? colors.neutral[800] : 'white' },
                            responseType === 'accept' && { borderColor: colors.success, borderWidth: 2 }
                        ]}
                        onPress={() => setResponseType('accept')}
                    >
                        <View style={[styles.optionIcon, { backgroundColor: colors.success + '20' }]}>
                            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                        </View>
                        <View style={styles.optionTextContainer}>
                            <Text style={[styles.optionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Accept Claim</Text>
                            <Text style={styles.optionDescription}>I acknowledge the issue and will resolve it.</Text>
                        </View>
                        {responseType === 'accept' && (
                            <Ionicons name="radio-button-on" size={24} color={colors.success} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.optionCard,
                            { backgroundColor: isDark ? colors.neutral[800] : 'white' },
                            responseType === 'deny' && { borderColor: colors.error, borderWidth: 2 }
                        ]}
                        onPress={() => setResponseType('deny')}
                    >
                        <View style={[styles.optionIcon, { backgroundColor: colors.error + '20' }]}>
                            <Ionicons name="close-circle" size={24} color={colors.error} />
                        </View>
                        <View style={styles.optionTextContainer}>
                            <Text style={[styles.optionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Deny & Provide Evidence</Text>
                            <Text style={styles.optionDescription}>The claim is incorrect. I have proof.</Text>
                        </View>
                        {responseType === 'deny' && (
                            <Ionicons name="radio-button-on" size={24} color={colors.error} />
                        )}
                    </TouchableOpacity>
                </View>

                {responseType && (
                    <View style={styles.formContainer}>
                        <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {responseType === 'accept' ? 'Resolution Note (Optional)' : 'Explanation (Mandatory for Denial)'}
                        </Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                {
                                    backgroundColor: isDark ? colors.neutral[800] : 'white',
                                    color: isDark ? colors.text.dark : colors.text.light,
                                    borderColor: isDark ? colors.neutral[700] : colors.neutral[200]
                                }
                            ]}
                            placeholder="Provide more details here..."
                            placeholderTextColor={colors.neutral[500]}
                            multiline
                            numberOfLines={4}
                            value={note}
                            onChangeText={setNote}
                        />

                        {responseType === 'deny' && (
                            <View style={styles.evidenceSection}>
                                <View style={styles.evidenceHeader}>
                                    <Text style={[styles.label, { color: isDark ? colors.text.dark : colors.text.light, marginBottom: 0 }]}>Evidence</Text>
                                    <Text style={styles.requiredText}>Required</Text>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evidenceList}>
                                    {evidence.map((item) => (
                                        <View key={item.id} style={styles.evidenceItem}>
                                            <Image source={{ uri: item.uri }} style={styles.evidenceImage} />
                                            <TouchableOpacity
                                                style={styles.removeEvidence}
                                                onPress={() => setEvidence(evidence.filter(e => e.id !== item.id))}
                                            >
                                                <Ionicons name="close-circle" size={20} color={colors.error} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    <TouchableOpacity
                                        style={[styles.addEvidenceButton, { borderColor: colors.primary[500] }]}
                                        onPress={handleAddEvidence}
                                    >
                                        <Ionicons name="camera-outline" size={32} color={colors.primary[500]} />
                                        <Text style={[styles.addEvidenceText, { color: colors.primary[500] }]}>Add Proof</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        )}

                        <Button
                            variant="primary"
                            onPress={handleSubmit}
                            style={styles.submitButton}
                        >
                            Submit Response
                        </Button>
                    </View>
                )}
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
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    backButton: {
        padding: spacing.sm,
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
    },
    content: {
        padding: spacing.lg,
    },
    disputeCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.xl,
        ...shadows.sm,
    },
    sectionTitle: {
        ...typography.caption,
        fontWeight: '800',
        marginBottom: spacing.sm,
    },
    disputeTitle: {
        ...typography.h3,
        fontSize: 18,
        marginBottom: spacing.sm,
    },
    disputeDescription: {
        ...typography.body,
        lineHeight: 20,
        marginBottom: spacing.lg,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    infoLabel: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    infoValue: {
        ...typography.caption,
        fontWeight: '700',
    },
    mainSectionTitle: {
        ...typography.h3,
        fontSize: 20,
        marginBottom: spacing.lg,
    },
    optionsContainer: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: 2,
    },
    optionDescription: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    formContainer: {
        marginBottom: spacing.xxl,
    },
    label: {
        ...typography.bodySemiBold,
        fontSize: 14,
        marginBottom: spacing.sm,
    },
    textInput: {
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 1,
        textAlignVertical: 'top',
        marginBottom: spacing.xl,
    },
    evidenceSection: {
        marginBottom: spacing.xl,
    },
    evidenceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    requiredText: {
        ...typography.caption,
        color: colors.error,
        fontWeight: '700',
    },
    evidenceList: {
        flexDirection: 'row',
    },
    evidenceItem: {
        width: 100,
        height: 100,
        borderRadius: borderRadius.md,
        marginRight: spacing.md,
        position: 'relative',
    },
    evidenceImage: {
        width: '100%',
        height: '100%',
        borderRadius: borderRadius.md,
    },
    removeEvidence: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    addEvidenceButton: {
        width: 100,
        height: 100,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addEvidenceText: {
        ...typography.caption,
        fontWeight: '700',
        marginTop: 4,
    },
    submitButton: {
        marginTop: spacing.md,
    },
});

export default DisputeResponseScreen;
