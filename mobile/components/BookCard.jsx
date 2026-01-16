import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

export default function BookCard({ book, onPress, onAddToCart, showAddButton = true }) {
    // Handle both old flat schema and new nested schema
    // CRITICAL: Never fall back to book.title object! Only use strings
    const title = book.title?.display
        || (typeof book.title === 'string' ? book.title : null)
        || book.title?.english
        || book.title?.odia
        || 'Untitled';

    // CRITICAL: Never fall back to book.price object! Only use numbers
    const price = book.finalPrice
        || book.price?.discounted
        || book.price?.original
        || (typeof book.price === 'number' ? book.price : 0);

    const author = book.author || 'Unknown Author';
    const category = book.category || '';
    const rating = book.rating || 0;
    const stock = book.stock || 0;
    const imageUrl = book.image || 'https://via.placeholder.com/150x200?text=No+Image';

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <Ionicons key={i} name="star" size={14} color={COLORS.accent} style={{ marginRight: 2 }} />
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <Ionicons key={i} name="star-half" size={14} color={COLORS.accent} style={{ marginRight: 2 }} />
                );
            } else {
                stars.push(
                    <Ionicons key={i} name="star-outline" size={14} color={COLORS.gray300} style={{ marginRight: 2 }} />
                );
            }
        }
        return stars;
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            {/* Book Cover */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Stock Badge */}
                {stock <= 0 && (
                    <View style={styles.outOfStockBadge}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                )}

                {stock > 0 && stock < 10 && (
                    <View style={styles.lowStockBadge}>
                        <Text style={styles.lowStockText}>Only {stock} left</Text>
                    </View>
                )}
            </View>

            {/* Book Details */}
            <View style={styles.details}>
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>

                <Text style={styles.author} numberOfLines={1}>
                    by {author}
                </Text>

                {/* Rating */}
                <View style={styles.ratingContainer}>
                    {renderStars(rating)}
                    <Text style={styles.ratingText}>({rating?.toFixed(1) || '0.0'})</Text>
                </View>

                {/* Price and Category */}
                <View style={styles.footer}>
                    <View>
                        <Text style={styles.price}>₹{price}</Text>
                        {category && (
                            <Text style={styles.category}>{category}</Text>
                        )}
                    </View>

                    {/* Add to Cart Button */}
                    {showAddButton && stock > 0 && onAddToCart && (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                onAddToCart(book);
                            }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="cart-outline" size={18} color={COLORS.white} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: 200,
        backgroundColor: COLORS.gray100,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    outOfStockBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: COLORS.error,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    outOfStockText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '600',
    },
    lowStockBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: COLORS.warning,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    lowStockText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '600',
    },
    details: {
        padding: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textDark,
        marginBottom: 4,
    },
    author: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
    },
    category: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 2,
        textTransform: 'capitalize',
    },
    addButton: {
        backgroundColor: COLORS.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
