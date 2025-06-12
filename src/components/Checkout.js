import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Checkout() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    deliveryMethod: 'Delivery',
    deliveryLocation: '',
    paymentMethod: 'Cash on Delivery'
  });
  const [deliveryLocations, setDeliveryLocations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load delivery locations from localStorage
  useEffect(() => {
    const savedLocations = localStorage.getItem('deliveryLocations');
    if (savedLocations) {
      const locations = JSON.parse(savedLocations);
      setDeliveryLocations(locations);
      // Set default delivery location if available
      if (locations.length > 0) {
        setFormData(prev => ({ ...prev, deliveryLocation: locations[0].name }));
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate successful payment
    if (formData.paymentMethod === 'Online Payment') {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Store order in localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder = {
      id: Date.now(),
      ...formData,
      customDesign: true,
      status: 'PLACED',
      date: new Date().toISOString()
    };
    localStorage.setItem('orders', JSON.stringify([...orders, newOrder]));
    
    // Store order ID for quick access
    localStorage.setItem('lastOrderId', newOrder.id.toString());

    navigate('/success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-900/80 border-2 border-electric rounded-xl p-8 shadow-neon">
          <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-cyan-200 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white placeholder-cyan-700 focus:outline-none focus:border-electric transition-colors"
                />
              </div>
              <div>
                <label htmlFor="mobileNumber" className="block text-cyan-200 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white placeholder-cyan-700 focus:outline-none focus:border-electric transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-cyan-200 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white placeholder-cyan-700 focus:outline-none focus:border-electric transition-colors"
                />
              </div>
            </div>

            {/* Delivery Method */}
            <div>
              <label className="block text-cyan-200 mb-2">Delivery Method</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="Delivery"
                    checked={formData.deliveryMethod === 'Delivery'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-white">Delivery</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="Pickup"
                    checked={formData.deliveryMethod === 'Pickup'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-white">Pickup</span>
                </label>
              </div>
            </div>

            {/* Delivery Location */}
            {formData.deliveryMethod === 'Delivery' && (
              <div>
                <label htmlFor="deliveryLocation" className="block text-cyan-200 mb-2">
                  Delivery Location
                </label>
                <select
                  id="deliveryLocation"
                  name="deliveryLocation"
                  value={formData.deliveryLocation}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white focus:outline-none focus:border-electric transition-colors"
                >
                  <option value="">Select a location</option>
                  {deliveryLocations.map((location) => (
                    <option key={location.id} value={location.name}>
                      {location.name} - {location.description}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-cyan-200 mb-2">Payment Method</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={formData.paymentMethod === 'Cash on Delivery'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-white">Cash on Delivery</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online Payment"
                    checked={formData.paymentMethod === 'Online Payment'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-white">Online Payment</span>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-cyan-700 pt-6">
              <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-white">
                  <span>Subtotal</span>
                  <span>₹597</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Delivery Fee</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between text-electric font-bold text-lg">
                  <span>Total</span>
                  <span>₹597</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout; 