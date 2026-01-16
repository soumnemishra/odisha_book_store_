import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const { addToCart } = useCart();

    // Load wishlist from localStorage
    useEffect(() => {
        const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistItems(savedWishlist);
    }, []);

    const removeFromWishlist = (bookId) => {
        const newWishlist = wishlistItems.filter((item) => item._id !== bookId);
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        setWishlistItems(newWishlist);
        toast.success('Removed from wishlist');
    };

    const moveToCart = (item) => {
        addToCart(item);
        removeFromWishlist(item._id);
        toast.success(`"${item.title}" moved to cart!`);
    };

    const clearWishlist = () => {
        localStorage.setItem('wishlist', JSON.stringify([]));
        setWishlistItems([]);
        toast.success('Wishlist cleared');
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-16">
                <div className="container-custom">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h1>
                        <p className="text-gray-500 mb-8">Save your favorite books to buy later!</p>
                        <Link to="/books" className="btn-primary inline-block">
                            Browse Books
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                        <p className="text-gray-500 mt-1">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved</p>
                    </div>
                    <button
                        onClick={clearWishlist}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                        Clear All
                    </button>
                </div>

                {/* Wishlist Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                        <div key={item._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="flex gap-4 p-4">
                                {/* Image */}
                                <Link to={`/books/${item._id}`} className="flex-shrink-0">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-24 h-32 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-24 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <span className="text-3xl">📚</span>
                                        </div>
                                    )}
                                </Link>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                        {item.category}
                                    </span>
                                    <Link to={`/books/${item._id}`}>
                                        <h3 className="font-serif font-bold text-lg text-gray-900 hover:text-primary transition-colors line-clamp-2 mt-1">
                                            {item.title}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-gray-500 mt-1">{item.author}</p>
                                    <p className="text-xl font-bold text-primary mt-2">₹{item.price}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex border-t border-gray-100">
                                <button
                                    onClick={() => moveToCart(item)}
                                    className="flex-1 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Move to Cart
                                </button>
                                <div className="w-px bg-gray-100" />
                                <button
                                    onClick={() => removeFromWishlist(item._id)}
                                    className="flex-1 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Continue Shopping */}
                <div className="text-center mt-12">
                    <Link to="/books" className="btn-secondary inline-block">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
