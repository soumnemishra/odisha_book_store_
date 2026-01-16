import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

/**
 * BookCard - Unified book card component with multiple variants
 * 
 * Variants:
 * - default: Full card with all details
 * - compact: Smaller card for carousels
 * - horizontal: Side-by-side layout for lists
 * - mini: Minimal card for chatbot/sidebars
 * 
 * Props:
 * - book: Book object with title, author, price, image, etc.
 * - variant: 'default' | 'compact' | 'horizontal' | 'mini'
 * - showAddToCart: Show add to cart button
 * - showWishlist: Show wishlist heart
 * - showRating: Show star rating
 * - showBadge: Show discount/bestseller badge
 */
const BookCard = ({
  book,
  variant = 'default',
  showAddToCart = true,
  showWishlist = true,
  showRating = true,
  showBadge = true,
  className = ''
}) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(() => {
    if (typeof window === 'undefined') return false;
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return wishlist.some((item) => item._id === book?._id);
  });
  const [isHovered, setIsHovered] = useState(false);

  if (!book) return null;

  // Handle nested price structure from backend
  const getPrice = () => {
    if (typeof book.price === 'object') {
      return book.price.discounted || book.price.original || 0;
    }
    return book.price || 0;
  };

  const getOriginalPrice = () => {
    if (typeof book.price === 'object') {
      return book.price.original || 0;
    }
    return book.originalPrice || book.price || 0;
  };

  const getDiscountPercent = () => {
    if (typeof book.price === 'object' && book.price.discountPercent) {
      return book.price.discountPercent;
    }
    const price = getPrice();
    const original = getOriginalPrice();
    if (original > price) {
      return Math.round((1 - price / original) * 100);
    }
    return 0;
  };

  const hasDiscount = () => getDiscountPercent() > 0;

  // Handle nested title structure from backend
  const getTitle = () => {
    if (typeof book.title === 'object') {
      return book.title.display || book.title.english || book.title.odia || 'Untitled';
    }
    return book.title || 'Untitled';
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cartItem = {
      _id: book._id,
      title: getTitle(),
      author: book.author,
      image: book.image,
      price: getPrice(),
      category: book.category,
    };
    addToCart(cartItem);
    toast.success(`Added to cart!`, {
      icon: '🛒',
      style: { borderRadius: '12px', background: '#333', color: '#fff' }
    });
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

    if (isWishlisted) {
      const newWishlist = wishlist.filter((item) => item._id !== book._id);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      setIsWishlisted(false);
      toast.success('Removed from wishlist', { icon: '💔' });
    } else {
      const wishlistItem = {
        _id: book._id,
        title: getTitle(),
        author: book.author,
        image: book.image,
        price: getPrice(),
        category: book.category,
      };
      wishlist.push(wishlistItem);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsWishlisted(true);
      toast.success('Added to wishlist!', { icon: '❤️' });
    }
  };

  const price = getPrice();
  const originalPrice = getOriginalPrice();
  const title = getTitle();
  const discountPercent = getDiscountPercent();
  const rating = book.rating || 0;
  const inStock = book.stock !== 0;

  // Wishlist Heart Button Component
  const WishlistButton = ({ size = 'md' }) => {
    const sizes = {
      sm: 'w-7 h-7',
      md: 'w-9 h-9',
      lg: 'w-10 h-10'
    };
    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-5 h-5'
    };

    return (
      <motion.button
        onClick={toggleWishlist}
        whileTap={{ scale: 0.85 }}
        className={`${sizes[size]} bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-10 group/heart border border-gray-100`}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <motion.svg
          animate={isWishlisted ? { scale: [1, 1.3, 1] } : {}}
          className={`${iconSizes[size]} transition-colors ${isWishlisted
              ? 'text-red-500 fill-red-500'
              : 'text-gray-400 group-hover/heart:text-red-400'
            }`}
          fill={isWishlisted ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </motion.svg>
      </motion.button>
    );
  };

  // Rating Component
  const Rating = ({ showCount = false }) => (
    <div className="flex items-center gap-1">
      {rating > 0 ? (
        <>
          <div className="flex items-center gap-0.5 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            <span>{rating.toFixed(1)}</span>
            <span className="text-[10px]">★</span>
          </div>
          {showCount && book.reviewCount && (
            <span className="text-xs text-gray-500">({book.reviewCount})</span>
          )}
        </>
      ) : (
        <span className="text-xs text-gray-400">New</span>
      )}
    </div>
  );

  // Badge Component
  const Badge = () => {
    if (!showBadge) return null;

    if (hasDiscount()) {
      return (
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            {discountPercent}% OFF
          </div>
        </div>
      );
    }

    if (rating >= 4.5) {
      return (
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
            <span>★</span> Bestseller
          </div>
        </div>
      );
    }

    return null;
  };

  // Image Component
  const BookImage = ({ aspectRatio = 'aspect-[2/3]', showOverlay = true }) => (
    <div className={`relative ${aspectRatio} overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50`}>
      {book.image ? (
        <motion.img
          src={book.image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
          whileHover={showOverlay ? { scale: 1.08 } : {}}
          transition={{ duration: 0.4 }}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 bg-gradient-to-br from-primary/5 to-primary/10">
          <span className="text-5xl mb-2">📚</span>
          <span className="text-xs text-gray-400">No cover</span>
        </div>
      )}

      {/* Hover Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </div>
  );

  // ========================================
  // VARIANT: MINI (for chatbot, sidebars)
  // ========================================
  if (variant === 'mini') {
    return (
      <Link
        to={`/books/${book._id}`}
        className={`flex gap-3 p-2 bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all ${className}`}
      >
        <div className="w-14 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {book.image ? (
            <img src={book.image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">📚</div>
          )}
        </div>
        <div className="flex-1 min-w-0 py-1">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{title}</h4>
          <p className="text-xs text-gray-500 line-clamp-1">{book.author}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-bold text-primary text-sm">₹{price}</span>
            {hasDiscount() && (
              <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // ========================================
  // VARIANT: HORIZONTAL (for lists, search)
  // ========================================
  if (variant === 'horizontal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group flex bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all ${className}`}
      >
        <Link to={`/books/${book._id}`} className="relative w-32 md:w-40 flex-shrink-0">
          <BookImage aspectRatio="aspect-[2/3]" />
          <Badge />
        </Link>

        <div className="flex-1 p-4 md:p-5 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{book.category}</span>
              <Link to={`/books/${book._id}`}>
                <h3 className="font-serif font-bold text-lg text-gray-900 line-clamp-2 hover:text-primary transition-colors mt-1">
                  {title}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 mt-1">{book.author}</p>
            </div>
            {showWishlist && <WishlistButton size="sm" />}
          </div>

          {showRating && <div className="mb-3"><Rating showCount /></div>}

          <div className="mt-auto flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">₹{price}</span>
              {hasDiscount() && (
                <>
                  <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
                  <span className="text-xs font-bold text-green-600">{discountPercent}% off</span>
                </>
              )}
            </div>
            {showAddToCart && (
              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm"
              >
                Add to Cart
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ========================================
  // VARIANT: COMPACT (for carousels)
  // ========================================
  if (variant === 'compact') {
    return (
      <Link
        to={`/books/${book._id}`}
        className={`group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <BookImage aspectRatio="aspect-[3/4]" />
          <Badge />
          {showWishlist && (
            <div className="absolute top-2 right-2">
              <WishlistButton size="sm" />
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{book.author}</p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-primary">₹{price}</span>
              {hasDiscount() && (
                <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
              )}
            </div>
            {showRating && rating > 0 && (
              <div className="flex items-center gap-0.5 text-xs">
                <span className="text-yellow-500">★</span>
                <span className="text-gray-600 font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // ========================================
  // VARIANT: DEFAULT (full card)
  // ========================================
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all h-full flex flex-col ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <Link to={`/books/${book._id}`} className="relative block">
        <BookImage />
        <Badge />

        {/* Wishlist Button */}
        {showWishlist && (
          <div className="absolute top-3 right-3">
            <WishlistButton />
          </div>
        )}

        {/* Quick Add Button (on hover) */}
        {showAddToCart && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            className="absolute bottom-3 left-3 right-3"
          >
            <motion.button
              onClick={handleAddToCart}
              whileTap={{ scale: 0.95 }}
              className="w-full py-2.5 bg-white/95 backdrop-blur-sm text-gray-900 font-bold rounded-xl shadow-lg hover:bg-primary hover:text-white transition-colors text-sm"
            >
              + Quick Add
            </motion.button>
          </motion.div>
        )}

        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-white text-gray-900 font-bold px-4 py-2 rounded-lg text-sm">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
          {book.category}
        </span>

        {/* Title */}
        <Link to={`/books/${book._id}`}>
          <h3 className="font-serif font-bold text-lg text-gray-900 line-clamp-2 hover:text-primary transition-colors leading-snug">
            {title}
          </h3>
        </Link>

        {/* Author */}
        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{book.author}</p>

        {/* Bottom Section */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          {/* Price and Rating Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">₹{price}</span>
              {hasDiscount() && (
                <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
              )}
            </div>
            {showRating && <Rating />}
          </div>

          {/* Discount Tag */}
          {hasDiscount() && (
            <div className="mt-2">
              <span className="inline-block text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                Save ₹{originalPrice - price}
              </span>
            </div>
          )}

          {/* Add to Cart Button (for mobile / when not hovering) */}
          {showAddToCart && (
            <motion.button
              onClick={handleAddToCart}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-3 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm md:hidden"
            >
              Add to Cart
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;