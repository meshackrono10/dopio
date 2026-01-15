import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { MainTabParamList, SearchStackParamList, MessagesStackParamList, ProfileStackParamList, BookingsStackParamList } from '../types/navigation';
import { colors, spacing, typography } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_USERS } from '../services/mockData';

// Existing Screens
import ExploreScreen from '../screens/explore/ExploreScreen';
import SavedScreen from '../screens/saved/SavedScreen';
import SearchScreen from '../screens/search/SearchScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ChatScreen from '../screens/messages/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PropertyDetailScreen from '../screens/properties/PropertyDetailScreen';
import SearchRequestLandingScreen from '../screens/search/SearchRequestLandingScreen';
import CreateSearchRequestScreen from '../screens/search/CreateSearchRequestScreen';
import HunterDashboardScreen from '../screens/hunter/HunterDashboardScreen';
import TenantDashboardScreen from '../screens/tenant/TenantDashboardScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import MyReviewsScreen from '../screens/profile/MyReviewsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import CheckoutScreen from '../screens/checkout/CheckoutScreen';
import BookingConfirmationScreen from '../screens/bookings/BookingConfirmationScreen';
import SearchRequestDetailScreen from '../screens/search-request/SearchRequestDetailScreen';
import AddListingScreen from '../screens/properties/AddListingScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import WithdrawScreen from '../screens/wallet/WithdrawScreen';
import HelpCenterScreen from '../screens/help/HelpCenterScreen';
import ContactScreen from '../screens/help/ContactScreen';
import HowItWorksScreen from '../screens/help/HowItWorksScreen';
import ReportIssueScreen from '../screens/issues/ReportIssueScreen';
import AdminDisputesScreen from '../screens/admin/AdminDisputesScreen';
import AdminAnalyticsScreen from '../screens/admin/AdminAnalyticsScreen';
import PropertyComparisonScreen from '../screens/properties/PropertyComparisonScreen';
import EarningsScreen from '../screens/earnings/EarningsScreen';
import ReviewsScreen from '../screens/reviews/ReviewsScreen';
import HunterListingsScreen from '../screens/hunter/HunterListingsScreen';
import EditPropertyScreen from '../screens/properties/EditPropertyScreen';
import ActivityScreen from '../screens/ActivityScreen';
import BidReviewScreen from '../screens/search-request/BidReviewScreen';
import EvidenceReviewScreen from '../screens/search-request/EvidenceReviewScreen';
import PropertyAnalyticsScreen from '../screens/properties/PropertyAnalyticsScreen';
import AdminVerificationsScreen from '../screens/admin/AdminVerificationsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import MyIssuesScreen from '../screens/issues/MyIssuesScreen';
import DisputeResponseScreen from '../screens/issues/DisputeResponseScreen';
import HunterOrdersScreen from '../screens/hunter/HunterOrdersScreen';
import UsersScreen from '../screens/admin/UsersScreen';
import ViewingRequestScreen from '../screens/bookings/ViewingRequestScreen';
import InvoiceScreen from '../screens/bookings/InvoiceScreen';
import PostViewingScreen from '../screens/bookings/PostViewingScreen';
import MeetupDayScreen from '../screens/bookings/MeetupDayScreen';
import VerificationScreen from '../screens/verification/VerificationScreen';
import PrivacyPolicyScreen from '../screens/legal/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/legal/TermsOfServiceScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const ExploreStack = createStackNavigator<SearchStackParamList>();
const HunterStack = createStackNavigator<SearchStackParamList>();
const MessagesStack = createStackNavigator<MessagesStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const BookingsStack = createStackNavigator<BookingsStackParamList>();

// Hunter Screens Stack - Requests/Search Requests
function HunterRequestsNavigator() {
    return (
        <HunterStack.Navigator screenOptions={{ headerShown: false }}>
            <HunterStack.Screen name="SearchRequests" component={SearchScreen} />
            <HunterStack.Screen name="SearchRequestDetail" component={SearchRequestDetailScreen} />
            <HunterStack.Screen name="CreateSearchRequest" component={CreateSearchRequestScreen} />
            <HunterStack.Screen name="BidReview" component={BidReviewScreen} />
            <HunterStack.Screen name="EvidenceReview" component={EvidenceReviewScreen} />
        </HunterStack.Navigator>
    );
}

// Explore Stack for Tenants
function ExploreStackNavigator() {
    return (
        <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
            <ExploreStack.Screen name="Explore" component={ExploreScreen} />
            <ExploreStack.Screen name="Search" component={SearchScreen} />
            <ExploreStack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
            <ExploreStack.Screen name="SearchRequestLanding" component={SearchRequestLandingScreen} />
            <ExploreStack.Screen name="CreateSearchRequest" component={CreateSearchRequestScreen} />
            <ExploreStack.Screen name="SearchRequestDetail" component={SearchRequestDetailScreen} />
            <ExploreStack.Screen name="Checkout" component={CheckoutScreen} />
            <ExploreStack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
            <ExploreStack.Screen name="PropertyComparison" component={PropertyComparisonScreen} />
            <ExploreStack.Screen name="BidReview" component={BidReviewScreen} />
            <ExploreStack.Screen name="EvidenceReview" component={EvidenceReviewScreen} />
        </ExploreStack.Navigator>
    );
}

// Search Stack for Tenants (Dedicated Search Tab)
function TenantSearchStackNavigator() {
    return (
        <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
            <ExploreStack.Screen name="SearchRequestLanding" component={SearchRequestLandingScreen} />
            <ExploreStack.Screen name="CreateSearchRequest" component={CreateSearchRequestScreen} />
            <ExploreStack.Screen name="SearchRequestDetail" component={SearchRequestDetailScreen} />
            <ExploreStack.Screen name="Search" component={SearchScreen} />
            <ExploreStack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
            <ExploreStack.Screen name="BidReview" component={BidReviewScreen} />
            <ExploreStack.Screen name="EvidenceReview" component={EvidenceReviewScreen} />
        </ExploreStack.Navigator>
    );
}

// Messages Stack
function MessagesStackNavigator() {
    return (
        <MessagesStack.Navigator screenOptions={{ headerShown: false }}>
            <MessagesStack.Screen name="Messages" component={MessagesScreen} />
            <MessagesStack.Screen name="Chat" component={ChatScreen} />
        </MessagesStack.Navigator>
    );
}

// Profile Stack
function ProfileStackNavigator() {
    return (
        <ProfileStack.Navigator initialRouteName="Profile" screenOptions={{ headerShown: false }}>
            <ProfileStack.Screen name="Profile" component={ProfileScreen} />
            <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
            <ProfileStack.Screen name="MyReviews" component={MyReviewsScreen} />
            <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
            <ProfileStack.Screen name="Wallet" component={WalletScreen} />
            <ProfileStack.Screen name="Withdraw" component={WithdrawScreen} />
            <ProfileStack.Screen name="HelpCenter" component={HelpCenterScreen} />
            <ProfileStack.Screen name="Contact" component={ContactScreen} />
            <ProfileStack.Screen name="HowItWorks" component={HowItWorksScreen} />
            <ProfileStack.Screen name="ReportIssue" component={ReportIssueScreen} />
            <ProfileStack.Screen name="MyIssues" component={MyIssuesScreen} />
            <ProfileStack.Screen name="DisputeResponse" component={DisputeResponseScreen} />
            <ProfileStack.Screen name="AddListing" component={AddListingScreen} />
            <ProfileStack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
            <ProfileStack.Screen name="EditProperty" component={EditPropertyScreen} />
            <ProfileStack.Screen name="TenantDashboard" component={TenantDashboardScreen} />
            <ProfileStack.Screen name="HunterDashboard" component={HunterDashboardScreen} />
            <ProfileStack.Screen name="CreateSearchRequest" component={CreateSearchRequestScreen} />
            <ProfileStack.Screen name="SearchRequestDetail" component={SearchRequestDetailScreen} />
            <ProfileStack.Screen name="PropertyComparison" component={PropertyComparisonScreen} />
            <ProfileStack.Screen name="PropertyAnalytics" component={PropertyAnalyticsScreen} />
            <ProfileStack.Screen name="AdminVerifications" component={AdminVerificationsScreen} />
            <ProfileStack.Screen name="AdminSettings" component={AdminSettingsScreen} />
            <ProfileStack.Screen name="Earnings" component={EarningsScreen} />
            <ProfileStack.Screen name="Reviews" component={ReviewsScreen} />
            <ProfileStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <ProfileStack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
        </ProfileStack.Navigator>
    );
}

// Bookings Stack
function BookingsStackNavigator() {
    return (
        <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
            <BookingsStack.Screen name="Bookings" component={BookingsScreen} />
            <BookingsStack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
            <BookingsStack.Screen name="ViewingRequests" component={ViewingRequestScreen} />
            <BookingsStack.Screen name="Invoice" component={InvoiceScreen} />
            <BookingsStack.Screen name="PostViewing" component={PostViewingScreen} />
            <BookingsStack.Screen name="MeetupDay" component={MeetupDayScreen} />
            <BookingsStack.Screen name="Verification" component={VerificationScreen} />
        </BookingsStack.Navigator>
    );
}

const MainNavigator = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();

    // Professional tab bar styling
    const tabBarOptions = {
        activeTintColor: colors.primary[500],
        inactiveTintColor: isDark ? colors.neutral[400] : colors.neutral[500],
        style: {
            backgroundColor: isDark ? colors.neutral[900] : '#FFFFFF',
            borderTopColor: isDark ? colors.neutral[800] : colors.neutral[100],
            height: 70,
            paddingBottom: 10,
            paddingTop: 8,
            borderTopWidth: 1,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
        },
        labelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 4,
        },
    };

    // Hunter Navigation: Dashboard, Requests, Earnings, Reviews, Inbox, Profile
    if (user?.role === 'hunter') {
        return (
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color }) => {
                        let iconName: keyof typeof Ionicons.glyphMap;

                        switch (route.name) {
                            case 'DashboardTab':
                                iconName = focused ? 'grid' : 'grid-outline';
                                break;
                            case 'ListingsTab':
                                iconName = focused ? 'home' : 'home-outline';
                                break;
                            case 'RequestsTab':
                                iconName = focused ? 'search' : 'search-outline';
                                break;
                            case 'EarningsTab':
                                iconName = focused ? 'wallet' : 'wallet-outline';
                                break;
                            case 'ReviewsTab':
                                iconName = focused ? 'star' : 'star-outline';
                                break;
                            case 'MessagesTab':
                                iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                                break;
                            case 'OrdersTab':
                                iconName = focused ? 'clipboard' : 'clipboard-outline';
                                break;
                            case 'ProfileTab':
                                iconName = focused ? 'person' : 'person-outline';
                                break;
                            default:
                                iconName = 'help-circle-outline';
                        }

                        return <Ionicons name={iconName} size={26} color={color} />;
                    },
                    ...tabBarOptions,
                    headerShown: false,
                })}
            >
                <Tab.Screen
                    name="DashboardTab"
                    component={HunterDashboardScreen}
                    options={{ tabBarLabel: 'Home', headerShown: false }}
                />
                <Tab.Screen
                    name="ListingsTab"
                    component={HunterListingsScreen}
                    options={{ tabBarLabel: 'Listings', headerShown: false }}
                />
                <Tab.Screen
                    name="RequestsTab"
                    component={HunterRequestsNavigator}
                    options={{ tabBarLabel: 'Requests' }}
                />
                <Tab.Screen
                    name="OrdersTab"
                    component={HunterOrdersScreen}
                    options={{ tabBarLabel: 'Orders', headerShown: false }}
                />
                <Tab.Screen
                    name="MessagesTab"
                    component={MessagesStackNavigator}
                    options={{ tabBarLabel: 'Inbox' }}
                />
                <Tab.Screen
                    name="ProfileTab"
                    component={ProfileStackNavigator}
                    options={{ tabBarLabel: 'Profile' }}
                />
            </Tab.Navigator>
        );
    }

    // Tenant Navigation: Explore, Search, Bookings, Inbox, Profile
    if (user?.role === 'tenant') {
        return (
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color }) => {
                        let iconName: keyof typeof Ionicons.glyphMap;

                        switch (route.name) {
                            case 'DashboardTab':
                                iconName = focused ? 'grid' : 'grid-outline';
                                break;
                            case 'ExploreTab':
                                iconName = focused ? 'home' : 'home-outline';
                                break;
                            case 'SearchTab':
                                iconName = focused ? 'search-circle' : 'search-circle-outline';
                                break;
                            case 'ActivityTab':
                                iconName = focused ? 'list' : 'list-outline';
                                break;
                            case 'MessagesTab':
                                iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                                break;
                            case 'ProfileTab':
                                iconName = focused ? 'person' : 'person-outline';
                                break;
                            default:
                                iconName = 'help-circle-outline';
                        }

                        return <Ionicons name={iconName} size={26} color={color} />;
                    },
                    ...tabBarOptions,
                    headerShown: false,
                })}
            >
                <Tab.Screen
                    name="ExploreTab"
                    component={ExploreStackNavigator}
                    options={{ tabBarLabel: 'Explore' }}
                />
                <Tab.Screen
                    name="SearchTab"
                    component={TenantSearchStackNavigator}
                    options={{ tabBarLabel: 'Search' }}
                />
                <Tab.Screen
                    name="ActivityTab"
                    component={ActivityScreen}
                    options={{ tabBarLabel: 'Activity' }}
                />
                <Tab.Screen
                    name="MessagesTab"
                    component={MessagesStackNavigator}
                    options={{ tabBarLabel: 'Inbox' }}
                />
                <Tab.Screen
                    name="DashboardTab"
                    component={TenantDashboardScreen}
                    options={{ tabBarLabel: 'Dashboard' }}
                />
                <Tab.Screen
                    name="ProfileTab"
                    component={ProfileStackNavigator}
                    options={{ tabBarLabel: 'Profile' }}
                />
            </Tab.Navigator>
        );
    }

    // Admin Navigation: Dashboard, Analytics, Disputes, Users, Profile
    if (user?.role === 'admin') {
        return (
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color }) => {
                        let iconName: keyof typeof Ionicons.glyphMap;

                        switch (route.name) {
                            case 'DashboardTab':
                                iconName = focused ? 'grid' : 'grid-outline';
                                break;
                            case 'AnalyticsTab':
                                iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                                break;
                            case 'DisputesTab':
                                iconName = focused ? 'alert-circle' : 'alert-circle-outline';
                                break;
                            case 'UsersTab':
                                iconName = focused ? 'people' : 'people-outline';
                                break;
                            case 'ProfileTab':
                                iconName = focused ? 'settings' : 'settings-outline';
                                break;
                            default:
                                iconName = 'help-circle-outline';
                        }

                        return <Ionicons name={iconName} size={26} color={color} />;
                    },
                    ...tabBarOptions,
                    headerShown: false,
                })}
            >
                <Tab.Screen
                    name="DashboardTab"
                    component={DashboardScreen}
                    options={{ tabBarLabel: 'Dashboard' }}
                />
                <Tab.Screen
                    name="AnalyticsTab"
                    component={AdminAnalyticsScreen}
                    options={{ tabBarLabel: 'Analytics' }}
                />
                <Tab.Screen
                    name="DisputesTab"
                    component={AdminDisputesScreen}
                    options={{ tabBarLabel: 'Disputes' }}
                />
                <Tab.Screen
                    name="UsersTab"
                    component={UsersScreen}
                    options={{
                        tabBarLabel: 'Users',
                        tabBarBadge: MOCK_USERS.filter(u => u.role === 'hunter' && (u.id === 'user-2' || u.id === 'user-3')).length || undefined
                    }}
                />
                <Tab.Screen
                    name="ProfileTab"
                    component={ProfileStackNavigator}
                    options={{ tabBarLabel: 'Settings' }}
                />
            </Tab.Navigator>
        );
    }

    // Default fallback (should not reach here)
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="ExploreTab" component={ExploreStackNavigator} />
            <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} />
        </Tab.Navigator>
    );
};

export default MainNavigator;
