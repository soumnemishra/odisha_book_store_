// app/(tabs)/order-success.jsx - Order Success Celebration Screen
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated as RNAnimated,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withDelay,
    withTiming,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

const { width, height } = Dimensions.get('window');

// Confetti colors
const CONFETTI_COLORS = [
    COLORS.primary,
    COLORS.gold,
    COLORS.success,
    COLORS.info || '#3B82F6',
    COLORS.orange,
    '#A855F7', // purple
    '#EC4899', // pink
];

/**
 * Single Confetti Piece
 */
const ConfettiPiece = ({ delay, color, startX, size }) => {
    const translateY = useRef(new RNAnimated.Value(-50)).current;
    const translateX = useRef(new RNAnimated.Value(0)).current;
    const rotate = useRef(new RNAnimated.Value(0)).current;
    const opacity = useRef(new RNAnimated.Value(1)).current;

    useEffect(() => {
        const animation = RNAnimated.parallel([
            RNAnimated.timing(translateY, {
                toValue: height + 50,
                duration: 3000 + Math.random() * 2000,
                delay,
                useNativeDriver: true,
                easing: Easing.linear,
            }),
            RNAnimated.timing(translateX, {
                toValue: (Math.random() - 0.5) * 200,
                duration: 3000 + Math.random() * 2000,
                delay,
                useNativeDriver: true,
            }),
            RNAnimated.timing(rotate, {
                toValue: Math.random() * 720,
                duration: 3000 + Math.random() * 2000,
                delay,
                useNativeDriver: true,
            }),
            RNAnimated.sequence([
                RNAnimated.delay(delay + 2000),
                RNAnimated.timing(opacity, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]),
        ]);

        animation.start();

        return () => animation.stop();
    }, []);

    const spin = rotate.interpolate({
        inputRange: [0, 360],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <RNAnimated.View
            style={[
                styles.confettiPiece,
                {
                    backgroundColor: color,
                    width: size,
                    height: size * 2.5,
                    left: startX,
                    transform: [
                        { translateY },
                        { translateX },
                        { rotate: spin },
                    ],
                    opacity,
                },
            ]}
        />
    );
};

/**
 * Confetti Container
 */
const Confetti = ({ count = 50 }) => {
    const pieces = React.useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            startX: Math.random() * width,
            delay: Math.random() * 1500,
            size: 6 + Math.random() * 6,
        }));
    }, [count]);

    return (
        <View style={styles.confettiContainer} pointerEvents="none">
            {pieces.map((piece) => (
                <ConfettiPiece key={piece.id} {...piece} />
            ))}
        </View>
    );
};

/**
 * Timeline Item
 */
const TimelineItem = ({ icon, title, subtitle, isCompleted, isActive, isLast }) => (
    <View style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
            <View style={[
                styles.timelineDot,
                isCompleted && styles.timelineDotCompleted,
                isActive && styles.timelineDotActive,
            ]}>
                {isCompleted ? (
                    <Ionicons name="checkmark" size={12} color="#FFF" />
                ) : (
                    <View style={styles.timelineDotInner} />
                )}
            </View>
            {!isLast && <View style={[styles.timelineLine, isCompleted && styles.timelineLineCompleted]} />}
        </View>
        <View style={styles.timelineContent}>
            <Text style={[styles.timelineTitle, isActive && styles.timelineTitleActive]}>{title}</Text>
            <Text style={styles.timelineSubtitle}>{subtitle}</Text>
        </View>
    </View>
);

export default function OrderSuccess() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();

    // Animation values
    const checkmarkScale = useSharedValue(0);
    const contentOpacity = useSharedValue(0);
    const contentTranslateY = useSharedValue(30);

    useEffect(() => {
        // Trigger celebration haptics
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Animate checkmark
        checkmarkScale.value = withDelay(
            300,
            withSpring(1, { damping: 8, stiffness: 100 })
        );

        // Animate content
        contentOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
        contentTranslateY.value = withDelay(600, withSpring(0, ANIMATIONS.spring));
    }, []);

    const checkmarkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkmarkScale.value }],
    }));

    const contentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: contentTranslateY.value }],
    }));

    const handleViewOrders = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.replace('/(tabs)/orders');
    };

    const handleContinueShopping = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.replace('/(tabs)/');
    };

    const orderId = params.orderId || `OBS${Date.now().toString().slice(-8)}`;
    const orderDate = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
    });

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Confetti Animation */}
            <Confetti count={60} />

            {/* Success Content */}
            <View style={styles.content}>
                {/* Checkmark Circle */}
                <Animated.View style={[styles.checkmarkContainer, checkmarkStyle]}>
                    <View style={styles.checkmarkCircle}>
                        <Ionicons name="checkmark" size={48} color="#FFF" />
                    </View>
                    <View style={styles.checkmarkGlow} />
                </Animated.View>

                {/* Success Message */}
                <Animated.View style={[styles.messageContainer, contentStyle]}>
                    <Text style={styles.successTitle}>Order Placed!</Text>
                    <Text style={styles.successSubtitle}>
                        Thank you for your purchase. Your order has been confirmed.
                    </Text>

                    {/* Order Info Card */}
                    <View style={styles.orderCard}>
                        <View style={styles.orderRow}>
                            <Text style={styles.orderLabel}>Order ID</Text>
                            <Text style={styles.orderId}>{orderId}</Text>
                        </View>
                        <View style={styles.orderDivider} />
                        <View style={styles.orderRow}>
                            <Text style={styles.orderLabel}>Order Date</Text>
                            <Text style={styles.orderValue}>{orderDate}</Text>
                        </View>
                        <View style={styles.orderRow}>
                            <Text style={styles.orderLabel}>Est. Delivery</Text>
                            <Text style={[styles.orderValue, { color: COLORS.primary }]}>{estimatedDelivery}</Text>
                        </View>
                    </View>

                    {/* Order Timeline */}
                    <View style={styles.timelineContainer}>
                        <Text style={styles.timelineHeader}>Order Status</Text>
                        <TimelineItem
                            icon="checkmark-circle"
                            title="Order Confirmed"
                            subtitle="Just now"
                            isCompleted={true}
                            isActive={false}
                        />
                        <TimelineItem
                            icon="cube"
                            title="Processing"
                            subtitle="Within 24 hours"
                            isCompleted={false}
                            isActive={true}
                        />
                        <TimelineItem
                            icon="car"
                            title="Shipped"
                            subtitle="2-3 business days"
                            isCompleted={false}
                            isActive={false}
                        />
                        <TimelineItem
                            icon="home"
                            title="Delivered"
                            subtitle={estimatedDelivery}
                            isCompleted={false}
                            isActive={false}
                            isLast={true}
                        />
                    </View>
                </Animated.View>
            </View>

            {/* Bottom Buttons */}
            <Animated.View style={[styles.bottomButtons, contentStyle, { paddingBottom: insets.bottom + SPACING.lg }]}>
                <TouchableOpacity
                    style={styles.viewOrdersButton}
                    onPress={handleViewOrders}
                    activeOpacity={0.8}
                >
                    <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.viewOrdersText}>View Orders</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinueShopping}
                    activeOpacity={0.9}
                >
                    <Text style={styles.continueText}>Continue Shopping</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // Confetti
    confettiContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
    },
    confettiPiece: {
        position: 'absolute',
        borderRadius: 2,
    },

    // Content
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.xxl,
    },

    // Checkmark
    checkmarkContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xxl,
    },
    checkmarkCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.success,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.glow,
    },
    checkmarkGlow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.success,
        opacity: 0.2,
        zIndex: -1,
    },

    // Message
    messageContainer: {
        alignItems: 'center',
        width: '100%',
    },
    successTitle: {
        ...TYPOGRAPHY.displayLarge,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    successSubtitle: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },

    // Order Card
    orderCard: {
        width: '100%',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
        ...SHADOWS.medium,
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    orderLabel: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
    },
    orderId: {
        ...TYPOGRAPHY.h4,
        color: COLORS.primary,
        fontFamily: 'JetBrainsMono-Medium',
    },
    orderValue: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    orderDivider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: SPACING.sm,
    },

    // Timeline
    timelineContainer: {
        width: '100%',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        ...SHADOWS.small,
    },
    timelineHeader: {
        ...TYPOGRAPHY.h4,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    timelineItem: {
        flexDirection: 'row',
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    timelineDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.surfaceDim,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    timelineDotCompleted: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    timelineDotActive: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.primary,
    },
    timelineDotInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.textTertiary,
    },
    timelineLine: {
        width: 2,
        height: 30,
        backgroundColor: COLORS.border,
        marginVertical: 4,
    },
    timelineLineCompleted: {
        backgroundColor: COLORS.success,
    },
    timelineContent: {
        flex: 1,
        paddingBottom: SPACING.md,
    },
    timelineTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    timelineTitleActive: {
        color: COLORS.textPrimary,
    },
    timelineSubtitle: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textTertiary,
    },

    // Bottom Buttons
    bottomButtons: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        gap: SPACING.md,
    },
    viewOrdersButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
        paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 2,
        borderColor: COLORS.primary,
        gap: SPACING.sm,
    },
    viewOrdersText: {
        ...TYPOGRAPHY.button,
        color: COLORS.primary,
    },
    continueButton: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        gap: SPACING.sm,
        ...SHADOWS.glow,
    },
    continueText: {
        ...TYPOGRAPHY.button,
        color: '#FFF',
    },
});
