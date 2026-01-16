// constants/theme.js - Premium Design System v2.0
// Luxurious Green-Gold Palette with Glassmorphism & Animations
/**
 * Premium Design Tokens for Odisha Book Store
 * Inspired by Amazon's structure, Zomato's vibrant feel
 * Features: Green-Gold palette, Glassmorphism, Micro-interactions
 */

export const COLORS = {
    // Primary Brand - Rich Forest Green
    primary: '#047857',
    primaryLight: '#10B981',
    primaryDark: '#065F46',
    primarySoft: '#ECFDF5',
    primaryMuted: 'rgba(4, 120, 87, 0.15)',

    // Premium Gold Accents
    gold: '#D4AF37',
    goldLight: '#F5E6B8',
    goldDark: '#B8962E',
    goldSoft: 'rgba(212, 175, 55, 0.15)',

    // Gradients (for LinearGradient)
    gradientPrimary: ['#047857', '#10B981'],
    gradientPrimaryDark: ['#065F46', '#047857'],
    gradientGold: ['#D4AF37', '#F5E6B8'],
    gradientLuxury: ['#047857', '#D4AF37'],
    gradientHero: ['#065F46', '#047857', '#10B981'],
    gradientAccent: ['#EC4899', '#8B5CF6'],
    gradientOrange: ['#F97316', '#FB923C'],
    gradientSunset: ['#F59E0B', '#EF4444'],
    gradientOcean: ['#0EA5E9', '#6366F1'],

    // Neutrals - Warm Undertones
    background: '#FAFAF8',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceDim: '#F5F5F3',
    border: '#E8E6E1',
    borderLight: '#F3F2EE',
    borderFocus: '#047857',

    // Text - Premium Contrast
    textPrimary: '#1A1A1A',
    textSecondary: '#525252',
    textTertiary: '#8C8C8C',
    textDisabled: '#BFBFBF',
    textInverse: '#FFFFFF',
    textGold: '#B8962E',

    // Semantic Colors
    success: '#10B981',
    successLight: '#D1FAE5',
    successDark: '#059669',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    warningDark: '#D97706',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    errorDark: '#DC2626',
    info: '#3B82F6',
    infoLight: '#DBEAFE',

    // Accent Colors
    accent: '#EC4899',
    accentLight: '#FDF2F8',
    purple: '#8B5CF6',
    orange: '#F97316',

    // Overlays & Effects
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayDark: 'rgba(0, 0, 0, 0.7)',
    shimmer: 'rgba(255, 255, 255, 0.4)',
    shimmerHighlight: 'rgba(255, 255, 255, 0.8)',

    // Glassmorphism
    glass: 'rgba(255, 255, 255, 0.85)',
    glassDark: 'rgba(0, 0, 0, 0.4)',
    glassLight: 'rgba(255, 255, 255, 0.95)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
    glassGold: 'rgba(212, 175, 55, 0.15)',

    // Category Colors (Premium palette)
    categoryColors: {
        Biography: '#6366F1',
        Autobiography: '#8B5CF6',
        Religion: '#D4AF37',
        Novel: '#14B8A6',
        Fiction: '#EC4899',
        History: '#B8962E',
        Science: '#3B82F6',
        Educational: '#10B981',
        Poetry: '#A855F7',
        Drama: '#EF4444',
        Children: '#F59E0B',
        Reference: '#6B7280',
        Philosophy: '#7C3AED',
        Politics: '#DC2626',
        Essays: '#059669',
        Stories: '#F472B6',
        Collection: '#8B5CF6',
    },
};

export const TYPOGRAPHY = {
    // Display - Hero Sections (Large, Bold)
    displayLarge: {
        fontSize: 36,
        fontWeight: '800',
        lineHeight: 44,
        letterSpacing: -0.8,
    },
    displayMedium: {
        fontSize: 30,
        fontWeight: '700',
        lineHeight: 38,
        letterSpacing: -0.5,
    },
    displaySmall: {
        fontSize: 26,
        fontWeight: '700',
        lineHeight: 34,
        letterSpacing: -0.3,
    },

    // Headings
    h1: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 32,
        letterSpacing: -0.3,
    },
    h2: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
        letterSpacing: -0.2,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 26,
    },
    h4: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
    },

    // Body
    bodyLarge: {
        fontSize: 17,
        fontWeight: '400',
        lineHeight: 26,
    },
    body: {
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 22,
    },
    bodySmall: {
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 18,
    },

    // Special
    button: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
        letterSpacing: 0.3,
    },
    buttonSmall: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 18,
        letterSpacing: 0.2,
    },
    caption: {
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
        letterSpacing: 0.2,
    },
    overline: {
        fontSize: 11,
        fontWeight: '700',
        lineHeight: 14,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    price: {
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 24,
    },
    priceLarge: {
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 32,
    },

    // Odia Typography - Regional text styles
    odiaTitle: {
        fontFamily: 'NotoSansOriya-Bold',
        fontSize: 22,
        lineHeight: 32,
    },
    odiaBody: {
        fontFamily: 'NotoSansOriya-Regular',
        fontSize: 16,
        lineHeight: 26,
    },
    odiaCaption: {
        fontFamily: 'NotoSansOriya-Medium',
        fontSize: 13,
        lineHeight: 20,
    },
};

export const SPACING = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    huge: 48,
    massive: 64,
};

export const BORDER_RADIUS = {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    xxxl: 24,
    round: 999,
};

export const SHADOWS = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    glow: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    goldGlow: {
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
};

// Glassmorphism styles
export const GLASSMORPHISM = {
    light: {
        backgroundColor: COLORS.glass,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    dark: {
        backgroundColor: COLORS.glassDark,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    card: {
        backgroundColor: COLORS.glassLight,
        borderWidth: 1.5,
        borderColor: COLORS.glassBorder,
        ...SHADOWS.medium,
    },
    gold: {
        backgroundColor: COLORS.glassGold,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
};

export const ANIMATIONS = {
    // Durations (ms)
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 450,
    slower: 600,

    // Spring configs for Reanimated
    spring: {
        damping: 15,
        stiffness: 150,
        mass: 1,
    },
    springBouncy: {
        damping: 12,
        stiffness: 180,
        mass: 0.8,
    },
    springGentle: {
        damping: 20,
        stiffness: 100,
        mass: 1,
    },
    springSnappy: {
        damping: 18,
        stiffness: 300,
        mass: 0.7,
    },
    springLuxury: {
        damping: 22,
        stiffness: 120,
        mass: 1.2,
    },

    // Timing configs
    timing: {
        duration: 300,
    },
    timingFast: {
        duration: 200,
    },
    timingSlow: {
        duration: 500,
    },

    // Scale values
    pressScale: 0.97,
    hoverScale: 1.02,
    bounceScale: 1.1,
};

export const SIZES = {
    // Touch targets (accessibility)
    touchTarget: 44,
    touchTargetSmall: 36,
    buttonHeight: 52,
    buttonHeightSmall: 40,
    inputHeight: 52,
    inputHeightSmall: 44,

    // Icons
    iconXS: 16,
    iconSM: 20,
    iconMD: 24,
    iconLG: 32,
    iconXL: 40,
    iconHero: 64,

    // Avatars
    avatarSM: 32,
    avatarMD: 48,
    avatarLG: 64,
    avatarXL: 80,

    // Product cards
    cardWidth: 165,
    cardHeight: 280,
    cardWidthLarge: 200,
    cardHeightLarge: 320,

    // Hero & Banners
    heroBannerHeight: 200,
    heroBannerHeightLarge: 240,
    carouselItemWidth: 280,
    carouselItemHeight: 160,

    // Tab bar
    tabBarHeight: 65,
    tabBarIconSize: 26,

    // Bottom sheet
    bottomSheetHandle: 4,
    bottomSheetHandleWidth: 40,
};

// Helper function to get category color
export const getCategoryColor = (category) => {
    return COLORS.categoryColors[category] || COLORS.textTertiary;
};

// Helper function to create gradient config
export const createGradient = (colors, horizontal = false) => ({
    colors,
    start: horizontal ? { x: 0, y: 0.5 } : { x: 0.5, y: 0 },
    end: horizontal ? { x: 1, y: 0.5 } : { x: 0.5, y: 1 },
});

// Helper for opacity variations
export const withOpacity = (color, opacity) => {
    // Handle hex colors
    if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
};

export default {
    COLORS,
    TYPOGRAPHY,
    SPACING,
    BORDER_RADIUS,
    SHADOWS,
    GLASSMORPHISM,
    ANIMATIONS,
    SIZES,
};
