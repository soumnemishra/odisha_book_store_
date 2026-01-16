// store/wishlistStore.js - Wishlist State Management with AsyncStorage Persistence
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Wishlist Store - Manages user's saved/favorited books
 * Features: Add/remove items, persistence, isWishlisted check
 */
export const useWishlistStore = create(
    persist(
        (set, get) => ({
            // State
            items: [], // Array of book objects

            // Add item to wishlist
            addItem: (book) => {
                const { items } = get();
                const exists = items.find((item) => item._id === book._id);

                if (!exists) {
                    set({ items: [...items, book] });
                    return true;
                }
                return false;
            },

            // Remove item from wishlist
            removeItem: (bookId) => {
                const { items } = get();
                set({ items: items.filter((item) => item._id !== bookId) });
            },

            // Toggle wishlist status
            toggleItem: (book) => {
                const { items, addItem, removeItem } = get();
                const exists = items.find((item) => item._id === book._id);

                if (exists) {
                    removeItem(book._id);
                    return false; // Removed
                } else {
                    addItem(book);
                    return true; // Added
                }
            },

            // Check if item is in wishlist
            isWishlisted: (bookId) => {
                const { items } = get();
                return items.some((item) => item._id === bookId);
            },

            // Get wishlist count
            getCount: () => {
                return get().items.length;
            },

            // Clear entire wishlist
            clearWishlist: () => {
                set({ items: [] });
            },
        }),
        {
            name: 'wishlist-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
