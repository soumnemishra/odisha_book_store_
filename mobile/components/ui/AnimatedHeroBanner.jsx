// components/ui/AnimatedHeroBanner.jsx - Premium Hero Banner with Parallax
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import {
    COLORS,
    TYPOGRAPHY,
    SPACING,
    BORDER_RADIUS,
    SHADOWS,
    GLASSMORPHISM,
} from '../../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_HEIGHT = 220;

/**
 * AnimatedHeroBanner - Premium hero section with parallax scrolling effect
 * @param {object} scrollY - Animated scroll value from parent
 * @param {number} bookCount - Total number of books for display
 * @param {function} onExplorePress - Callback for CTA button
 */
export default function AnimatedHeroBanner({
    scrollY,
    bookCount = 0,
    onExplorePress,
    title = "ସ୍ୱାଗତ!",
    subtitle = "Discover Odia Literature",
}) {
    // Parallax effect for background decoration
    const parallaxStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            scrollY?.value || 0,
            [0, 150],
            [0, 30],
            Extrapolation.CLAMP
        );
        const scale = interpolate(
            scrollY?.value || 0,
            [0, 150],
            [1, 1.1],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ translateY }, { scale }],
        };
    });

    // Fade effect for text
    const textOpacityStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY?.value || 0,
            [0, 100],
            [1, 0.7],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    // Scale down on scroll
    const bannerScaleStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollY?.value || 0,
            [0, 100],
            [1, 0.98],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ scale }],
        };
    });

    return (
        <Animated.View style={[styles.container, bannerScaleStyle]}>
            {/* Background with gradient effect */}
            <View style={styles.background}>
                {/* Decorative circles */}
                <Animated.View style={[styles.decorativeCircle1, parallaxStyle]} />
                <Animated.View style={[styles.decorativeCircle2, parallaxStyle]} />
                <Animated.View style={[styles.decorativeCircle3, parallaxStyle]} />

                {/* Gold accent line */}
                <View style={styles.goldAccent} />
            </View>

            {/* Content */}
            <Animated.View style={[styles.content, textOpacityStyle]}>
                {/* Badge */}
                <View style={styles.badge}>
                    <Ionicons name="sparkles" size={12} color={COLORS.gold} />
                    <Text style={styles.badgeText}>Premium Collection</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>

                {/* Book count */}
                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Ionicons name="book" size={18} color={COLORS.goldLight} />
                        <Text style={styles.statText}>{bookCount}+ Books</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Ionicons name="star" size={18} color={COLORS.goldLight} />
                        <Text style={styles.statText}>Curated</Text>
                    </View>
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={onExplorePress}
                    activeOpacity={0.85}
                >
                    <Text style={styles.ctaText}>Explore Now</Text>
                    <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
                </TouchableOpacity>
            </Animated.View>

            {/* Decorative book icon */}
            <Animated.View style={[styles.bookDecoration, parallaxStyle]}>
                <Ionicons name="library" size={100} color="rgba(255,255,255,0.08)" />
            </Animated.View>
        </Animated.View>
    );
}

/**
 * PromoCarousel - Auto-rotating promotional banners
 */
export function PromoBanner({
    title,
    subtitle,
    discount,
    onPress,
    variant = 'primary'
}) {
    const getBackgroundStyle = () => {
        switch (variant) {
            case 'gold':
                return { backgroundColor: COLORS.goldDark };
            case 'accent':
                return { backgroundColor: COLORS.accent };
            default:
                return { backgroundColor: COLORS.primaryDark };
        }
    };

    return (
        <TouchableOpacity
            style={[styles.promoBanner, getBackgroundStyle()]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {discount && (
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{discount}</Text>
                </View>
            )}

            <View style={styles.promoContent}>
                <Text style={styles.promoTitle}>{title}</Text>
                <Text style={styles.promoSubtitle}>{subtitle}</Text>
            </View>

            <View style={styles.promoArrow}>
                <Ionicons name="chevron-forward" size={24} color={COLORS.textInverse} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: SPACING.lg,
        marginTop: 60,
        marginBottom: SPACING.lg,
        height: BANNER_HEIGHT,
        borderRadius: BORDER_RADIUS.xxl,
        overflow: 'hidden',
        ...SHADOWS.xl,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.primaryDark,
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(16, 185, 129, 0.3)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -60,
        left: -30,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
    },
    decorativeCircle3: {
        position: 'absolute',
        top: 40,
        left: '40%',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    goldAccent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: COLORS.gold,
    },
    content: {
        flex: 1,
        padding: SPACING.xl,
        justifyContent: 'center',
        zIndex: 1,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.sm,
        gap: 4,
    },
    badgeText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.gold,
        fontWeight: '600',
    },
    title: {
        ...TYPOGRAPHY.displayLarge,
        color: COLORS.textInverse,
        marginBottom: 4,
    },
    subtitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.textInverse,
        opacity: 0.9,
        marginBottom: SPACING.md,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textInverse,
        opacity: 0.85,
    },
    statDivider: {
        width: 1,
        height: 16,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: SPACING.md,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: COLORS.gold,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.round,
        gap: 8,
        ...SHADOWS.medium,
    },
    ctaText: {
        ...TYPOGRAPHY.button,
        color: COLORS.primaryDark,
    },
    bookDecoration: {
        position: 'absolute',
        right: -10,
        bottom: 20,
    },

    // Promo Banner
    promoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        ...SHADOWS.medium,
    },
    discountBadge: {
        backgroundColor: COLORS.gold,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        marginRight: SPACING.md,
    },
    discountText: {
        ...TYPOGRAPHY.overline,
        color: COLORS.primaryDark,
        fontWeight: '800',
    },
    promoContent: {
        flex: 1,
    },
    promoTitle: {
        ...TYPOGRAPHY.h4,
        color: COLORS.textInverse,
        marginBottom: 2,
    },
    promoSubtitle: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textInverse,
        opacity: 0.8,
    },
    promoArrow: {
        width: 32,
        height: 32,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
