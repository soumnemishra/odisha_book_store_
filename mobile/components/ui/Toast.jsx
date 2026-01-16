// components/ui/Toast.jsx - Animated Toast Notifications
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    runOnJS,
    SlideInUp,
    SlideOutUp,
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    COLORS,
    TYPOGRAPHY,
    SPACING,
    BORDER_RADIUS,
    SHADOWS,
    ANIMATIONS,
} from '../../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Toast Context
const ToastContext = createContext(null);

/**
 * Toast variants configuration
 */
const TOAST_VARIANTS = {
    success: {
        icon: 'checkmark-circle',
        backgroundColor: COLORS.success,
        iconColor: '#FFF',
    },
    error: {
        icon: 'close-circle',
        backgroundColor: COLORS.error,
        iconColor: '#FFF',
    },
    warning: {
        icon: 'warning',
        backgroundColor: COLORS.orange,
        iconColor: '#FFF',
    },
    info: {
        icon: 'information-circle',
        backgroundColor: COLORS.info || '#3B82F6',
        iconColor: '#FFF',
    },
    cart: {
        icon: 'cart',
        backgroundColor: COLORS.primary,
        iconColor: '#FFF',
    },
    wishlist: {
        icon: 'heart',
        backgroundColor: COLORS.error,
        iconColor: '#FFF',
    },
};

/**
 * Individual Toast Item
 */
const ToastItem = ({ toast, onDismiss }) => {
    const insets = useSafeAreaInsets();
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.9);

    const variant = TOAST_VARIANTS[toast.type] || TOAST_VARIANTS.info;

    useEffect(() => {
        // Animate in
        translateY.value = withSpring(0, ANIMATIONS.springBouncy);
        opacity.value = withTiming(1, { duration: 200 });
        scale.value = withSpring(1, ANIMATIONS.spring);

        // Haptic feedback
        if (toast.type === 'success' || toast.type === 'cart') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (toast.type === 'error') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Auto dismiss
        const timer = setTimeout(() => {
            dismissToast();
        }, toast.duration || 3000);

        return () => clearTimeout(timer);
    }, []);

    const dismissToast = () => {
        translateY.value = withTiming(-100, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        scale.value = withTiming(0.9, { duration: 200 }, () => {
            runOnJS(onDismiss)(toast.id);
        });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.toastContainer,
                { top: insets.top + SPACING.sm },
                animatedStyle
            ]}
        >
            <TouchableOpacity
                style={[styles.toast, { backgroundColor: variant.backgroundColor }]}
                onPress={dismissToast}
                activeOpacity={0.9}
            >
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <Ionicons name={variant.icon} size={22} color={variant.iconColor} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {toast.title && (
                        <Text style={styles.title}>{toast.title}</Text>
                    )}
                    <Text style={styles.message} numberOfLines={2}>
                        {toast.message}
                    </Text>
                </View>

                {/* Action button */}
                {toast.action && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            toast.action.onPress?.();
                            dismissToast();
                        }}
                    >
                        <Text style={styles.actionText}>{toast.action.label}</Text>
                    </TouchableOpacity>
                )}

                {/* Close button */}
                <TouchableOpacity style={styles.closeButton} onPress={dismissToast}>
                    <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

/**
 * Toast Provider - Wrap your app with this
 */
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((options) => {
        const id = Date.now().toString();
        const newToast = {
            id,
            type: 'info',
            duration: 3000,
            ...options,
        };
        setToasts((prev) => [...prev, newToast]);
        return id;
    }, []);

    const hideToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const hideAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // Convenience methods
    const toast = {
        show: showToast,
        success: (message, options = {}) => showToast({ type: 'success', message, ...options }),
        error: (message, options = {}) => showToast({ type: 'error', message, ...options }),
        warning: (message, options = {}) => showToast({ type: 'warning', message, ...options }),
        info: (message, options = {}) => showToast({ type: 'info', message, ...options }),
        cart: (message, options = {}) => showToast({ type: 'cart', message, ...options }),
        wishlist: (message, options = {}) => showToast({ type: 'wishlist', message, ...options }),
        hide: hideToast,
        hideAll: hideAllToasts,
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast Container */}
            <View style={styles.toastWrapper} pointerEvents="box-none">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={hideToast} />
                ))}
            </View>
        </ToastContext.Provider>
    );
}

/**
 * useToast hook - Access toast from any component
 */
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

/**
 * Standalone Toast component for simple usage
 */
export default function Toast({ visible, type, message, onDismiss }) {
    if (!visible) return null;

    return (
        <ToastItem
            toast={{ id: 'standalone', type, message }}
            onDismiss={onDismiss}
        />
    );
}

const styles = StyleSheet.create({
    toastWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: 'center',
    },
    toastContainer: {
        position: 'absolute',
        left: SPACING.lg,
        right: SPACING.lg,
        zIndex: 9999,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingLeft: SPACING.md,
        paddingRight: SPACING.sm,
        borderRadius: BORDER_RADIUS.xl,
        ...SHADOWS.large,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    content: {
        flex: 1,
    },
    title: {
        ...TYPOGRAPHY.h4,
        color: '#FFF',
        marginBottom: 2,
    },
    message: {
        ...TYPOGRAPHY.body,
        color: 'rgba(255,255,255,0.9)',
    },
    actionButton: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: BORDER_RADIUS.md,
        marginLeft: SPACING.sm,
    },
    actionText: {
        ...TYPOGRAPHY.buttonSmall,
        color: '#FFF',
    },
    closeButton: {
        padding: SPACING.sm,
        marginLeft: SPACING.xs,
    },
});
