import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AddressStep - Shipping address form with saved addresses
 * Features: Address validation, pincode autofill, address type selection
 */
const AddressStep = ({
    savedAddresses = [],
    selectedAddress,
    onAddressSelect,
    onAddNewAddress,
    onContinue
}) => {
    const [showNewAddressForm, setShowNewAddressForm] = useState(savedAddresses.length === 0);
    const [newAddress, setNewAddress] = useState({
        fullName: '',
        phone: '',
        street: '',
        landmark: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        addressType: 'home',
    });
    const [errors, setErrors] = useState({});
    const [isLoadingPincode, setIsLoadingPincode] = useState(false);

    // Pincode auto-fill (mock)
    useEffect(() => {
        if (newAddress.zipCode.length === 6) {
            setIsLoadingPincode(true);
            // Mock pincode lookup
            setTimeout(() => {
                const pincodeData = {
                    '751001': { city: 'Bhubaneswar', state: 'Odisha' },
                    '753001': { city: 'Cuttack', state: 'Odisha' },
                    '760001': { city: 'Berhampur', state: 'Odisha' },
                    '769001': { city: 'Rourkela', state: 'Odisha' },
                    '110001': { city: 'New Delhi', state: 'Delhi' },
                    '400001': { city: 'Mumbai', state: 'Maharashtra' },
                };
                const data = pincodeData[newAddress.zipCode];
                if (data) {
                    setNewAddress(prev => ({ ...prev, city: data.city, state: data.state }));
                }
                setIsLoadingPincode(false);
            }, 500);
        }
    }, [newAddress.zipCode]);

    const validateForm = () => {
        const newErrors = {};
        if (!newAddress.fullName.trim()) newErrors.fullName = 'Name is required';
        if (!newAddress.phone.match(/^[6-9]\d{9}$/)) newErrors.phone = 'Enter valid 10-digit phone';
        if (!newAddress.street.trim()) newErrors.street = 'Address is required';
        if (!newAddress.city.trim()) newErrors.city = 'City is required';
        if (!newAddress.state.trim()) newErrors.state = 'State is required';
        if (!newAddress.zipCode.match(/^\d{6}$/)) newErrors.zipCode = 'Enter valid 6-digit pincode';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitNewAddress = () => {
        if (validateForm()) {
            onAddNewAddress?.(newAddress);
            onAddressSelect?.(newAddress);
            setShowNewAddressForm(false);
        }
    };

    const handleContinue = () => {
        if (selectedAddress) {
            onContinue?.();
        } else if (showNewAddressForm) {
            handleSubmitNewAddress();
            if (Object.keys(errors).length === 0) {
                onContinue?.();
            }
        }
    };

    const addressTypes = [
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'work', label: 'Work', icon: '🏢' },
        { id: 'other', label: 'Other', icon: '📍' },
    ];

    return (
        <div className="space-y-6">
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && !showNewAddressForm && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Select a delivery address</h3>

                    <div className="grid gap-4">
                        {savedAddresses.map((address, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => onAddressSelect?.(address)}
                                className={`
                  relative p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${selectedAddress === address
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }
                `}
                            >
                                {/* Selection Radio */}
                                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${selectedAddress === address ? 'border-primary bg-primary' : 'border-gray-300'}
                `}>
                                    {selectedAddress === address && (
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    )}
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{address.addressType === 'home' ? '🏠' : address.addressType === 'work' ? '🏢' : '📍'}</span>
                                    <div className="flex-1 pr-8">
                                        <div className="font-semibold text-gray-900">{address.fullName}</div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {address.street}
                                            {address.landmark && <>, {address.landmark}</>}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {address.city}, {address.state} - {address.zipCode}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">📞 {address.phone}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowNewAddressForm(true)}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-primary font-medium hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Address
                    </button>
                </div>
            )}

            {/* New Address Form */}
            <AnimatePresence>
                {showNewAddressForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        {savedAddresses.length > 0 && (
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Add New Address</h3>
                                <button
                                    onClick={() => setShowNewAddressForm(false)}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={newAddress.fullName}
                                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-0 transition-colors
                    ${errors.fullName ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'}
                  `}
                                    placeholder="John Doe"
                                />
                                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">+91</span>
                                    <input
                                        type="tel"
                                        value={newAddress.phone}
                                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        className={`w-full pl-14 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-0 transition-colors
                      ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'}
                    `}
                                        placeholder="9876543210"
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>

                            {/* Pincode */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newAddress.zipCode}
                                        onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-0 transition-colors
                      ${errors.zipCode ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'}
                    `}
                                        placeholder="751001"
                                    />
                                    {isLoadingPincode && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                                {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                            </div>

                            {/* City & State */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                    <input
                                        type="text"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-0 transition-colors
                      ${errors.city ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'}
                    `}
                                        placeholder="Bhubaneswar"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                                    <input
                                        type="text"
                                        value={newAddress.state}
                                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-0 transition-colors
                      ${errors.state ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'}
                    `}
                                        placeholder="Odisha"
                                    />
                                </div>
                            </div>

                            {/* Street Address */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address (House No, Building, Street) *</label>
                                <input
                                    type="text"
                                    value={newAddress.street}
                                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-0 transition-colors
                    ${errors.street ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'}
                  `}
                                    placeholder="123, Main Road, Near XYZ"
                                />
                                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                            </div>

                            {/* Landmark */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                                <input
                                    type="text"
                                    value={newAddress.landmark}
                                    onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-0 transition-colors"
                                    placeholder="Near Temple, Behind Market"
                                />
                            </div>
                        </div>

                        {/* Address Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                            <div className="flex gap-3">
                                {addressTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setNewAddress({ ...newAddress, addressType: type.id })}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
                      ${newAddress.addressType === type.id
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }
                    `}
                                    >
                                        <span>{type.icon}</span>
                                        <span className="font-medium">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Continue Button */}
            <button
                onClick={handleContinue}
                disabled={!selectedAddress && !showNewAddressForm}
                className="w-full py-4 bg-gradient-to-r from-primary to-cta text-white font-bold rounded-xl 
          hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all
          shadow-lg shadow-primary/25"
            >
                Deliver to this Address
            </button>
        </div>
    );
};

export default AddressStep;
