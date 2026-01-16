import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// Initialize the context with null, as required by createContext.
const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // Initialize state with an empty array.
  const [cartItems, setCartItems] = useState([]);

  // --- Persistence Logic ---

  // 1. Load cart data from localStorage on initial mount (client side only).
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        // Parse the saved string, defaulting to empty array on parse error
        setCartItems(JSON.parse(savedCart) || []);
      }
    } catch (e) {
      console.error("Could not load cart from localStorage:", e);
      setCartItems([]); // Reset cart if local storage is corrupt
    }
  }, []);

  // 2. Save cart data to localStorage whenever cartItems changes.
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error("Could not save cart to localStorage:", e);
      // Handle potential storage limit errors here if needed
    }
  }, [cartItems]);

  // --- Cart Operations ---

  const addToCart = useCallback((book) => {
    // Normalize ID: check _id first, then id
    const bookId = book._id || book.id;

    if (!book || !bookId || book.price == null) {
      console.error("Invalid book object passed to addToCart:", book);
      return;
    }

    // Use the quantity passed in the book object, or default to 1
    const quantityToAdd = book.quantity || 1;

    setCartItems((prevItems) => {
      // Check if item exists using either _id or id
      const existingItem = prevItems.find((item) => (item._id || item.id) === bookId);

      if (existingItem) {
        // Increment quantity for existing item
        return prevItems.map((item) =>
          (item._id || item.id) === bookId
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      }

      // Add new item
      // Ensure we store it with _id for consistency if possible
      return [...prevItems, { ...book, _id: bookId, quantity: quantityToAdd }];
    });
  }, []);

  const removeFromCart = useCallback((bookId) => {
    setCartItems((prevItems) => prevItems.filter((item) => (item._id || item.id) !== bookId));
  }, []);

  const updateQuantity = useCallback((bookId, quantity) => {
    const newQuantity = Number(quantity); // Ensure quantity is treated as a number

    if (newQuantity <= 0 || isNaN(newQuantity)) {
      removeFromCart(bookId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        (item._id || item.id) === bookId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    // Remove the item completely from storage
    localStorage.removeItem('cart');
  }, []);

  // --- Derived Values (Memoized for Performance) ---

  // Total price of all items
  const getTotalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Total number of items (sum of quantities)
  const getItemCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Subtotal (same as total for now, but useful for adding shipping/tax later)
  const getSubtotal = useMemo(() => {
    return getTotalPrice;
  }, [getTotalPrice]);

  // Group all context values into a single memoized object
  const contextValue = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getItemCount,
    getSubtotal,
  }), [cartItems, getTotalPrice, getItemCount, getSubtotal, addToCart, removeFromCart, updateQuantity, clearCart]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// --- Custom Hook ---

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    // Standard error for misuse of context
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};