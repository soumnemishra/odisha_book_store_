import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import COLORS from '../constants/colors';

export default function CategoryChips({ categories, selectedCategory, onSelectCategory }) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {/* All category chip */}
            <TouchableOpacity
                style={[
                    styles.chip,
                    selectedCategory === null && styles.chipSelected
                ]}
                onPress={() => onSelectCategory(null)}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.chipText,
                    selectedCategory === null && styles.chipTextSelected
                ]}>
                    All Books
                </Text>
            </TouchableOpacity>

            {/* Category chips */}
            {categories.map((category) => (
                <TouchableOpacity
                    key={category}
                    style={[
                        styles.chip,
                        selectedCategory === category && styles.chipSelected
                    ]}
                    onPress={() => onSelectCategory(category)}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        styles.chipText,
                        selectedCategory === category && styles.chipTextSelected
                    ]}>
                        {category}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.gray100,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        marginRight: 8,
    },
    chipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textPrimary,
        textTransform: 'capitalize',
    },
    chipTextSelected: {
        color: COLORS.white,
        fontWeight: '600',
    },
});
