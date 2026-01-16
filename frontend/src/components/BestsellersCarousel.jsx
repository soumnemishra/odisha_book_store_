import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BookCard from './BookCard';
import SkeletonCard from './ui/SkeletonCard';
import { useBooks } from '../services/bookService';

const BestsellersCarousel = () => {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    // Fetch bestsellers - using sales count or just popular books
    // Dynamic: Will automatically show more books as inventory grows
    const { data, isLoading } = useBooks({
        sortBy: 'createdAt', // Can be changed to 'salesCount' when available
        sortOrder: 'desc',
        limit: 12, // Fetch up to 12 bestsellers
    });

    const books = data?.books || [];

    // Check scroll position
    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [books]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScroll, 300);
        }
    };

    // Don't render if no books
    if (!isLoading && books.length === 0) return null;

    return (
        <section className="py-12 bg-gradient-to-br from-secondary via-secondary to-gray-900 text-white overflow-hidden">
            <div className="container-custom">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-2xl md:text-3xl font-serif font-bold flex items-center gap-2"
                        >
                            🔥 Bestsellers
                        </motion.h2>
                        <p className="text-gray-300 mt-1">Most loved by our readers</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Navigation Arrows */}
                        <div className="hidden md:flex gap-2">
                            <button
                                onClick={() => scroll('left')}
                                disabled={!canScrollLeft}
                                className={`p-2 rounded-full transition-all ${canScrollLeft
                                    ? 'bg-white/10 hover:bg-white/20 text-white'
                                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                disabled={!canScrollRight}
                                className={`p-2 rounded-full transition-all ${canScrollRight
                                    ? 'bg-white/10 hover:bg-white/20 text-white'
                                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <Link
                            to="/books?sortBy=createdAt&sortOrder=desc"
                            className="text-primary-200 hover:text-white font-medium transition-colors flex items-center gap-1"
                        >
                            View All
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Carousel */}
                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {isLoading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-[200px] snap-start">
                                <SkeletonCard />
                            </div>
                        ))
                    ) : (
                        books.map((book, index) => (
                            <motion.div
                                key={book._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="flex-shrink-0 w-[200px] snap-start"
                            >
                                <BookCard book={book} variant="compact" showAddToCart={false} />
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default BestsellersCarousel;
