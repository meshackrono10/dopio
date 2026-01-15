import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Linking,
    Dimensions,
    Image,
    Animated,
    Alert,
    Modal,
    TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ImageGallery from '../../components/property/ImageGallery';
import Button from '../../components/common/Button';
import { getPropertyById, getReviewsByPropertyId } from '../../services/mockData';
import { SearchStackParamList } from '../../types/navigation';
import { useWishlist } from '../../contexts/WishlistContext';
import { useComparison } from '../../contexts/ComparisonContext';
import { useToast } from '../../contexts/ToastContext';
import { useInvoices } from '../../contexts/InvoiceContext';

const { width } = Dimensions.get('window');

type PropertyDetailScreenRouteProp = RouteProp<SearchStackParamList, 'PropertyDetail'>;
type PropertyDetailScreenNavigationProp = StackNavigationProp<SearchStackParamList, 'PropertyDetail'>;

const PropertyDetailScreen = () => {
    const route = useRoute<PropertyDetailScreenRouteProp>();
    const navigation = useNavigation<PropertyDetailScreenNavigationProp>();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const { propertyId } = route.params;
    const scrollY = useRef(new Animated.Value(0)).current;
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { addToComparison, removeFromComparison, isInComparison, maxComparisonReached } = useComparison();
    const { showToast } = useToast();
    const { createViewingRequest } = useInvoices();
    const [selectedPackageId, setSelectedPackageId] = useState<string | number | null>(null);

    // Viewing Request Modal State
    const [requestModalVisible, setRequestModalVisible] = useState(false);
    const [requestDate, setRequestDate] = useState('');
    const [requestTime, setRequestTime] = useState('');
    const [requestMessage, setRequestMessage] = useState('');
    const [requestLoading, setRequestLoading] = useState(false);

    const handleToggleCompare = () => {
        if (!property) return;

        if (isInComparison(property.id.toString())) {
            removeFromComparison(property.id.toString());
            showToast('success', 'Removed from comparison');
        } else {
            const added = addToComparison(property);
            if (added) {
                showToast('success', 'Added to comparison');
            } else {
                if (maxComparisonReached) {
                    showToast('error', 'Maximum 4 properties can be compared');
                } else {
                    showToast('info', 'Property already in comparison');
                }
            }
        }
    };

    const handleRequestViewing = async () => {
        if (!requestDate || !requestTime) {
            showToast('error', 'Please select a date and time');
            return;
        }

        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in to request a viewing.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign In', onPress: () => (navigation as any).navigate('Auth') },
            ]);
            return;
        }

        setRequestLoading(true);
        try {
            const selectedPkg = property?.viewingPackages?.find(p => p.id === selectedPackageId);

            createViewingRequest({
                propertyId: property!.id.toString(),
                propertyTitle: property!.title,
                tenantId: user.id,
                tenantName: user.name,
                tenantPhone: user.phoneNumber,
                hunterId: property!.houseHunter.id.toString(),
                hunterName: property!.houseHunter.name,
                proposedDates: [
                    {
                        date: requestDate,
                        timeSlot: requestTime.includes('AM') ? 'morning' : requestTime.includes('2:00') ? 'afternoon' : 'evening',
                    }
                ],
                message: requestMessage || undefined,
            });

            setRequestModalVisible(false);
            setRequestDate('');
            setRequestTime('');
            setRequestMessage('');

            Alert.alert(
                'Request Sent!',
                'Your viewing request has been sent to the House Hunter. You\'ll be notified when they respond.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            showToast('error', 'Failed to send request. Please try again.');
        } finally {
            setRequestLoading(false);
        }
    };

    const property = getPropertyById(propertyId);
    const reviews = getReviewsByPropertyId(propertyId);

    if (!property) {
        return (
            <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                <Text style={{ color: isDark ? colors.text.dark : colors.text.light }}>Property not found</Text>
            </View>
        );
    }

    const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;

    const headerOpacity = scrollY.interpolate({
        inputRange: [200, 300],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Sticky Header */}
            <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity, backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                <SafeAreaView edges={['top']} style={styles.stickyHeaderContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color={isDark ? colors.text.dark : colors.text.light} />
                    </TouchableOpacity>
                    <Text style={[styles.stickyTitle, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                        {property.title}
                    </Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={handleToggleCompare}>
                            <Ionicons
                                name={isInComparison(property.id.toString()) ? "git-compare" : "git-compare-outline"}
                                size={22}
                                color={isInComparison(property.id.toString()) ? colors.primary[600] : (isDark ? colors.text.dark : colors.text.light)}
                            />
                        </TouchableOpacity>
                        <Ionicons name="share-outline" size={22} color={isDark ? colors.text.dark : colors.text.light} />
                        <TouchableOpacity onPress={() => toggleWishlist(property.id)}>
                            <Ionicons
                                name={isInWishlist(property.id) ? "heart" : "heart-outline"}
                                size={22}
                                color={isInWishlist(property.id) ? colors.error[500] : (isDark ? colors.text.dark : colors.text.light)}
                            />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Animated.View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Image Gallery */}
                <View style={styles.galleryContainer}>
                    <ImageGallery images={property.images as string[]} />
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerActionsAbsolute}>
                        <TouchableOpacity style={styles.actionIcon} onPress={handleToggleCompare}>
                            <Ionicons
                                name={isInComparison(property.id.toString()) ? "git-compare" : "git-compare-outline"}
                                size={22}
                                color={isInComparison(property.id.toString()) ? colors.primary[500] : "white"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionIcon}>
                            <Ionicons name="share-outline" size={22} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionIcon} onPress={() => toggleWishlist(property.id)}>
                            <Ionicons
                                name={isInWishlist(property.id) ? "heart" : "heart-outline"}
                                size={22}
                                color={isInWishlist(property.id) ? colors.error[500] : "white"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.section}>
                        <Text style={[styles.title, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {property.title}
                        </Text>
                        <Text style={[styles.locationText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {property.location.generalArea}, {property.location.county}
                        </Text>
                        <Text style={[styles.detailsText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            {property.layout} · {property.bathrooms} Bath · {property.furnished}
                        </Text>

                        <View style={styles.ratingSummary}>
                            <Ionicons name="star" size={16} color={colors.text.light} />
                            <Text style={[styles.ratingText, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {property.averageRating} · {reviews.length} reviews
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Host Info */}
                    <View style={styles.section}>
                        <View style={styles.hostRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.hostTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                    Managed by {property.houseHunter.name}
                                </Text>
                                <Text style={[styles.hostSubtitle, { color: colors.neutral[500] }]}>
                                    Verified House Hunter · {property.houseHunter.rating} rating
                                </Text>
                            </View>
                            <Image source={{ uri: property.houseHunter.profilePhoto }} style={styles.hostAvatar} />
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={[styles.description, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                            {property.description}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Amenities */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            What this place offers
                        </Text>
                        <View style={styles.amenitiesList}>
                            {property.amenities.slice(0, 6).map((amenity, index) => (
                                <View key={index} style={styles.amenityItem}>
                                    <Ionicons name="checkmark-outline" size={24} color={colors.neutral[700]} />
                                    <Text style={[styles.amenityText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                                        {amenity}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        {property.amenities.length > 6 && (
                            <Button variant="outline" style={{ marginTop: spacing.md }} onPress={() => {
                                // Show toast with all amenities for now
                                const allAmenities = property.amenities.join(', ');
                                alert(`All Amenities:\n\n${allAmenities}`);
                            }}>
                                Show all {property.amenities.length} amenities
                            </Button>
                        )}
                    </View>

                    <View style={styles.divider} />

                    {/* Viewing Packages */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Select a Viewing Package
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.packagesScroll}>
                            {property.viewingPackages?.map((pkg) => {
                                const isSelected = selectedPackageId === pkg.id;
                                return (
                                    <TouchableOpacity
                                        key={pkg.id}
                                        style={[
                                            styles.packageCard,
                                            {
                                                backgroundColor: isDark ? colors.neutral[800] : 'white',
                                                borderColor: isSelected ? colors.primary[500] : colors.neutral[200],
                                                borderWidth: isSelected ? 2 : 1,
                                            }
                                        ]}
                                        onPress={() => setSelectedPackageId(pkg.id)}
                                    >
                                        <View style={[
                                            styles.packageBadge,
                                            { backgroundColor: pkg.tier === 'platinum' ? colors.neutral[900] : pkg.tier === 'gold' ? '#FFD700' : '#CD7F32' }
                                        ]}>
                                            <Text style={[styles.packageBadgeText, { color: pkg.tier === 'gold' ? 'black' : 'white' }]}>
                                                {pkg.tier.toUpperCase()}
                                            </Text>
                                        </View>
                                        <Text style={[styles.packageName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                            {pkg.name}
                                        </Text>
                                        <Text style={[styles.packagePrice, { color: colors.primary[500] }]}>
                                            KES {pkg.price.toLocaleString()}
                                        </Text>
                                        <Text style={[styles.packageDesc, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                                            {pkg.description}
                                        </Text>
                                        <View style={styles.packageFeatures}>
                                            <Ionicons name="time-outline" size={14} color={colors.neutral[500]} />
                                            <Text style={[styles.packageFeatureText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
                                                {pkg.duration}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    <View style={styles.divider} />

                    {/* Reviews */}
                    <View style={styles.section}>
                        <View style={styles.reviewHeaderRow}>
                            <Ionicons name="star" size={20} color={colors.text.light} />
                            <Text style={[styles.reviewTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                {property.averageRating} · {reviews.length} reviews
                            </Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reviewsScroll}>
                            {reviews.map((review) => (
                                <View key={review.id} style={[styles.reviewCard, { borderColor: colors.neutral[200] }]}>
                                    <View style={styles.reviewUserRow}>
                                        <Image source={{ uri: review.tenantAvatar }} style={styles.reviewAvatar} />
                                        <View>
                                            <Text style={[styles.reviewName, { color: isDark ? colors.text.dark : colors.text.light }]}>{review.tenantName}</Text>
                                            <Text style={[styles.reviewDate, { color: colors.neutral[500] }]}>{review.createdAt}</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.reviewComment, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]} numberOfLines={4}>
                                        {review.comment}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Animated.ScrollView>

            {/* Sticky Bottom Bar */}
            <SafeAreaView edges={['bottom']} style={[styles.bottomBar, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                <View style={styles.bottomBarContent}>
                    <View>
                        <View style={styles.bottomPriceRow}>
                            <Text style={[styles.bottomPrice, { color: isDark ? colors.text.dark : colors.text.light }]}>{formatPrice(property.rent)}</Text>
                            <Text style={[styles.bottomPerMonth, { color: isDark ? colors.text.dark : colors.text.light }]}> month</Text>
                        </View>
                        <Text style={[styles.bottomDate, { color: isDark ? colors.text.dark : colors.text.light }]}>Available now</Text>
                    </View>
                    <Button
                        onPress={() => {
                            if (!selectedPackageId) {
                                showToast('info', 'Please select a viewing package first');
                                return;
                            }
                            setRequestModalVisible(true);
                        }}
                        style={styles.bookButton}
                        disabled={!selectedPackageId}
                    >
                        Request Viewing
                    </Button>
                </View>
            </SafeAreaView>

            {/* Viewing Request Modal */}
            <Modal
                visible={requestModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setRequestModalVisible(false)}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setRequestModalVisible(false)}>
                            <Ionicons name="close" size={28} color={isDark ? colors.text.dark : colors.text.light} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            Request Viewing
                        </Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.modalContent}>
                        {/* Property Summary */}
                        <View style={[styles.modalCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <Image source={{ uri: (property.images as string[])[0] }} style={styles.modalPropertyImage} />
                            <View style={styles.modalPropertyInfo}>
                                <Text style={[styles.modalPropertyTitle, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                                    {property.title}
                                </Text>
                                <Text style={styles.modalPropertyLocation}>
                                    {property.location.generalArea}
                                </Text>
                                <Text style={styles.modalPropertyHunter}>
                                    Hunter: {property.houseHunter.name}
                                </Text>
                            </View>
                        </View>

                        {/* Date Selection */}
                        <View style={[styles.modalCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <Text style={[styles.modalLabel, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                Proposed Date *
                            </Text>
                            <RNTextInput
                                style={[styles.modalInput, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100], color: isDark ? colors.text.dark : colors.text.light }]}
                                placeholder="e.g., Tomorrow, January 15, 2026"
                                placeholderTextColor={colors.neutral[400]}
                                value={requestDate}
                                onChangeText={setRequestDate}
                            />

                            <Text style={[styles.modalLabel, { color: isDark ? colors.text.dark : colors.text.light, marginTop: spacing.md }]}>
                                Preferred Time *
                            </Text>
                            <View style={styles.timeOptions}>
                                {['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'].map((time) => (
                                    <TouchableOpacity
                                        key={time}
                                        style={[
                                            styles.timeOption,
                                            requestTime === time && { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
                                        ]}
                                        onPress={() => setRequestTime(time)}
                                    >
                                        <Text style={[
                                            styles.timeOptionText,
                                            { color: requestTime === time ? 'white' : colors.neutral[600] },
                                        ]}>
                                            {time}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.modalLabel, { color: isDark ? colors.text.dark : colors.text.light, marginTop: spacing.md }]}>
                                Message (Optional)
                            </Text>
                            <RNTextInput
                                style={[styles.modalInput, styles.modalTextArea, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100], color: isDark ? colors.text.dark : colors.text.light }]}
                                placeholder="Any specific requirements or questions..."
                                placeholderTextColor={colors.neutral[400]}
                                value={requestMessage}
                                onChangeText={setRequestMessage}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Fee Info */}
                        <View style={[styles.modalCard, { backgroundColor: colors.primary[500] + '15' }]}>
                            <View style={styles.feeRow}>
                                <Text style={{ color: colors.neutral[600] }}>Viewing Fee</Text>
                                <Text style={{ color: colors.primary[500], fontWeight: '700' }}>
                                    KES {property.viewingPackages?.find(p => p.id === selectedPackageId)?.price?.toLocaleString() || '500'}
                                </Text>
                            </View>
                            <Text style={[styles.feeNote, { color: colors.neutral[500] }]}>
                                You'll only be charged after the Hunter accepts your request.
                            </Text>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <Button
                            onPress={handleRequestViewing}
                            style={{ flex: 1 }}
                            loading={requestLoading}
                        >
                            Send Request
                        </Button>
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    stickyHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
        gap: spacing.md,
    },
    stickyTitle: {
        ...typography.bodySemiBold,
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    galleryContainer: {
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: spacing.lg,
        width: 32,
        height: 32,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    headerActionsAbsolute: {
        position: 'absolute',
        top: 50,
        right: spacing.lg,
        flexDirection: 'row',
        gap: spacing.md,
        zIndex: 10,
    },
    actionIcon: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        paddingTop: spacing.xl,
        paddingBottom: 120,
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    divider: {
        height: 1,
        backgroundColor: colors.neutral[100],
        marginHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h2,
        marginBottom: spacing.xs,
    },
    locationText: {
        ...typography.bodySemiBold,
        marginBottom: 4,
    },
    detailsText: {
        ...typography.bodySmall,
        marginBottom: spacing.sm,
    },
    ratingSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        ...typography.bodySmall,
        fontWeight: '600',
    },
    hostRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    hostTitle: {
        ...typography.h3,
        fontSize: 20,
    },
    hostSubtitle: {
        ...typography.bodySmall,
        marginTop: 2,
    },
    hostAvatar: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.full,
    },
    description: {
        ...typography.body,
        lineHeight: 24,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.lg,
    },
    amenitiesList: {
        gap: spacing.md,
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    amenityText: {
        ...typography.body,
    },
    reviewHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: spacing.lg,
    },
    reviewTitle: {
        ...typography.h3,
    },
    reviewsScroll: {
        gap: spacing.md,
    },
    reviewCard: {
        width: 280,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
    },
    reviewUserRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    reviewAvatar: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
    },
    reviewName: {
        ...typography.bodySemiBold,
    },
    reviewDate: {
        ...typography.caption,
    },
    reviewComment: {
        ...typography.body,
        lineHeight: 20,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    bottomBarContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bottomPriceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    bottomPrice: {
        ...typography.bodySemiBold,
        fontSize: 18,
    },
    bottomPerMonth: {
        ...typography.bodySmall,
    },
    bottomDate: {
        ...typography.bodySmall,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    bookButton: {
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.md,
    },
    packagesScroll: {
        gap: spacing.md,
        paddingRight: spacing.lg,
    },
    packageCard: {
        width: 200,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        marginRight: spacing.md,
    },
    packageBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.sm,
    },
    packageBadgeText: {
        ...typography.caption,
        fontWeight: 'bold',
        fontSize: 10,
    },
    packageName: {
        ...typography.bodySemiBold,
        marginBottom: 4,
    },
    packagePrice: {
        ...typography.bodySemiBold,
        fontSize: 16,
        marginBottom: spacing.sm,
    },
    packageDesc: {
        ...typography.caption,
        marginBottom: spacing.md,
        height: 36, // Fixed height for alignment
    },
    packageFeatures: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    packageFeatureText: {
        ...typography.caption,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    modalTitle: {
        ...typography.h3,
        fontSize: 18,
    },
    modalContent: {
        padding: spacing.lg,
    },
    modalCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    modalPropertyImage: {
        width: 80,
        height: 60,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
    },
    modalPropertyInfo: {},
    modalPropertyTitle: {
        ...typography.bodySemiBold,
    },
    modalPropertyLocation: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    modalPropertyHunter: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    modalLabel: {
        ...typography.bodySemiBold,
        fontSize: 14,
        marginBottom: spacing.sm,
    },
    modalInput: {
        height: 48,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        ...typography.body,
    },
    modalTextArea: {
        height: 100,
        paddingTop: spacing.md,
        textAlignVertical: 'top',
    },
    timeOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    timeOption: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[300],
    },
    timeOptionText: {
        ...typography.body,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    feeNote: {
        ...typography.caption,
    },
    modalFooter: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
});

export default PropertyDetailScreen;
