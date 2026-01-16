import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Stats data
const stats = [
    { number: '5+', label: 'Years of Excellence', icon: '🏆' },
    { number: '10,000+', label: 'Books Sold', icon: '📚' },
    { number: '5,000+', label: 'Happy Readers', icon: '😊' },
    { number: '500+', label: 'Odia Titles', icon: '📖' }
];

// Mission values
const values = [
    {
        icon: '📚',
        title: 'Preserve Heritage',
        description: 'Safeguarding the rich literary traditions of Odisha for future generations.'
    },
    {
        icon: '🌍',
        title: 'Connect Globally',
        description: 'Bringing Odia literature to readers worldwide with reliable shipping.'
    },
    {
        icon: '✅',
        title: 'Quality Assured',
        description: 'Every book is carefully curated and authenticated for genuineness.'
    },
    {
        icon: '👨‍👩‍👧‍👦',
        title: 'Community First',
        description: 'Supporting local authors, publishers, and the Odia literary ecosystem.'
    }
];

// Features
const features = [
    { icon: '📚', title: 'Authentic Odia Books', description: 'Genuine books from trusted publishers' },
    { icon: '🔍', title: 'Expert Curation', description: 'Hand-picked by literature experts' },
    { icon: '🚚', title: 'Pan-India Delivery', description: 'Fast nationwide shipping' },
    { icon: '🔒', title: 'Secure Payments', description: 'Bank-grade security' },
    { icon: '↩️', title: 'Easy Returns', description: '7-day hassle-free returns' },
    { icon: '💬', title: '24/7 Support', description: 'Always here to help' }
];

// Testimonials
const testimonials = [
    {
        name: 'Priyanka Mohanty',
        location: 'Bhubaneswar',
        text: 'Amazing collection of Odia books! Found rare titles I have been searching for years.',
        avatar: 'PM',
        rating: 5
    },
    {
        name: 'Rajesh Panda',
        location: 'Cuttack',
        text: 'Best place to buy Odia literature online. Fast delivery and great packaging!',
        avatar: 'RP',
        rating: 5
    },
    {
        name: 'Sujata Das',
        location: 'Kolkata',
        text: 'Living outside Odisha, this store is a blessing for authentic Odia books.',
        avatar: 'SD',
        rating: 5
    }
];

// Timeline
const timeline = [
    { year: '2019', title: 'Founded', description: 'Started with 100 books and a dream' },
    { year: '2020', title: 'Online Launch', description: 'Launched e-commerce platform' },
    { year: '2022', title: '5000+ Orders', description: 'Milestone of 5000 happy customers' },
    { year: '2024', title: 'Mobile App', description: 'Launched Android & iOS apps' }
];

const About = () => {
    return (
        <div className="bg-background-cream min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 md:py-28 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(224,122,95,0.15) 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                <div className="container-custom relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        {/* Badge */}
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                            <span>📖</span>
                            Our Story
                        </span>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-secondary leading-tight mb-6">
                            Preserving the Soul of
                            <br />
                            <span className="hero-gradient-text">Odia Literature</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
                            From ancient palm-leaf manuscripts to contemporary fiction, we bring
                            Odisha's rich literary heritage to readers everywhere.
                        </p>

                        {/* CTA */}
                        <Link
                            to="/books"
                            className="btn-cta inline-flex items-center gap-2 text-lg px-8 py-4"
                        >
                            Explore Our Collection
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white border-y border-gray-100">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm hover-lift"
                            >
                                <span className="text-3xl mb-3 block">{stat.icon}</span>
                                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</div>
                                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-20 bg-background-cream">
                <div className="container-custom max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="section-title mb-4">Our Journey</h2>
                        <p className="section-subtitle">From a small dream to Odisha&apos;s trusted online bookstore</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-2xl p-8 md:p-12 shadow-premium mb-12"
                    >
                        <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                            <span className="text-primary font-serif text-4xl font-bold float-left mr-2 leading-none">&ldquo;</span>
                            Odisha Book Store was born from a simple observation — while the world was going digital,
                            the treasure trove of Odia literature remained difficult to access online.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            Founded in 2019, we started with just 100 books and a mission to preserve Odia literary heritage.
                            Today, we proudly offer over 500 carefully curated titles — from educational books for children
                            to philosophical works, from poetry collections to modern fiction.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Every book is a bridge connecting generations, preserving the words that define our identity.
                            <span className="text-primary font-serif text-4xl font-bold">&rdquo;</span>
                        </p>
                    </motion.div>

                    {/* Timeline */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {timeline.map((milestone, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm text-center hover-lift"
                            >
                                <span className="text-primary font-bold text-2xl">{milestone.year}</span>
                                <h4 className="font-semibold text-secondary mt-2">{milestone.title}</h4>
                                <p className="text-gray-500 text-xs mt-1">{milestone.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Values */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="section-title mb-4">Our Mission & Values</h2>
                        <p className="section-subtitle">What drives us every day</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-white to-primary/5 border border-primary/10 hover-lift"
                            >
                                <span className="text-4xl mb-4 block">{value.icon}</span>
                                <h3 className="font-semibold text-lg text-secondary mb-2">{value.title}</h3>
                                <p className="text-gray-500 text-sm">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 bg-secondary text-white">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Why Choose Us?</h2>
                        <p className="text-gray-300 max-w-2xl mx-auto">Experience the best in online book shopping</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover-lift"
                            >
                                <span className="text-3xl mb-4 block">{feature.icon}</span>
                                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                <p className="text-gray-400 text-sm">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gray-50">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="section-title mb-4">What Our Customers Say</h2>
                        <p className="section-subtitle">Real stories from our happy readers</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-6 shadow-premium hover-lift"
                            >
                                {/* Stars */}
                                <div className="flex gap-1 mb-3">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i} className="text-yellow-500 text-sm">★</span>
                                    ))}
                                </div>
                                <p className="text-gray-600 italic mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-secondary text-sm">{testimonial.name}</h4>
                                        <p className="text-gray-400 text-xs">{testimonial.location}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-10 bg-white border-y border-gray-100">
                <div className="container-custom">
                    <div className="flex flex-wrap justify-center gap-4">
                        {['100% Authentic', 'Secure Payments', 'Easy Returns', '24/7 Support'].map((badge, i) => (
                            <span key={i} className="trust-badge">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary to-cta">
                <div className="container-custom text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                            Start Your Odia Reading Journey
                        </h2>
                        <p className="text-white/80 mb-8 max-w-xl mx-auto">
                            Discover hundreds of authentic Odia books waiting to enrich your world
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                to="/books"
                                className="px-8 py-3 bg-white text-primary rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
                            >
                                Shop Now
                            </Link>
                            <Link
                                to="/books?category=New%20Arrivals"
                                className="px-8 py-3 bg-white/10 border border-white/30 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
                            >
                                View New Arrivals
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;
