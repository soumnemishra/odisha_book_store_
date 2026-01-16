// store/cartStore.js - Cart state management with manual AsyncStorage persistence
// This version avoids Zustand middleware to ensure Hermes compatibility
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = '@odisha_book_store_cart';

/**
 * Cart Store - Client-Side Cart using Zustand with AsyncStorage Persistence
 * 
 * Features:
 * - cart: Array of items
 * - addToCart(book): If book exists, increment quantity. If not, add with quantity 1.
 * - removeFromCart(bookId): Remove item
 * - totalPrice: Derived value calculating the total cost
 * - Persistence: Manual AsyncStorage sync (survives app restarts)
 * 
 * Note: This implementation uses manual persistence instead of middleware
 * to ensure compatibility with React Native's Hermes engine.
 */

const useCartStore = create((set, get) => ({
    // State
    items: [],
    isLoaded: false,

    // Load cart from AsyncStorage on app start
    loadCart: async () => {
        try {
            const cartJson = await AsyncStorage.getItem(CART_STORAGE_KEY);
            if (cartJson) {
                const items = JSON.parse(cartJson);
                set({ items, isLoaded: true });
            } else {
                set({ isLoaded: true });
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            set({ isLoaded: true });
        }
    },

    // Save cart to AsyncStorage (internal method)
    _saveCart: async (items) => {
        try {
            await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    },

    // Add item to cart
    addItem: (book, quantity = 1) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(item => item._id === book._id);

        let newItems;
        if (existingItemIndex > -1) {
            // Update quantity if item already exists
            newItems = [...items];
            newItems[existingItemIndex].quantity += quantity;
        } else {
            // Add new item with quantity 1
            newItems = [...items, { ...book, quantity }];
        }

        set({ items: newItems });
        get()._saveCart(newItems);
    },

    // Remove item from cart
    removeItem: (bookId) => {
        const { items } = get();
        const newItems = items.filter(item => item._id !== bookId);
        set({ items: newItems });
        get()._saveCart(newItems);
    },

    // Update item quantity
    updateQuantity: (bookId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
            get().removeItem(bookId);
            return;
        }

        const newItems = items.map(item =>
            item._id === bookId ? { ...item, quantity } : item
        );
        set({ items: newItems });
        get()._saveCart(newItems);
    },

    // Increase quantity
    increaseQuantity: (bookId) => {
        const { items } = get();
        const item = items.find(item => item._id === bookId);
        if (item) {
            get().updateQuantity(bookId, item.quantity + 1);
        }
    },

    // Decrease quantity (removes if quantity becomes 0)
    decreaseQuantity: (bookId) => {
        const { items } = get();
        const item = items.find(item => item._id === bookId);
        if (item && item.quantity > 1) {
            get().updateQuantity(bookId, item.quantity - 1);
        } else if (item && item.quantity === 1) {
            get().removeItem(bookId);
        }
    },

    // Clear entire cart
    clearCart: () => {
        set({ items: [] });
        get()._saveCart([]);
    },

    // Get cart item count
    getItemCount: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
    },

    // Get cart subtotal
    getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
            const price = item.finalPrice || item.price?.discounted || item.price?.original || item.price || 0;
            return total + (price * item.quantity);
        }, 0);
    },

    // Get shipping cost (free shipping over ₹500, otherwise ₹50)
    getShippingCost: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= 500 ? 0 : 50;
    },

    // Get total (subtotal + shipping)
    getTotal: () => {
        return get().getSubtotal() + get().getShippingCost();
    },

    // Check if item is in cart
    isInCart: (bookId) => {
        const { items } = get();
        return items.some(item => item._id === bookId);
    },

    // Get quantity of specific item
    getItemQuantity: (bookId) => {
        const { items } = get();
        const item = items.find(item => item._id === bookId);
        return item ? item.quantity : 0;
    },
}));

// Auto-load cart on app start
useCartStore.getState().loadCart();

export { useCartStore };
