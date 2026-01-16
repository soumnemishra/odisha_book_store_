// screens/BookDetails.js - Premium Book Details Screen with Skeleton Loader
import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBook } from '../hooks/useBooks';
import { useCartStore } from '../store/cartStore';

const { width } = Dimensions.get('window');

/**
 * Skeleton Loader Component - Gray pulsing bars for perceived speed
 */
const SkeletonLoader = () => {
    const pulseAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [pulseAnim]);

    const opacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={styles.skeletonContainer}>
            {/* Cover Skeleton */}
            <Animated.View style={[styles.skeletonCover, { opacity }]} />

            {/* Title Skeleton */}
            <View style={styles.skeletonSection}>
                <Animated.View style={[styles.skeletonTitle, { opacity }]} />
                <Animated.View style={[styles.skeletonSubtitle, { opacity }]} />
            </View>

            {/* Badges Skeleton */}
            <View style={styles.skeletonBadges}>
                <Animated.View style={[styles.skeletonBadge, { opacity }]} />
                <Animated.View style={[styles.skeletonBadge, { opacity }]} />
            </View>

            {/* Price Skeleton */}
            <View style={styles.skeletonSection}>
                <Animated.View style={[styles.skeletonPrice, { opacity }]} />
            </View>

            {/* Description Skeleton */}
            <View style={styles.skeletonSection}>
                <Animated.View style={[styles.skeletonLine, { opacity }]} />
                <Animated.View style={[styles.skeletonLine, { opacity }]} />
                <Animated.View style={[styles.skeletonLineShort, { opacity }]} />
            </View>
        </View>
    );
};

/**
 * Get color scheme based on book category (reuse logic from BookCard)
 */
const getCategoryColor = (category) => {
    const categoryColors = {
        'Biography': '#6366F1', 'Autobiography': '#8B5CF6', 'Religion': '#F97316',
        'Novel': '#14B8A6', 'Fiction': '#EC4899', 'History': '#EAB308',
        'Science': '#3B82F6', 'Educational': '#10B981', 'Poetry': '#A855F7',
        'Drama': '#EF4444', 'Children': '#F59E0B', 'Reference': '#6B7280',
        'Philosophy': '#7C3AED', 'Politics': '#DC2626', 'Essays': '#059669',
        'Stories': '#F472B6', 'Collection': '#8B5CF6',
    };
    return categoryColors[category] || '#9CA3AF';
};

/**
 * Get icon based on category
 */
const getCategoryIcon = (category) => {
    const categoryIcons = {
        'Biography': 'person', 'Autobiography': 'person-circle', 'Religion': 'flower',
        'Novel': 'book', 'Fiction': 'sparkles', 'History': 'time',
        'Science': 'flask', 'Educational': 'school', 'Poetry': 'heart',
        'Drama': 'film', 'Children': 'happy', 'Reference': 'library',
        'Philosophy': 'bulb', 'Politics': 'flag', 'Essays': 'document-text',
        'Stories': 'chatbubbles', 'Collection': 'albums',
    };
    return categoryIcons[category] || 'book-outline';
};

export default function BookDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const bookId = params.bookId;

    // Fetch book data using our custom hook
    const { data, isLoading, error } = useBook(bookId);
    const book = data?.data || data; // Handle both nested and flat response

    // Cart store actions
    const addItem = useCartStore((state) => state.addItem);
    const isInCart = useCartStore((state) => state.isInCart);
    const getItemQuantity = useCartStore((state) => state.getItemQuantity);

    const handleAddToCart = () => {
        if (book) {
            addItem(book);
        }
    };

    const handleGoBack = () => {
        router.back();
    };

    // Show skeleton loader while loading
    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.scrollView}>
                    <SkeletonLoader />
                </ScrollView>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
                    <Text style={styles.errorText}>Error loading book details</Text>
                    <Text style={styles.errorSubtext}>{error?.message || 'Please try again'}</Text>
                </View>
            </View>
        );
    }

    if (!book) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="book-outline" size={60} color="#9CA3AF" />
                    <Text style={styles.errorText}>Book not found</Text>
                </View>
            </View>
        );
    }

    const categoryColor = getCategoryColor(book.category);
    const categoryIcon = getCategoryIcon(book.category);
    const hasDiscount = book.hasDiscount || (book.price?.discountPercent > 0);
    const finalPrice = book.finalPrice || book.price?.discounted || book.price?.original || 0;
    const originalPrice = book.price?.original || finalPrice;
    const savings = hasDiscount ? originalPrice - finalPrice : 0;
    const inCart = isInCart(bookId);
    const cartQuantity = getItemQuantity(bookId);

    return (
        <View style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Book Details</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Dynamic Cover - Large Version */}
                <View style={[styles.largeCover, { backgroundColor: categoryColor }]}>
                    <View style={styles.largeCoverIconContainer}>
                        <Ionicons name={categoryIcon} size={48} color="rgba(255,255,255,0.2)" />
                    </View>

                    <View style={styles.largeCoverTextContainer}>
                        <Text style={styles.largeCoverTitle}>
                            {book.title?.odia || book.title?.display || book.title || 'Untitled'}
                        </Text>
                    </View>

                    {hasDiscount && (
                        <View style={styles.largeDiscountBadge}>
                            <Text style={styles.largeDiscountText}>
                                {book.price?.discountPercent || 0}% OFF
                            </Text>
                        </View>
                    )}
                </View>

                {/* Info Block - Title (Odia & English), Author */}
                <View style={styles.infoBlock}>
                    <Text style={styles.odiaTitle}>
                        {book.title?.odia || book.title?.display || book.title || 'Untitled'}
                    </Text>
                    {book.title?.english && book.title.english !== book.title.display && (
                        <Text style={styles.englishTitle}>{book.title.english}</Text>
                    )}
                    <Text style={styles.author}>by {book.author}</Text>

                    {/* Badges for Language and Category */}
                    <View style={styles.badgesContainer}>
                        <View style={styles.badge}>
                            <Ionicons name="language" size={14} color="#059669" />
                            <Text style={styles.badgeText}>
                                {book.language === 'Odia' ? 'ଓଡ଼ିଆ' : book.language}
                            </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: `${categoryColor}15` }]}>
                            <Ionicons name={categoryIcon} size={14} color={categoryColor} />
                            <Text style={[styles.badgeText, { color: categoryColor }]}>
                                {book.category}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Price Block */}
                <View style={styles.priceBlock}>
                    <View style={styles.priceRow}>
                        <Text style={styles.finalPrice}>₹{finalPrice}</Text>
                        {hasDiscount && (
                            <>
                                <Text style={styles.crossedPrice}>₹{originalPrice}</Text>
                                <View style={styles.saveBadge}>
                                    <Text style={styles.saveText}>Save ₹{savings}</Text>
                                </View>
                            </>
                        )}
                    </View>
                    {!hasDiscount && <Text style={styles.priceLabel}>Net Price</Text>}
                    {hasDiscount && (
                        <Text style={styles.priceLabel}>
                            You save {book.price?.discountPercent}% on this book
                        </Text>
                    )}
                </View>

                {/* Description Block - Hide if missing */}
                {book.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{book.description}</Text>
                    </View>
                )}

                {/* Specs Grid - 2x2 Grid */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Specifications</Text>
                    <View style={styles.specsGrid}>
                        {/* Publisher */}
                        <View style={styles.specItem}>
                            <Ionicons name="business-outline" size={20} color="#6B7280" />
                            <Text style={styles.specLabel}>Publisher</Text>
                            <Text style={styles.specValue}>
                                {book.publisher || 'Not specified'}
                            </Text>
                        </View>

                        {/* Pages */}
                        <View style={styles.specItem}>
                            <Ionicons name="document-text-outline" size={20} color="#6B7280" />
                            <Text style={styles.specLabel}>Pages</Text>
                            <Text style={styles.specValue}>
                                {book.pages || 'N/A'}
                            </Text>
                        </View>

                        {/* Weight (useful for shipping calc later) */}
                        <View style={styles.specItem}>
                            <Ionicons name="scale-outline" size={20} color="#6B7280" />
                            <Text style={styles.specLabel}>Weight</Text>
                            <Text style={styles.specValue}>
                                {book.weight ? `${book.weight}g` : 'N/A'}
                            </Text>
                        </View>

                        {/* Academic Grade */}
                        <View style={styles.specItem}>
                            <Ionicons name="school-outline" size={20} color="#6B7280" />
                            <Text style={styles.specLabel}>Grade</Text>
                            <Text style={styles.specValue}>
                                {book.academicGrade || book.grade || 'General'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Bottom padding for sticky footer */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Sticky Footer - Add to Cart Button */}
            <View style={styles.stickyFooter}>
                <TouchableOpacity
                    style={[styles.addToCartButton, inCart && styles.addToCartButtonActive]}
                    onPress={handleAddToCart}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={inCart ? "checkmark-circle" : "cart"}
                        size={24}
                        color="#FFF"
                    />
                    <Text style={styles.addToCartButtonText}>
                        {inCart ? `In Cart (${cartQuantity})` : 'Add to Cart'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },

    // Large Dynamic Cover
    largeCover: {
        height: 320,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    largeCoverIconContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    largeCoverTextContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    largeCoverTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    largeDiscountBadge: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: '#EF4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    largeDiscountText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },

    // Info Block
    infoBlock: {
        backgroundColor: '#FFF',
        padding: 20,
        marginTop: -20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    odiaTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
    },
    englishTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 8,
    },
    author: {
        fontSize: 15,
        color: '#9CA3AF',
        fontStyle: 'italic',
        marginBottom: 16,
    },
    badgesContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#ECFDF5',
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#059669',
    },

    // Price Block
    priceBlock: {
        backgroundColor: '#FFF',
        padding: 20,
        marginTop: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 6,
    },
    finalPrice: {
        fontSize: 32,
        fontWeight: '700',
        color: '#059669',
    },
    crossedPrice: {
        fontSize: 20,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    saveBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    saveText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#D97706',
    },
    priceLabel: {
        fontSize: 13,
        color: '#6B7280',
    },

    // Section
    section: {
        backgroundColor: '#FFF',
        padding: 20,
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        color: '#4B5563',
    },

    // Specs Grid
    specsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    specItem: {
        width: (width - 64) / 2,
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        gap: 6,
    },
    specLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
    },
    specValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },

    // Sticky Footer
    stickyFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    addToCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#059669',
        paddingVertical: 16,
        borderRadius: 12,
    },
    addToCartButtonActive: {
        backgroundColor: '#10B981',
    },
    addToCartButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },

    // Error State
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#EF4444',
        marginTop: 16,
    },
    errorSubtext: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
    },

    // Skeleton Loader
    skeletonContainer: {
        padding: 0,
    },
    skeletonCover: {
        width: '100%',
        height: 320,
        backgroundColor: '#E5E7EB',
    },
    skeletonSection: {
        backgroundColor: '#FFF',
        padding: 20,
        marginTop: 12,
        gap: 10,
    },
    skeletonTitle: {
        width: '80%',
        height: 28,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
    },
    skeletonSubtitle: {
        width: '60%',
        height: 20,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
    },
    skeletonBadges: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        marginTop: 12,
    },
    skeletonBadge: {
        width: 80,
        height: 32,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
    },
    skeletonPrice: {
        width: '40%',
        height: 36,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
    },
    skeletonLine: {
        width: '100%',
        height: 16,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    skeletonLineShort: {
        width: '70%',
        height: 16,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
});
