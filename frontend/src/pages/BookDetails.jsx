import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBook, useBooks } from '../services/bookService';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';
import BookCard from '../components/BookCard';
import ImageGallery from '../components/ImageGallery';
import DeliveryCheck from '../components/DeliveryCheck';
import OffersSection from '../components/OffersSection';
import ReviewsSection from '../components/ReviewsSection';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BookDetails Page - Enhanced with Phase 1 features
 * Features: Image gallery zoom, delivery check, offers, enhanced reviews
 */
const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Use the normalized book data from the hook
  const { data: book, isLoading, error } = useBook(id);

  // Fetch related books (same category)
  const { data: relatedData } = useBooks({
    category: book?.category,
    limit: 4
  });
  const relatedBooks = relatedData?.books?.filter(b => b._id !== id)?.slice(0, 4) || [];

  // Scroll listener for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ensure stock is set for demo
  const bookWithStock = book ? {
    ...book,
    stock: book.stock > 0 ? book.stock : 10,
    // Mock multiple images for gallery demo
    images: book.image ? [book.image] : []
  } : null;

  // Mock reviews for demo
  const mockReviews = [
    {
      _id: '1',
      user: { name: 'Ramesh Kumar' },
      rating: 5,
      comment: 'Excellent book! The content is very informative and well-written. Highly recommended for anyone interested in Odia literature.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      verified: true,
      helpfulCount: 12
    },
    {
      _id: '2',
      user: { name: 'Sita Devi' },
      rating: 4,
      comment: 'Good quality printing and fast delivery. The book arrived in perfect condition.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      verified: true,
      helpfulCount: 8
    },
    {
      _id: '3',
      user: { name: 'Prakash Mohanty' },
      rating: 5,
      comment: 'A must-read for Odia book lovers. The author has done an amazing job.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      verified: false,
      helpfulCount: 5
    }
  ];

  const reviews = bookWithStock?.reviews?.length > 0 ? bookWithStock.reviews : mockReviews;

  const handleAddToCart = () => {
    if (bookWithStock && bookWithStock.stock > 0) {
      addToCart({ ...bookWithStock, quantity });
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (bookWithStock && bookWithStock.stock > 0) {
      addToCart({ ...bookWithStock, quantity });
      navigate('/checkout');
    }
  };

  const handleWriteReview = () => {
    // TODO: Open review modal or navigate to review page
    alert('Write review feature coming soon!');
  };

  if (isLoading) return <Loader />;

  if (error || !bookWithStock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Not Found</h2>
          <p className="text-gray-500 mb-6">The book you are looking for does not exist or has been removed.</p>
          <Link to="/books" className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            Browse All Books
          </Link>
        </div>
      </div>
    );
  }

  // Calculate discount info
  const hasDiscount = bookWithStock.discountPercent > 0;
  const displayPrice = bookWithStock.price;
  const originalPrice = bookWithStock.originalPrice || Math.round(displayPrice * 1.2);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Breadcrumb */}
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/books" className="hover:text-primary transition-colors">Books</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{bookWithStock.title}</span>
          </nav>
        </div>

        <div className="container-custom pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column - Image Gallery */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <ImageGallery
                  images={bookWithStock.images}
                  title={bookWithStock.title}
                />

                {/* Trust Badges */}
                <div className="flex justify-center gap-4 mt-6 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-full shadow-sm">
                    <span className="text-green-500">✓</span> Authentic
                  </div>
                  <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-full shadow-sm">
                    <span className="text-green-500">✓</span> Secure
                  </div>
                  <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-full shadow-sm">
                    <span className="text-green-500">✓</span> Fast Delivery
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <div className="p-6 lg:p-8">
                  {/* Category & Language Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                      {bookWithStock.category}
                    </span>
                    {bookWithStock.language && (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {bookWithStock.language}
                      </span>
                    )}
                    {bookWithStock.rating >= 4 && (
                      <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                        ⭐ Bestseller
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="font-serif text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                    {bookWithStock.title}
                  </h1>

                  {/* Author */}
                  <p className="text-lg text-gray-500 mb-4">
                    by <span className="text-gray-900 font-medium hover:text-primary cursor-pointer transition-colors">{bookWithStock.author}</span>
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-lg">
                      <span className="font-bold">{bookWithStock.rating?.toFixed(1) || '4.2'}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {reviews.length} ratings & reviews
                    </span>
                  </div>

                  {/* Price Section */}
                  <div className="flex items-baseline gap-4 mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <span className="text-4xl font-bold text-gray-900">₹{displayPrice}</span>
                    {hasDiscount || originalPrice > displayPrice ? (
                      <>
                        <span className="text-lg text-gray-400 line-through">₹{originalPrice}</span>
                        <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                          {bookWithStock.discountPercent || Math.round((1 - displayPrice / originalPrice) * 100)}% OFF
                        </span>
                      </>
                    ) : null}
                  </div>

                  {/* Delivery Check */}
                  <div className="mb-6">
                    <DeliveryCheck price={displayPrice} />
                  </div>

                  {/* Offers Section */}
                  <div className="mb-6">
                    <OffersSection price={displayPrice} bookTitle={bookWithStock.title} />
                  </div>

                  {/* Stock & Quantity */}
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-3 text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors"
                      >-</button>
                      <span className="px-6 py-3 font-bold text-gray-900 border-x-2 border-gray-200 min-w-[4rem] text-center text-lg">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(bookWithStock.stock, quantity + 1))}
                        className="px-4 py-3 text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors"
                      >+</button>
                    </div>

                    {bookWithStock.stock > 0 ? (
                      <div className="text-green-600 font-medium flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                        In Stock ({bookWithStock.stock} available)
                      </div>
                    ) : (
                      <div className="text-red-600 font-medium flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleAddToCart}
                      disabled={bookWithStock.stock === 0}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${isAddedToCart
                        ? 'bg-green-500 text-white'
                        : bookWithStock.stock > 0
                          ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:shadow-xl'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      {isAddedToCart ? (
                        <>✓ Added!</>
                      ) : bookWithStock.stock > 0 ? (
                        <>🛒 Add to Cart</>
                      ) : (
                        <>Unavailable</>
                      )}
                    </motion.button>

                    <motion.button
                      onClick={handleBuyNow}
                      disabled={bookWithStock.stock === 0}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${bookWithStock.stock > 0
                        ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-xl'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      ⚡ Buy Now
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="px-5 py-4 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all text-xl"
                    >
                      ♥
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Tabs Section */}
              <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Tab Buttons */}
                <div className="flex border-b border-gray-200">
                  {[
                    { id: 'description', label: 'Description' },
                    { id: 'details', label: 'Details' },
                    { id: 'reviews', label: `Reviews (${reviews.length})` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-6 py-4 font-semibold transition-colors relative ${activeTab === tab.id
                        ? 'text-primary'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-6 lg:p-8">
                  <AnimatePresence mode="wait">
                    {activeTab === 'description' && (
                      <motion.div
                        key="description"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="prose prose-lg max-w-none"
                      >
                        <p className="text-gray-600 leading-relaxed">
                          {bookWithStock.description || 'No description available for this book.'}
                        </p>
                      </motion.div>
                    )}

                    {activeTab === 'details' && (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {[
                          { label: 'Category', value: bookWithStock.category },
                          { label: 'Language', value: bookWithStock.language || 'Odia' },
                          { label: 'Author', value: bookWithStock.author },
                          { label: 'ISBN', value: bookWithStock.isbn || 'N/A' },
                          { label: 'Academic Grade', value: bookWithStock.academicGrade || 'N/A' },
                          { label: 'Publisher', value: 'Odisha Book Store' },
                        ].map((item) => (
                          <div key={item.label} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <span className="text-gray-500 text-sm">{item.label}</span>
                            <p className="font-semibold text-gray-900">{item.value}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {activeTab === 'reviews' && (
                      <motion.div
                        key="reviews"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <ReviewsSection
                          reviews={reviews}
                          bookId={id}
                          onWriteReview={handleWriteReview}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Related Books Section */}
          {/* Related Books Section */}
          {relatedBooks.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedBooks.map((relBook) => (
                  <BookCard
                    key={relBook._id}
                    book={relBook}
                    variant="compact"
                    showAddToCart={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Add to Cart Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 safe-area-bottom"
          >
            <div className="container-custom py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {bookWithStock.image ? (
                    <img src={bookWithStock.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{bookWithStock.title}</p>
                  <p className="text-lg font-bold text-primary">₹{displayPrice}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-500 transition-colors"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BookDetails;