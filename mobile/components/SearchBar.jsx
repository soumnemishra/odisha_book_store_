import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import COLORS from '../constants/colors';

export default function SearchBar({
    value,
    onChangeText,
    onSearch,
    placeholder = 'Search books...',
    onClear
}) {
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = () => {
        onChangeText('');
        if (onClear) onClear();
    };

    return (
        <View style={[styles.container, isFocused && styles.containerFocused]}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />

            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={COLORS.placeholderText}
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSearch}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                returnKeyType="search"
            />

            {value.length > 0 && (
                <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBackground,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    containerFocused: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textPrimary,
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
    },
});
