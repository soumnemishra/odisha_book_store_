// components/ui/DynamicSearchBar.jsx - Premium Dynamic Search with Suggestions
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Keyboard,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    COLORS,
    TYPOGRAPHY,
    SPACING,
    BORDER_RADIUS,
    SHADOWS,
    ANIMATIONS,
    getCategoryColor,
} from '../../constants/theme';

const RECENT_SEARCHES_KEY = '@recent_searches';
const MAX_RECENT_SEARCHES = 8;

// Trending searches (can be fetched from backend later)
const TRENDING_SEARCHES = [
    { text: 'Odia Literature', icon: 'trending-up' },
    { text: 'Children Books', icon: 'happy' },
    { text: 'Religious', icon: 'flower' },
    { text: 'Biography', icon: 'person' },
    { text: 'Poetry', icon: 'heart' },
];

// Quick category filters
const QUICK_FILTERS = [
    { label: 'All', value: 'all', icon: 'grid-outline' },
    { label: 'Under ₹100', value: 'budget', icon: 'wallet-outline' },
    { label: 'Bestsellers', value: 'bestseller', icon: 'star' },
    { label: 'New Arrivals', value: 'new', icon: 'sparkles' },
];

/**
 * DynamicSearchBar - Premium Search with Autocomplete & Voice
 * Features: Debounced input, suggestions, recent searches, trending, voice search
 */
export default function DynamicSearchBar({
    value,
    onChangeText,
    onSearch,
    onClear,
    placeholder = 'Search books, authors...',
    books = [],
    onFilterChange,
    activeFilter = 'all',
}) {
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const inputRef = useRef(null);
    const debounceTimer = useRef(null);

    const searchBarScale = useSharedValue(1);
    const suggestionsOpacity = useSharedValue(0);

    // Load recent searches on mount
    useEffect(() => {
        loadRecentSearches();
    }, []);

    // Debounced search suggestions
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (value.trim().length >= 2) {
            debounceTimer.current = setTimeout(() => {
                generateSuggestions(value.trim());
            }, 300);
        } else {
            setSuggestions([]);
        }

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [value, books]);

    // Generate suggestions from books
    const generateSuggestions = useCallback((query) => {
        const lowerQuery = query.toLowerCase();

        // Match titles
        const titleMatches = books.filter((book) => {
            const title = typeof book.title === 'string'
                ? book.title.toLowerCase()
                : (book.title?.display || book.title?.english || '').toLowerCase();
            return title.includes(lowerQuery);
        }).slice(0, 4);

        // Match authors
        const authorMatches = books.filter((book) =>
            book.author?.toLowerCase().includes(lowerQuery)
        ).slice(0, 2);

        // Match categories
        const categoryMatches = books.filter((book) =>
            book.category?.toLowerCase().includes(lowerQuery)
        ).slice(0, 2);

        // Combine and deduplicate
        const combined = [...titleMatches];
        authorMatches.forEach((book) => {
            if (!combined.find((b) => b._id === book._id)) {
                combined.push(book);
            }
        });
        categoryMatches.forEach((book) => {
            if (!combined.find((b) => b._id === book._id)) {
                combined.push(book);
            }
        });

        setSuggestions(combined.slice(0, 6));
    }, [books]);

    // Load recent searches from storage
    const loadRecentSearches = async () => {
        try {
            const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
            if (stored) {
                setRecentSearches(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load recent searches:', error);
        }
    };

    // Save recent search
    const saveRecentSearch = async (query) => {
        if (!query.trim()) return;

        try {
            const newRecent = [
                query.trim(),
                ...recentSearches.filter((s) => s.toLowerCase() !== query.toLowerCase()),
            ].slice(0, MAX_RECENT_SEARCHES);

            setRecentSearches(newRecent);
            await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
        } catch (error) {
            console.error('Failed to save recent search:', error);
        }
    };

    // Clear recent searches
    const clearRecentSearches = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setRecentSearches([]);
        await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    };

    // Handle search submit
    const handleSubmit = () => {
        if (value.trim()) {
            saveRecentSearch(value);
            onSearch?.(value);
            Keyboard.dismiss();
            setShowSuggestions(false);
        }
    };

    // Handle suggestion press
    const handleSuggestionPress = (book) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const title = typeof book.title === 'string'
            ? book.title
            : book.title?.display || book.title?.english || '';
        onChangeText(title);
        saveRecentSearch(title);
        onSearch?.(title);
        setShowSuggestions(false);
        Keyboard.dismiss();
    };

    // Handle recent search press
    const handleRecentPress = (query) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChangeText(query);
        onSearch?.(query);
        setShowSuggestions(false);
        Keyboard.dismiss();
    };

    // Handle trending press
    const handleTrendingPress = (item) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChangeText(item.text);
        saveRecentSearch(item.text);
        onSearch?.(item.text);
        setShowSuggestions(false);
        Keyboard.dismiss();
    };

    // Handle focus
    const handleFocus = () => {
        setIsFocused(true);
        setShowSuggestions(true);
        searchBarScale.value = withSpring(1.02, ANIMATIONS.springSnappy);
        suggestionsOpacity.value = withTiming(1, { duration: 200 });
    };

    // Handle blur
    const handleBlur = () => {
        setIsFocused(false);
        searchBarScale.value = withSpring(1, ANIMATIONS.spring);
        // Delay hiding suggestions to allow tap
        setTimeout(() => {
            setShowSuggestions(false);
            suggestionsOpacity.value = withTiming(0, { duration: 200 });
        }, 200);
    };

    // Handle clear
    const handleClear = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChangeText('');
        onClear?.();
        setSuggestions([]);
        inputRef.current?.focus();
    };

    // Animated styles
    const searchBarStyle = useAnimatedStyle(() => ({
        transform: [{ scale: searchBarScale.value }],
    }));

    const suggestionsStyle = useAnimatedStyle(() => ({
        opacity: suggestionsOpacity.value,
    }));

    // Get book title helper
    const getBookTitle = (book) => {
        if (typeof book.title === 'string') return book.title;
        return book.title?.display || book.title?.english || book.title?.odia || 'Untitled';
    };

    // Render suggestion item
    const renderSuggestion = ({ item }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handleSuggestionPress(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.suggestionCover, { backgroundColor: getCategoryColor(item.category) }]}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.suggestionImage} />
                ) : (
                    <Ionicons name="book" size={16} color="#FFF" />
                )}
            </View>
            <View style={styles.suggestionInfo}>
                <Text style={styles.suggestionTitle} numberOfLines={1}>
                    {getBookTitle(item)}
                </Text>
                <Text style={styles.suggestionMeta} numberOfLines={1}>
                    {item.author} • {item.category}
                </Text>
            </View>
            <Text style={styles.suggestionPrice}>₹{item.finalPrice || item.price?.discounted || item.price || 0}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Search Input */}
            <Animated.View style={[styles.searchBar, isFocused && styles.searchBarFocused, searchBarStyle]}>
                <Ionicons
                    name="search"
                    size={20}
                    color={isFocused ? COLORS.primary : COLORS.textTertiary}
                />
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textTertiary}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="search"
                />
                {value.length > 0 && (
                    <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
                    </TouchableOpacity>
                )}


            </Animated.View>

            {/* Quick Filters */}
            {!isFocused && onFilterChange && (
                <View style={styles.quickFilters}>
                    {QUICK_FILTERS.map((filter) => (
                        <TouchableOpacity
                            key={filter.value}
                            style={[
                                styles.filterPill,
                                activeFilter === filter.value && styles.filterPillActive,
                            ]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                onFilterChange(filter.value);
                            }}
                        >
                            <Ionicons
                                name={filter.icon}
                                size={14}
                                color={activeFilter === filter.value ? COLORS.textInverse : COLORS.textSecondary}
                            />
                            <Text style={[
                                styles.filterText,
                                activeFilter === filter.value && styles.filterTextActive,
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && (
                <Animated.View
                    style={[styles.suggestionsContainer, suggestionsStyle]}
                >
                    {/* Book Suggestions (when typing) */}
                    {value.length >= 2 && suggestions.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Suggestions</Text>
                            {suggestions.map((item) => (
                                <TouchableOpacity
                                    key={item._id}
                                    style={styles.suggestionItem}
                                    onPress={() => handleSuggestionPress(item)}
                                >
                                    <View style={[styles.suggestionCover, { backgroundColor: getCategoryColor(item.category) }]}>
                                        {item.image ? (
                                            <Image source={{ uri: item.image }} style={styles.suggestionImage} />
                                        ) : (
                                            <Ionicons name="book" size={16} color="#FFF" />
                                        )}
                                    </View>
                                    <View style={styles.suggestionInfo}>
                                        <Text style={styles.suggestionTitle} numberOfLines={1}>
                                            {getBookTitle(item)}
                                        </Text>
                                        <Text style={styles.suggestionMeta} numberOfLines={1}>
                                            {item.author} • {item.category}
                                        </Text>
                                    </View>
                                    <Text style={styles.suggestionPrice}>
                                        ₹{item.finalPrice || item.price?.discounted || 0}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Recent Searches (when empty) */}
                    {value.length < 2 && recentSearches.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Recent Searches</Text>
                                <TouchableOpacity onPress={clearRecentSearches}>
                                    <Text style={styles.clearText}>Clear</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.recentGrid}>
                                {recentSearches.map((query, index) => (
                                    <TouchableOpacity
                                        key={`${query}-${index}`}
                                        style={styles.recentChip}
                                        onPress={() => handleRecentPress(query)}
                                    >
                                        <Ionicons name="time-outline" size={14} color={COLORS.textTertiary} />
                                        <Text style={styles.recentText} numberOfLines={1}>{query}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Trending Searches */}
                    {value.length < 2 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Trending</Text>
                            <View style={styles.trendingGrid}>
                                {TRENDING_SEARCHES.map((item, index) => (
                                    <TouchableOpacity
                                        key={item.text}
                                        style={styles.trendingChip}
                                        onPress={() => handleTrendingPress(item)}
                                    >
                                        <Ionicons name={item.icon} size={14} color={COLORS.primary} />
                                        <Text style={styles.trendingText}>{item.text}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* No results */}
                    {value.length >= 2 && suggestions.length === 0 && (
                        <View style={styles.noResults}>
                            <Ionicons name="search-outline" size={40} color={COLORS.textTertiary} />
                            <Text style={styles.noResultsText}>No suggestions found</Text>
                            <Text style={styles.noResultsHint}>Try different keywords</Text>
                        </View>
                    )}
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        zIndex: 100,
    },

    // Search Bar
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    searchBarFocused: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.surface,
        ...SHADOWS.medium,
    },
    input: {
        flex: 1,
        ...TYPOGRAPHY.body,
        color: COLORS.textPrimary,
        marginLeft: SPACING.sm,
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
    },
    micButton: {
        padding: 4,
        marginLeft: SPACING.sm,
    },
    listeningIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.sm,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.errorLight || '#FEE2E2',
        borderRadius: BORDER_RADIUS.round,
        alignSelf: 'center',
    },
    listeningDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.error,
        marginRight: SPACING.sm,
    },
    listeningText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.error,
        fontWeight: '600',
    },

    // Quick Filters
    quickFilters: {
        flexDirection: 'row',
        marginTop: SPACING.md,
        gap: SPACING.sm,
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceDim,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.round,
        gap: 4,
    },
    filterPillActive: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        ...TYPOGRAPHY.caption,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    filterTextActive: {
        color: COLORS.textInverse,
    },

    // Suggestions Container
    suggestionsContainer: {
        position: 'absolute',
        top: 56,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.md,
        maxHeight: 400,
        ...SHADOWS.large,
        zIndex: 1000,
    },

    // Section
    section: {
        marginBottom: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h4,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    clearText: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.primary,
        fontWeight: '600',
    },

    // Suggestion Item
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    suggestionCover: {
        width: 40,
        height: 50,
        borderRadius: BORDER_RADIUS.sm,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    suggestionImage: {
        width: '100%',
        height: '100%',
    },
    suggestionInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    suggestionTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    suggestionMeta: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textTertiary,
    },
    suggestionPrice: {
        ...TYPOGRAPHY.h4,
        color: COLORS.primary,
    },

    // Recent Searches
    recentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    recentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceDim,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.round,
        gap: 6,
    },
    recentText: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textSecondary,
        maxWidth: 120,
    },

    // Trending
    trendingGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    trendingChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primarySoft,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.round,
        gap: 6,
    },
    trendingText: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.primary,
        fontWeight: '600',
    },

    // No Results
    noResults: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    noResultsText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
    },
    noResultsHint: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textTertiary,
    },
});
