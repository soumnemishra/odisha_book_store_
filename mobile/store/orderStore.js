import { create } from 'zustand';
import { API_URL } from '../constants/api';

export const useOrderStore = create((set, get) => ({
    orders: [],
    currentOrder: null,
    isLoading: false,
    error: null,

    // Create new order
    createOrder: async (orderData, token) => {
        try {
            set({ isLoading: true, error: null });

            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create order');
            }

            set({
                currentOrder: data.data,
                isLoading: false
            });

            // Also add to orders list
            set(state => ({
                orders: [data.data, ...state.orders]
            }));

            return { success: true, order: data.data };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Fetch user's orders
    fetchMyOrders: async (token) => {
        try {
            set({ isLoading: true, error: null });

            const response = await fetch(`${API_URL}/orders/myorders`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch orders');
            }

            set({
                orders: data.data || [],
                isLoading: false
            });

            return { success: true };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Fetch single order by ID
    fetchOrderById: async (orderId, token) => {
        try {
            set({ isLoading: true, error: null });

            const response = await fetch(`${API_URL}/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch order');
            }

            set({
                currentOrder: data.data,
                isLoading: false
            });

            return { success: true, order: data.data };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Update order payment status (if you implement payment)
    updateOrderPayment: async (orderId, paymentResult, token) => {
        try {
            set({ isLoading: true, error: null });

            const response = await fetch(`${API_URL}/orders/${orderId}/pay`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(paymentResult),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update payment');
            }

            // Update the order in the orders list
            set(state => ({
                orders: state.orders.map(order =>
                    order._id === orderId ? data.data : order
                ),
                currentOrder: data.data,
                isLoading: false
            }));

            return { success: true, order: data.data };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
        }
    },

    // Clear current order
    clearCurrentOrder: () => {
        set({ currentOrder: null });
    },

    // Get order status display text
    getOrderStatusText: (order) => {
        if (order.isDelivered) {
            return 'Delivered';
        } else if (order.isPaid) {
            return 'Processing';
        } else {
            return 'Pending Payment';
        }
    },

    // Get order status color
    getOrderStatusColor: (order) => {
        if (order.isDelivered) {
            return '#10B981'; // green
        } else if (order.isPaid) {
            return '#F59E0B'; // orange
        } else {
            return '#6B7280'; // gray
        }
    },
}));
