/**
 * Toast Component
 * Toast notification UI component
 */

import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { useToast, ToastType } from '../../contexts/ToastContext';

const Toast: React.FC = () => {
    const { toasts, hideToast } = useToast();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { top: insets.top + 10 }]} pointerEvents="box-none">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    id={toast.id}
                    type={toast.type}
                    message={toast.message}
                    onDismiss={hideToast}
                />
            ))}
        </View>
    );
};

interface ToastItemProps {
    id: string;
    type: ToastType;
    message: string;
    onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ id, type, message, onDismiss }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(-100);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 300 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    const handleDismiss = () => {
        opacity.value = withTiming(0, { duration: 200 }, (finished) => {
            if (finished) {
                runOnJS(onDismiss)(id);
            }
        });
    };

    const getToastConfig = () => {
        switch (type) {
            case 'success':
                return {
                    backgroundColor: colors.success,
                    icon: 'checkmark-circle' as const,
                };
            case 'error':
                return {
                    backgroundColor: colors.error,
                    icon: 'alert-circle' as const,
                };
            case 'warning':
                return {
                    backgroundColor: colors.warning,
                    icon: 'warning' as const,
                };
            case 'info':
            default:
                return {
                    backgroundColor: colors.info,
                    icon: 'information-circle' as const,
                };
        }
    };

    const config = getToastConfig();

    return (
        <Animated.View
            style={[
                styles.toast,
                { backgroundColor: config.backgroundColor },
                animatedStyle,
            ]}
        >
            <View style={styles.content}>
                <Ionicons name={config.icon} size={24} color="white" style={styles.icon} />
                <Text style={styles.message} numberOfLines={2}>
                    {message}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.dismissButton}
                onPress={handleDismiss}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: spacing.md,
        right: spacing.md,
        zIndex: 9999,
        gap: spacing.sm,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.md,
        minHeight: 56,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: spacing.md,
    },
    icon: {
        marginRight: spacing.md,
    },
    message: {
        ...typography.body,
        color: 'white',
        fontWeight: '600',
        flex: 1,
    },
    dismissButton: {
        padding: spacing.xs,
    },
});

export default Toast;
