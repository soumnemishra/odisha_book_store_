import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFilterStats } from '../services/bookService';

// Category icon mapping
const categoryIcons = {
    Educational: '📚',
    Novel: '📖',
    Biography: '👤',
    Poetry: '🎭',
    Travel: '🗺️',
    History: '🏛️',
    'Short Story': '📝',
    Children: '🧒',
    Philosophy: '🧠',
    Religion: '🙏',
    Science: '🔬',
    Cooking: '🍳',
    Health: '💊',
    Art: '🎨',
    Music: '🎵',
    default: '📕',
};

const getCategoryIcon = (category) => {
    return categoryIcons[category] || categoryIcons.default;
};

const CategoryGrid = () => {
    const { data: filterStats, isLoading } = useFilterStats();
    const categories = filterStats?.categories?.slice(0, 8) || [];

    if (isLoading) {
        return (
            <section className="py-12 bg-white">
                <div className="container-custom">
                    <div className="animate-pulse">
                        <div className="h-8 w-48 bg-gray-200 rounded mb-8 mx-auto" />
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                            {Array(8).fill(0).map((_, i) => (
                                <div key={i} className="h-24 bg-gray-100 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 bg-white">
            <div className="container-custom">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-secondary">
                        Browse by Category
                    </h2>
                    <p className="text-gray-500 mt-2">Find your next read from our curated collections</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                    {categories.map((cat, index) => (
                        <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                to={`/books?category=${encodeURIComponent(cat.name)}`}
                                className="group flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-primary/5 border-2 border-transparent hover:border-primary/20 transition-all"
                            >
                                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                    {getCategoryIcon(cat.name)}
                                </span>
                                <span className="text-sm font-medium text-secondary group-hover:text-primary text-center">
                                    {cat.name}
                                </span>
                                <span className="text-xs text-gray-400 mt-0.5">
                                    {cat.count} books
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <Link
                        to="/books"
                        className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                    >
                        View All Categories
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;
