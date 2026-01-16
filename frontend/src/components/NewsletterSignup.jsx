import { useState } from 'react';
import toast from 'react-hot-toast';

const NewsletterSignup = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
        setEmail('');
        toast.success('Thanks for subscribing! 📚');
    };

    return (
        <section className="py-16 bg-secondary">
            <div className="container-custom">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                        Stay Updated on New Releases
                    </h2>
                    <p className="text-gray-300 mb-8">
                        Get notified about new Odia books, exclusive offers, and literary events.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex-1 px-5 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-primary/30"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Subscribing...' : 'Subscribe'}
                        </button>
                    </form>

                    <p className="text-xs text-gray-400 mt-4">
                        We respect your privacy. Unsubscribe anytime.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default NewsletterSignup;
