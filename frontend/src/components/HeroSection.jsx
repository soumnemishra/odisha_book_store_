import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useBooks, useFilterStats } from '../services/bookService';
import BookCover3D from './BookCover3D';

/**
 * Enhanced Hero Section with Featured Book Spotlight
 * Features:
 * - 3D rotating featured book from bestsellers
 * - Dynamic stats from API
 * - Trust metrics bar
 * - Animated headline
 */
const HeroSection = () => {
    const { data: filterStats } = useFilterStats();
    const { data, isLoading } = useBooks({ limit: 10, sort: '-createdAt' });
    const [currentBookIndex, setCurrentBookIndex] = useState(0);

    // Extract books safely
    const books = data?.books || [];

    // Rotate featured book every 5 seconds
    useEffect(() => {
        if (books.length === 0) return;

        const interval = setInterval(() => {
            setCurrentBookIndex(prev => (prev + 1) % Math.min(books.length, 5));
        }, 5000);

        return () => clearInterval(interval);
    }, [books.length]);

    // Calculate dynamic stats
    const totalBooks = filterStats?.totalBooks || 145;
    const categories = filterStats?.categories?.length || 27;
    const languages = filterStats?.languages?.length || 2;

    const featuredBook = books[currentBookIndex];

    return (
        <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-br from-background-cream via-background-cream to-primary/5">
            {/* Decorative Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(224,122,95,0.1) 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}
                />
                {/* Floating decorative circles */}
                <motion.div
                    className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-cta/10 blur-3xl"
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 6, repeat: Infinity }}
                />
            </div>

            <div className="container-custom relative z-10 py-12 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="order-2 lg:order-1"
                    >
                        {/* Trust Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6"
                        >
                            <span className="text-lg">🏆</span>
                            Odisha's Premier Book Store
                        </motion.div>

                        {/* Main Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-secondary leading-tight mb-4">
                            Discover Your
                            <br />
                            <span className="hero-gradient-text">Next Great Read</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-lg">
                            Explore our curated collection of <span className="font-semibold text-primary">{totalBooks}+ Odia books</span> — from timeless classics to contemporary works that celebrate Odisha's rich cultural heritage.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-4 mb-10">
                            <Link
                                to="/books"
                                className="btn-cta inline-flex items-center gap-2 text-lg px-8 py-4"
                            >
                                Shop Now
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <Link
                                to="/books"
                                className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4"
                            >
                                Browse Categories
                            </Link>
                        </div>

                        {/* Trust Metrics */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-wrap gap-6 pt-6 border-t border-gray-200/70"
                        >
                            <div className="trust-metric">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-lg">📚</span>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-secondary">{totalBooks}+</p>
                                    <p className="text-sm text-gray-500">Books</p>
                                </div>
                            </div>
                            <div className="trust-metric">
                                <div className="w-10 h-10 rounded-full bg-cta/10 flex items-center justify-center">
                                    <span className="text-lg">📖</span>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-secondary">{categories}+</p>
                                    <p className="text-sm text-gray-500">Categories</p>
                                </div>
                            </div>
                            <div className="trust-metric">
                                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                                    <span className="text-lg">🚚</span>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-success">FREE</p>
                                    <p className="text-sm text-gray-500">Shipping ₹500+</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Content - Featured Book */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="order-1 lg:order-2 flex justify-center items-center"
                    >
                        <div className="relative">
                            {/* Glow behind book */}
                            <div className="absolute inset-0 -m-10 bg-gradient-to-br from-primary/20 via-cta/10 to-transparent rounded-full blur-3xl" />

                            {/* Featured Book */}
                            {isLoading ? (
                                <div className="w-56 h-80 bg-gray-200 animate-pulse rounded-lg" />
                            ) : featuredBook ? (
                                <motion.div
                                    key={featuredBook._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <BookCover3D book={featuredBook} size="large" />
                                </motion.div>
                            ) : (
                                <div className="w-56 h-80 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    <span className="text-6xl">📖</span>
                                </div>
                            )}

                            {/* Rotating indicator */}
                            {books.length > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    {books.slice(0, 5).map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentBookIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === currentBookIndex
                                                ? 'bg-primary w-6'
                                                : 'bg-gray-300 hover:bg-gray-400'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
