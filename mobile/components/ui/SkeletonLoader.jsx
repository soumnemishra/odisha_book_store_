// components/ui/SkeletonLoader.jsx - Premium Skeleton Loading States
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
    Easing,
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDER_RADIUS, SIZES } from '../../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * Shimmer effect overlay
 */
const ShimmerOverlay = ({ width = '100%' }) => {
    const shimmerPosition = useSharedValue(-1);

    useEffect(() => {
        shimmerPosition.value = withRepeat(
            withTiming(1, {
                duration: 1500,
                easing: Easing.inOut(Easing.ease),
            }),
            -1, // infinite
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: interpolate(
                    shimmerPosition.value,
                    [-1, 1],
                    [-SCREEN_WIDTH, SCREEN_WIDTH]
                ),
            },
        ],
    }));

    return (
        <Animated.View style={[styles.shimmerOverlay, animatedStyle, { width }]}>
            <View style={styles.shimmerGradient} />
        </Animated.View>
    );
};

/**
 * Base skeleton element with shimmer
 */
const SkeletonBox = ({ width, height, borderRadius = BORDER_RADIUS.md, style }) => (
    <View
        style={[
            styles.skeleton,
            { width, height, borderRadius },
            style,
        ]}
    >
        <ShimmerOverlay />
    </View>
);

/**
 * Book Card Skeleton - Matches PremiumBookCard layout
 */
export const BookCardSkeleton = () => {
    const cardWidth = (SCREEN_WIDTH - SPACING.lg * 3) / 2;

    return (
        <View style={[styles.bookCard, { width: cardWidth }]}>
            {/* Cover image placeholder */}
            <SkeletonBox
                width="100%"
                height={140}
                borderRadius={0}
            />

            {/* Content */}
            <View style={styles.bookCardContent}>
                {/* Title - 2 lines */}
                <SkeletonBox
                    width="90%"
                    height={16}
                    style={{ marginBottom: 6 }}
                />
                <SkeletonBox
                    width="70%"
                    height={16}
                    style={{ marginBottom: 10 }}
                />

                {/* Author */}
                <SkeletonBox
                    width="60%"
                    height={12}
                    style={{ marginBottom: 12 }}
                />

                {/* Category badge */}
                <SkeletonBox
                    width={80}
                    height={24}
                    borderRadius={BORDER_RADIUS.sm}
                    style={{ marginBottom: 10 }}
                />

                {/* Price */}
                <SkeletonBox
                    width={60}
                    height={20}
                    style={{ marginBottom: 10 }}
                />

                {/* Add button */}
                <SkeletonBox
                    width="100%"
                    height={36}
                    borderRadius={BORDER_RADIUS.md}
                />
            </View>
        </View>
    );
};

/**
 * Hero Banner Skeleton
 */
export const HeroBannerSkeleton = () => (
    <View style={styles.heroBanner}>
        <SkeletonBox
            width="100%"
            height={SIZES.heroBannerHeight}
            borderRadius={BORDER_RADIUS.xl}
        />
    </View>
);

/**
 * Category Pills Skeleton - Horizontal row
 */
export const CategoryPillsSkeleton = () => (
    <View style={styles.categoryPills}>
        {[80, 100, 90, 70, 110, 85].map((width, index) => (
            <SkeletonBox
                key={index}
                width={width}
                height={36}
                borderRadius={BORDER_RADIUS.round}
                style={{ marginRight: SPACING.sm }}
            />
        ))}
    </View>
);

/**
 * Carousel Item Skeleton
 */
export const CarouselItemSkeleton = () => (
    <View style={styles.carouselItem}>
        <SkeletonBox
            width={SIZES.carouselItemWidth}
            height={SIZES.carouselItemHeight}
            borderRadius={BORDER_RADIUS.lg}
        />
    </View>
);

/**
 * Trending Section Skeleton
 */
export const TrendingSkeleton = () => (
    <View style={styles.trendingSection}>
        {/* Section header */}
        <View style={styles.sectionHeader}>
            <SkeletonBox width={120} height={24} />
            <SkeletonBox width={60} height={16} />
        </View>

        {/* Carousel items */}
        <View style={styles.carouselRow}>
            {[1, 2, 3].map((_, index) => (
                <CarouselItemSkeleton key={index} />
            ))}
        </View>
    </View>
);

/**
 * Full Home Screen Skeleton
 */
export const HomeScreenSkeleton = () => (
    <View style={styles.homeContainer}>
        <HeroBannerSkeleton />

        <View style={styles.searchBarSkeleton}>
            <SkeletonBox
                width="100%"
                height={48}
                borderRadius={BORDER_RADIUS.lg}
            />
        </View>

        <CategoryPillsSkeleton />
        <TrendingSkeleton />

        {/* Section header */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.lg }]}>
            <SkeletonBox width={140} height={24} />
        </View>

        {/* Book grid */}
        <View style={styles.bookGrid}>
            {[1, 2, 3, 4].map((_, index) => (
                <BookCardSkeleton key={index} />
            ))}
        </View>
    </View>
);

/**
 * Cart Item Skeleton
 */
export const CartItemSkeleton = () => (
    <View style={styles.cartItem}>
        <SkeletonBox
            width={80}
            height={100}
            borderRadius={BORDER_RADIUS.md}
        />
        <View style={styles.cartItemContent}>
            <SkeletonBox width="80%" height={18} style={{ marginBottom: 8 }} />
            <SkeletonBox width="50%" height={14} style={{ marginBottom: 12 }} />
            <SkeletonBox width={60} height={20} style={{ marginBottom: 8 }} />
            <View style={styles.cartItemActions}>
                <SkeletonBox width={100} height={32} borderRadius={BORDER_RADIUS.md} />
            </View>
        </View>
    </View>
);

/**
 * List Item Skeleton
 */
export const ListItemSkeleton = () => (
    <View style={styles.listItem}>
        <SkeletonBox
            width={48}
            height={48}
            borderRadius={BORDER_RADIUS.round}
        />
        <View style={styles.listItemContent}>
            <SkeletonBox width="70%" height={16} style={{ marginBottom: 6 }} />
            <SkeletonBox width="50%" height={12} />
        </View>
    </View>
);

const styles = StyleSheet.create({
    // Base skeleton
    skeleton: {
        backgroundColor: COLORS.borderLight,
        overflow: 'hidden',
    },
    shimmerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    shimmerGradient: {
        width: 100,
        height: '100%',
        backgroundColor: COLORS.shimmer,
        transform: [{ skewX: '-20deg' }],
    },

    // Book Card
    bookCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
    },
    bookCardContent: {
        padding: SPACING.md,
    },

    // Hero Banner
    heroBanner: {
        marginHorizontal: SPACING.lg,
        marginTop: 60,
        marginBottom: SPACING.lg,
    },

    // Category Pills
    categoryPills: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },

    // Carousel
    carouselItem: {
        marginRight: SPACING.md,
    },
    carouselRow: {
        flexDirection: 'row',
        paddingLeft: SPACING.lg,
    },

    // Trending Section
    trendingSection: {
        marginTop: SPACING.lg,
    },

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },

    // Home Container
    homeContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // Search Bar
    searchBarSkeleton: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },

    // Book Grid
    bookGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
    },

    // Cart Item
    cartItem: {
        flexDirection: 'row',
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    cartItemContent: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    cartItemActions: {
        flexDirection: 'row',
    },

    // List Item
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
    },
    listItemContent: {
        flex: 1,
        marginLeft: SPACING.md,
    },
});

export default {
    BookCardSkeleton,
    HeroBannerSkeleton,
    CategoryPillsSkeleton,
    CarouselItemSkeleton,
    TrendingSkeleton,
    HomeScreenSkeleton,
    CartItemSkeleton,
    ListItemSkeleton,
};
