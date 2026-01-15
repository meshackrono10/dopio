import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/common/Button';

type OrderStatus = 'pending' | 'active' | 'completed' | 'cancelled';

interface Order {
    id: string;
    tenantName: string;
    tenantAvatar: string;
    propertyTitle: string;
    propertyImage: string;
    date: string;
    time: string;
    amount: number;
    status: OrderStatus;
    type: 'viewing' | 'booking';
}

const HunterOrdersScreen = () => {
    const { isDark } = useTheme();
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<OrderStatus>('pending');

    const [orders, setOrders] = useState<Order[]>([
        {
            id: '1',
            tenantName: 'Michael Otieno',
            tenantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
            propertyTitle: 'Modern 2BR Apartment',
            propertyImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
            date: '2025-01-10',
            time: '10:00 AM',
            amount: 1500,
            status: 'pending',
            type: 'viewing',
        },
        {
            id: '2',
            tenantName: 'Sarah Wanjiku',
            tenantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
            propertyTitle: 'Spacious Studio in Kilimani',
            propertyImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
            date: '2025-01-12',
            time: '02:30 PM',
            amount: 2000,
            status: 'pending',
            type: 'viewing',
        },
        {
            id: '3',
            tenantName: 'John Kamau',
            tenantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            propertyTitle: 'Cozy 1BR in Westlands',
            propertyImage: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400',
            date: '2025-01-05',
            time: '11:00 AM',
            amount: 1500,
            status: 'active',
            type: 'viewing',
        },
    ]);

    const filteredOrders = orders.filter(order => order.status === activeTab);

    const handleAccept = (orderId: string) => {
        setOrders(prev => prev.map(order =>
            order.id === orderId ? { ...order, status: 'active' } : order
        ));
        Alert.alert('Success', 'Order accepted successfully!');
    };

    const handleDecline = (orderId: string) => {
        Alert.alert(
            'Decline Order',
            'Are you sure you want to decline this order?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Decline',
                    style: 'destructive',
                    onPress: () => {
                        setOrders(prev => prev.map(order =>
                            order.id === orderId ? { ...order, status: 'cancelled' } : order
                        ));
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'pending': return colors.warning;
            case 'active': return colors.primary[500];
            case 'completed': return colors.success;
            case 'cancelled': return colors.error;
            default: return colors.neutral[500];
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                <Text style={[styles.headerTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>Order Management</Text>
            </SafeAreaView>

            <View style={[styles.tabBar, { backgroundColor: isDark ? colors.neutral[900] : 'white' }]}>
                {(['pending', 'active', 'completed'] as OrderStatus[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tabItem,
                            activeTab === tab && { borderBottomColor: colors.primary[500] }
                        ]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text
                            style={[
                                styles.tabLabel,
                                { color: activeTab === tab ? colors.primary[500] : colors.neutral[500] }
                            ]}
                        >
                            {tab.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {filteredOrders.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="clipboard-outline" size={64} color={colors.neutral[300]} />
                        <Text style={[styles.emptyTitle, { color: isDark ? colors.text.dark : colors.text.light }]}>
                            No {activeTab} orders
                        </Text>
                        <Text style={styles.emptySubtext}>
                            You don't have any {activeTab} orders at the moment.
                        </Text>
                    </View>
                ) : (
                    filteredOrders.map(order => (
                        <View key={order.id} style={[styles.orderCard, { backgroundColor: isDark ? colors.neutral[800] : 'white' }]}>
                            <View style={styles.orderHeader}>
                                <View style={styles.tenantInfo}>
                                    <Image source={{ uri: order.tenantAvatar }} style={styles.avatar} />
                                    <View>
                                        <Text style={[styles.tenantName, { color: isDark ? colors.text.dark : colors.text.light }]}>
                                            {order.tenantName}
                                        </Text>
                                        <Text style={styles.orderType}>{order.type.toUpperCase()}</Text>
                                    </View>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                        {order.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.propertyInfo}>
                                <Image source={{ uri: order.propertyImage }} style={styles.propertyImage} />
                                <View style={styles.propertyDetails}>
                                    <Text style={[styles.propertyTitle, { color: isDark ? colors.text.dark : colors.text.light }]} numberOfLines={1}>
                                        {order.propertyTitle}
                                    </Text>
                                    <View style={styles.dateTimeRow}>
                                        <Ionicons name="calendar-outline" size={14} color={colors.neutral[500]} />
                                        <Text style={styles.dateTimeText}>{order.date}</Text>
                                        <Ionicons name="time-outline" size={14} color={colors.neutral[500]} style={{ marginLeft: 8 }} />
                                        <Text style={styles.dateTimeText}>{order.time}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.orderFooter}>
                                <View>
                                    <Text style={styles.amountLabel}>Earnings</Text>
                                    <Text style={[styles.amountValue, { color: colors.primary[500] }]}>KES {order.amount}</Text>
                                </View>
                                {order.status === 'pending' && (
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.declineButton]}
                                            onPress={() => handleDecline(order.id)}
                                        >
                                            <Text style={styles.declineButtonText}>Decline</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.acceptButton]}
                                            onPress={() => handleAccept(order.id)}
                                        >
                                            <Text style={styles.acceptButtonText}>Accept</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {order.status === 'active' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onPress={() => (navigation as any).navigate('MessagesTab', { screen: 'Chat', params: { otherPartyName: order.tenantName } })}
                                    >
                                        Message Tenant
                                    </Button>
                                )}
                            </View>
                        </View>
                    ))
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
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 20,
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    tabItem: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabLabel: {
        ...typography.bodySemiBold,
        fontSize: 12,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    orderCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    tenantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    tenantName: {
        ...typography.bodySemiBold,
        fontSize: 15,
    },
    orderType: {
        ...typography.caption,
        color: colors.neutral[500],
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        ...typography.caption,
        fontSize: 10,
        fontWeight: '800',
    },
    propertyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.neutral[100],
        marginBottom: spacing.md,
    },
    propertyImage: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.md,
    },
    propertyDetails: {
        flex: 1,
    },
    propertyTitle: {
        ...typography.bodySemiBold,
        fontSize: 14,
        marginBottom: 4,
    },
    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateTimeText: {
        ...typography.caption,
        color: colors.neutral[500],
        marginLeft: 4,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountLabel: {
        ...typography.caption,
        color: colors.neutral[500],
    },
    amountValue: {
        ...typography.bodySemiBold,
        fontSize: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    declineButton: {
        backgroundColor: colors.neutral[100],
    },
    acceptButton: {
        backgroundColor: colors.primary[500],
    },
    declineButtonText: {
        ...typography.bodySemiBold,
        fontSize: 13,
        color: colors.neutral[600],
    },
    acceptButtonText: {
        ...typography.bodySemiBold,
        fontSize: 13,
        color: 'white',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxxl,
    },
    emptyTitle: {
        ...typography.h3,
        marginTop: spacing.md,
    },
    emptySubtext: {
        ...typography.body,
        color: colors.neutral[500],
        textAlign: 'center',
        marginTop: spacing.xs,
    },
});

export default HunterOrdersScreen;
