import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Testimonials data - can be made dynamic with API later
const testimonials = [
    {
        id: 1,
        name: 'Priyanka Mohanty',
        location: 'Bhubaneswar',
        avatar: 'PM',
        rating: 5,
        text: 'Amazing collection of Odia books! Found rare titles I have been searching for years. The delivery was prompt and packaging excellent.',
        date: '2 weeks ago'
    },
    {
        id: 2,
        name: 'Rajesh Kumar Panda',
        location: 'Cuttack',
        avatar: 'RP',
        rating: 5,
        text: 'Best place to buy Odia literature online. The prices are reasonable and customer service is top-notch. Highly recommended for book lovers!',
        date: '1 month ago'
    },
    {
        id: 3,
        name: 'Sujata Das',
        location: 'Kolkata',
        avatar: 'SD',
        rating: 5,
        text: 'Living outside Odisha, this store is a blessing. I can now gift authentic Odia books to my children. Thank you for preserving our culture!',
        date: '3 weeks ago'
    },
    {
        id: 4,
        name: 'Ananya Mishra',
        location: 'Delhi',
        avatar: 'AM',
        rating: 5,
        text: 'The educational books for my daughter are of great quality. She loves reading Odia stories now. Will definitely order again!',
        date: '1 week ago'
    },
    {
        id: 5,
        name: 'Biswajit Sahoo',
        location: 'Rourkela',
        avatar: 'BS',
        rating: 5,
        text: 'Fast delivery and genuine products. The book condition was exactly as described. Very satisfied with my purchase.',
        date: '2 months ago'
    }
];

const TestimonialsSlider = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-rotate testimonials
    useEffect(() => {
        if (!isAutoPlaying) return;

        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [isAutoPlaying]);

    const goTo = (index) => {
        setActiveIndex(index);
        setIsAutoPlaying(false);
        // Resume auto-play after 10 seconds
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                >
                    <h2 className="section-title">What Our Readers Say</h2>
                    <p className="section-subtitle">
                        Join thousands of happy customers
                    </p>
                </motion.div>

                <div className="max-w-4xl mx-auto relative">
                    {/* Main Testimonial Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-premium"
                        >
                            {/* Quote Icon */}
                            <div className="text-6xl text-primary/20 font-serif leading-none mb-4">"</div>

                            {/* Review Text */}
                            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 font-light">
                                {testimonials[activeIndex].text}
                            </p>

                            {/* Reviewer Info */}
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-600 text-white flex items-center justify-center font-bold text-lg">
                                        {testimonials[activeIndex].avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-secondary text-lg">
                                            {testimonials[activeIndex].name}
                                        </h4>
                                        <p className="text-gray-500 text-sm flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {testimonials[activeIndex].location}
                                        </p>
                                    </div>
                                </div>

                                {/* Rating & Date */}
                                <div className="text-right">
                                    <div className="flex gap-0.5 justify-end mb-1">
                                        {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                                            <span key={i} className="text-yellow-400 text-lg">★</span>
                                        ))}
                                    </div>
                                    <p className="text-gray-400 text-sm">{testimonials[activeIndex].date}</p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Dots */}
                    <div className="flex justify-center gap-2 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goTo(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeIndex
                                        ? 'bg-primary w-8'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Trust Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-100"
                    >
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary">5000+</p>
                            <p className="text-gray-500 text-sm">Happy Customers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary">4.9</p>
                            <p className="text-gray-500 text-sm">Average Rating</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary">98%</p>
                            <p className="text-gray-500 text-sm">Satisfaction Rate</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSlider;
