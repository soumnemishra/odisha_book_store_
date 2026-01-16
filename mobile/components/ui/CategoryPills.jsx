// components/ui/CategoryPills.jsx - Animated Category Selection Pills
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolateColor,
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

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Individual Category Pill with animation
 */
const CategoryPill = ({ category, isSelected, onPress, icon }) => {
    const scale = useSharedValue(1);
    const backgroundColor = useSharedValue(isSelected ? 1 : 0);

    React.useEffect(() => {
        backgroundColor.value = withSpring(isSelected ? 1 : 0, ANIMATIONS.spring);
    }, [isSelected]);

    const handlePress = () => {
        scale.value = withSpring(0.95, ANIMATIONS.springSnappy);
        setTimeout(() => {
            scale.value = withSpring(1, ANIMATIONS.springBouncy);
        }, 100);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        backgroundColor: interpolateColor(
            backgroundColor.value,
            [0, 1],
            [COLORS.surfaceDim, COLORS.primary]
        ),
        borderColor: interpolateColor(
            backgroundColor.value,
            [0, 1],
            [COLORS.border, COLORS.primary]
        ),
    }));

    const textAnimatedStyle = useAnimatedStyle(() => ({
        color: interpolateColor(
            backgroundColor.value,
            [0, 1],
            [COLORS.textPrimary, COLORS.textInverse]
        ),
    }));

    const iconColor = isSelected ? COLORS.textInverse : COLORS.textSecondary;

    return (
        <AnimatedTouchable
            style={[styles.pill, animatedStyle]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            {icon && (
                <Ionicons
                    name={icon}
                    size={14}
                    color={iconColor}
                    style={styles.pillIcon}
                />
            )}
            <Animated.Text style={[styles.pillText, textAnimatedStyle]}>
                {category}
            </Animated.Text>
            {isSelected && (
                <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={COLORS.textInverse}
                    style={styles.checkIcon}
                />
            )}
        </AnimatedTouchable>
    );
};

/**
 * Category icon mapping
 */
const CATEGORY_ICONS = {
    all: 'grid-outline',
    Biography: 'person-outline',
    Autobiography: 'person-circle-outline',
    Religion: 'flower-outline',
    Novel: 'book-outline',
    Fiction: 'sparkles-outline',
    History: 'time-outline',
    Science: 'flask-outline',
    Educational: 'school-outline',
    Poetry: 'heart-outline',
    Drama: 'film-outline',
    Children: 'happy-outline',
    Reference: 'library-outline',
    Philosophy: 'bulb-outline',
    Politics: 'flag-outline',
    Essays: 'document-text-outline',
    Stories: 'chatbubbles-outline',
    Collection: 'albums-outline',
};

/**
 * CategoryPills - Horizontal scrolling category filters with animation
 */
export default function CategoryPills({
    activeCategory = 'all',
    onSelectCategory,
    showIcons = true,
}) {
    const categories = [
        'all',
        'Biography',
        'Novel',
        'Fiction',
        'History',
        'Poetry',
        'Religion',
        'Educational',
        'Children',
        'Science',
        'Philosophy',
    ];

    const getDisplayName = (category) => {
        if (category === 'all') return 'All Books';
        return category;
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                decelerationRate="fast"
            >
                {categories.map((category) => (
                    <CategoryPill
                        key={category}
                        category={getDisplayName(category)}
                        isSelected={activeCategory === category}
                        onPress={() => onSelectCategory(category)}
                        icon={showIcons ? CATEGORY_ICONS[category] : null}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

/**
 * Compact filter chips for search results
 */
export function FilterChips({ filters = [], activeFilters = [], onToggle }) {
    return (
        <View style={styles.filterContainer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContent}
            >
                {filters.map((filter) => {
                    const isActive = activeFilters.includes(filter.value);
                    return (
                        <TouchableOpacity
                            key={filter.value}
                            style={[styles.filterChip, isActive && styles.filterChipActive]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                onToggle(filter.value);
                            }}
                            activeOpacity={0.8}
                        >
                            {filter.icon && (
                                <Ionicons
                                    name={filter.icon}
                                    size={14}
                                    color={isActive ? COLORS.textInverse : COLORS.textSecondary}
                                />
                            )}
                            <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                                {filter.label}
                            </Text>
                            {isActive && (
                                <Ionicons name="close-circle" size={14} color={COLORS.textInverse} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

/**
 * Sort options pill group
 */
export function SortPills({ options = [], activeSort, onSelect }) {
    return (
        <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sortScrollContent}
            >
                {options.map((option) => {
                    const isActive = activeSort === option.value;
                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[styles.sortPill, isActive && styles.sortPillActive]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                onSelect(option.value);
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.sortPillText, isActive && styles.sortPillTextActive]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: SPACING.sm,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.round,
        borderWidth: 1.5,
        marginRight: SPACING.sm,
        ...SHADOWS.small,
    },
    pillIcon: {
        marginRight: 6,
    },
    pillText: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
    },
    checkIcon: {
        marginLeft: 6,
    },

    // Filter chips
    filterContainer: {
        marginVertical: SPACING.sm,
    },
    filterScrollContent: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.surfaceDim,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: SPACING.sm,
        gap: 4,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterChipText: {
        ...TYPOGRAPHY.bodySmall,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    filterChipTextActive: {
        color: COLORS.textInverse,
    },

    // Sort pills
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
    },
    sortLabel: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textSecondary,
        marginRight: SPACING.sm,
    },
    sortScrollContent: {
        gap: SPACING.sm,
    },
    sortPill: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: COLORS.surfaceDim,
        marginRight: SPACING.sm,
    },
    sortPillActive: {
        backgroundColor: COLORS.goldSoft,
    },
    sortPillText: {
        ...TYPOGRAPHY.bodySmall,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    sortPillTextActive: {
        color: COLORS.goldDark,
        fontWeight: '600',
    },
});
