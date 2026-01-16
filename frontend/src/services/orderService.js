import apiClient from './apiClient';

export const orderService = {
  createOrder: (orderData) => apiClient.post('/orders', orderData),
  getMyOrders: () => apiClient.get('/orders/myorders'),
  getOrder: (id) => apiClient.get(`/orders/${id}`),
};

