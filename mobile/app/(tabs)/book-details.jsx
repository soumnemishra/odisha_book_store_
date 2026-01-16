// app/(tabs)/book-details.jsx - Premium Book Details with Parallax & Animations
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image,
    Share,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    withSpring,
    withSequence,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBook } from '../../hooks/useBooks';
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

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 350;
const COLLAPSED_HEADER = 100;

// Category icons
const getCategoryIcon = (category) => {
    const icons = {
        Biography: 'person', Autobiography: 'person-circle', Religion: 'flower',
        Novel: 'book', Fiction: 'sparkles', History: 'time', Science: 'flask',
        Educational: 'school', Poetry: 'heart', Drama: 'film', Children: 'happy',
        Reference: 'library', Philosophy: 'bulb', Politics: 'flag',
        Essays: 'document-text', Stories: 'chatbubbles', Collection: 'albums',
    };
    return icons[category] || 'book-outline';
};

/**
 * Premium Skeleton Loader
 */
const SkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
        <View style={styles.skeletonCover} />
        <View style={styles.skeletonContent}>
            <View style={[styles.skeletonBar, { width: '80%', height: 24 }]} />
            <View style={[styles.skeletonBar, { width: '50%', height: 16 }]} />
            <View style={[styles.skeletonBar, { width: '40%', height: 32, marginTop: 16 }]} />
        </View>
    </View>
);

export default function BookDetails() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const toast = useToast();
    const params = useLocalSearchParams();
    const bookId = params.bookId;
    const scrollY = useSharedValue(0);
    const buttonScale = useSharedValue(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);

    // Fetch book data
    const { data, isLoading, error } = useBook(bookId);
    const book = data?.data || data;

    // Cart store
    const { addItem, isInCart, getItemQuantity } = useCartStore();
    const inCart = book ? isInCart(bookId) : false;
    const cartQuantity = book ? getItemQuantity(bookId) : 0;

    // Scroll handler for parallax
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // Header parallax animation
    const headerStyle = useAnimatedStyle(() => ({
        height: interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT - COLLAPSED_HEADER],
            [HEADER_HEIGHT, COLLAPSED_HEADER],
            Extrapolation.CLAMP
        ),
    }));

    const headerImageStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: interpolate(
                    scrollY.value,
                    [-100, 0],
                    [1.5, 1],
                    Extrapolation.CLAMP
                ),
            },
            {
                translateY: interpolate(
                    scrollY.value,
                    [0, HEADER_HEIGHT],
                    [0, -HEADER_HEIGHT / 3],
                    Extrapolation.CLAMP
                ),
            },
        ],
        opacity: interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT - COLLAPSED_HEADER - 50],
            [1, 0.3],
            Extrapolation.CLAMP
        ),
    }));

    const titleOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(
            scrollY.value,
            [HEADER_HEIGHT - COLLAPSED_HEADER - 100, HEADER_HEIGHT - COLLAPSED_HEADER],
            [0, 1],
            Extrapolation.CLAMP
        ),
    }));

    // Button animation
    const buttonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const handleAddToCart = useCallback(() => {
        if (!book) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        buttonScale.value = withSequence(
            withSpring(0.95, ANIMATIONS.springSnappy),
            withSpring(1, ANIMATIONS.springBouncy)
        );

        addItem(book);
        const title = book.title?.display || book.title?.english || book.title?.odia || 'Book';
        toast.cart(`"${title}" added to cart`, {
            action: {
                label: 'View Cart',
                onPress: () => router.push('/(tabs)/cart'),
            },
        });
    }, [book, addItem, toast, router, buttonScale]);

    const handleBuyNow = useCallback(() => {
        if (!book) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        addItem(book);
        router.push('/(tabs)/checkout');
    }, [book, addItem, router]);

    const handleWishlist = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsWishlisted((prev) => !prev);
        const title = book?.title?.display || 'Book';
        if (!isWishlisted) {
            toast.wishlist(`"${title}" saved to wishlist`);
        } else {
            toast.info(`Removed from wishlist`);
        }
    }, [book, isWishlisted, toast]);

    const handleShare = useCallback(async () => {
        if (!book) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            const title = book.title?.display || book.title?.english || 'Book';
            await Share.share({
                message: `Check out "${title}" by ${book.author} on Odisha Book Store!`,
            });
        } catch (error) {
            console.error(error);
        }
    }, [book]);

    const handleGoBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    // Loading state
    if (isLoading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.loadingHeader}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>
                <SkeletonLoader />
            </View>
        );
    }

    // Error state
    if (error || !book) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.loadingHeader}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
                    <Text style={styles.errorText}>
                        {error ? 'Error loading book' : 'Book not found'}
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                        <Text style={styles.retryText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const categoryColor = getCategoryColor(book.category);
    const categoryIcon = getCategoryIcon(book.category);
    const hasDiscount = book.hasDiscount || (book.price?.discountPercent > 0);
    const finalPrice = book.finalPrice || book.price?.discounted || book.price?.original || 0;
    const originalPrice = book.price?.original || finalPrice;
    const title = book.title?.display || book.title?.english || book.title?.odia || 'Untitled';

    return (
        <View style={styles.container}>
            {/* Parallax Header */}
            <Animated.View style={[styles.headerContainer, headerStyle]}>
                <Animated.View style={[styles.headerBackground, { backgroundColor: categoryColor }, headerImageStyle]}>
                    {book.image ? (
                        <Animated.Image
                            source={{ uri: book.image }}
                            style={styles.headerImage}
                            resizeMode="cover"
                            sharedTransitionTag={`book-cover-${bookId}`}
                        />
                    ) : (
                        <Animated.View sharedTransitionTag={`book-cover-${bookId}`} style={styles.placeholderIcon}>
                            <Ionicons name={categoryIcon} size={100} color="rgba(255,255,255,0.2)" />
                        </Animated.View>
                    )}
                </Animated.View>

                {/* Header Overlay */}
                <View style={[styles.headerOverlay, { paddingTop: insets.top }]}>
                    {/* Back & Actions */}
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
                            <Ionicons name="arrow-back" size={22} color="#FFF" />
                        </TouchableOpacity>

                        <Animated.Text style={[styles.headerTitle, titleOpacity]} numberOfLines={1}>
                            {title}
                        </Animated.Text>

                        <View style={styles.headerRight}>
                            <TouchableOpacity onPress={handleWishlist} style={styles.headerButton}>
                                <Ionicons
                                    name={isWishlisted ? 'heart' : 'heart-outline'}
                                    size={22}
                                    color={isWishlisted ? COLORS.error : '#FFF'}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                                <Ionicons name="share-outline" size={22} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Discount Badge */}
                    {hasDiscount && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                                {Math.round(book.price?.discountPercent || 0)}% OFF
                            </Text>
                        </View>
                    )}
                </View>
            </Animated.View>

            {/* Scrollable Content */}
            <Animated.ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_HEIGHT }]}
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                {/* Main Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.bookTitle}>{title}</Text>
                    {book.title?.odia && book.title.odia !== title && (
                        <Text style={styles.odiaTitle}>{book.title.odia}</Text>
                    )}
                    <Text style={styles.author}>by {book.author || 'Unknown Author'}</Text>

                    {/* Rating */}
                    <View style={styles.ratingRow}>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={14} color={COLORS.gold} />
                            <Text style={styles.ratingText}>{book.rating?.toFixed(1) || '4.5'}</Text>
                        </View>
                        <Text style={styles.ratingCount}>
                            ({book.reviews || Math.floor(Math.random() * 100 + 50)} reviews)
                        </Text>
                    </View>

                    {/* Tags */}
                    <View style={styles.tagsRow}>
                        <View style={[styles.tag, { backgroundColor: `${categoryColor}15` }]}>
                            <Ionicons name={categoryIcon} size={12} color={categoryColor} />
                            <Text style={[styles.tagText, { color: categoryColor }]}>{book.category}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Ionicons name="language" size={12} color={COLORS.primary} />
                            <Text style={styles.tagText}>{book.language || 'Odia'}</Text>
                        </View>
                    </View>
                </View>

                {/* Price Card */}
                <View style={styles.priceCard}>
                    <View style={styles.priceRow}>
                        <Text style={styles.finalPrice}>₹{finalPrice}</Text>
                        {hasDiscount && (
                            <>
                                <Text style={styles.originalPrice}>₹{originalPrice}</Text>
                                <View style={styles.saveBadge}>
                                    <Text style={styles.saveText}>Save ₹{originalPrice - finalPrice}</Text>
                                </View>
                            </>
                        )}
                    </View>
                    <Text style={styles.taxText}>Inclusive of all taxes</Text>
                </View>

                {/* Description */}
                {book.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About this Book</Text>
                        <Text
                            style={styles.description}
                            numberOfLines={showFullDescription ? undefined : 4}
                        >
                            {book.description}
                        </Text>
                        {book.description.length > 200 && (
                            <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
                                <Text style={styles.readMore}>
                                    {showFullDescription ? 'Show less' : 'Read more'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Specifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Specifications</Text>
                    <View style={styles.specsGrid}>
                        <SpecItem icon="business-outline" label="Publisher" value={book.publisher || 'N/A'} />
                        <SpecItem icon="document-text-outline" label="Pages" value={book.pages || 'N/A'} />
                        <SpecItem icon="calendar-outline" label="Published" value={book.year || 'N/A'} />
                        <SpecItem icon="scale-outline" label="Weight" value={book.weight ? `${book.weight}g` : 'N/A'} />
                    </View>
                </View>

                {/* Spacer for sticky footer */}
                <View style={{ height: 120 }} />
            </Animated.ScrollView>

            {/* Sticky Footer */}
            <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + SPACING.md }]}>
                <View style={styles.footerPrice}>
                    <Text style={styles.footerPriceLabel}>Price</Text>
                    <Text style={styles.footerPriceValue}>₹{finalPrice}</Text>
                </View>

                <View style={styles.footerButtons}>
                    <TouchableOpacity
                        style={[styles.cartButton, inCart && styles.cartButtonActive]}
                        onPress={handleAddToCart}
                        activeOpacity={0.8}
                    >
                        <Animated.View style={buttonStyle}>
                            <Ionicons
                                name={inCart ? 'checkmark' : 'cart-outline'}
                                size={20}
                                color={inCart ? COLORS.success : COLORS.primary}
                            />
                        </Animated.View>
                        {inCart && <Text style={styles.cartQuantity}>{cartQuantity}</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buyButton}
                        onPress={handleBuyNow}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.buyButtonText}>Buy Now</Text>
                        <Ionicons name="flash" size={18} color={COLORS.textInverse} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// Spec Item Component
const SpecItem = ({ icon, label, value }) => (
    <View style={styles.specItem}>
        <Ionicons name={icon} size={20} color={COLORS.textTertiary} />
        <Text style={styles.specLabel}>{label}</Text>
        <Text style={styles.specValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // Header
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        overflow: 'hidden',
    },
    headerBackground: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerImage: {
        ...StyleSheet.absoluteFillObject,
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: SPACING.lg,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.md,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...TYPOGRAPHY.h3,
        color: '#FFF',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: SPACING.sm,
    },
    headerRight: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    discountBadge: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.lg,
        backgroundColor: COLORS.error,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    discountText: {
        ...TYPOGRAPHY.button,
        color: '#FFF',
        fontSize: 14,
    },

    // Loading
    loadingHeader: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surfaceDim,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Skeleton
    skeletonContainer: {
        flex: 1,
    },
    skeletonCover: {
        height: HEADER_HEIGHT,
        backgroundColor: COLORS.surfaceDim,
    },
    skeletonContent: {
        padding: SPACING.xl,
        gap: SPACING.md,
    },
    skeletonBar: {
        backgroundColor: COLORS.surfaceDim,
        borderRadius: BORDER_RADIUS.sm,
    },

    // Error
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    errorText: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textSecondary,
        marginTop: SPACING.lg,
    },
    retryButton: {
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.lg,
    },
    retryText: {
        ...TYPOGRAPHY.button,
        color: COLORS.textInverse,
    },

    // Scroll
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: SPACING.xl,
    },

    // Info Card
    infoCard: {
        backgroundColor: COLORS.surface,
        marginTop: -SPACING.xl,
        borderTopLeftRadius: BORDER_RADIUS.xxl,
        borderTopRightRadius: BORDER_RADIUS.xxl,
        padding: SPACING.xl,
        ...SHADOWS.small,
    },
    bookTitle: {
        ...TYPOGRAPHY.displayMedium,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    odiaTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    author: {
        ...TYPOGRAPHY.body,
        color: COLORS.textTertiary,
        fontStyle: 'italic',
        marginBottom: SPACING.md,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.goldSoft,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        gap: 4,
    },
    ratingText: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        color: COLORS.goldDark,
    },
    ratingCount: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textTertiary,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primarySoft,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.round,
        gap: 4,
    },
    tagText: {
        ...TYPOGRAPHY.caption,
        fontWeight: '600',
        color: COLORS.primary,
    },

    // Price Card
    priceCard: {
        backgroundColor: COLORS.surface,
        marginTop: SPACING.md,
        padding: SPACING.xl,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.xs,
    },
    finalPrice: {
        ...TYPOGRAPHY.priceLarge,
        color: COLORS.primary,
    },
    originalPrice: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textTertiary,
        textDecorationLine: 'line-through',
    },
    saveBadge: {
        backgroundColor: COLORS.successLight,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    saveText: {
        ...TYPOGRAPHY.caption,
        fontWeight: '700',
        color: COLORS.success,
    },
    taxText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textTertiary,
    },

    // Section
    section: {
        backgroundColor: COLORS.surface,
        marginTop: SPACING.md,
        padding: SPACING.xl,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    description: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    readMore: {
        ...TYPOGRAPHY.body,
        color: COLORS.primary,
        fontWeight: '600',
        marginTop: SPACING.sm,
    },

    // Specs
    specsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
    },
    specItem: {
        width: (width - SPACING.xl * 2 - SPACING.md) / 2,
        backgroundColor: COLORS.surfaceDim,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        gap: SPACING.xs,
    },
    specLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textTertiary,
        textTransform: 'uppercase',
    },
    specValue: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },

    // Sticky Footer
    stickyFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        ...SHADOWS.large,
    },
    footerPrice: {
        flex: 1,
    },
    footerPriceLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textTertiary,
    },
    footerPriceValue: {
        ...TYPOGRAPHY.priceLarge,
        color: COLORS.textPrimary,
    },
    footerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    cartButton: {
        width: 52,
        height: 52,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 2,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
    },
    cartButtonActive: {
        backgroundColor: COLORS.successLight,
        borderColor: COLORS.success,
    },
    cartQuantity: {
        ...TYPOGRAPHY.caption,
        fontWeight: '700',
        color: COLORS.success,
        marginTop: 2,
    },
    buyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xxl,
        paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        gap: SPACING.sm,
        ...SHADOWS.glow,
    },
    buyButtonText: {
        ...TYPOGRAPHY.button,
        color: COLORS.textInverse,
    },
});
