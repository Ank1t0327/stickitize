import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Mock orders data - replace with actual data from your backend
const mockOrders = [
  {
    id: 'ORD001',
    date: '2024-03-20T10:30:00',
    items: [
      { name: 'Minimalist Laptop Sticker', quantity: 2, price: 99 },
      { name: 'Custom Poster', quantity: 1, price: 399 }
    ],
    totalPrice: 597,
    deliveryMethod: 'Delivery',
    deliveryLocation: 'Hostel A',
    paymentMethod: 'Online Payment',
    status: 'Processing',
    mobileNumber: '9876543210'
  },
  {
    id: 'ORD002',
    date: '2024-03-19T15:45:00',
    items: [
      { name: 'Custom Poster', quantity: 1, price: 399 }
    ],
    totalPrice: 399,
    deliveryMethod: 'Pickup',
    deliveryLocation: 'Main Gate',
    paymentMethod: 'Cash on Delivery',
    status: 'Completed',
    mobileNumber: '9876543210'
  }
];

function OrderCard({ order }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Out for Delivery':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'Completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="bg-slate-900/80 border-2 border-electric rounded-xl p-6 shadow-neon hover:shadow-neon-btn transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Order #{order.id}</h3>
          <p className="text-cyan-400 text-sm">
            {new Date(order.date).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyan-400 hover:text-white hover:shadow-neon-btn transition-all duration-200 rounded-full p-1 border border-transparent hover:border-cyan-400"
          >
            {isExpanded ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <MagnifyingGlassIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-fadeIn">
          <div className="border-t border-cyan-700 pt-4">
            <h4 className="text-cyan-200 font-medium mb-2">Order Items</h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-white">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-electric">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-cyan-700 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-cyan-200">Delivery Method</p>
                <p className="text-white">{order.deliveryMethod}</p>
              </div>
              <div>
                <p className="text-cyan-200">Location</p>
                <p className="text-white">{order.deliveryLocation}</p>
              </div>
              <div>
                <p className="text-cyan-200">Payment Method</p>
                <p className="text-white">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-cyan-200">Total</p>
                <p className="text-electric font-semibold">₹{order.totalPrice}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderHistory() {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate OTP verification
  const handleVerifyMobile = () => {
    if (mobileNumber.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
      // Filter orders for the entered mobile number
      setOrders(mockOrders.filter(order => order.mobileNumber === mobileNumber));
    }, 1500);
  };

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      new Date(order.date).toLocaleString().toLowerCase().includes(searchLower)
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy via-slate-800 to-slate-900 py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-slate-900/80 border-2 border-electric rounded-xl p-8 shadow-neon">
            <h2 className="text-2xl font-bold text-white mb-6">View Order History</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="mobile" className="block text-cyan-200 mb-2">
                  Enter Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobile"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter your 10-digit mobile number"
                  className="w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white placeholder-cyan-700 focus:outline-none focus:border-electric transition-colors"
                  maxLength={10}
                />
              </div>
              <button
                onClick={handleVerifyMobile}
                disabled={isLoading}
                className="w-full py-3 px-6 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'View Orders'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Order History</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
          >
            Change Number
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID or Date..."
              className="w-full px-4 py-2 pl-10 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white placeholder-cyan-700 focus:outline-none focus:border-electric transition-colors"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-cyan-700 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-cyan-200 text-lg">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderHistory; 