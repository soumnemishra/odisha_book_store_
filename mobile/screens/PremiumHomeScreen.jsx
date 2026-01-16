// screens/PremiumHomeScreen.jsx - Luxury E-Commerce Home Screen
import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    Dimensions,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useInfiniteBooks } from '../hooks/useBooks';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useToast } from '../components/ui/Toast';

// Premium UI Components
import AnimatedHeroBanner, { PromoBanner } from '../components/ui/AnimatedHeroBanner';
import TrendingCarousel from '../components/ui/TrendingCarousel';
import AnimatedBookCard from '../components/ui/AnimatedBookCard';
import CategoryPills from '../components/ui/CategoryPills';
import DynamicSearchBar from '../components/ui/DynamicSearchBar';
import StickyCartCTA from '../components/ui/StickyCartCTA';
import { HomeScreenSkeleton, BookCardSkeleton } from '../components/ui/SkeletonLoader';
import CustomRefreshControl, { getRefreshControlProps } from '../components/ui/CustomRefreshControl';
import {
    COLORS,
    TYPOGRAPHY,
    SPACING,
    BORDER_RADIUS,
    SHADOWS,
} from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

/**
 * Premium Home Screen - Luxurious E-Commerce Experience
 * Features: Parallax hero, trending carousel, animated book cards, sticky CTA
 */
export default function PremiumHomeScreen() {
    const router = useRouter();
    const toast = useToast();
    const [searchValue, setSearchValue] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { addItem, getItemCount, getTotal } = useCartStore();
    const { isWishlisted, toggleItem: toggleWishlist } = useWishlistStore();
    const scrollY = useSharedValue(0);

    // Fetch books with infinite scroll
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch,
        isRefetching,
    } = useInfiniteBooks({
        category: selectedCategory === 'all' ? null : selectedCategory,
        search: searchValue,
    });

    // Flatten pages into single array
    const allBooks = data?.pages.flatMap((page) => page.books) || [];
    const totalBooks = data?.pages[0]?.totalBooks || 0;

    // Get trending books (first 8 for carousel)
    const trendingBooks = allBooks.slice(0, 8);
    // Rest for grid
    const gridBooks = allBooks.slice(8);

    // Scroll handler for parallax
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const handleBookPress = useCallback((book) => {
        router.push({ pathname: '/(tabs)/book-details', params: { bookId: book._id } });
    }, [router]);

    const handleAddToCart = useCallback((book) => {
        addItem(book);
        const title = typeof book.title === 'string' ? book.title :
            book.title?.display || book.title?.english || 'Book';
        toast.cart(`"${title}" added to cart`, {
            action: {
                label: 'View Cart',
                onPress: () => router.push('/(tabs)/cart'),
            },
        });
    }, [addItem, toast, router]);

    const handleToggleWishlist = useCallback((book) => {
        const title = typeof book.title === 'string' ? book.title :
            book.title?.display || book.title?.english || 'Book';
        const wasAdded = toggleWishlist(book);
        if (wasAdded) {
            toast.wishlist(`"${title}" saved to wishlist`);
        } else {
            toast.info(`Removed from wishlist`);
        }
    }, [toast, toggleWishlist]);

    const handleClearSearch = () => {
        setSearchValue('');
    };

    const handleCheckout = () => {
        router.push('/(tabs)/cart');
    };

    // Section Header Component
    const renderSectionHeader = (title, subtitle, icon, iconColor) => (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
                {icon && (
                    <View style={[styles.sectionIcon, { backgroundColor: `${iconColor}20` }]}>
                        <Ionicons name={icon} size={18} color={iconColor} />
                    </View>
                )}
                <View>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
                </View>
            </View>
        </View>
    );

    // Render individual book card - minimal dependencies to prevent re-renders
    const renderBookItem = useCallback(({ item }) => (
        <AnimatedBookCard
            book={item}
            onPress={handleBookPress}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={isWishlisted(item._id)}
        />
    ), [handleBookPress, handleAddToCart, handleToggleWishlist, isWishlisted]);

    // Stable key extractor
    const keyExtractor = useCallback((item) => item._id, []);

    // Header component with hero, search, categories, trending
    const renderHeader = () => (
        <View>
            {/* Hero Banner with Parallax */}
            <AnimatedHeroBanner
                scrollY={scrollY}
                bookCount={totalBooks}
                onExplorePress={() => {
                    // Scroll to books section
                }}
            />

            {/* Promo Banner */}
            <PromoBanner
                title="Free Shipping"
                subtitle="On orders above ₹499"
                discount="NEW"
                variant="gold"
            />

            {/* Dynamic Search Bar with Suggestions */}
            <View style={styles.searchContainer}>
                <DynamicSearchBar
                    value={searchValue}
                    onChangeText={setSearchValue}
                    onSearch={(query) => setSearchValue(query)}
                    onClear={handleClearSearch}
                    placeholder="Search Odia books, authors..."
                    books={allBooks}
                />
            </View>

            {/* Category Pills */}
            <CategoryPills
                activeCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                showIcons={true}
            />

            {/* Trending Section */}
            {trendingBooks.length > 0 && (
                <TrendingCarousel
                    books={trendingBooks}
                    title="Trending Now"
                    onBookPress={handleBookPress}
                    onAddToCart={handleAddToCart}
                />
            )}

            {/* Featured Section Header */}
            {gridBooks.length > 0 && renderSectionHeader(
                'Featured Books',
                `${allBooks.length} of ${totalBooks}`,
                'star',
                COLORS.gold
            )}
        </View>
    );

    // Empty state
    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="search-outline" size={64} color={COLORS.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No books found</Text>
            <Text style={styles.emptyText}>
                {searchValue
                    ? `No results for "${searchValue}"`
                    : 'Try adjusting your search or filters'}
            </Text>
        </View>
    );

    // Footer loading indicator
    const renderFooter = () => {
        if (!isFetchingNextPage) return <View style={styles.footerSpacer} />;
        return (
            <View style={styles.footer}>
                <View style={styles.loadingDots}>
                    {[0, 1, 2].map((i) => (
                        <View key={i} style={styles.loadingDot} />
                    ))}
                </View>
                <Text style={styles.loadingText}>Loading more treasures...</Text>
            </View>
        );
    };

    // Show skeleton while loading
    if (isLoading) {
        return <HomeScreenSkeleton />;
    }

    return (
        <View style={styles.container}>
            {/* Custom Refresh Indicator Overlay */}
            <CustomRefreshControl refreshing={isRefetching} />

            <AnimatedFlatList
                data={gridBooks.length > 0 ? gridBooks : allBooks}
                renderItem={renderBookItem}
                keyExtractor={keyExtractor}
                numColumns={2}
                columnWrapperStyle={styles.row}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyState}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                // Performance optimizations
                windowSize={5}
                maxToRenderPerBatch={4}
                updateCellsBatchingPeriod={50}
                initialNumToRender={6}
                removeClippedSubviews={true}
                getItemLayout={undefined}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                        progressBackgroundColor={COLORS.surface}
                    />
                }
            />

            {/* Sticky Cart CTA */}
            <StickyCartCTA
                itemCount={getItemCount()}
                totalPrice={getTotal()}
                onPress={handleCheckout}
                visible={getItemCount() > 0}
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
        paddingBottom: 120, // Space for sticky CTA
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
    },

    // Search
    searchContainer: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.sm,
    },

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    sectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    sectionIcon: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.textPrimary,
    },
    sectionSubtitle: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textTertiary,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.massive,
        paddingHorizontal: SPACING.xl,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: COLORS.surfaceDim,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    emptyTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    emptyText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },

    // Footer
    footer: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    footerSpacer: {
        height: SPACING.xxl,
    },
    loadingDots: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: SPACING.sm,
    },
    loadingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
    loadingText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
    },
});
