import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * OrderSuccess - Order confirmation page
 * Shown after successful order placement
 */
const OrderSuccess = () => {
    // Generate a random order ID for demo
    const orderId = `OBS${Date.now().toString().slice(-8)}`;

    // Estimated delivery (4 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);
    const formattedDate = deliveryDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-lg w-full"
            >
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-24 h-24 bg-green-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-green-200"
                    >
                        <motion.svg
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="w-12 h-12 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <motion.path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                            />
                        </motion.svg>
                    </motion.div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Order Placed! 🎉
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Thank you for your purchase. Your order has been confirmed.
                        </p>

                        {/* Order ID */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-500 mb-1">Order ID</p>
                            <p className="text-xl font-mono font-bold text-primary">{orderId}</p>
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-green-50 rounded-xl p-4 mb-6 text-left">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🚚</span>
                                <div>
                                    <p className="font-semibold text-gray-900">Estimated Delivery</p>
                                    <p className="text-green-700">{formattedDate}</p>
                                </div>
                            </div>
                        </div>

                        {/* What's Next */}
                        <div className="text-left mb-6">
                            <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>Order confirmation email sent to your inbox</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>We'll notify you when your order ships</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>Track your order from the Orders page</span>
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Link
                                to="/orders"
                                className="block w-full py-3 bg-gradient-to-r from-primary to-cta text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25"
                            >
                                View My Orders
                            </Link>
                            <Link
                                to="/books"
                                className="block w-full py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                        <p className="text-center text-sm text-gray-500">
                            Need help? <a href="mailto:support@odishabookstore.com" className="text-primary hover:underline">Contact Support</a>
                        </p>
                    </div>
                </div>

                {/* Trust Message */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    🔒 Your order is secured with 256-bit encryption
                </p>
            </motion.div>
        </div>
    );
};

export default OrderSuccess;
