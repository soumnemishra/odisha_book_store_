// app/(tabs)/wishlist.jsx - Premium Wishlist Screen
import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    FadeInDown,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useToast } from '../../components/ui/Toast';
import {
    COLORS,
    TYPOGRAPHY,
    SPACING,
    BORDER_RADIUS,
    SHADOWS,
    ANIMATIONS,
    getCategoryColor,
} from '../../constants/theme';

const { width } = Dimensions.get('window');

// Category icons
const getCategoryIcon = (category) => {
    const icons = {
        Biography: 'person', Autobiography: 'person-circle', Religion: 'flower',
        Novel: 'book', Fiction: 'sparkles', History: 'time', Science: 'flask',
        Educational: 'school', Poetry: 'heart', Drama: 'film', Children: 'happy',
    };
    return icons[category] || 'book-outline';
};

/**
 * Wishlist Item Component
 */
const WishlistItem = ({ book, onRemove, onAddToCart, onPress, index }) => {
    const scale = useSharedValue(1);
    const categoryColor = getCategoryColor(book.category);

    const getTitle = () => {
        if (typeof book.title === 'string') return book.title;
        return book.title?.display || book.title?.english || book.title?.odia || 'Untitled';
    };

    const getPrice = () => {
        if (book.finalPrice) return book.finalPrice;
        if (typeof book.price === 'number') return book.price;
        if (typeof book.price === 'object') {
            return book.price?.discounted || book.price?.original || 0;
        }
        return 0;
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSequence(
            withSpring(0.98, ANIMATIONS.springSnappy),
            withSpring(1, ANIMATIONS.spring)
        );
        onPress();
    };

    const handleAddToCart = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        scale.value = withSequence(
            withSpring(0.95, ANIMATIONS.springSnappy),
            withSpring(1, ANIMATIONS.springBouncy)
        );
        onAddToCart();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            style={[styles.itemCard, animatedStyle]}
        >
            <TouchableOpacity
                style={styles.itemContent}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                {/* Book Cover */}
                <View style={[styles.coverContainer, { backgroundColor: categoryColor }]}>
                    {book.image ? (
                        <Image source={{ uri: book.image }} style={styles.coverImage} resizeMode="cover" />
                    ) : (
                        <Ionicons name={getCategoryIcon(book.category)} size={32} color="rgba(255,255,255,0.4)" />
                    )}
                </View>

                {/* Book Info */}
                <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle} numberOfLines={2}>{getTitle()}</Text>
                    <Text style={styles.bookAuthor} numberOfLines={1}>{book.author || 'Unknown Author'}</Text>

                    <View style={styles.categoryBadge}>
                        <Ionicons name={getCategoryIcon(book.category)} size={10} color={categoryColor} />
                        <Text style={[styles.categoryText, { color: categoryColor }]}>{book.category}</Text>
                    </View>

                    <Text style={styles.bookPrice}>₹{getPrice()}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            onRemove();
                        }}
                    >
                        <Ionicons name="heart" size={22} color={COLORS.error} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cartButton}
                        onPress={handleAddToCart}
                    >
                        <Ionicons name="cart-outline" size={18} color={COLORS.textInverse} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

/**
 * Empty Wishlist State
 */
const EmptyWishlist = ({ onBrowse }) => (
    <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
            <Ionicons name="heart-outline" size={80} color={COLORS.textTertiary} />
        </View>
        <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
        <Text style={styles.emptySubtitle}>
            Save your favorite books here by tapping the heart icon
        </Text>
        <TouchableOpacity style={styles.browseButton} onPress={onBrowse}>
            <Ionicons name="compass-outline" size={20} color={COLORS.textInverse} />
            <Text style={styles.browseButtonText}>Discover Books</Text>
        </TouchableOpacity>
    </View>
);

export default function Wishlist() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const toast = useToast();

    const { items, removeItem, getCount } = useWishlistStore();
    const { addItem: addToCart } = useCartStore();

    const handleRemove = useCallback((book) => {
        removeItem(book._id);
        const title = typeof book.title === 'string'
            ? book.title
            : book.title?.display || 'Item';
        toast.info(`"${title}" removed from wishlist`);
    }, [removeItem, toast]);

    const handleAddToCart = useCallback((book) => {
        addToCart(book);
        const title = typeof book.title === 'string'
            ? book.title
            : book.title?.display || 'Book';
        toast.cart(`"${title}" added to cart`, {
            action: {
                label: 'View Cart',
                onPress: () => router.push('/(tabs)/cart'),
            },
        });
    }, [addToCart, toast, router]);

    const handleBookPress = useCallback((book) => {
        router.push({ pathname: '/(tabs)/book-details', params: { bookId: book._id } });
    }, [router]);

    const handleBrowse = useCallback(() => {
        router.push('/(tabs)/');
    }, [router]);

    const renderItem = useCallback(({ item, index }) => (
        <WishlistItem
            book={item}
            index={index}
            onRemove={() => handleRemove(item)}
            onAddToCart={() => handleAddToCart(item)}
            onPress={() => handleBookPress(item)}
        />
    ), [handleRemove, handleAddToCart, handleBookPress]);

    const keyExtractor = useCallback((item) => item._id, []);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Wishlist</Text>
                    {getCount() > 0 && (
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{getCount()}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.headerRight} />
            </View>

            {/* Content */}
            {items.length === 0 ? (
                <EmptyWishlist onBrowse={handleBrowse} />
            ) : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surfaceDim,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.textPrimary,
    },
    countBadge: {
        backgroundColor: COLORS.error,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.round,
    },
    countText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textInverse,
        fontWeight: '700',
    },
    headerRight: {
        width: 40,
    },

    // List
    listContent: {
        padding: SPACING.lg,
        gap: SPACING.md,
    },

    // Item Card
    itemCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    itemContent: {
        flexDirection: 'row',
        padding: SPACING.md,
    },
    coverContainer: {
        width: 80,
        height: 110,
        borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    bookInfo: {
        flex: 1,
        marginLeft: SPACING.md,
        justifyContent: 'center',
    },
    bookTitle: {
        ...TYPOGRAPHY.h4,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    bookAuthor: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginBottom: SPACING.sm,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: COLORS.surfaceDim,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
        gap: 4,
        marginBottom: SPACING.sm,
    },
    categoryText: {
        ...TYPOGRAPHY.caption,
        fontWeight: '600',
    },
    bookPrice: {
        ...TYPOGRAPHY.h3,
        color: COLORS.primary,
    },

    // Actions
    actions: {
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: SPACING.sm,
    },
    removeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.errorLight || '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xxl,
    },
    emptyIconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: COLORS.surfaceDim,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    emptyTitle: {
        ...TYPOGRAPHY.displayMedium,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    emptySubtitle: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    browseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xxl,
        paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.xl,
        gap: SPACING.sm,
        ...SHADOWS.glow,
    },
    browseButtonText: {
        ...TYPOGRAPHY.button,
        color: COLORS.textInverse,
    },
});
