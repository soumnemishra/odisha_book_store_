// components/ui/AnimatedBookCard.jsx - Premium Book Card with Animations
import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
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

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 3) / 2;

// Category icon mapping (outside component for memoization)
const CATEGORY_ICONS = {
    Biography: 'person',
    Autobiography: 'person-circle',
    Religion: 'flower',
    Novel: 'book',
    Fiction: 'sparkles',
    History: 'time',
    Science: 'flask',
    Educational: 'school',
    Poetry: 'heart',
    Drama: 'film',
    Children: 'happy',
    Reference: 'library',
    Philosophy: 'bulb',
    Politics: 'flag',
    Essays: 'document-text',
    Stories: 'chatbubbles',
    Collection: 'albums',
};

const getCategoryIcon = (category) => CATEGORY_ICONS[category] || 'book-outline';

/**
 * AnimatedBookCard - Premium book card with micro-interactions
 * Features: Press scale, wishlist heart animation, swipe preview
 * Wrapped with React.memo for performance optimization
 */
function AnimatedBookCard({
    book,
    onPress,
    onAddToCart,
    onToggleWishlist,
    isWishlisted = false,
}) {
    const scale = useSharedValue(1);
    const heartScale = useSharedValue(1);
    const addButtonScale = useSharedValue(1);

    const categoryColor = useMemo(() => getCategoryColor(book.category), [book.category]);

    // Memoize computed values
    const title = useMemo(() => {
        if (typeof book.title === 'string') return book.title;
        if (typeof book.title === 'object' && book.title !== null) {
            return book.title.display || book.title.odia || book.title.english || 'Untitled';
        }
        return 'Untitled';
    }, [book.title]);

    const finalPrice = useMemo(() => {
        if (book.finalPrice) return book.finalPrice;
        if (typeof book.price === 'number') return book.price;
        if (typeof book.price === 'object') {
            return book.price?.discounted || book.price?.original || 0;
        }
        return 0;
    }, [book.finalPrice, book.price]);

    const originalPrice = useMemo(() => {
        if (typeof book.price === 'object') {
            return book.price?.original || 0;
        }
        return 0;
    }, [book.price]);

    const hasDiscount = book.hasDiscount || (book.price?.discountPercent > 0);
    const discountPercent = book.price?.discountPercent || 0;

    // Callbacks
    const handlePress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSequence(
            withSpring(0.97, ANIMATIONS.springSnappy),
            withSpring(1, ANIMATIONS.springBouncy)
        );
        onPress?.(book);
    }, [book, onPress]);

    const handleWishlistPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        heartScale.value = withSequence(
            withSpring(1.3, ANIMATIONS.springSnappy),
            withSpring(1, ANIMATIONS.springBouncy)
        );
        onToggleWishlist?.(book);
    }, [book, onToggleWishlist]);

    const handleAddToCart = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        addButtonScale.value = withSequence(
            withSpring(0.9, ANIMATIONS.springSnappy),
            withSpring(1.05, ANIMATIONS.springBouncy),
            withSpring(1, ANIMATIONS.spring)
        );
        onAddToCart?.(book);
    }, [book, onAddToCart]);

    // Animated styles
    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const heartAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heartScale.value }],
    }));

    const addButtonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: addButtonScale.value }],
    }));

    return (
        <TouchableOpacity activeOpacity={0.95} onPress={handlePress}>
            <Animated.View style={[styles.card, cardAnimatedStyle]}>
                {/* Wishlist Heart */}
                <TouchableOpacity
                    style={styles.wishlistButton}
                    onPress={handleWishlistPress}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Animated.View style={[styles.heartContainer, heartAnimatedStyle]}>
                        <Ionicons
                            name={isWishlisted ? 'heart' : 'heart-outline'}
                            size={18}
                            color={isWishlisted ? COLORS.error : COLORS.textSecondary}
                        />
                    </Animated.View>
                </TouchableOpacity>

                {/* Discount Badge */}
                {hasDiscount && discountPercent > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{Math.round(discountPercent)}%</Text>
                    </View>
                )}

                {/* Book Cover - with Shared Element Transition */}
                <View style={[styles.cover, { backgroundColor: categoryColor }]}>
                    {book.image ? (
                        <Animated.Image
                            source={{ uri: book.image }}
                            style={styles.coverImage}
                            resizeMode="cover"
                            sharedTransitionTag={`book-cover-${book._id}`}
                        />
                    ) : (
                        <Animated.View sharedTransitionTag={`book-cover-${book._id}`} style={styles.coverPlaceholder}>
                            <Ionicons
                                name={getCategoryIcon(book.category)}
                                size={48}
                                color="rgba(255,255,255,0.3)"
                            />
                        </Animated.View>
                    )}

                    {/* Rating overlay */}
                    <View style={styles.coverOverlay}>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={10} color={COLORS.gold} />
                            <Text style={styles.ratingText}>
                                {book.rating?.toFixed(1) || '4.5'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Book Info */}
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={2}>
                        {title}
                    </Text>

                    <Text style={styles.author} numberOfLines={1}>
                        {book.author || 'Unknown Author'}
                    </Text>

                    {/* Category Badge */}
                    <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}15` }]}>
                        <Ionicons name={getCategoryIcon(book.category)} size={10} color={categoryColor} />
                        <Text style={[styles.categoryText, { color: categoryColor }]} numberOfLines={1}>
                            {book.category || 'General'}
                        </Text>
                    </View>

                    {/* Price Row */}
                    <View style={styles.priceRow}>
                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>₹{finalPrice}</Text>
                            {hasDiscount && originalPrice > finalPrice && (
                                <Text style={styles.originalPrice}>₹{originalPrice}</Text>
                            )}
                        </View>
                    </View>

                    {/* Add to Cart Button */}
                    <TouchableOpacity activeOpacity={0.8} onPress={handleAddToCart}>
                        <Animated.View style={[styles.addButton, addButtonAnimatedStyle]}>
                            <Ionicons name="cart-outline" size={16} color={COLORS.textInverse} />
                            <Text style={styles.addButtonText}>Add</Text>
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

// Custom comparison to prevent unnecessary re-renders
const areEqual = (prevProps, nextProps) => {
    return (
        prevProps.book._id === nextProps.book._id &&
        prevProps.isWishlisted === nextProps.isWishlisted &&
        prevProps.book.price === nextProps.book.price
    );
};

export default memo(AnimatedBookCard, areEqual);

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
        ...SHADOWS.medium,
    },
    wishlistButton: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        zIndex: 10,
    },
    heartContainer: {
        width: 32,
        height: 32,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.glass,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    discountBadge: {
        position: 'absolute',
        top: SPACING.sm,
        left: SPACING.sm,
        zIndex: 10,
        backgroundColor: COLORS.orange,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.sm,
    },
    discountText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textInverse,
        fontWeight: '700',
        fontSize: 10,
    },
    cover: {
        width: '100%',
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    coverImage: {
        ...StyleSheet.absoluteFillObject,
    },
    coverOverlay: {
        position: 'absolute',
        bottom: SPACING.sm,
        left: SPACING.sm,
        right: SPACING.sm,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
        gap: 3,
    },
    ratingText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textInverse,
        fontWeight: '600',
        fontSize: 10,
    },
    info: {
        padding: SPACING.md,
    },
    title: {
        ...TYPOGRAPHY.h4,
        color: COLORS.textPrimary,
        marginBottom: 4,
        minHeight: 40,
    },
    author: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginBottom: SPACING.sm,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.sm,
        gap: 4,
    },
    categoryText: {
        ...TYPOGRAPHY.caption,
        fontWeight: '600',
        fontSize: 10,
    },
    priceRow: {
        marginBottom: SPACING.sm,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    price: {
        ...TYPOGRAPHY.h3,
        color: COLORS.primary,
        fontWeight: '700',
    },
    originalPrice: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textTertiary,
        textDecorationLine: 'line-through',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    addButtonText: {
        ...TYPOGRAPHY.buttonSmall,
        color: COLORS.textInverse,
    },
});
