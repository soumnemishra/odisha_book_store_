// app/(tabs)/orders.jsx - Orders Screen (Guest Checkout Version)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * Orders Screen - For Guest Checkout
 * 
 * Since we're using guest checkout (no authentication required),
 * we recommend users to:
 * 1. Save their order confirmation
 * 2. Contact support with Order ID to track
 * 
 * Future enhancement: Add phone number + OTP lookup for order tracking
 */
export default function Orders() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Order Tracking</Text>
                <Text style={styles.headerSubtitle}>Track your Odisha Book Store orders</Text>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
                <View style={styles.iconCircle}>
                    <Ionicons name="receipt-outline" size={40} color="#059669" />
                </View>
                <Text style={styles.infoTitle}>Guest Checkout Active</Text>
                <Text style={styles.infoText}>
                    Since you placed your order as a guest, you can track it using your phone number
                    and order ID.
                </Text>
            </View>

            {/* How to Track Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>How to Track Your Order</Text>

                <View style={styles.step}>
                    <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Save Your Order ID</Text>
                        <Text style={styles.stepText}>
                            Your order ID was shown on the success screen. Make sure to save it!
                        </Text>
                    </View>
                </View>

                <View style={styles.step}>
                    <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>We'll Call You</Text>
                        <Text style={styles.stepText}>
                            Our team will contact you on the phone number you provided to confirm
                            your order and delivery.
                        </Text>
                    </View>
                </View>

                <View style={styles.step}>
                    <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Track via Phone</Text>
                        <Text style={styles.stepText}>
                            Call or WhatsApp us with your Order ID for real-time updates.
                        </Text>
                    </View>
                </View>
            </View>

            {/* Contact Card */}
            <View style={styles.contactCard}>
                <Ionicons name="headset-outline" size={28} color="#059669" />
                <View style={styles.contactContent}>
                    <Text style={styles.contactTitle}>Need Help?</Text>
                    <Text style={styles.contactText}>Contact our support team</Text>
                </View>
            </View>

            {/* Contact Options */}
            <View style={styles.contactOptions}>
                <TouchableOpacity style={styles.contactButton}>
                    <Ionicons name="call-outline" size={20} color="#059669" />
                    <Text style={styles.contactButtonText}>Call Support</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactButton}>
                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                    <Text style={styles.contactButtonText}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactButton}>
                    <Ionicons name="mail-outline" size={20} color="#3B82F6" />
                    <Text style={styles.contactButtonText}>Email</Text>
                </TouchableOpacity>
            </View>

            {/* Future Enhancement Notice */}
            <View style={styles.futureCard}>
                <Ionicons name="rocket-outline" size={24} color="#8B5CF6" />
                <Text style={styles.futureText}>
                    <Text style={styles.futureTextBold}>Coming Soon:</Text> Track orders using
                    phone number + OTP verification. No login required!
                </Text>
            </View>

            {/* Back to Shopping Button */}
            <TouchableOpacity
                style={styles.shopButton}
                onPress={() => router.push('/(tabs)/')}
            >
                <Ionicons name="book-outline" size={20} color="#FFF" />
                <Text style={styles.shopButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#6B7280',
    },
    infoCard: {
        backgroundColor: '#FFF',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
    },
    section: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 20,
    },
    step: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#059669',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    stepText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        gap: 12,
    },
    contactContent: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    contactText: {
        fontSize: 14,
        color: '#6B7280',
    },
    contactOptions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    contactButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#FFF',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    contactButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    futureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F5F3FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#8B5CF6',
    },
    futureText: {
        flex: 1,
        fontSize: 13,
        color: '#6B21A8',
        lineHeight: 20,
    },
    futureTextBold: {
        fontWeight: '700',
    },
    shopButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#059669',
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    shopButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
});
