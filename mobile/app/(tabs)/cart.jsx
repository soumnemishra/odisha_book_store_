// app/(tabs)/cart.jsx - Premium Shopping Cart with Swipe Gestures
import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Dimensions,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../store/cartStore';
import { Ionicons } from '@expo/vector-icons';
import {
    COLORS,
    TYPOGRAPHY,
    SPACING,
    BORDER_RADIUS,
    SHADOWS,
    ANIMATIONS,
    getCategoryColor,
} from '../../constants/theme';
import { CartItemSkeleton } from '../../components/ui/SkeletonLoader';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -80;

/**
 * Get icon based on category
 */
const getCategoryIcon = (category) => {
    const categoryIcons = {
        Biography: 'person', Autobiography: 'person-circle', Religion: 'flower',
        Novel: 'book', Fiction: 'sparkles', History: 'time',
        Science: 'flask', Educational: 'school', Poetry: 'heart',
        Drama: 'film', Children: 'happy', Reference: 'library',
        Philosophy: 'bulb', Politics: 'flag', Essays: 'document-text',
        Stories: 'chatbubbles', Collection: 'albums',
    };
    return categoryIcons[category] || 'book-outline';
};

/**
 * Swipeable Cart Item with animations
 */
const SwipeableCartItem = ({ item, onRemove, onIncrease, onDecrease }) => {
    const translateX = useSharedValue(0);
    const itemHeight = useSharedValue(100);
    const opacity = useSharedValue(1);

    const categoryColor = getCategoryColor(item.category);
    const categoryIcon = getCategoryIcon(item.category);
    const price = item.finalPrice || item.price?.discounted || item.price?.original || item.price || 0;
    const title = item.title?.display || item.title?.english || item.title?.odia || item.title || 'Untitled';

    const triggerHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const handleRemove = () => {
        triggerHaptic();
        // Animate out
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        itemHeight.value = withTiming(0, { duration: 200 }, () => {
            runOnJS(onRemove)(item._id);
        });
    };

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            translateX.value = Math.min(0, Math.max(event.translationX, -120));
        })
        .onEnd((event) => {
            if (translateX.value < SWIPE_THRESHOLD) {
                // Show delete action
                translateX.value = withSpring(-100, ANIMATIONS.springSnappy);
                runOnJS(triggerHaptic)();
            } else {
                translateX.value = withSpring(0, ANIMATIONS.spring);
            }
        });

    const itemStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        height: itemHeight.value,
        opacity: opacity.value,
        marginBottom: itemHeight.value > 0 ? SPACING.md : 0,
    }));

    const deleteButtonStyle = useAnimatedStyle(() => ({
        opacity: translateX.value < -20 ? 1 : 0,
    }));

    // Quantity button animations
    const QuantityButton = ({ icon, onPress }) => {
        const scale = useSharedValue(1);

        const handlePress = () => {
            scale.value = withSpring(0.9, ANIMATIONS.springSnappy);
            setTimeout(() => {
                scale.value = withSpring(1, ANIMATIONS.springBouncy);
            }, 100);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
        };

        const buttonStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
        }));

        return (
            <Animated.View style={buttonStyle}>
                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={handlePress}
                    activeOpacity={0.8}
                >
                    <Ionicons name={icon} size={16} color={COLORS.primary} />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.swipeContainer}>
            {/* Delete action behind */}
            <Animated.View style={[styles.deleteAction, deleteButtonStyle]}>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleRemove}
                >
                    <Ionicons name="trash" size={24} color={COLORS.textInverse} />
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Cart item */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.cartItem, itemStyle]}>
                    {/* Book Cover */}
                    <View style={[styles.bookCover, { backgroundColor: categoryColor }]}>
                        <Ionicons name={categoryIcon} size={22} color="rgba(255,255,255,0.4)" />
                        {item.price?.discountPercent > 0 && (
                            <View style={styles.discountTag}>
                                <Text style={styles.discountTagText}>
                                    {Math.round(item.price.discountPercent)}%
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Details */}
                    <View style={styles.itemDetails}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                            {title}
                        </Text>
                        <Text style={styles.itemAuthor} numberOfLines={1}>
                            by {item.author || 'Unknown Author'}
                        </Text>

                        <View style={styles.priceRow}>
                            <Text style={styles.itemPrice}>₹{price}</Text>
                            {item.price?.original > price && (
                                <Text style={styles.originalPrice}>₹{item.price.original}</Text>
                            )}
                        </View>
                    </View>

                    {/* Quantity Controls */}
                    <View style={styles.itemActions}>
                        <View style={styles.quantityControl}>
                            <QuantityButton
                                icon="remove"
                                onPress={() => onDecrease(item._id)}
                            />
                            <Text style={styles.quantityText}>{item.quantity}</Text>
                            <QuantityButton
                                icon="add"
                                onPress={() => onIncrease(item._id)}
                            />
                        </View>
                        <Text style={styles.itemTotal}>
                            ₹{(price * item.quantity).toLocaleString()}
                        </Text>
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

export default function Cart() {
    const router = useRouter();
    const {
        items,
        removeItem,
        increaseQuantity,
        decreaseQuantity,
        getSubtotal,
        getShippingCost,
        getTotal,
        getItemCount,
        clearCart,
    } = useCartStore();

    const handleRemoveItem = (bookId) => {
        removeItem(bookId);
    };

    const handleClearCart = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            'Clear Cart',
            'Are you sure you want to remove all items?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        clearCart();
                    }
                },
            ]
        );
    };

    const handleCheckout = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/(tabs)/checkout');
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.headerTitle}>Shopping Bag</Text>
                <Text style={styles.headerSubtitle}>
                    {getItemCount()} {getItemCount() === 1 ? 'item' : 'items'}
                </Text>
            </View>
            {items.length > 0 && (
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClearCart}
                >
                    <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="bag-outline" size={64} color={COLORS.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>Your bag is empty</Text>
            <Text style={styles.emptyText}>
                Add some amazing Odia books to get started!
            </Text>
            <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push('/(tabs)/')}
                activeOpacity={0.9}
            >
                <Ionicons name="book-outline" size={20} color={COLORS.textInverse} />
                <Text style={styles.browseButtonText}>Browse Books</Text>
            </TouchableOpacity>
        </View>
    );

    const renderFooter = () => {
        if (items.length === 0) return null;

        const subtotal = getSubtotal();
        const shipping = getShippingCost();
        const total = getTotal();
        const freeShippingThreshold = 499;
        const amountForFreeShipping = freeShippingThreshold - subtotal;

        return (
            <View style={styles.summaryContainer}>
                {/* Free shipping progress */}
                {subtotal < freeShippingThreshold && (
                    <View style={styles.freeShippingBanner}>
                        <Ionicons name="gift-outline" size={18} color={COLORS.gold} />
                        <Text style={styles.freeShippingText}>
                            Add ₹{amountForFreeShipping.toFixed(0)} more for
                            <Text style={styles.freeShippingHighlight}> FREE shipping!</Text>
                        </Text>
                    </View>
                )}

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Order Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>₹{subtotal.toLocaleString()}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={[styles.summaryValue, shipping === 0 && styles.freeShippingValue]}>
                            {shipping === 0 ? 'FREE' : `₹${shipping}`}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <View style={styles.totalValueContainer}>
                            <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
                            <Text style={styles.taxNote}>Incl. of all taxes</Text>
                        </View>
                    </View>

                    {/* Checkout Button */}
                    <TouchableOpacity
                        style={styles.checkoutButton}
                        onPress={handleCheckout}
                        activeOpacity={0.9}
                    >
                        <View style={styles.checkoutContent}>
                            <View>
                                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                                <Text style={styles.checkoutSubtext}>{getItemCount()} items • ₹{total.toLocaleString()}</Text>
                            </View>
                            <View style={styles.checkoutArrow}>
                                <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Trust badges */}
                    <View style={styles.trustBadges}>
                        <View style={styles.trustBadge}>
                            <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} />
                            <Text style={styles.trustText}>Secure</Text>
                        </View>
                        <View style={styles.trustBadge}>
                            <Ionicons name="refresh-outline" size={16} color={COLORS.primary} />
                            <Text style={styles.trustText}>Easy Returns</Text>
                        </View>
                        <View style={styles.trustBadge}>
                            <Ionicons name="card-outline" size={16} color={COLORS.primary} />
                            <Text style={styles.trustText}>COD Available</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                renderItem={({ item }) => (
                    <SwipeableCartItem
                        item={item}
                        onRemove={handleRemoveItem}
                        onIncrease={increaseQuantity}
                        onDecrease={decreaseQuantity}
                    />
                )}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContent: {
        paddingBottom: 40,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: 60,
        paddingBottom: SPACING.lg,
    },
    headerTitle: {
        ...TYPOGRAPHY.displayMedium,
        color: COLORS.textPrimary,
    },
    headerSubtitle: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.errorLight,
    },
    clearText: {
        ...TYPOGRAPHY.body,
        color: COLORS.error,
        fontWeight: '600',
    },

    // Swipe container
    swipeContainer: {
        marginHorizontal: SPACING.lg,
        position: 'relative',
    },
    deleteAction: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: SPACING.md,
        width: 100,
        borderRadius: BORDER_RADIUS.xl,
        backgroundColor: COLORS.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        alignItems: 'center',
        gap: 4,
    },
    deleteText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textInverse,
        fontWeight: '600',
    },

    // Cart Item
    cartItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.xl,
        ...SHADOWS.medium,
    },
    bookCover: {
        width: 70,
        height: 95,
        borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    discountTag: {
        position: 'absolute',
        top: -4,
        left: -4,
        backgroundColor: COLORS.orange,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.xs,
    },
    discountTagText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textInverse,
        fontWeight: '700',
        fontSize: 8,
    },
    itemDetails: {
        flex: 1,
        marginLeft: SPACING.md,
        justifyContent: 'center',
    },
    itemTitle: {
        ...TYPOGRAPHY.h4,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    itemAuthor: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginBottom: SPACING.sm,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    itemPrice: {
        ...TYPOGRAPHY.h3,
        color: COLORS.primary,
        fontWeight: '700',
    },
    originalPrice: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textTertiary,
        textDecorationLine: 'line-through',
    },
    itemActions: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primarySoft,
        borderRadius: BORDER_RADIUS.lg,
        padding: 4,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        ...TYPOGRAPHY.h4,
        color: COLORS.textPrimary,
        paddingHorizontal: SPACING.md,
        minWidth: 32,
        textAlign: 'center',
    },
    itemTotal: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },

    // Empty state
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.massive,
        paddingHorizontal: SPACING.xl,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.surfaceDim,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    emptyTitle: {
        ...TYPOGRAPHY.h1,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    emptyText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xxl,
    },
    browseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xxl,
        paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.round,
        ...SHADOWS.glow,
    },
    browseButtonText: {
        ...TYPOGRAPHY.button,
        color: COLORS.textInverse,
    },

    // Summary
    summaryContainer: {
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
    },
    freeShippingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.goldSoft,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
    },
    freeShippingText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
    },
    freeShippingHighlight: {
        color: COLORS.goldDark,
        fontWeight: '700',
    },
    summaryCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xxl,
        padding: SPACING.xl,
        ...SHADOWS.large,
    },
    summaryTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    summaryLabel: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
    },
    summaryValue: {
        ...TYPOGRAPHY.body,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    freeShippingValue: {
        color: COLORS.success,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: SPACING.lg,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.xl,
    },
    totalLabel: {
        ...TYPOGRAPHY.h2,
        color: COLORS.textPrimary,
    },
    totalValueContainer: {
        alignItems: 'flex-end',
    },
    totalValue: {
        ...TYPOGRAPHY.priceLarge,
        color: COLORS.primary,
    },
    taxNote: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textTertiary,
    },
    checkoutButton: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.xl,
        ...SHADOWS.glow,
    },
    checkoutContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
    },
    checkoutButtonText: {
        ...TYPOGRAPHY.button,
        color: COLORS.textInverse,
    },
    checkoutSubtext: {
        ...TYPOGRAPHY.caption,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    checkoutArrow: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.gold,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trustBadges: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.lg,
        marginTop: SPACING.lg,
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trustText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
});
