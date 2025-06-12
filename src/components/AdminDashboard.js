import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrashIcon } from '@heroicons/react/24/outline';
import DeliveryLocations from './DeliveryLocations';

// Mock orders data - replace with actual data from your backend
const mockOrders = [
  {
    id: 1,
    customerName: 'John Doe',
    items: [
      { name: 'Minimalist Laptop Sticker', quantity: 2, price: 99 },
      { name: 'Custom Poster', quantity: 1, price: 399 }
    ],
    totalPrice: 597,
    deliveryMethod: 'Delivery',
    deliveryLocation: 'Hostel A',
    paymentMethod: 'Online Payment',
    status: 'Processing',
    date: '2024-03-20T10:30:00'
  },
  {
    id: 2,
    customerName: 'Jane Smith',
    items: [
      { name: 'Custom Poster', quantity: 1, price: 399 }
    ],
    totalPrice: 399,
    deliveryMethod: 'Pickup',
    deliveryLocation: 'Main Gate',
    paymentMethod: 'Cash on Delivery',
    status: 'Out for Delivery',
    date: '2024-03-20T09:15:00'
  }
];

function OrderCard({ order, onStatusChange, onDelete }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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
          <h3 className="text-lg font-semibold text-white">{order.customerName}</h3>
          <p className="text-cyan-400 text-sm">
            {new Date(order.date).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="text-cyan-400 hover:text-white hover:shadow-neon-btn transition-all duration-200 rounded-full p-1 border border-transparent hover:border-cyan-400"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
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

        <div className="border-t border-cyan-700 pt-4">
          <div className="flex space-x-2">
            <button
              onClick={() => onStatusChange(order.id, 'Processing')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                order.status === 'Processing'
                  ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/50'
                  : 'bg-slate-800 text-white border-2 border-cyan-700 hover:bg-slate-700'
              }`}
            >
              Processing
            </button>
            <button
              onClick={() => onStatusChange(order.id, 'Out for Delivery')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                order.status === 'Out for Delivery'
                  ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/50'
                  : 'bg-slate-800 text-white border-2 border-cyan-700 hover:bg-slate-700'
              }`}
            >
              Out for Delivery
            </button>
            <button
              onClick={() => onStatusChange(order.id, 'Completed')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                order.status === 'Completed'
                  ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50'
                  : 'bg-slate-800 text-white border-2 border-cyan-700 hover:bg-slate-700'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border-2 border-electric rounded-xl p-6 max-w-md w-full mx-4 shadow-neon">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-cyan-200 mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-2 px-4 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(order.id);
                  setShowConfirmDelete(false);
                }}
                className="flex-1 py-2 px-4 bg-red-500/20 text-red-400 border-2 border-red-500/50 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [orders, setOrders] = useState(mockOrders);
  const [activeTab, setActiveTab] = useState('orders');

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin-login');
    }
  }, [isAuthenticated, navigate]);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleDelete = (orderId) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
  };

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'orders'
                ? 'bg-electric text-white'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'locations'
                ? 'bg-electric text-white'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            Delivery Locations
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' ? (
          <div className="space-y-6">
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <DeliveryLocations />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard; 