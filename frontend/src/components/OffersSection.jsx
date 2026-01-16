import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * OffersSection - Display available offers, coupons, and deals
 * Features: Bank offers, coupon codes, EMI options, combo deals
 */
const OffersSection = ({ price = 0, bookTitle = '' }) => {
    const [copiedCode, setCopiedCode] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // Mock offers data (in real app, fetch from API)
    const bankOffers = [
        { id: 1, bank: 'HDFC', discount: '10%', maxDiscount: 100, minOrder: 299, icon: '🏦' },
        { id: 2, bank: 'ICICI', discount: '15%', maxDiscount: 150, minOrder: 499, icon: '💳' },
        { id: 3, bank: 'SBI', discount: '5%', maxDiscount: 50, minOrder: 199, icon: '🏧' },
    ];

    const coupons = [
        { code: 'FIRST50', discount: '₹50 off', description: 'On first order', minOrder: 299 },
        { code: 'ODIA10', discount: '10% off', description: 'On Odia books', minOrder: 199 },
        { code: 'BUNDLE20', discount: '₹20 off', description: 'Buy 2+ books', minOrder: 399 },
    ];

    const emiOptions = price >= 500 ? [
        { months: 3, amount: Math.round(price / 3), interest: 0 },
        { months: 6, amount: Math.round(price / 6), interest: 0 },
    ] : [];

    const handleCopyCoupon = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const visibleOffers = isExpanded ? bankOffers : bankOffers.slice(0, 2);

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🎁</span>
                    <span className="font-semibold text-gray-900">Available Offers</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {bankOffers.length + coupons.length} offers
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Bank Offers */}
                <div className="space-y-2">
                    {visibleOffers.map((offer) => (
                        <div
                            key={offer.id}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-2xl">{offer.icon}</span>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    <span className="text-green-600">{offer.discount}</span> Instant Discount on {offer.bank} Cards
                                </p>
                                <p className="text-xs text-gray-500">
                                    Max ₹{offer.maxDiscount} on min purchase of ₹{offer.minOrder}
                                </p>
                            </div>
                        </div>
                    ))}

                    {bankOffers.length > 2 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-primary text-sm font-medium hover:underline"
                        >
                            {isExpanded ? 'Show less' : `+${bankOffers.length - 2} more offers`}
                        </button>
                    )}
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-gray-200" />

                {/* Coupons */}
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">🏷️ Apply Coupons</p>
                    <div className="space-y-2">
                        {coupons.map((coupon) => (
                            <div
                                key={coupon.code}
                                className="flex items-center justify-between p-3 border border-dashed border-gray-300 rounded-lg bg-white hover:border-primary/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 text-primary font-mono font-bold text-sm px-3 py-1 rounded">
                                        {coupon.code}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{coupon.discount}</p>
                                        <p className="text-xs text-gray-500">{coupon.description} • Min ₹{coupon.minOrder}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleCopyCoupon(coupon.code)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${copiedCode === coupon.code
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-primary/10 hover:text-primary'
                                        }`}
                                >
                                    {copiedCode === coupon.code ? '✓ Copied' : 'Copy'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* EMI Options */}
                {emiOptions.length > 0 && (
                    <>
                        <div className="border-t border-dashed border-gray-200" />
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">💳 No Cost EMI</p>
                            <div className="flex gap-2">
                                {emiOptions.map((emi) => (
                                    <div
                                        key={emi.months}
                                        className="flex-1 p-3 bg-blue-50 rounded-lg text-center border border-blue-100"
                                    >
                                        <p className="text-sm font-bold text-blue-700">₹{emi.amount}/mo</p>
                                        <p className="text-xs text-blue-600">{emi.months} months • 0% interest</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Combo Deal Suggestion */}
                <div className="border-t border-dashed border-gray-200" />
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <span className="text-2xl">📚</span>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-purple-800">
                            Buy 2, Get 10% Off
                        </p>
                        <p className="text-xs text-purple-600">
                            Add another book to save more!
                        </p>
                    </div>
                    <button className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                        Browse
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OffersSection;
