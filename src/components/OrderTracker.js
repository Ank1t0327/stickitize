import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, TruckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const ORDER_STATUSES = {
  PLACED: {
    label: 'Order Placed',
    icon: CheckCircleIcon,
    color: 'text-green-400',
    glow: 'shadow-green-400/50'
  },
  PROCESSING: {
    label: 'Processing',
    icon: ArrowPathIcon,
    color: 'text-blue-400',
    glow: 'shadow-blue-400/50'
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    icon: TruckIcon,
    color: 'text-yellow-400',
    glow: 'shadow-yellow-400/50'
  },
  DELIVERED: {
    label: 'Delivered',
    icon: CheckCircleIcon,
    color: 'text-green-400',
    glow: 'shadow-green-400/50'
  }
};

function OrderTracker() {
  const [searchType, setSearchType] = useState('orderId');
  const [searchValue, setSearchValue] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load last order ID from localStorage
  useEffect(() => {
    const lastOrderId = localStorage.getItem('lastOrderId');
    if (lastOrderId) {
      setSearchValue(lastOrderId);
      setSearchType('orderId');
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (searchType === 'mobile') {
        // Show OTP input for mobile number search
        setShowOtpInput(true);
        return;
      }

      // Search by Order ID
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const foundOrder = orders.find(o => o.id.toString() === searchValue);

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError('Order not found. Please check your Order ID.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (otp === '123456') { // Mock OTP
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const foundOrder = orders.find(o => o.mobileNumber === searchValue);

        if (foundOrder) {
          setOrder(foundOrder);
          setShowOtpInput(false);
        } else {
          setError('No orders found for this mobile number.');
        }
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIndex = (status) => {
    return Object.keys(ORDER_STATUSES).indexOf(status);
  };

  const getEstimatedDelivery = (orderDate) => {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 2); // Mock: 2 days delivery
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-slate-900/80 border-2 border-electric rounded-xl p-8 shadow-neon">
        <h1 className="text-3xl font-bold text-white mb-2">Track Your Order</h1>
        <p className="text-cyan-200 mb-8">Enter your Order ID or Mobile Number to check status</p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchType"
                    value="orderId"
                    checked={searchType === 'orderId'}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-white">Order ID</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchType"
                    value="mobile"
                    checked={searchType === 'mobile'}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-white">Mobile Number</span>
                </label>
              </div>
              <input
                type={searchType === 'mobile' ? 'tel' : 'text'}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={searchType === 'mobile' ? 'Enter mobile number' : 'Enter Order ID'}
                className="w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white focus:outline-none focus:border-electric transition-colors"
                required
                pattern={searchType === 'mobile' ? '[0-9]{10}' : undefined}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Searching...' : 'Track Order'}
            </button>
          </div>
        </form>

        {/* OTP Form */}
        {showOtpInput && (
          <form onSubmit={verifyOtp} className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-cyan-200 mb-2">Enter OTP sent to {searchValue}</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white focus:outline-none focus:border-electric transition-colors"
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/50 border-2 border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Order Status */}
        {order && (
          <div className="space-y-8">
            {/* Status Progress */}
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-700 -translate-y-1/2"></div>
              <div className="relative flex justify-between">
                {Object.entries(ORDER_STATUSES).map(([status, { label, icon: Icon, color, glow }], index) => {
                  const isActive = getStatusIndex(order.status) >= index;
                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? `${color} ${glow}` : 'bg-slate-700 text-slate-500'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`mt-2 text-sm ${isActive ? 'text-white' : 'text-slate-500'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">Order #{order.id}</h3>
                  <p className="text-cyan-200">Placed on {new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-cyan-200">Estimated Delivery</p>
                  <p className="text-white font-semibold">{getEstimatedDelivery(order.date)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-cyan-200 mb-2">Order Details</h4>
                  <div className="space-y-2">
                    <p className="text-white">
                      <span className="text-cyan-400">Type:</span> {order.type}
                    </p>
                    <p className="text-white">
                      <span className="text-cyan-400">Quantity:</span> {order.quantity}
                    </p>
                    {order.size && (
                      <p className="text-white">
                        <span className="text-cyan-400">Size:</span> {order.size}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-cyan-200 mb-2">Delivery Details</h4>
                  <div className="space-y-2">
                    <p className="text-white">
                      <span className="text-cyan-400">Method:</span> {order.deliveryMethod}
                    </p>
                    {order.deliveryLocation && (
                      <p className="text-white">
                        <span className="text-cyan-400">Location:</span> {order.deliveryLocation}
                      </p>
                    )}
                    <p className="text-white">
                      <span className="text-cyan-400">Payment:</span> {order.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderTracker; 