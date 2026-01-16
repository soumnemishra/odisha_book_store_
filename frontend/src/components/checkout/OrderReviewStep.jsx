import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * OrderReviewStep - Final order review before payment
 * Features: Complete order summary, edit options, price breakdown
 */
const OrderReviewStep = ({
    cartItems = [],
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingCost = 0,
    taxAmount = 0,
    discount = 0,
    codCharge = 0,
    onEditAddress,
    onEditPayment,
    onPlaceOrder,
    isLoading = false,
    couponCode = '',
    onApplyCoupon,
}) => {
    const total = subtotal - discount + shippingCost + taxAmount + codCharge;

    const getPaymentMethodLabel = (method) => {
        const labels = {
            upi: 'UPI',
            card: 'Credit/Debit Card',
            netbanking: 'Net Banking',
            wallet: 'Wallet',
            cod: 'Cash on Delivery',
        };
        return labels[method] || method;
    };

    const getPaymentMethodIcon = (method) => {
        const icons = {
            upi: '📱',
            card: '💳',
            netbanking: '🏦',
            wallet: '👛',
            cod: '💵',
        };
        return icons[method] || '💰';
    };

    // Estimate delivery date (mock)
    const getDeliveryDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 4); // 4 days from now
        return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    return (
        <div className="space-y-6">
            {/* Order Items */}
            <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                        Order Items ({cartItems.length})
                    </h3>
                    <Link to="/cart" className="text-sm text-primary hover:underline">
                        Edit Cart
                    </Link>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {cartItems.map((item, index) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex gap-3 bg-white p-3 rounded-lg"
                        >
                            <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 line-clamp-2 text-sm">{item.title}</h4>
                                <p className="text-xs text-gray-500">{item.author}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                    <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Delivery Estimate */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-sm">
                    <span className="text-green-600">🚚</span>
                    <span className="text-gray-600">
                        Estimated delivery by <strong className="text-gray-900">{getDeliveryDate()}</strong>
                    </span>
                </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span>📍</span> Delivery Address
                    </h3>
                    <button onClick={onEditAddress} className="text-sm text-primary hover:underline">
                        Change
                    </button>
                </div>

                {shippingAddress && (
                    <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-900">{shippingAddress.fullName}</p>
                        <p>{shippingAddress.street}</p>
                        {shippingAddress.landmark && <p>{shippingAddress.landmark}</p>}
                        <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.zipCode}</p>
                        <p className="mt-1">📞 +91 {shippingAddress.phone}</p>
                    </div>
                )}
            </div>

            {/* Payment Method */}
            <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span>{getPaymentMethodIcon(paymentMethod)}</span> Payment Method
                    </h3>
                    <button onClick={onEditPayment} className="text-sm text-primary hover:underline">
                        Change
                    </button>
                </div>

                <p className="text-sm text-gray-600">{getPaymentMethodLabel(paymentMethod)}</p>
            </div>

            {/* Coupon Code */}
            <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>🏷️</span> Apply Coupon
                </h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none text-sm"
                    />
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors">
                        Apply
                    </button>
                </div>
                {discount > 0 && (
                    <p className="text-green-600 text-sm mt-2">✓ Coupon applied! You save ₹{discount}</p>
                )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Price Details</h3>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Price ({cartItems.length} items)</span>
                        <span>₹{subtotal}</span>
                    </div>

                    {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-₹{discount}</span>
                        </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                        <span>Delivery Charges</span>
                        {shippingCost === 0 ? (
                            <span className="text-green-600 font-medium">FREE</span>
                        ) : (
                            <span>₹{shippingCost}</span>
                        )}
                    </div>

                    {taxAmount > 0 && (
                        <div className="flex justify-between text-gray-600">
                            <span>GST (5%)</span>
                            <span>₹{taxAmount}</span>
                        </div>
                    )}

                    {codCharge > 0 && (
                        <div className="flex justify-between text-gray-600">
                            <span>COD Charge</span>
                            <span>₹{codCharge}</span>
                        </div>
                    )}

                    <div className="flex justify-between font-bold text-lg text-gray-900 pt-3 border-t border-gray-200 mt-3">
                        <span>Total Amount</span>
                        <span className="text-primary">₹{total}</span>
                    </div>
                </div>

                {discount > 0 && (
                    <div className="mt-3 bg-green-50 text-green-700 text-sm p-2 rounded-lg text-center">
                        🎉 You will save ₹{discount} on this order
                    </div>
                )}
            </div>

            {/* Place Order Button */}
            <button
                onClick={onPlaceOrder}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-cta to-primary text-white font-bold text-lg rounded-xl 
          hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all
          shadow-lg shadow-cta/25 flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        {paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${total}`}
                    </>
                )}
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
                By placing this order, you agree to our{' '}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
        </div>
    );
};

export default OrderReviewStep;
