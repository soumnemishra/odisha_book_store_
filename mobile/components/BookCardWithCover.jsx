// components/BookCardWithCover.jsx - New version with dynamic covers for migrated schema
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Get color scheme based on book category
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

const BookCardWithCover = React.memo(({ book, onPress }) => {
    const categoryColor = getCategoryColor(book.category);
    const categoryIcon = getCategoryIcon(book.category);
    const hasDiscount = book.hasDiscount || (book.price?.discountPercent > 0);

    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => onPress?.(book._id)}
        >
            {/* Dynamic Cover */}
            <View style={[styles.cover, { backgroundColor: categoryColor }]}>
                <View style={styles.iconContainer}>
                    <Ionicons name={categoryIcon} size={28} color="rgba(255,255,255,0.3)" />
                </View>

                <View style={styles.coverTextContainer}>
                    <Text style={styles.coverTitle} numberOfLines={4}>
                        {book.title?.odia || book.title?.display || book.title || 'Untitled'}
                    </Text>
                </View>

                <View style={styles.languageBadge}>
                    <Text style={styles.languageText}>
                        {book.language === 'Odia' ? 'ଓଡ଼ିଆ' : book.language?.substring(0, 2).toUpperCase()}
                    </Text>
                </View>

                {hasDiscount && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>
                            {book.price?.discountPercent || 0}% OFF
                        </Text>
                    </View>
                )}
            </View>

            {/* Details */}
            <View style={styles.details}>
                {book.title?.english && book.title.english !== book.title.display && (
                    <Text style={styles.englishTitle} numberOfLines={2}>
                        {book.title.english}
                    </Text>
                )}
                <Text style={styles.author} numberOfLines={1}>{book.author}</Text>
                <Text style={styles.category} numberOfLines={1}>{book.category}</Text>

                <View style={styles.priceContainer}>
                    {hasDiscount ? (
                        <>
                            <Text style={styles.originalPrice}>₹{book.price?.original || 0}</Text>
                            <Text style={styles.discountedPrice}>₹{book.finalPrice || book.price?.discounted || 0}</Text>
                        </>
                    ) : (
                        <Text style={styles.price}>₹{book.finalPrice || book.price?.original || book.price || 0}</Text>
                    )}
                </View>
            </View>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    card: { flex: 1, margin: 6, backgroundColor: '#FFF', borderRadius: 10, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
    cardPressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
    cover: { height: 180, padding: 10, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    iconContainer: { position: 'absolute', top: 8, right: 8 },
    coverTextContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
    coverTitle: { fontSize: 16, fontWeight: '700', color: '#FFF', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
    languageBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
    languageText: { fontSize: 9, fontWeight: '600', color: '#FFF' },
    discountBadge: { position: 'absolute', bottom: 6, right: 6, backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
    discountText: { fontSize: 9, fontWeight: '700', color: '#FFF' },
    details: { padding: 10, gap: 3 },
    englishTitle: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
    author: { fontSize: 11, color: '#6B7280', fontStyle: 'italic' },
    category: { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase' },
    priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    price: { fontSize: 15, fontWeight: '700', color: '#059669' },
    originalPrice: { fontSize: 13, color: '#9CA3AF', textDecorationLine: 'line-through' },
    discountedPrice: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});

BookCardWithCover.displayName = 'BookCardWithCover';
export default BookCardWithCover;
