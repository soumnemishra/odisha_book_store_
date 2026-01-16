// app/(tabs)/checkout.jsx - Checkout Screen with 3-Layer Validation
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../store/cartStore';
import { createOrder } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function Checkout() {
    const router = useRouter();
    const { items, getTotal, getSubtotal, getShippingCost, clearCart } = useCartStore();

    // Form state
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Validation errors
    const [errors, setErrors] = useState({});

    /**
     * LAYER 2: Client-Side Validation
     * Validates form before sending to server (saves bandwidth)
     */
    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!customerName || customerName.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Phone validation (exactly 10 digits)
        if (!customerPhone || customerPhone.length !== 10) {
            newErrors.phone = 'Phone number must be exactly 10 digits';
        } else if (!/^\d{10}$/.test(customerPhone)) {
            newErrors.phone = 'Phone number must contain only digits';
        }

        // Address validation (at least 10 characters)
        if (!customerAddress || customerAddress.trim().length < 10) {
            newErrors.address = 'Address must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle Order Placement
     * LAYER 3: Server-side validation happens in the API
     */
    const handlePlaceOrder = async () => {
        // Layer 2 validation
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fix the errors before submitting');
            return;
        }

        setIsProcessing(true);

        try {
            // Prepare order data
            const orderData = {
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                customerAddress: customerAddress.trim(),
                items: items.map(item => ({
                    bookId: item._id,
                    quantity: item.quantity,
                })),
                shippingCost: getShippingCost(),
                notes: notes.trim() || undefined,
            };

            // Call API (LAYER 3: Server validates prices and stock)
            const response = await createOrder(orderData);

            if (response.success) {
                // Clear cart on success
                clearCart();

                // Navigate to success screen
                router.replace({
                    pathname: '/(tabs)/order-success',
                    params: {
                        orderId: response.data._id,
                        totalAmount: response.data.totalAmount,
                    },
                });
            } else {
                throw new Error(response.message || 'Order placement failed');
            }
        } catch (error) {
            console.error('Order placement error:', error);
            Alert.alert(
                'Order Failed',
                error.message || 'Something went wrong. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsProcessing(false);
        }
    };

    // Redirect if cart is empty
    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={100} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptyText}>Add some books before checkout</Text>
                <TouchableOpacity
                    style={styles.browseButton}
                    onPress={() => router.replace('/(tabs)/')}
                >
                    <Text style={styles.browseButtonText}>Browse Books</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const subtotal = getSubtotal();
    const shipping = getShippingCost();
    const total = getTotal();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // Check if form is valid for button enable/disable
    const isFormValid = customerName.trim().length >= 2 &&
        customerPhone.length === 10 &&
        customerAddress.trim().length >= 10;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Items:</Text>
                        <Text style={styles.summaryValue}>{itemCount}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal:</Text>
                        <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping:</Text>
                        <Text style={[styles.summaryValue, shipping === 0 && styles.freeShipping]}>
                            {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.grandTotalLabel}>Grand Total:</Text>
                        <Text style={styles.grandTotalValue}>₹{total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Delivery Information</Text>

                    {/* Name Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name *</Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            placeholder="Enter your full name"
                            placeholderTextColor="#9CA3AF"
                            value={customerName}
                            onChangeText={(text) => {
                                setCustomerName(text);
                                if (errors.name) setErrors({ ...errors, name: null });
                            }}
                            autoCapitalize="words"
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    {/* Phone Input - LAYER 1: UI Validation (numeric keyboard, max 10 chars) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone Number *</Text>
                        <TextInput
                            style={[styles.input, errors.phone && styles.inputError]}
                            placeholder="10-digit phone number"
                            placeholderTextColor="#9CA3AF"
                            value={customerPhone}
                            onChangeText={(text) => {
                                // LAYER 1: Stop user from typing letters
                                const numericOnly = text.replace(/[^0-9]/g, '');
                                setCustomerPhone(numericOnly);
                                if (errors.phone) setErrors({ ...errors, phone: null });
                            }}
                            keyboardType="numeric"
                            maxLength={10}
                        />
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                        {!errors.phone && customerPhone.length > 0 && customerPhone.length < 10 && (
                            <Text style={styles.hintText}>
                                {10 - customerPhone.length} digits remaining
                            </Text>
                        )}
                    </View>

                    {/* Address Input (Multiline) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Address for delivery in Odisha *</Text>
                        <TextInput
                            style={[styles.textArea, errors.address && styles.inputError]}
                            placeholder="Enter complete delivery address with landmark"
                            placeholderTextColor="#9CA3AF"
                            value={customerAddress}
                            onChangeText={(text) => {
                                setCustomerAddress(text);
                                if (errors.address) setErrors({ ...errors, address: null });
                            }}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
                        {!errors.address && customerAddress.length > 0 && customerAddress.length < 10 && (
                            <Text style={styles.hintText}>
                                Minimum 10 characters required
                            </Text>
                        )}
                    </View>

                    {/* Optional Notes */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Any special instructions for delivery"
                            placeholderTextColor="#9CA3AF"
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            maxLength={500}
                        />
                    </View>
                </View>

                {/* Payment Info */}
                <View style={styles.paymentInfo}>
                    <Ionicons name="cash-outline" size={24} color="#059669" />
                    <Text style={styles.paymentText}>Cash on Delivery</Text>
                </View>
            </ScrollView>

            {/* Footer with Confirm Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        (!isFormValid || isProcessing) && styles.confirmButtonDisabled,
                    ]}
                    onPress={handlePlaceOrder}
                    disabled={!isFormValid || isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                            <Text style={styles.confirmButtonText}>Confirm Order</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    summaryCard: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 15,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    freeShipping: {
        color: '#10B981',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
    },
    grandTotalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    grandTotalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#059669',
    },
    formSection: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#111827',
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    textArea: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#111827',
        minHeight: 100,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    hintText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    paymentText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#059669',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#059669',
        paddingVertical: 16,
        borderRadius: 12,
    },
    confirmButtonDisabled: {
        backgroundColor: '#9CA3AF',
        opacity: 0.6,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginTop: 20,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: '#6B7280',
        marginBottom: 30,
        textAlign: 'center',
    },
    browseButton: {
        backgroundColor: '#059669',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 8,
    },
    browseButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
