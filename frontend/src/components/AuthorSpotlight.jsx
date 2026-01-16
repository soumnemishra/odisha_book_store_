import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBooks } from '../services/bookService';

// Featured authors - can be made dynamic later with author API
const featuredAuthors = [
    {
        name: 'Gopabandhu Das',
        title: 'Utkalmani (Jewel of Odisha)',
        bio: 'Pioneer of modern Odia literature and freedom fighter',
        category: 'Literature',
    },
    {
        name: 'Fakir Mohan Senapati',
        title: 'Father of Modern Odia Literature',
        bio: 'Famous for "Chha Mana Atha Guntha"',
        category: 'Classics',
    },
    {
        name: 'Pratibha Ray',
        title: 'Jnanpith Award Winner',
        bio: 'Contemporary Odia novelist and short story writer',
        category: 'Fiction',
    },
];

const AuthorSpotlight = () => {
    // Get current week's featured author (rotates weekly)
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const currentAuthor = featuredAuthors[weekNumber % featuredAuthors.length];

    // Fetch books by author (dynamic - searches across all inventory)
    const { data, isLoading } = useBooks({
        search: currentAuthor.name,
        limit: 4,
    });

    const authorBooks = data?.books || [];

    return (
        <section className="py-16 bg-gradient-to-br from-primary/5 via-white to-primary/5">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                >
                    <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary font-medium text-sm rounded-full mb-4">
                        ✍️ Author Spotlight
                    </span>
                    <h2 className="section-title">This Week's Featured Author</h2>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8 items-center">
                    {/* Author Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-1"
                    >
                        <div className="glass-card p-8 text-center bg-gradient-to-br from-white to-primary/5">
                            {/* Author Avatar */}
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white text-3xl font-serif">
                                {currentAuthor.name.split(' ').map(n => n[0]).join('')}
                            </div>

                            <h3 className="text-2xl font-serif font-bold text-secondary mb-1">
                                {currentAuthor.name}
                            </h3>
                            <p className="text-primary font-medium text-sm mb-3">
                                {currentAuthor.title}
                            </p>
                            <p className="text-gray-500 text-sm mb-6">
                                {currentAuthor.bio}
                            </p>

                            <Link
                                to={`/books?search=${encodeURIComponent(currentAuthor.name)}`}
                                className="btn-accent inline-flex items-center gap-2"
                            >
                                View All Books
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Author's Books */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-2"
                    >
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                            </div>
                        ) : authorBooks.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {authorBooks.slice(0, 4).map((book, index) => (
                                    <motion.div
                                        key={book._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link
                                            to={`/books/${book._id}`}
                                            className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                                        >
                                            <div className="aspect-[3/4] bg-gray-100">
                                                <img
                                                    src={book.coverImage}
                                                    alt={book.title?.display || book.title?.english}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="p-3">
                                                <h4 className="font-medium text-secondary text-sm line-clamp-1">
                                                    {book.title?.display || book.title?.english}
                                                </h4>
                                                <p className="text-primary font-bold text-sm mt-1">
                                                    ₹{book.price}
                                                </p>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p>Explore our collection for books by this author</p>
                                <Link to="/books" className="text-primary hover:underline mt-2 inline-block">
                                    Browse All Books →
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default AuthorSpotlight;
