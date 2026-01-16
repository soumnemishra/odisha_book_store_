import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ReviewsSection - Enhanced reviews with sorting, filtering, and ratings breakdown
 * Features: Star breakdown chart, sort/filter, verified badge, helpful votes
 */
const ReviewsSection = ({ reviews = [], bookId, onWriteReview }) => {
    const [sortBy, setSortBy] = useState('recent');
    const [filterRating, setFilterRating] = useState(0); // 0 = all
    const [helpfulVotes, setHelpfulVotes] = useState({});

    // Calculate rating statistics
    const stats = useMemo(() => {
        if (reviews.length === 0) {
            return { average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
        }

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let sum = 0;

        reviews.forEach(review => {
            const rating = Math.round(review.rating);
            if (rating >= 1 && rating <= 5) {
                distribution[rating]++;
                sum += review.rating;
            }
        });

        return {
            average: (sum / reviews.length).toFixed(1),
            total: reviews.length,
            distribution
        };
    }, [reviews]);

    // Sort and filter reviews
    const filteredReviews = useMemo(() => {
        let result = [...reviews];

        // Filter by rating
        if (filterRating > 0) {
            result = result.filter(r => Math.round(r.rating) === filterRating);
        }

        // Sort
        switch (sortBy) {
            case 'recent':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'helpful':
                result.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
                break;
            case 'highest':
                result.sort((a, b) => b.rating - a.rating);
                break;
            case 'lowest':
                result.sort((a, b) => a.rating - b.rating);
                break;
            default:
                break;
        }

        return result;
    }, [reviews, sortBy, filterRating]);

    const handleHelpfulVote = (reviewId) => {
        setHelpfulVotes(prev => ({
            ...prev,
            [reviewId]: !prev[reviewId]
        }));
    };

    const StarRating = ({ rating, size = 'md' }) => {
        const sizeClasses = {
            sm: 'text-sm',
            md: 'text-base',
            lg: 'text-xl'
        };

        return (
            <div className={`flex ${sizeClasses[size]} text-yellow-400`}>
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={star}>
                        {star <= rating ? '★' : star - 0.5 <= rating ? '½' : '☆'}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Rating Summary */}
            <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 rounded-xl">
                {/* Average Rating */}
                <div className="text-center md:text-left md:pr-6 md:border-r border-gray-200">
                    <div className="text-5xl font-bold text-gray-900">{stats.average}</div>
                    <StarRating rating={parseFloat(stats.average)} size="lg" />
                    <p className="text-sm text-gray-500 mt-1">{stats.total} reviews</p>
                </div>

                {/* Rating Distribution */}
                <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = stats.distribution[star];
                        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                        return (
                            <button
                                key={star}
                                onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                                className={`w-full flex items-center gap-3 group hover:bg-white p-1 rounded transition-colors ${filterRating === star ? 'bg-white shadow-sm' : ''
                                    }`}
                            >
                                <span className="w-8 text-sm font-medium text-gray-600">{star} ★</span>
                                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 0.5, delay: star * 0.1 }}
                                        className={`h-full rounded-full ${star >= 4 ? 'bg-green-400' : star === 3 ? 'bg-yellow-400' : 'bg-red-400'
                                            }`}
                                    />
                                </div>
                                <span className="w-10 text-xs text-gray-500 text-right">
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="helpful">Most Helpful</option>
                        <option value="highest">Highest Rated</option>
                        <option value="lowest">Lowest Rated</option>
                    </select>
                </div>

                {filterRating > 0 && (
                    <button
                        onClick={() => setFilterRating(0)}
                        className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                    >
                        Clear filter ({filterRating}★)
                        <span>×</span>
                    </button>
                )}

                <button
                    onClick={onWriteReview}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    <span>✍️</span> Write a Review
                </button>
            </div>

            {/* Reviews List */}
            <AnimatePresence mode="popLayout">
                {filteredReviews.length > 0 ? (
                    <div className="space-y-4">
                        {filteredReviews.map((review, idx) => (
                            <motion.div
                                key={review._id || idx}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                {/* Review Header */}
                                <div className="flex items-start gap-4 mb-3">
                                    <div className="w-11 h-11 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                                        {review.user?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-gray-900">
                                                {review.user?.name || 'Anonymous'}
                                            </span>
                                            {review.verified && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                                    <span>✓</span> Verified Purchase
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <StarRating rating={review.rating} size="sm" />
                                            <span className="text-xs text-gray-400">
                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : 'Recently'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Review Title */}
                                {review.title && (
                                    <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                                )}

                                {/* Review Content */}
                                <p className="text-gray-600 leading-relaxed">{review.comment || review.content}</p>

                                {/* Review Images */}
                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 mt-3">
                                        {review.images.map((img, i) => (
                                            <img
                                                key={i}
                                                src={img}
                                                alt={`Review image ${i + 1}`}
                                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Review Actions */}
                                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => handleHelpfulVote(review._id || idx)}
                                        className={`flex items-center gap-2 text-sm transition-colors ${helpfulVotes[review._id || idx]
                                                ? 'text-primary font-medium'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <span>{helpfulVotes[review._id || idx] ? '👍' : '👍🏻'}</span>
                                        Helpful ({(review.helpfulCount || 0) + (helpfulVotes[review._id || idx] ? 1 : 0)})
                                    </button>
                                    <button className="text-sm text-gray-500 hover:text-gray-700">
                                        Report
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 bg-gray-50 rounded-xl"
                    >
                        <div className="text-5xl mb-4">💬</div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                            {filterRating > 0
                                ? `No ${filterRating}-star reviews yet`
                                : 'No reviews yet'}
                        </h3>
                        <p className="text-gray-500 mb-4">Be the first to share your thoughts!</p>
                        <button
                            onClick={onWriteReview}
                            className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Write a Review
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Load More */}
            {filteredReviews.length >= 5 && (
                <div className="text-center">
                    <button className="text-primary font-medium hover:underline">
                        Load more reviews
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewsSection;
