import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * 3D Book Cover Component
 * Creates an interactive 3D book effect with CSS perspective
 */
const BookCover3D = ({ book, size = 'large' }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Safety check - don't render if no book or no ID
    if (!book || !book._id) return null;

    const sizeClasses = {
        small: 'w-32 h-48',
        medium: 'w-40 h-56',
        large: 'w-48 h-72 md:w-56 md:h-80'
    };

    const coverImage = book.coverImage || '/placeholder-book.jpg';
    const title = book.title?.display || book.title?.english || book.title || 'Untitled';
    const author = book.author || 'Unknown Author';
    const bookId = book._id;

    return (
        <Link
            to={`/books/${bookId}`}
            className="block perspective-1000"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                className="relative preserve-3d cursor-pointer"
                animate={{
                    rotateY: isHovered ? -15 : -5,
                    rotateX: isHovered ? 5 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                {/* Book Container */}
                <div className={`relative ${sizeClasses[size]}`}>
                    {/* Book Cover (Front) */}
                    <div
                        className="absolute inset-0 rounded-r-md overflow-hidden shadow-2xl"
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: 'translateZ(15px)',
                            boxShadow: isHovered
                                ? '10px 15px 40px rgba(0,0,0,0.4)'
                                : '5px 10px 30px rgba(0,0,0,0.3)'
                        }}
                    >
                        <img
                            src={coverImage}
                            alt={title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = '/placeholder-book.jpg';
                            }}
                        />
                        {/* Shine effect on hover */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
                            initial={{ opacity: 0, x: '-100%' }}
                            animate={{
                                opacity: isHovered ? 1 : 0,
                                x: isHovered ? '100%' : '-100%'
                            }}
                            transition={{ duration: 0.6 }}
                        />
                    </div>

                    {/* Book Spine */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-800 to-gray-600 rounded-l-sm"
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: 'translateZ(0px) rotateY(90deg) translateX(-8px)',
                            transformOrigin: 'left center'
                        }}
                    />

                    {/* Book Pages (Side) */}
                    <div
                        className="absolute right-0 top-1 bottom-1 w-3 bg-gradient-to-b from-gray-100 via-gray-50 to-gray-200"
                        style={{
                            transform: 'translateZ(5px)',
                            borderRadius: '0 2px 2px 0'
                        }}
                    />
                </div>

                {/* Featured Badge */}
                {book.featured && (
                    <div className="absolute -top-3 -right-3 z-10 bg-cta text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        ⭐ Featured
                    </div>
                )}
            </motion.div>

            {/* Book Info Below */}
            <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="text-lg font-serif font-bold text-secondary line-clamp-2 mb-1">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{author}</p>
                {book.rating && (
                    <div className="flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <span
                                key={i}
                                className={`text-sm ${i < Math.floor(book.rating) ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                                ★
                            </span>
                        ))}
                        <span className="text-sm text-gray-500 ml-1">
                            {book.rating?.toFixed(1) || '4.5'}
                        </span>
                    </div>
                )}
            </motion.div>
        </Link>
    );
};

export default BookCover3D;
