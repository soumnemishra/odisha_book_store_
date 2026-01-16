import { motion } from 'framer-motion';

/**
 * OrderSummary - Sticky order summary sidebar
 * Shows cart items, pricing breakdown, and trust badges
 */
const OrderSummary = ({
    cartItems = [],
    subtotal = 0,
    shippingCost = 0,
    discount = 0,
    codCharge = 0,
    isCollapsible = true,
}) => {
    const total = subtotal - discount + shippingCost + codCharge;

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-cta p-4 text-white">
                <h2 className="font-bold text-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Order Summary
                </h2>
                <p className="text-sm text-white/80">{cartItems.length} item(s)</p>
            </div>

            {/* Items List */}
            <div className="p-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                    {cartItems.map((item, index) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex gap-3"
                        >
                            <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl">📚</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</h4>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                                ₹{item.price * item.quantity}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                </div>

                {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-₹{discount}</span>
                    </div>
                )}

                <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    {shippingCost === 0 ? (
                        <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                        <span>₹{shippingCost}</span>
                    )}
                </div>

                {codCharge > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>COD Charge</span>
                        <span>₹{codCharge}</span>
                    </div>
                )}

                <div className="flex justify-between font-bold text-lg pt-3 border-t border-dashed border-gray-200 mt-2">
                    <span>Total</span>
                    <span className="text-primary">₹{total}</span>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>Secure checkout with 256-bit encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>7-day easy returns</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h4.5a1 1 0 01.8.4l1.5 2a1 1 0 01.2.6V15a1 1 0 01-1 1h-1.05a2.5 2.5 0 00-4.9 0H14V7z" />
                        </svg>
                        <span>Free shipping on orders above ₹500</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
