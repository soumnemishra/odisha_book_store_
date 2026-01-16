import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Curated reading lists - these can be made admin-configurable later
const readingLists = [
    {
        id: 'classics',
        title: 'Odia Classics',
        subtitle: 'Timeless masterpieces',
        icon: '📚',
        query: 'category=Classics',
        gradient: 'from-amber-500 to-orange-600',
    },
    {
        id: 'children',
        title: 'For Children',
        subtitle: 'Learning Odia is fun',
        icon: '🧒',
        query: 'category=Children',
        gradient: 'from-pink-500 to-rose-600',
    },
    {
        id: 'spiritual',
        title: 'Spiritual Wisdom',
        subtitle: 'Ancient knowledge',
        icon: '🪷',
        query: 'category=Spiritual',
        gradient: 'from-purple-500 to-indigo-600',
    },
    {
        id: 'poetry',
        title: 'Poetry Collection',
        subtitle: 'Words that touch the soul',
        icon: '✨',
        query: 'category=Poetry',
        gradient: 'from-teal-500 to-cyan-600',
    },
    {
        id: 'educational',
        title: 'Educational',
        subtitle: 'Learn and grow',
        icon: '🎓',
        query: 'category=Educational',
        gradient: 'from-blue-500 to-indigo-600',
    },
    {
        id: 'new',
        title: 'New Releases',
        subtitle: 'Fresh additions',
        icon: '🆕',
        query: 'sortBy=createdAt&sortOrder=desc',
        gradient: 'from-green-500 to-emerald-600',
    },
];

const ReadingLists = () => {
    return (
        <section className="py-16 bg-gray-50">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                >
                    <h2 className="section-title">Curated Reading Lists</h2>
                    <p className="section-subtitle">
                        Handpicked collections for every reader
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {readingLists.map((list, index) => (
                        <motion.div
                            key={list.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                to={`/books?${list.query}`}
                                className="group block"
                            >
                                <div className={`
                  relative overflow-hidden rounded-2xl p-6 text-center text-white
                  bg-gradient-to-br ${list.gradient}
                  hover:shadow-xl transition-all duration-300
                  hover:-translate-y-1 hover:scale-105
                `}>
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_50%)]" />
                                    </div>

                                    <span className="text-4xl mb-3 block drop-shadow-lg">
                                        {list.icon}
                                    </span>
                                    <h3 className="font-bold text-sm mb-1 drop-shadow">
                                        {list.title}
                                    </h3>
                                    <p className="text-xs opacity-80">
                                        {list.subtitle}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ReadingLists;
