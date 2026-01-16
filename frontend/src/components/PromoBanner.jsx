import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
    {
        id: 1,
        title: '📚 New Arrivals This Week',
        description: 'Discover the latest additions to our collection',
        link: '/books?sortBy=createdAt&sortOrder=desc',
        bgColor: 'from-primary/10 to-orange-50',
        textColor: 'text-primary',
    },
    {
        id: 2,
        title: '🎓 Educational Books Sale',
        description: 'Up to 20% off on textbooks and study guides',
        link: '/books?category=Educational',
        bgColor: 'from-blue-50 to-indigo-50',
        textColor: 'text-blue-600',
    },
    {
        id: 3,
        title: '🆓 Free Shipping on ₹500+',
        description: 'No minimum on select categories',
        link: '/books',
        bgColor: 'from-green-50 to-emerald-50',
        textColor: 'text-green-600',
    },
    {
        id: 4,
        title: '📖 Odia Classics Collection',
        description: 'Timeless literature from legendary authors',
        link: '/books?language=Odia',
        bgColor: 'from-amber-50 to-yellow-50',
        textColor: 'text-amber-600',
    },
];

const PromoBanner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const slide = slides[currentSlide];

    return (
        <section className="py-4 bg-white border-b border-gray-100">
            <div className="container-custom">
                <div className={`relative rounded-xl bg-gradient-to-r ${slide.bgColor} overflow-hidden`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={slide.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="px-6 py-4 flex items-center justify-between gap-4"
                        >
                            <Link
                                to={slide.link}
                                className="flex-1 flex items-center gap-4"
                            >
                                <div>
                                    <h3 className={`text-lg font-bold ${slide.textColor}`}>
                                        {slide.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">{slide.description}</p>
                                </div>
                            </Link>

                            <Link
                                to={slide.link}
                                className={`hidden sm:inline-flex items-center gap-1 px-4 py-2 ${slide.textColor} font-medium hover:underline`}
                            >
                                Shop Now
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </motion.div>
                    </AnimatePresence>

                    {/* Dots */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`w-2 h-2 rounded-full transition-colors ${idx === currentSlide ? 'bg-gray-800' : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromoBanner;
