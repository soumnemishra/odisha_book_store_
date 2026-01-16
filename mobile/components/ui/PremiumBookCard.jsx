// components/ui/PremiumBookCard.jsx - Premium Book Card Component (No Gradients)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS, getCategoryColor } from '../../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - (SPACING.lg * 3)) / 2;

/**
 * Premium Book Card Component
 */
export default function PremiumBookCard({ book, onPress, onAddToCart, onToggleWishlist, isWishlisted = false }) {
    const categoryColor = getCategoryColor(book.category);

    // Safely extract price values
    const getNumericPrice = (priceData, key) => {
        if (typeof priceData === 'number') return priceData;
        if (typeof priceData === 'object' && priceData !== null) {
            return key ? (priceData[key] || 0) : (priceData.discounted || priceData.original || 0);
        }
        return 0;
    };

    const finalPrice = book.finalPrice || getNumericPrice(book.price);
    const originalPrice = getNumericPrice(book.price, 'original');
    const hasDiscount = book.hasDiscount || (book.price?.discountPercent > 0);
    const discountPercent = book.price?.discountPercent || 0;

    // Get book title safely
    const getTitle = () => {
        if (typeof book.title === 'string') return book.title;
        if (typeof book.title === 'object' && book.title !== null) {
            return book.title.display || book.title.odia || book.title.english || 'Untitled';
        }
        return 'Untitled';
    };
    const title = getTitle();

    // Get category icon
    const getCategoryIcon = (category) => {
        const icons = {
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
        return icons[category] || 'book-outline';
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* Wishlist Heart */}
            <TouchableOpacity
                style={styles.wishlistButton}
                onPress={() => onToggleWishlist?.(book)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <View style={styles.heartContainer}>
                    <Ionicons
                        name={isWishlisted ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isWishlisted ? COLORS.error : COLORS.textPrimary}
                    />
                </View>
            </TouchableOpacity>

            {/* Discount Badge */}
            {hasDiscount && discountPercent > 0 && (
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{Math.round(discountPercent)}% OFF</Text>
                </View>
            )}

            {/* Book Cover */}
            <View style={[styles.cover, { backgroundColor: categoryColor }]}>
                <Ionicons
                    name={getCategoryIcon(book.category)}
                    size={48}
                    color="rgba(255,255,255,0.3)"
                />
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
                    <Ionicons name={getCategoryIcon(book.category)} size={12} color={categoryColor} />
                    <Text style={[styles.categoryText, { color: categoryColor }]} numberOfLines={1}>
                        {book.category || 'General'}
                    </Text>
                </View>

                {/* Price */}
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{finalPrice}</Text>
                    {hasDiscount && originalPrice > finalPrice && (
                        <Text style={styles.originalPrice}>₹{originalPrice}</Text>
                    )}
                </View>

                {/* Add Button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => onAddToCart?.(book)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="cart-outline" size={16} color={COLORS.surface} />
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

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
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    discountBadge: {
        position: 'absolute',
        top: SPACING.sm,
        left: SPACING.sm,
        zIndex: 10,
        backgroundColor: '#F97316',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    discountText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.surface,
        fontWeight: '700',
    },
    cover: {
        width: '100%',
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        padding: SPACING.md,
    },
    title: {
        ...TYPOGRAPHY.h4,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
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
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.sm,
        gap: 4,
    },
    categoryText: {
        ...TYPOGRAPHY.caption,
        fontWeight: '600',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
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
        ...TYPOGRAPHY.button,
        fontSize: 14,
        color: COLORS.surface,
    },
});
