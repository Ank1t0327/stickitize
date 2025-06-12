import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, TruckIcon, CreditCardIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

const ORDER_STATUSES = {
  PLACED: {
    label: 'Order Placed',
    icon: ClockIcon,
    color: 'text-blue-400',
    glow: 'shadow-blue-400/20'
  },
  PROCESSING: {
    label: 'Processing',
    icon: ClockIcon,
    color: 'text-yellow-400',
    glow: 'shadow-yellow-400/20'
  },
  SHIPPED: {
    label: 'Out for Delivery',
    icon: TruckIcon,
    color: 'text-purple-400',
    glow: 'shadow-purple-400/20'
  },
  DELIVERED: {
    label: 'Delivered',
    icon: ClockIcon,
    color: 'text-green-400',
    glow: 'shadow-green-400/20'
  }
};

function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock order details
      setOrderDetails({
        id: orderId,
        status: 'PROCESSING',
        products: [
          { name: 'Custom Sticker Pack', quantity: 2, price: 199 },
          { name: 'Art Poster', quantity: 1, price: 499 }
        ],
        paymentMethod: 'Credit Card',
        deliveryMethod: 'Standard Shipping',
        deliveryAddress: '123 Main St, City, State - 123456',
        estimatedDelivery: '2024-03-25'
      });
    } catch (err) {
      setError('Failed to fetch order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Track Your Order</h1>

        <div className="bg-slate-900/80 border-2 border-electric/30 rounded-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-electric"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-electric text-white rounded-lg font-medium transition-colors flex items-center gap-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-500'
              }`}
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </form>
        </div>

        {error && (
          <div className="text-red-400 text-center mb-8">
            {error}
          </div>
        )}

        {orderDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 border-2 border-electric/30 rounded-xl p-8"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Order Status</h2>
              <div className="flex items-center justify-between">
                {Object.entries(ORDER_STATUSES).map(([status, { label, icon: Icon, color, glow }]) => (
                  <div key={status} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-2 ${glow}`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <span className={`text-sm ${color}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Order Details</h3>
                <div className="space-y-4">
                  {orderDetails.products.map((product, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-cyan-200">{product.name} x {product.quantity}</span>
                      <span className="text-white">₹{product.price}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-700 pt-4">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-white">Total</span>
                      <span className="text-electric">₹{orderDetails.products.reduce((sum, p) => sum + (p.price * p.quantity), 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Payment & Delivery</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CreditCardIcon className="w-5 h-5 text-cyan-200" />
                      <span className="text-cyan-200">{orderDetails.paymentMethod}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TruckIcon className="w-5 h-5 text-cyan-200" />
                      <span className="text-cyan-200">{orderDetails.deliveryMethod}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-5 h-5 text-cyan-200" />
                      <span className="text-cyan-200">{orderDetails.deliveryAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-cyan-200" />
                      <span className="text-cyan-200">Estimated Delivery: {orderDetails.estimatedDelivery}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default TrackOrder; 