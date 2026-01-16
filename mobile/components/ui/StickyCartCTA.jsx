// components/ui/StickyCartCTA.jsx - Fixed Bottom Checkout Button
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
    COLORS,
    TYPOGRAPHY,
    SPACING,
    BORDER_RADIUS,
    SHADOWS,
    ANIMATIONS,
} from '../../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * StickyCartCTA - Fixed bottom checkout button with animations
 * Shows item count, total price, and checkout action
 */
export default function StickyCartCTA({
    itemCount = 0,
    totalPrice = 0,
    onPress,
    visible = true,
    showDetails = true,
}) {
    const translateY = useSharedValue(visible ? 0 : 100);
    const badgeScale = useSharedValue(1);
    const priceScale = useSharedValue(1);
    const prevItemCount = useSharedValue(itemCount);
    const prevPrice = useSharedValue(totalPrice);

    // Animate visibility
    useEffect(() => {
        translateY.value = withSpring(visible && itemCount > 0 ? 0 : 100, ANIMATIONS.springGentle);
    }, [visible, itemCount]);

    // Animate badge when count changes
    useEffect(() => {
        if (itemCount !== prevItemCount.value && itemCount > 0) {
            badgeScale.value = withSequence(
                withSpring(1.3, ANIMATIONS.springSnappy),
                withSpring(1, ANIMATIONS.springBouncy)
            );
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        prevItemCount.value = itemCount;
    }, [itemCount]);

    // Animate price when it changes
    useEffect(() => {
        if (totalPrice !== prevPrice.value && totalPrice > 0) {
            priceScale.value = withSequence(
                withSpring(1.1, ANIMATIONS.springSnappy),
                withSpring(1, ANIMATIONS.spring)
            );
        }
        prevPrice.value = totalPrice;
    }, [totalPrice]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const badgeAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: badgeScale.value }],
    }));

    const priceAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: priceScale.value }],
    }));

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress?.();
    };

    if (itemCount === 0) return null;

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            {/* Glassmorphism background */}
            <View style={styles.background}>
                <View style={styles.glassEffect} />
            </View>

            <View style={styles.content}>
                {/* Left side - Cart info */}
                {showDetails && (
                    <View style={styles.cartInfo}>
                        <View style={styles.cartIconContainer}>
                            <Ionicons name="cart" size={22} color={COLORS.primary} />
                            <Animated.View style={[styles.badge, badgeAnimatedStyle]}>
                                <Text style={styles.badgeText}>{itemCount}</Text>
                            </Animated.View>
                        </View>
                        <Animated.View style={priceAnimatedStyle}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalPrice}>₹{totalPrice.toLocaleString()}</Text>
                        </Animated.View>
                    </View>
                )}

                {/* Checkout button */}
                <TouchableOpacity
                    style={[styles.checkoutButton, !showDetails && styles.checkoutButtonFull]}
                    onPress={handlePress}
                    activeOpacity={0.9}
                >
                    <Text style={styles.checkoutText}>
                        {showDetails ? 'Checkout' : `Checkout (${itemCount} items)`}
                    </Text>
                    <View style={styles.arrowContainer}>
                        <Ionicons name="arrow-forward" size={18} color={COLORS.textInverse} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Gold accent line */}
            <View style={styles.goldAccent} />
        </Animated.View>
    );
}

/**
 * Compact variant for product pages
 */
export function CompactCartCTA({ price, onAddToCart, onBuyNow, inCart = false }) {
    const buttonScale = useSharedValue(1);

    const handleAddToCart = () => {
        buttonScale.value = withSequence(
            withSpring(0.95, ANIMATIONS.springSnappy),
            withSpring(1, ANIMATIONS.springBouncy)
        );
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onAddToCart?.();
    };

    const addButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    return (
        <View style={styles.compactContainer}>
            <View style={styles.compactGlass} />

            {/* Price */}
            <View style={styles.compactPrice}>
                <Text style={styles.compactPriceLabel}>Price</Text>
                <Text style={styles.compactPriceValue}>₹{price}</Text>
            </View>

            {/* Actions */}
            <View style={styles.compactActions}>
                <Animated.View style={addButtonStyle}>
                    <TouchableOpacity
                        style={[styles.compactAddButton, inCart && styles.compactAddButtonInCart]}
                        onPress={handleAddToCart}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={inCart ? 'checkmark' : 'cart-outline'}
                            size={20}
                            color={inCart ? COLORS.success : COLORS.primary}
                        />
                    </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                    style={styles.compactBuyButton}
                    onPress={onBuyNow}
                    activeOpacity={0.9}
                >
                    <Text style={styles.compactBuyText}>Buy Now</Text>
                    <Ionicons name="flash" size={16} color={COLORS.textInverse} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.glass,
        borderTopLeftRadius: BORDER_RADIUS.xxl,
        borderTopRightRadius: BORDER_RADIUS.xxl,
        overflow: 'hidden',
    },
    glassEffect: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.surface,
        opacity: 0.95,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    cartInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    cartIconContainer: {
        position: 'relative',
        width: 44,
        height: 44,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 20,
        height: 20,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.error,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: COLORS.surface,
    },
    badgeText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textInverse,
        fontWeight: '700',
        fontSize: 10,
    },
    totalLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    totalPrice: {
        ...TYPOGRAPHY.h2,
        color: COLORS.textPrimary,
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: BORDER_RADIUS.round,
        gap: SPACING.sm,
        ...SHADOWS.glow,
    },
    checkoutButtonFull: {
        flex: 1,
        justifyContent: 'center',
    },
    checkoutText: {
        ...TYPOGRAPHY.button,
        color: COLORS.textInverse,
    },
    arrowContainer: {
        width: 28,
        height: 28,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    goldAccent: {
        position: 'absolute',
        top: 0,
        left: SPACING.xxl,
        right: SPACING.xxl,
        height: 2,
        backgroundColor: COLORS.gold,
        borderRadius: BORDER_RADIUS.round,
    },

    // Compact variant
    compactContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.xxl,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        ...SHADOWS.large,
    },
    compactGlass: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.surface,
    },
    compactPrice: {
        flex: 1,
    },
    compactPriceLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    compactPriceValue: {
        ...TYPOGRAPHY.priceLarge,
        color: COLORS.textPrimary,
    },
    compactActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    compactAddButton: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 2,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
    },
    compactAddButtonInCart: {
        backgroundColor: COLORS.successLight,
        borderColor: COLORS.success,
    },
    compactBuyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        gap: SPACING.sm,
        ...SHADOWS.glow,
    },
    compactBuyText: {
        ...TYPOGRAPHY.button,
        color: COLORS.textInverse,
    },
});
