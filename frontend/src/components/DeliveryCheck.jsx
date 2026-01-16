import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DeliveryCheck - Pincode-based delivery estimate
 * Shows delivery date, shipping cost, and COD availability
 */
const DeliveryCheck = ({ price = 0 }) => {
    const [pincode, setPincode] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState(null);
    const [error, setError] = useState('');

    // Mock delivery calculation
    const calculateDelivery = (pin) => {
        // Odisha pincodes start with 75, 76, 77
        const isOdisha = pin.startsWith('75') || pin.startsWith('76') || pin.startsWith('77');
        // Metro pincodes (simplified check)
        const isMetro = ['110', '400', '560', '600', '700', '500'].some(p => pin.startsWith(p));

        const today = new Date();
        let deliveryDays = isOdisha ? 2 : isMetro ? 3 : 5;
        const deliveryDate = new Date(today.setDate(today.getDate() + deliveryDays));

        const freeDeliveryThreshold = 500;
        const isFreeDelivery = price >= freeDeliveryThreshold;
        const shippingCost = isFreeDelivery ? 0 : isOdisha ? 40 : 60;

        return {
            pincode: pin,
            location: isOdisha ? 'Odisha' : isMetro ? 'Metro City' : 'India',
            deliveryDate: deliveryDate.toLocaleDateString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            }),
            deliveryDays,
            shippingCost,
            isFreeDelivery,
            freeDeliveryThreshold,
            codAvailable: true,
            expressAvailable: isOdisha || isMetro
        };
    };

    const handleCheck = async () => {
        if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
            setError('Please enter a valid 6-digit pincode');
            return;
        }

        setIsChecking(true);
        setError('');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        const info = calculateDelivery(pincode);
        setDeliveryInfo(info);
        setIsChecking(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleCheck();
    };

    return (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-semibold text-gray-900">Delivery Options</span>
            </div>

            {/* Pincode Input */}
            <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={pincode}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setPincode(val);
                            if (deliveryInfo) setDeliveryInfo(null);
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter pincode"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        maxLength={6}
                    />
                    {pincode.length === 6 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>
                    )}
                </div>
                <button
                    onClick={handleCheck}
                    disabled={pincode.length !== 6 || isChecking}
                    className="px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[80px]"
                >
                    {isChecking ? (
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : 'Check'}
                </button>
            </div>

            {/* Error */}
            {error && (
                <p className="text-red-500 text-sm mb-3">{error}</p>
            )}

            {/* Delivery Info */}
            <AnimatePresence>
                {deliveryInfo && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        {/* Delivery Date */}
                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                🚚
                            </div>
                            <div>
                                <p className="font-medium text-green-800">
                                    Get it by <span className="font-bold">{deliveryInfo.deliveryDate}</span>
                                </p>
                                <p className="text-sm text-green-600">
                                    {deliveryInfo.deliveryDays === 1 ? 'Tomorrow' : `${deliveryInfo.deliveryDays} business days`} to {deliveryInfo.location}
                                </p>
                            </div>
                        </div>

                        {/* Shipping Cost */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            {deliveryInfo.isFreeDelivery ? (
                                <span className="text-green-600 font-medium">FREE ✓</span>
                            ) : (
                                <div className="text-right">
                                    <span className="font-medium text-gray-900">₹{deliveryInfo.shippingCost}</span>
                                    <p className="text-xs text-gray-500">
                                        Free over ₹{deliveryInfo.freeDeliveryThreshold}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* COD Available */}
                        {deliveryInfo.codAvailable && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="text-green-500">✓</span>
                                Cash on Delivery available
                            </div>
                        )}

                        {/* Express Delivery */}
                        {deliveryInfo.expressAvailable && (
                            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                                <div className="flex items-center gap-2">
                                    <span>⚡</span>
                                    <span className="text-sm font-medium text-yellow-800">Express Delivery</span>
                                </div>
                                <span className="text-sm text-yellow-700">+₹99 for next day</span>
                            </div>
                        )}

                        {/* Change Pincode */}
                        <button
                            onClick={() => {
                                setDeliveryInfo(null);
                                setPincode('');
                            }}
                            className="text-primary text-sm font-medium hover:underline"
                        >
                            Change pincode
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Default Info (when no pincode checked) */}
            {!deliveryInfo && !error && (
                <div className="text-sm text-gray-500 space-y-1">
                    <p>📦 Usually ships within 24 hours</p>
                    <p>🚚 Free delivery on orders over ₹500</p>
                </div>
            )}
        </div>
    );
};

export default DeliveryCheck;
