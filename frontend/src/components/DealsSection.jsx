import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BookCard from './BookCard';
import SkeletonCard from './ui/SkeletonCard';
import { useBooks } from '../services/bookService';

const DealsSection = () => {
    // Calculate end of day for countdown
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    // Fetch books with discount (simulated - using random books for now)
    // When discount field is added to backend, filter by: hasDiscount: true
    const { data, isLoading } = useBooks({
        limit: 4,
        sortBy: 'price',
        sortOrder: 'asc', // Lower priced books as "deals"
    });

    const dealBooks = data?.books || [];

    // Countdown timer - resets at midnight
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const diff = endOfDay - now;

            return {
                hours: Math.floor(diff / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000)
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Don't render if no books
    if (!isLoading && dealBooks.length === 0) return null;

    return (
        <section className="py-12 bg-gradient-to-r from-sale/10 via-sale/5 to-transparent border-y border-sale/20">
            <div className="container-custom">
                {/* Header with Countdown */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-2xl md:text-3xl font-serif font-bold text-secondary flex items-center gap-2"
                        >
                            <span className="text-3xl">⚡</span> Today's Deals
                        </motion.h2>
                        <p className="text-gray-500 mt-1">Limited time offers on select books</p>
                    </div>

                    {/* Countdown Timer */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3"
                    >
                        <span className="text-sm text-gray-500 font-medium">Ends in:</span>
                        <div className="flex gap-2">
                            <div className="bg-sale text-white px-3 py-2 rounded-lg text-center min-w-[50px]">
                                <span className="text-xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                                <p className="text-xs opacity-80">HRS</p>
                            </div>
                            <div className="bg-sale text-white px-3 py-2 rounded-lg text-center min-w-[50px]">
                                <span className="text-xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                <p className="text-xs opacity-80">MIN</p>
                            </div>
                            <div className="bg-sale text-white px-3 py-2 rounded-lg text-center min-w-[50px]">
                                <span className="text-xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                <p className="text-xs opacity-80">SEC</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Deal Books Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                    ) : (
                        dealBooks.map((book, index) => (
                            <motion.div
                                key={book._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                {/* Deal Badge */}
                                <div className="absolute top-2 left-2 z-10 sale-badge">
                                    🔥 Deal
                                </div>
                                <BookCard book={book} />
                            </motion.div>
                        ))
                    )}
                </div>

                {/* View All Link */}
                <div className="text-center mt-8">
                    <Link
                        to="/books?sortBy=price&sortOrder=asc"
                        className="inline-flex items-center gap-2 text-sale hover:text-sale-dark font-medium transition-colors"
                    >
                        View All Deals
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default DealsSection;
