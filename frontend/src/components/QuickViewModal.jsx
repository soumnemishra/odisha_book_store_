import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const QuickViewModal = ({ book, isOpen, onClose }) => {
    const { addToCart } = useCart();

    if (!isOpen || !book) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-4xl bg-heritage-cream rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-heritage-gold/20"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 text-heritage-charcoal/60 hover:text-heritage-red transition-colors bg-white/50 rounded-full hover:bg-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Image Section */}
                    <div className="w-full md:w-2/5 bg-heritage-charcoal relative group">
                        <img
                            src={book.image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop"}
                            alt={book.title}
                            className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 border-[3px] border-heritage-gold/20 pointer-events-none"></div>
                    </div>

                    {/* Details Section */}
                    <div className="w-full md:w-3/5 p-8 overflow-y-auto custom-scrollbar bg-white">
                        <div className="mb-6">
                            <span className="text-xs font-bold text-heritage-gold uppercase tracking-wider bg-heritage-charcoal/5 px-2 py-1 rounded border border-heritage-gold/10">
                                {book.category}
                            </span>
                            <h2 className="text-3xl font-serif font-bold text-heritage-charcoal mt-3 mb-2 leading-tight">
                                {book.title}
                            </h2>
                            <p className="text-lg text-heritage-red/80 font-medium italic mb-4 font-serif">
                                by {book.author}
                            </p>

                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-heritage-gold/10">
                                <span className="text-3xl font-bold text-heritage-red font-serif">
                                    ₹{book.price}
                                </span>
                                <div className="flex items-center text-heritage-orange text-sm bg-heritage-cream px-2 py-1 rounded border border-heritage-gold/20">
                                    <span className="mr-1">★</span>
                                    <span className="font-bold text-heritage-charcoal">{book.rating || '4.5'}</span>
                                    <span className="text-heritage-charcoal/40 mx-1">•</span>
                                    <span className="text-heritage-charcoal/60 underline decoration-dotted">12 reviews</span>
                                </div>
                            </div>

                            <div className="prose prose-sm text-gray-600 mb-8 max-w-none font-sans leading-relaxed">
                                <p>
                                    {book.description || "Immerse yourself in this captivating work that explores the depths of Odia culture and heritage. A must-read for enthusiasts of literature and history alike."}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={() => {
                                        addToCart(book);
                                        onClose();
                                    }}
                                    className="flex-1 shadow-heritage hover:shadow-xl bg-heritage-orange hover:bg-heritage-red text-white border-none"
                                >
                                    Add to Cart
                                </Button>
                                <Link to={`/books/${book._id}`} className="flex-1">
                                    <Button variant="outline" size="lg" className="w-full border-heritage-gold/50 text-heritage-red hover:bg-heritage-red hover:text-white">
                                        View Full Details
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 gap-4 bg-heritage-cream/30 p-4 rounded-lg border border-heritage-gold/10 text-sm">
                            <div>
                                <span className="block text-heritage-charcoal/50 text-xs uppercase tracking-wider mb-1">Publisher</span>
                                <span className="font-medium text-heritage-charcoal font-serif">Odisha Books Ltd.</span>
                            </div>
                            <div>
                                <span className="block text-heritage-charcoal/50 text-xs uppercase tracking-wider mb-1">Language</span>
                                <span className="font-medium text-heritage-charcoal font-serif">Odia / English</span>
                            </div>
                            <div>
                                <span className="block text-heritage-charcoal/50 text-xs uppercase tracking-wider mb-1">Pages</span>
                                <span className="font-medium text-heritage-charcoal font-serif">324</span>
                            </div>
                            <div>
                                <span className="block text-heritage-charcoal/50 text-xs uppercase tracking-wider mb-1">ISBN</span>
                                <span className="font-medium text-heritage-charcoal font-serif">978-3-16-148410-0</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default QuickViewModal;
