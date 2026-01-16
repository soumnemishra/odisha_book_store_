import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCartStore } from '../store/cartStore';
import COLORS from '../constants/colors';
import { useEffect, useState } from 'react';

export default function CartButton({ style }) {
    const router = useRouter();
    const items = useCartStore(state => state.items);
    const [itemCount, setItemCount] = useState(0);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const count = items.reduce((total, item) => total + item.quantity, 0);

        if (count > itemCount) {
            // Trigger animation when count increases
            setAnimate(true);
            setTimeout(() => setAnimate(false), 300);
        }

        setItemCount(count);
    }, [items]);

    const handlePress = () => {
        router.push('/(tabs)/cart');
    };

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, animate && styles.iconAnimate]}>
                <Ionicons name="cart-outline" size={24} color={COLORS.primary} />

                {itemCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        padding: 8,
    },
    iconContainer: {
        position: 'relative',
    },
    iconAnimate: {
        transform: [{ scale: 1.2 }],
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: COLORS.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '700',
    },
});
