import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Animated, Modal, Alert, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows, animations } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Pressable from '../../components/common/Pressable';
import ReviewForm from '../../components/review/ReviewForm';

import { useBookings } from '../../contexts/BookingContext';

const BookingItem = ({ item, isDark, onLeaveReview, onContact, onViewDetails, onCancel }: any) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return colors.success;
            case 'pending_payment': return colors.warning;
            case 'completed': return colors.primary[500];
            case 'cancelled': return colors.error;
            default: return colors.neutral[500];
        }
    };

    return (
        <View style={styles.bookingItem}>
            <TouchableOpacity style={styles.bookingMain} onPress={() => onViewDetails(item)}>
                <Image source={{ uri: item.propertyImage }} style={styles.propertyImage} />
                <View style={styles.bookingInfo}>
                    <Text style={[styles.propertyTitle, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                        {item.propertyTitle}
                    </Text>
                    <Text style={styles.bookingMeta}>{item.packageName} • {item.scheduledDate || 'Date TBD'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {item.status.replace('_', ' ').toUpperCase()}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            <View style={styles.bookingActions}>
                {item.status === 'completed' ? (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => onLeaveReview(item)}>
                        <Ionicons name="star-outline" size={18} color={colors.primary[500]} />
                        <Text style={styles.actionBtnText}>Review</Text>
                    </TouchableOpacity>
                ) : item.status !== 'cancelled' ? (
                    <>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => onContact(item)}>
                            <Ionicons name="chatbubble-outline" size={18} color={colors.text.light} />
                            <Text style={styles.actionBtnText}>Contact</Text>
                        </TouchableOpacity>
                        {item.status === 'pending_payment' && (
                            <TouchableOpacity style={[styles.actionBtn, styles.payBtn]}>
                                <Ionicons name="card-outline" size={18} color="white" />
                                <Text style={[styles.actionBtnText, { color: 'white' }]}>Pay Now</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.actionBtn} onPress={() => onCancel(item)}>
                            <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                            <Text style={[styles.actionBtnText, { color: colors.error }]}>Cancel</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text style={[styles.actionBtnText, { color: colors.neutral[400] }]}>Booking Cancelled</Text>
                )}
            </View>
        </View>
    );
};

const BookingsScreen = ({ hideHeader = false }: { hideHeader?: boolean }) => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const { bookings, cancelBooking } = useBookings();
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

    const handleLeaveReview = (booking: any) => {
        setSelectedBooking(booking);
        setShowReviewModal(true);
    };

    const submitReview = (data: any) => {
        setShowReviewModal(false);
        Alert.alert('Success', 'Thank you for your review!');
    };

    const filteredBookings = bookings.filter(booking => {
        if (activeTab === 'upcoming') {
            return booking.status === 'confirmed' || booking.status === 'pending_payment';
        }
        return booking.status === 'completed' || booking.status === 'cancelled';
    });

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {!hideHeader && (
                <SafeAreaView edges={['top']} style={styles.header}>
                    <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>Trips</Text>
                </SafeAreaView>
            )}

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
                    onPress={() => setActiveTab('upcoming')}
                >
                    <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'past' && styles.activeTab]}
                    onPress={() => setActiveTab('past')}
                >
                    <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Past</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredBookings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <BookingItem
                        item={item}
                        isDark={isDark}
                        onLeaveReview={handleLeaveReview}
                        onContact={(booking: any) => (navigation as any).navigate('MessagesTab', {
                            screen: 'Chat',
                            params: {
                                conversationId: booking.id,
                                otherPartyName: booking.hunterName,
                                propertyTitle: booking.propertyTitle
                            }
                        })}
                        onViewDetails={(booking: any) => (navigation as any).navigate('ExploreTab', {
                            screen: 'PropertyDetail',
                            params: { propertyId: booking.propertyId }
                        })}
                        onCancel={(booking: any) => Alert.alert('Cancel Booking', 'Are you sure?', [
                            { text: 'No', style: 'cancel' },
                            { text: 'Yes', style: 'destructive', onPress: () => Alert.alert('Cancelled', 'Your booking has been cancelled.') }
                        ])}
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {activeTab === 'upcoming' ? 'No upcoming trips' : 'No past trips'}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {activeTab === 'upcoming'
                                ? "When you're ready to start planning your next trip, we're here to help."
                                : "You haven't taken any trips yet."}
                        </Text>
                    </View>
                }
            />

            <Modal
                visible={showReviewModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowReviewModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <ReviewForm
                        hunterName={selectedBooking?.hunterName || ''}
                        propertyTitle={selectedBooking?.propertyTitle || ''}
                        onSubmit={submitReview}
                        onCancel={() => setShowReviewModal(false)}
                    />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
    },
    title: {
        ...typography.h1,
        fontSize: 32,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    tab: {
        paddingVertical: spacing.md,
        marginRight: spacing.xl,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.text.light,
    },
    tabText: {
        ...typography.bodySemiBold,
        color: colors.neutral[500],
    },
    activeTabText: {
        color: colors.text.light,
    },
    list: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 100,
    },
    bookingItem: {
        backgroundColor: 'white',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.neutral[100],
    },
    bookingMain: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    propertyImage: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.md,
    },
    bookingInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    propertyTitle: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: 4,
    },
    bookingMeta: {
        ...typography.caption,
        color: colors.neutral[500],
        marginBottom: 8,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        ...typography.caption,
        fontWeight: '700',
        fontSize: 10,
    },
    bookingActions: {
        flexDirection: 'row',
        marginTop: spacing.md,
        gap: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
    },
    payBtn: {
        backgroundColor: colors.success,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
    },
    actionBtnText: {
        ...typography.caption,
        fontWeight: '700',
        color: colors.text.light,
    },
    bookingHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    bookingLocation: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    bookingDates: {
        ...typography.caption,
        color: colors.neutral[500],
        marginBottom: 2,
    },
    bookingHunter: {
        ...typography.caption,
        color: colors.neutral[400],
    },
    reviewLink: {
        ...typography.caption,
        color: colors.primary[500],
        fontWeight: '700',
        marginTop: 4,
        textDecorationLine: 'underline',
    },
    emptyState: {
        paddingTop: 60,
    },
    emptyTitle: {
        ...typography.h3,
        marginBottom: spacing.sm,
    },
    emptySubtext: {
        ...typography.body,
        color: colors.neutral[500],
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
});

export default BookingsScreen;
