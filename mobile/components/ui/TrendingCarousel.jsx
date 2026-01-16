// components/ui/TrendingCarousel.jsx - Horizontally Scrolling Book Carousel
import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    interpolate,
    Extrapolation,
    withSpring,
} from 'react-native-reanimated';
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
const ITEM_WIDTH = 180;
const ITEM_HEIGHT = 240;
const ITEM_SPACING = SPACING.md;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

/**
 * Individual carousel item with scale animation
 */
const CarouselItem = ({ book, index, scrollX, onPress, onAddToCart }) => {
    const categoryColor = getCategoryColor(book.category);

    // Get book title safely
    const getTitle = () => {
        if (typeof book.title === 'string') return book.title;
        if (typeof book.title === 'object' && book.title !== null) {
            return book.title.display || book.title.odia || book.title.english || 'Untitled';
        }
        return 'Untitled';
    };

    // Get price safely
    const getPrice = () => {
        if (book.finalPrice) return book.finalPrice;
        if (typeof book.price === 'number') return book.price;
        if (typeof book.price === 'object') {
            return book.price?.discounted || book.price?.original || 0;
        }
        return 0;
    };

    const inputRange = [
        (index - 1) * (ITEM_WIDTH + ITEM_SPACING),
        index * (ITEM_WIDTH + ITEM_SPACING),
        (index + 1) * (ITEM_WIDTH + ITEM_SPACING),
    ];

    const animatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.9, 1, 0.9],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.7, 1, 0.7],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ scale }],
            opacity,
        };
    });

    return (
        <Animated.View style={[styles.itemContainer, animatedStyle]}>
            <TouchableOpacity
                style={styles.item}
                onPress={() => onPress?.(book)}
                activeOpacity={0.9}
            >
                {/* Book cover with category color */}
                <View style={[styles.cover, { backgroundColor: categoryColor }]}>
                    <Ionicons
                        name="book"
                        size={48}
                        color="rgba(255,255,255,0.25)"
                    />

                    {/* Trending badge */}
                    <View style={styles.trendingBadge}>
                        <Ionicons name="trending-up" size={12} color={COLORS.textInverse} />
                        <Text style={styles.trendingText}>Trending</Text>
                    </View>
                </View>

                {/* Book info */}
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={2}>
                        {getTitle()}
                    </Text>
                    <Text style={styles.author} numberOfLines={1}>
                        {book.author || 'Unknown Author'}
                    </Text>

                    <View style={styles.footer}>
                        <Text style={styles.price}>₹{getPrice()}</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => onAddToCart?.(book)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="add" size={18} color={COLORS.textInverse} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

/**
 * TrendingCarousel - Horizontal scrolling book carousel with snap behavior
 */
export default function TrendingCarousel({
    books = [],
    title = "Trending Now",
    onBookPress,
    onAddToCart,
    onSeeAllPress,
}) {
    const scrollX = useSharedValue(0);
    const flatListRef = useRef(null);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    if (books.length === 0) return null;

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.sectionIcon}>
                        <Ionicons name="flame" size={18} color={COLORS.orange} />
                    </View>
                    <Text style={styles.sectionTitle}>{title}</Text>
                </View>
                {onSeeAllPress && (
                    <TouchableOpacity
                        style={styles.seeAllButton}
                        onPress={onSeeAllPress}
                    >
                        <Text style={styles.seeAllText}>See All</Text>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Carousel */}
            <AnimatedFlatList
                ref={flatListRef}
                data={books}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={ITEM_WIDTH + ITEM_SPACING}
                decelerationRate="fast"
                contentContainerStyle={styles.listContent}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                renderItem={({ item, index }) => (
                    <CarouselItem
                        book={item}
                        index={index}
                        scrollX={scrollX}
                        onPress={onBookPress}
                        onAddToCart={onAddToCart}
                    />
                )}
            />
        </View>
    );
}

/**
 * Mini horizontal book list (for Recently Viewed, etc.)
 */
export function MiniBookCarousel({ books = [], title, onBookPress }) {
    if (books.length === 0) return null;

    return (
        <View style={styles.miniContainer}>
            <Text style={styles.miniTitle}>{title}</Text>
            <FlatList
                data={books}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.miniListContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.miniItem}
                        onPress={() => onBookPress?.(item)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.miniCover, { backgroundColor: getCategoryColor(item.category) }]}>
                            <Ionicons name="book-outline" size={24} color="rgba(255,255,255,0.5)" />
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    sectionIcon: {
        width: 32,
        height: 32,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.warningLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.textPrimary,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    seeAllText: {
        ...TYPOGRAPHY.body,
        color: COLORS.primary,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.sm,
    },
    itemContainer: {
        width: ITEM_WIDTH,
        marginRight: ITEM_SPACING,
    },
    item: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    cover: {
        width: '100%',
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    trendingBadge: {
        position: 'absolute',
        top: SPACING.sm,
        left: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.sm,
        gap: 4,
    },
    trendingText: {
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
    },
    author: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        ...TYPOGRAPHY.h3,
        color: COLORS.primary,
        fontWeight: '700',
    },
    addButton: {
        width: 28,
        height: 28,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Mini carousel
    miniContainer: {
        marginTop: SPACING.lg,
        marginBottom: SPACING.md,
    },
    miniTitle: {
        ...TYPOGRAPHY.h4,
        color: COLORS.textPrimary,
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    miniListContent: {
        paddingHorizontal: SPACING.lg,
    },
    miniItem: {
        marginRight: SPACING.sm,
    },
    miniCover: {
        width: 60,
        height: 80,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
