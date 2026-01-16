import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * PaymentStep - Payment method selection
 * Features: Multiple payment options, COD charge display, secure badges
 */
const PaymentStep = ({
    selectedMethod,
    onMethodSelect,
    onContinue,
    orderTotal = 0
}) => {
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: '',
    });
    const [upiId, setUpiId] = useState('');
    const [selectedBank, setSelectedBank] = useState('');

    const paymentMethods = [
        {
            id: 'upi',
            title: 'UPI',
            subtitle: 'Pay using any UPI app',
            icon: '📱',
            logos: ['gpay.svg', 'phonepe.svg', 'paytm.svg'],
            popular: true,
        },
        {
            id: 'card',
            title: 'Credit / Debit Card',
            subtitle: 'Visa, Mastercard, RuPay, Amex',
            icon: '💳',
            logos: ['visa.svg', 'mastercard.svg', 'rupay.svg'],
        },
        {
            id: 'netbanking',
            title: 'Net Banking',
            subtitle: 'All Indian banks supported',
            icon: '🏦',
        },
        {
            id: 'wallet',
            title: 'Wallets',
            subtitle: 'Paytm, PhonePe, Amazon Pay',
            icon: '👛',
        },
        {
            id: 'cod',
            title: 'Cash on Delivery',
            subtitle: orderTotal >= 500 ? 'Available for this order' : '+₹40 extra charge',
            icon: '💵',
            extraCharge: orderTotal >= 500 ? 0 : 40,
        },
    ];

    const banks = [
        { id: 'sbi', name: 'State Bank of India' },
        { id: 'hdfc', name: 'HDFC Bank' },
        { id: 'icici', name: 'ICICI Bank' },
        { id: 'axis', name: 'Axis Bank' },
        { id: 'kotak', name: 'Kotak Mahindra Bank' },
        { id: 'pnb', name: 'Punjab National Bank' },
    ];

    const upiApps = [
        { id: 'gpay', name: 'Google Pay', logo: '🟢' },
        { id: 'phonepe', name: 'PhonePe', logo: '🟣' },
        { id: 'paytm', name: 'Paytm', logo: '🔵' },
        { id: 'amazonpay', name: 'Amazon Pay', logo: '🟡' },
    ];

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : value;
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>

            {/* Payment Methods */}
            <div className="space-y-3">
                {paymentMethods.map((method, index) => (
                    <motion.div
                        key={method.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <button
                            onClick={() => onMethodSelect?.(method.id)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all
                ${selectedMethod === method.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }
              `}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{method.icon}</span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">{method.title}</span>
                                            {method.popular && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                                    Popular
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{method.subtitle}</p>
                                    </div>
                                </div>

                                {/* Radio */}
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${selectedMethod === method.id ? 'border-primary bg-primary' : 'border-gray-300'}
                `}>
                                    {selectedMethod === method.id && (
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    )}
                                </div>
                            </div>

                            {/* Extra Charge Badge */}
                            {method.extraCharge > 0 && (
                                <div className="mt-2 inline-block text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                                    +₹{method.extraCharge} handling charge
                                </div>
                            )}
                        </button>

                        {/* Expanded Content for Selected Method */}
                        {selectedMethod === method.id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-3 ml-12 p-4 bg-gray-50 rounded-xl"
                            >
                                {/* UPI Options */}
                                {method.id === 'upi' && (
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            {upiApps.map((app) => (
                                                <button
                                                    key={app.id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-primary transition-colors"
                                                >
                                                    <span>{app.logo}</span>
                                                    <span className="text-sm font-medium">{app.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span>or enter UPI ID:</span>
                                            <input
                                                type="text"
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                placeholder="yourname@upi"
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Card Form */}
                                {method.id === 'card' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Card Number</label>
                                            <input
                                                type="text"
                                                value={cardDetails.number}
                                                onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength={19}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Expiry</label>
                                                <input
                                                    type="text"
                                                    value={cardDetails.expiry}
                                                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                                                    placeholder="MM/YY"
                                                    maxLength={5}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
                                                <input
                                                    type="password"
                                                    value={cardDetails.cvv}
                                                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                                    placeholder="•••"
                                                    maxLength={4}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    value={cardDetails.name}
                                                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })}
                                                    placeholder="NAME"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                            Your card details are encrypted and secure
                                        </p>
                                    </div>
                                )}

                                {/* Net Banking */}
                                {method.id === 'netbanking' && (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {banks.map((bank) => (
                                                <button
                                                    key={bank.id}
                                                    onClick={() => setSelectedBank(bank.id)}
                                                    className={`px-3 py-2 text-sm text-left rounded-lg border transition-colors
                            ${selectedBank === bank.id
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }
                          `}
                                                >
                                                    {bank.name}
                                                </button>
                                            ))}
                                        </div>
                                        <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none">
                                            <option value="">Select Other Bank...</option>
                                            <option value="bob">Bank of Baroda</option>
                                            <option value="canara">Canara Bank</option>
                                            <option value="idbi">IDBI Bank</option>
                                            <option value="indian">Indian Bank</option>
                                        </select>
                                    </div>
                                )}

                                {/* Wallets */}
                                {method.id === 'wallet' && (
                                    <div className="flex flex-wrap gap-2">
                                        {['Paytm', 'PhonePe', 'Amazon Pay', 'MobiKwik', 'FreeCharge'].map((wallet) => (
                                            <button
                                                key={wallet}
                                                className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-primary text-sm font-medium transition-colors"
                                            >
                                                {wallet}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* COD Info */}
                                {method.id === 'cod' && (
                                    <div className="text-sm text-gray-600">
                                        <p>✓ Pay when you receive your order</p>
                                        <p>✓ Exact change recommended</p>
                                        {method.extraCharge > 0 && (
                                            <p className="text-yellow-700 mt-2">⚠️ A handling charge of ₹{method.extraCharge} will be added</p>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Continue Button */}
            <button
                onClick={onContinue}
                disabled={!selectedMethod}
                className="w-full py-4 bg-gradient-to-r from-primary to-cta text-white font-bold rounded-xl 
          hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all
          shadow-lg shadow-primary/25"
            >
                Continue to Review
            </button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    256-bit Encrypted
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    100% Secure
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>🏦</span>
                    PCI Compliant
                </div>
            </div>
        </div>
    );
};

export default PaymentStep;
