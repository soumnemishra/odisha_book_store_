// components/ui/SearchBar.jsx - Premium Search Bar Component
import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

/**
 * Premium Search Bar Component
 * Features: Search icon, clear button, voice search
 */
export default function SearchBar({
    value,
    onChangeText,
    onClear,
    onFocus,
    onBlur,
    placeholder = 'Search for Odia books...',
    autoFocus = false,
}) {
    return (
        <View style={styles.container}>
            {/* Search Icon */}
            <Ionicons name="search-outline" size={20} color={COLORS.textTertiary} style={styles.searchIcon} />

            {/* Input */}
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textTertiary}
                autoFocus={autoFocus}
                onFocus={onFocus}
                onBlur={onBlur}
                returnKeyType="search"
            />

            {/* Clear Button */}
            {value.length > 0 && (
                <TouchableOpacity onPress={onClear} style={styles.clearButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <View style={styles.clearIconContainer}>
                        <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
                    </View>
                </TouchableOpacity>
            )}

            {/* Voice Search Icon (future feature) */}
            {value.length === 0 && (
                <TouchableOpacity style={styles.voiceButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="mic-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    searchIcon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        ...TYPOGRAPHY.body,
        color: COLORS.textPrimary,
        paddingVertical: 0, // Remove default padding
    },
    clearButton: {
        marginLeft: SPACING.sm,
    },
    clearIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    voiceButton: {
        marginLeft: SPACING.sm,
    },
});
