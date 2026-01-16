import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchAutocomplete from './SearchAutocomplete';

/**
 * Modern E-Commerce Navbar
 * Features:
 * - Sticky on all pages with scroll detection
 * - Enhanced avatar dropdown with user info
 * - Category mega menu
 * - Cart preview dropdown
 * - Announcement bar
 */

// Categories for mega menu
// Categories for mega menu (Matched with MongoDB)
const bookCategories = [
  { name: 'Novel', icon: '📖', path: '/books?category=Novel' },
  { name: 'Poetry', icon: '✨', path: '/books?category=Poetry' },
  { name: 'Children', icon: '🧒', path: '/books?category=Children' },
  { name: 'Educational', icon: '📚', path: '/books?category=Educational' },
  { name: 'Biography', icon: '👤', path: '/books?category=Biography' },
  { name: 'Story Collection', icon: '🎭', path: '/books?category=Story%20Collection' },
  { name: 'Science Fiction', icon: '🚀', path: '/books?category=Science%20Fiction' },
  { name: 'Travel', icon: '✈️', path: '/books?category=Travel' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems, getItemCount, getTotalPrice } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll detection for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/books', label: 'Books', hasMegaMenu: true },
    { to: '/about', label: 'About' },
  ];

  return (
    <>
      {/* Announcement Bar */}
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-primary to-cta text-white text-sm"
          >
            <div className="container-custom py-2 flex items-center justify-between">
              <div className="flex-1 text-center">
                <span className="mr-2">🚚</span>
                <span>Free shipping on orders over <strong>₹500</strong>!</span>
                <span className="ml-2">•</span>
                <span className="ml-2">📦 Same-day dispatch on orders before 2 PM</span>
              </div>
              <button
                onClick={() => setShowAnnouncement(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Close announcement"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
        : 'bg-background-cream/95 backdrop-blur-sm border-b border-stone-200/50'
        }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between py-3">

            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className={`w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl shadow-md group-hover:scale-105 transition-transform ${isScrolled ? 'w-9 h-9' : ''}`}>
                O
              </div>
              <span className={`font-serif font-bold text-secondary tracking-tight group-hover:text-primary transition-colors ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
                Odisha<span className="text-primary">Book</span>Store
              </span>
            </Link>

            {/* Center: Links (Desktop Only) */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.to}
                  className="relative"
                  onMouseEnter={() => link.hasMegaMenu && setActiveDropdown('books')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={link.to}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${location.pathname === link.to
                      ? 'text-primary bg-primary/5'
                      : 'text-secondary hover:text-primary hover:bg-gray-50'
                      }`}
                  >
                    {link.label}
                    {link.hasMegaMenu && (
                      <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {/* Mega Menu for Books */}
                  {link.hasMegaMenu && activeDropdown === 'books' && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 min-w-[400px]"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-secondary">Browse Categories</h3>
                          <Link to="/books" className="text-sm text-primary hover:underline">
                            View All →
                          </Link>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {bookCategories.map((cat) => (
                            <Link
                              key={cat.name}
                              to={cat.path}
                              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                              <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-2">

              {/* Search Bar (Desktop) */}
              <div className="hidden md:block flex-1 max-w-2xl mx-4">
                <SearchAutocomplete className="w-full" categories={bookCategories} />
              </div>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="hidden md:flex p-2 text-secondary hover:text-primary hover:bg-gray-50 rounded-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {/* Cart Icon with Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('cart')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to="/cart"
                  className="relative flex p-2 text-secondary hover:text-primary hover:bg-gray-50 rounded-lg transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {getItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-cta rounded-full">
                      {getItemCount > 99 ? '99+' : getItemCount}
                    </span>
                  )}
                </Link>

                {/* Cart Preview Dropdown */}
                {activeDropdown === 'cart' && getItemCount > 0 && (
                  <div className="absolute right-0 top-full pt-2 hidden md:block">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-80"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-secondary">Cart ({getItemCount})</h3>
                        <Link to="/cart" className="text-sm text-primary hover:underline">
                          View All
                        </Link>
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {cartItems.slice(0, 3).map((item) => (
                          <div key={item._id} className="flex gap-3">
                            <img
                              src={item.coverImage || '/placeholder-book.jpg'}
                              alt={item.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                              <p className="text-sm font-semibold text-primary">₹{item.price * item.quantity}</p>
                            </div>
                          </div>
                        ))}
                        {cartItems.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{cartItems.length - 3} more items
                          </p>
                        )}
                      </div>
                      <div className="border-t border-gray-100 mt-3 pt-3">
                        <div className="flex justify-between mb-3">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold text-primary">₹{getTotalPrice?.toFixed(2) || '0.00'}</span>
                        </div>
                        <Link
                          to="/checkout"
                          className="block w-full py-2 bg-cta text-white text-center rounded-lg font-semibold hover:bg-cta-hover transition-colors"
                        >
                          Checkout
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* User Avatar/Account (Desktop) */}
              <div
                className="hidden md:block relative"
                onMouseEnter={() => setActiveDropdown('user')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {user ? (
                  <>
                    <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-all">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-cta text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* User Dropdown */}
                    {activeDropdown === 'user' && (
                      <div className="absolute right-0 top-full pt-2">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-56"
                        >
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary to-cta text-white rounded-full flex items-center justify-center font-bold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[140px]">{user.email}</p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <Link to="/orders" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                              <span>📦</span> My Orders
                            </Link>
                            <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                              <span>❤️</span> Wishlist
                            </Link>
                            <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                              <span>⚙️</span> Settings
                            </Link>
                          </div>

                          {/* Logout */}
                          <div className="border-t border-gray-100 pt-2">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50"
                            >
                              <span>🚪</span> Logout
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all text-secondary"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-medium">Sign In</span>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Guest Dropdown */}
                    {activeDropdown === 'user' && (
                      <div className="absolute right-0 top-full pt-2">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-64"
                        >
                          <div className="flex gap-2 mb-3">
                            <Link
                              to="/login"
                              className="flex-1 py-2 text-center border border-primary text-primary rounded-lg font-medium hover:bg-primary/5"
                            >
                              Sign In
                            </Link>
                            <Link
                              to="/register"
                              className="flex-1 py-2 text-center bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
                            >
                              Sign Up
                            </Link>
                          </div>
                          <div className="border-t border-gray-100 pt-3">
                            <Link to="/track-order" className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary">
                              <span>📦</span> Track Your Order
                            </Link>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-secondary hover:text-primary hover:bg-gray-50 rounded-lg transition-all"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <span className="text-lg font-bold text-secondary">Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="p-4 border-b">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search books..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </form>

                {/* Navigation Links */}
                <nav className="flex-1 py-4 overflow-y-auto">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-6 py-3 text-lg font-medium transition-colors ${location.pathname === link.to
                        ? 'text-primary bg-primary/5'
                        : 'text-secondary hover:bg-gray-50'
                        }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {/* Categories in mobile */}
                  <div className="px-6 py-3 border-t border-gray-100 mt-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Categories</p>
                    <div className="grid grid-cols-2 gap-2">
                      {bookCategories.slice(0, 6).map((cat) => (
                        <Link
                          key={cat.name}
                          to={cat.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                          <span>{cat.icon}</span>
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <Link
                    to="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-6 py-3 text-lg font-medium text-secondary hover:bg-gray-50 border-t border-gray-100"
                  >
                    ❤️ Wishlist
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-6 py-3 text-lg font-medium text-secondary hover:bg-gray-50"
                  >
                    📦 My Orders
                  </Link>
                </nav>

                {/* Auth Section */}
                <div className="p-4 border-t">
                  {user ? (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-cta text-white rounded-full flex items-center justify-center font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full py-2 text-center text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 py-2 text-center text-primary font-medium border border-primary rounded-lg hover:bg-primary/5"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 py-2 text-center text-white font-medium bg-primary rounded-lg hover:bg-primary/90"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;