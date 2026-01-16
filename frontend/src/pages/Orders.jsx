import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { orderService } from '../services/orderService';
import Loader from '../components/Loader';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getMyOrders();
        setOrders(response.data.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-orange-900 mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-orange-700 text-lg">You have no orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-lg p-6 border-2 border-orange-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-orange-600">Order ID: {order._id}</p>
                    <p className="text-sm text-orange-600">
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-orange-600">₹{order.totalPrice}</p>
                    <p className="text-sm text-orange-600">
                      {order.isPaid ? (
                        <span className="text-green-600 font-semibold">✓ Paid</span>
                      ) : (
                        <span className="text-yellow-600 font-semibold">⏳ Pending</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="border-t border-orange-200 pt-4">
                  <h3 className="font-semibold text-orange-900 mb-2">Items:</h3>
                  <ul className="space-y-2">
                    {order.orderItems.map((item, index) => (
                      <li key={index} className="text-sm text-orange-800">
                        {item.book?.title || 'Book'} - Quantity: {item.quantity} - ₹{item.price}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

