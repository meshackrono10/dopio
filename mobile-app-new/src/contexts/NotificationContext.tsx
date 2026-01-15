import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '../data/types';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
    markAsRead: (id: string | number) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string | number) => void;
    clearAll: () => void;
    getUnreadNotifications: () => Notification[];
    loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'dapio_notifications';

// Mock initial notifications
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif-1',
        userId: 'hunter-1',
        userType: 'hunter',
        type: 'booking_confirmed',
        title: 'New Booking Confirmed',
        message: 'Your viewing for Modern 2BR in Kasarani has been confirmed for Dec 18',
        read: false,
        createdAt: '2024-12-15T10:30:00Z',
    },
    {
        id: 'notif-2',
        userId: 'hunter-1',
        userType: 'hunter',
        type: 'payment_received',
        title: 'Payment Received',
        message: 'KES 2,125 has been added to your wallet',
        read: false,
        createdAt: '2024-12-10T14:05:00Z',
    },
    {
        id: 'notif-3',
        userId: 'tenant-1',
        userType: 'tenant',
        type: 'review_received',
        title: 'You have a new review',
        message: 'John Kamau left you a 5-star review. Check it out!',
        read: true,
        createdAt: '2024-12-05T09:15:00Z',
    },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        saveNotifications();
    }, [notifications]);

    const loadNotifications = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setNotifications(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveNotifications = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
        } catch (error) {
            console.error('Failed to save notifications:', error);
        }
    };

    const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };

        setNotifications([newNotification, ...notifications]);
    };

    const markAsRead = (id: string | number) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string | number) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const getUnreadNotifications = () => {
        return notifications.filter(n => !n.read);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                clearAll,
                getUnreadNotifications,
                loading,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
}
