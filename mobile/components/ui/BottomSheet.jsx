// components/ui/BottomSheet.jsx - Reusable Bottom Sheet with Gestures
import React, { useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import {
    COLORS,
    TYPOGRAPHY,
    SPACING,
    BORDER_RADIUS,
    SHADOWS,
    ANIMATIONS,
    SIZES,
} from '../../constants/theme';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * BottomSheet - Gesture-controlled modal from bottom
 * 
 * Usage:
 * const sheetRef = useRef();
 * sheetRef.current?.open();
 * sheetRef.current?.close();
 */
const BottomSheet = forwardRef(({
    children,
    snapPoints = [300, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT * 0.85],
    initialSnapIndex = 0,
    onClose,
    title,
    showHandle = true,
    showCloseButton = true,
    enableBackdropDismiss = true,
    enableDragToDismiss = true,
}, ref) => {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const active = useSharedValue(false);
    const context = useSharedValue({ y: 0 });
    const currentSnapIndex = useSharedValue(initialSnapIndex);

    const maxHeight = Math.max(...snapPoints);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        open: (snapIndex = initialSnapIndex) => {
            active.value = true;
            currentSnapIndex.value = snapIndex;
            translateY.value = withSpring(
                SCREEN_HEIGHT - snapPoints[snapIndex],
                ANIMATIONS.springGentle
            );
        },
        close: () => {
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
                active.value = false;
                if (onClose) runOnJS(onClose)();
            });
        },
        snapTo: (snapIndex) => {
            if (snapIndex >= 0 && snapIndex < snapPoints.length) {
                currentSnapIndex.value = snapIndex;
                translateY.value = withSpring(
                    SCREEN_HEIGHT - snapPoints[snapIndex],
                    ANIMATIONS.springGentle
                );
            }
        },
    }));

    const triggerHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const close = useCallback(() => {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
            active.value = false;
            if (onClose) runOnJS(onClose)();
        });
    }, [onClose]);

    // Find nearest snap point
    const findNearestSnapPoint = (currentY) => {
        'worklet';
        const currentHeight = SCREEN_HEIGHT - currentY;
        let nearestIndex = 0;
        let minDistance = Math.abs(snapPoints[0] - currentHeight);

        snapPoints.forEach((point, index) => {
            const distance = Math.abs(point - currentHeight);
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = index;
            }
        });

        return nearestIndex;
    };

    // Pan gesture for dragging
    const panGesture = Gesture.Pan()
        .onStart(() => {
            context.value = { y: translateY.value };
        })
        .onUpdate((event) => {
            translateY.value = Math.max(
                event.translationY + context.value.y,
                SCREEN_HEIGHT - maxHeight
            );
        })
        .onEnd((event) => {
            // Check if should dismiss
            if (enableDragToDismiss && event.velocityY > 500) {
                translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
                    active.value = false;
                    if (onClose) runOnJS(onClose)();
                });
                runOnJS(triggerHaptic)();
                return;
            }

            // Snap to nearest point
            const nearestIndex = findNearestSnapPoint(translateY.value);
            currentSnapIndex.value = nearestIndex;
            translateY.value = withSpring(
                SCREEN_HEIGHT - snapPoints[nearestIndex],
                ANIMATIONS.springGentle
            );
            runOnJS(triggerHaptic)();
        });

    // Animated styles
    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: active.value
            ? withTiming(1, { duration: 200 })
            : withTiming(0, { duration: 200 }),
        pointerEvents: active.value ? 'auto' : 'none',
    }));

    return (
        <>
            {/* Backdrop */}
            <Animated.View style={[styles.backdrop, backdropStyle]}>
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={enableBackdropDismiss ? close : undefined}
                />
            </Animated.View>

            {/* Sheet */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.sheet, { height: maxHeight }, sheetStyle]}>
                    {/* Handle */}
                    {showHandle && (
                        <View style={styles.handleContainer}>
                            <View style={styles.handle} />
                        </View>
                    )}

                    {/* Header */}
                    {(title || showCloseButton) && (
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                            {showCloseButton && (
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={close}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Content */}
                    <View style={styles.content}>
                        {children}
                    </View>
                </Animated.View>
            </GestureDetector>
        </>
    );
});

/**
 * Quick Action Sheet - Preset for book quick actions (add to cart, wishlist, share)
 */
export const QuickActionSheet = forwardRef(({ book, onAddToCart, onWishlist, onShare, onClose }, ref) => {
    const getTitle = () => {
        if (typeof book?.title === 'string') return book.title;
        if (typeof book?.title === 'object') {
            return book.title?.display || book.title?.odia || 'Book';
        }
        return 'Book';
    };

    return (
        <BottomSheet
            ref={ref}
            snapPoints={[280]}
            title="Quick Actions"
            onClose={onClose}
        >
            <View style={styles.actionContent}>
                <Text style={styles.actionBookTitle} numberOfLines={2}>
                    {getTitle()}
                </Text>

                <View style={styles.actionList}>
                    <TouchableOpacity style={styles.actionItem} onPress={onAddToCart}>
                        <View style={[styles.actionIcon, { backgroundColor: COLORS.primarySoft }]}>
                            <Ionicons name="cart-outline" size={22} color={COLORS.primary} />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionItemTitle}>Add to Cart</Text>
                            <Text style={styles.actionItemSubtitle}>Add this book to your cart</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem} onPress={onWishlist}>
                        <View style={[styles.actionIcon, { backgroundColor: COLORS.errorLight }]}>
                            <Ionicons name="heart-outline" size={22} color={COLORS.error} />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionItemTitle}>Add to Wishlist</Text>
                            <Text style={styles.actionItemSubtitle}>Save for later</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem} onPress={onShare}>
                        <View style={[styles.actionIcon, { backgroundColor: COLORS.infoLight }]}>
                            <Ionicons name="share-outline" size={22} color={COLORS.info} />
                        </View>
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionItemTitle}>Share</Text>
                            <Text style={styles.actionItemSubtitle}>Share with friends</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.overlay,
        zIndex: 100,
    },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: BORDER_RADIUS.xxl,
        borderTopRightRadius: BORDER_RADIUS.xxl,
        zIndex: 101,
        ...SHADOWS.xl,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    handle: {
        width: SIZES.bottomSheetHandleWidth,
        height: SIZES.bottomSheetHandle,
        backgroundColor: COLORS.border,
        borderRadius: BORDER_RADIUS.round,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    title: {
        ...TYPOGRAPHY.h2,
        color: COLORS.textPrimary,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.surfaceDim,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },

    // Quick Action Sheet
    actionContent: {
        padding: SPACING.xl,
    },
    actionBookTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
    },
    actionList: {
        gap: SPACING.md,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surfaceDim,
        borderRadius: BORDER_RADIUS.lg,
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionTextContainer: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    actionItemTitle: {
        ...TYPOGRAPHY.h4,
        color: COLORS.textPrimary,
    },
    actionItemSubtitle: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textSecondary,
    },
});

export default BottomSheet;
